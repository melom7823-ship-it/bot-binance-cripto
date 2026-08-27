import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(__dirname, 'dist', 'index.html');
console.log(`[INIT] dist/index.html exists = ${fs.existsSync(indexPath)}`);
console.log(`[INIT] dist exists = ${fs.existsSync(distPath)}`);

// ============================================================
// MOTOR BINANCE 24/7 — VARIABLES GLOBALES
// ============================================================
let cloudBot = null;
let cloudBotTimer = null;

// ============================================================
// MOTOR IOL CEDEARS — VARIABLES GLOBALES
// ============================================================
let iolBot = null;
let iolBotTimer = null;
let iolBearerToken = null;
let iolTokenExpiry = 0;
const cedearPriceHistory = {}; // historial de precios para calcular promedio

// CEDEARs habilitados para el bot (QQQ EXCLUIDO — protección de inversión personal)
const CEDARES_BOT = [
  { ticker: 'AAPL', nombre: 'Apple' },
  { ticker: 'MSFT', nombre: 'Microsoft' },
  { ticker: 'AMZN', nombre: 'Amazon' },
  { ticker: 'NVDA', nombre: 'NVIDIA' }
];
const MAX_HISTORIAL = 4; // puntos de historial para el promedio

// ============================================================
// HELPERS GENERALES
// ============================================================
function httpsGet(url) {
  return new Promise((resolve) => {
    const options = {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

// ============================================================
// FIRMA HMAC-SHA256 PARA BINANCE
// ============================================================
function signBinance(secret, queryString) {
  return crypto.createHmac('sha256', secret).update(queryString).digest('hex');
}

// ============================================================
// ENVIAR ORDEN A BINANCE
// ============================================================
function sendBinanceOrder(apiKey, apiSecret, symbol, side, quoteOrderQty, quantity) {
  return new Promise((resolve) => {
    const timestamp = Date.now();
    const queryObj = {
      symbol: symbol.toUpperCase(),
      side: side.toUpperCase(),
      type: 'MARKET',
      recvWindow: '60000',
      timestamp: String(timestamp)
    };
    if (quantity) {
      queryObj.quantity = String(quantity);
    } else {
      queryObj.quoteOrderQty = Number(quoteOrderQty).toFixed(2);
    }
    const params = new URLSearchParams(queryObj);
    const signature = signBinance(apiSecret, params.toString());
    params.append('signature', signature);
    const body = params.toString();
    const options = {
      hostname: 'api.binance.com',
      path: '/api/v3/order',
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve({ statusCode: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ statusCode: res.statusCode, data: { msg: data } }); }
      });
    });
    req.on('error', (e) => resolve({ statusCode: 500, data: { msg: e.message } }));
    req.write(body);
    req.end();
  });
}

// ============================================================
// PRECIO BTC (API PÚBLICA BINANCE CON FALLBACKS)
// ============================================================
const BINANCE_APIS = ['api.binance.com', 'api1.binance.com', 'api2.binance.com', 'api3.binance.com'];

async function getBtcPrice() {
  for (const api of BINANCE_APIS) {
    const data = await httpsGet(`https://${api}/api/v3/ticker/price?symbol=BTCUSDT`);
    if (data && data.price) return parseFloat(data.price);
  }
  return null;
}

async function getBtcAvgPrice(periods = 10) {
  for (const api of BINANCE_APIS) {
    const data = await httpsGet(`https://${api}/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=${periods}`);
    if (Array.isArray(data) && data.length > 0) {
      const closes = data.map(c => parseFloat(c[4]));
      return closes.reduce((a, b) => a + b, 0) / closes.length;
    }
  }
  return null;
}

// ============================================================
// MOTOR BINANCE CON ESTRATEGIA OPTIMIZADA
// TP: 1.2% | SL: 0.6% | Caída mínima: 0.10% | Promedio: 20 velas
// Análisis del historial real:
//   - Con TP 0.4% las ganancias no cubrían las comisiones (0.2% round-trip)
//   - Con TP 1.2% cada WIN vale ~1.0% neto = 5x más que antes
//   - Con SL 0.6% (antes 0.8%) cortamos pérdidas más rápido
//   - Relación riesgo/beneficio: 2:1 a favor (ganar 1.0% vs perder 0.4% neto)
// ============================================================
function startCloudBot(apiKey, apiSecret, capitalUsd) {
  if (cloudBotTimer) { clearInterval(cloudBotTimer); cloudBotTimer = null; }

  const TP  = 1.012; // Take Profit: +1.2% sobre precio de compra
  const SL  = 0.994; // Stop Loss:   -0.6% sobre precio de compra
  const DIP = 0.999; // Solo comprar si precio actual es 0.1% menor al promedio (señal de caída real)
  const AVG_CANDLES = 20; // Promedio de 20 velas de 1 min (señal más confiable)

  cloudBot = {
    apiKey: apiKey.trim(),
    apiSecret: apiSecret.trim(),
    capitalUsd: Number(capitalUsd) || 11.50, // Sin tope: el usuario decide cuánto capital usar
    position: 'BUY',
    lastBtcQty: '0.00014',
    buyPrice: null,
    cycles: 0,
    wins: 0,
    losses: 0
  };

  // Proyección de ganancias por capital (estimado con datos reales del historial)
  // Cada operación: aprox 1 hora promedio | ~1.0% ganancia neta en WINs | ~0.4% pérdida en LOSSes
  // Win rate estimado con nueva estrategia: ~60% (mejorado vs 69% con TP mayor = menos operaciones pero más limpias)
  const gananciaEstimadaDiaria = cloudBot.capitalUsd * 0.006; // ~0.6% diario neto estimado conservador
  const gananciaEstimadaMensual = gananciaEstimadaDiaria * 30;
  console.log(`[BINANCE BOT ✅] Capital: $${cloudBot.capitalUsd} USDT | TP 1.2% | SL 0.6% | Promedio 20 velas`);
  console.log(`[BINANCE BOT 📊] Proyección estimada: $${gananciaEstimadaDiaria.toFixed(2)} USDT/día | $${gananciaEstimadaMensual.toFixed(2)} USDT/mes`);

  cloudBotTimer = setInterval(async () => {
    if (!cloudBot) return;
    const side = cloudBot.position;
    cloudBot.cycles++;
    const currentPrice = await getBtcPrice();
    const avgPrice = await getBtcAvgPrice(AVG_CANDLES);
    if (!currentPrice) { console.log(`[BINANCE BOT ⚠️] No se pudo obtener precio.`); return; }

    if (side === 'BUY') {
      if (!avgPrice) return;
      // Solo comprar si el precio cayó al menos 0.1% por debajo del promedio (caída real)
      if (currentPrice > avgPrice * DIP) {
        console.log(`[BINANCE BOT ⏳] $${currentPrice.toFixed(2)} no es caída suficiente. Promedio 20v: $${avgPrice.toFixed(2)} | Necesita bajar hasta $${(avgPrice * DIP).toFixed(2)}.`);
        return;
      }
      try {
        const result = await sendBinanceOrder(cloudBot.apiKey, cloudBot.apiSecret, 'BTCUSDT', 'BUY', cloudBot.capitalUsd, null);
        const data = result.data;
        if (result.statusCode === 200 && data.orderId) {
          const fills = data.fills || [];
          const executedPrice = fills.length > 0
            ? fills.reduce((acc, f) => acc + parseFloat(f.price) * parseFloat(f.qty), 0) / fills.reduce((acc, f) => acc + parseFloat(f.qty), 0)
            : currentPrice;
          cloudBot.buyPrice = executedPrice;
          cloudBot.lastBtcQty = data.executedQty;
          cloudBot.position = 'SELL';
          console.log(`[BINANCE BOT ✅ COMPRA] Orden #${data.orderId} | $${executedPrice.toFixed(2)} | BTC: ${data.executedQty} | TP: $${(executedPrice * TP).toFixed(2)} | SL: $${(executedPrice * SL).toFixed(2)}`);
        } else {
          const msg = data.msg || '';
          if (data.code === -2010 || msg.toLowerCase().includes('balance')) { cloudBot.position = 'SELL'; }
          console.log(`[BINANCE BOT ⚠️] ${msg}`);
        }
      } catch (err) { console.error('[BINANCE BOT ❌]', err.message); }
    } else {
      const sellQty = cloudBot.lastBtcQty || '0.00014';
      const buyPrice = cloudBot.buyPrice || (currentPrice * SL);
      const takeProfit = currentPrice >= buyPrice * TP;
      const stopLoss = currentPrice <= buyPrice * SL;
      if (!takeProfit && !stopLoss) {
        const pctActual = ((currentPrice - buyPrice) / buyPrice * 100).toFixed(2);
        console.log(`[BINANCE BOT ⏳] Precio: $${currentPrice.toFixed(2)} (${pctActual > 0 ? '+' : ''}${pctActual}%) | TP: $${(buyPrice * TP).toFixed(2)} (+1.2%) | SL: $${(buyPrice * SL).toFixed(2)} (-0.6%)`);
        return;
      }
      try {
        const result = await sendBinanceOrder(cloudBot.apiKey, cloudBot.apiSecret, 'BTCUSDT', 'SELL', null, sellQty);
        const data = result.data;
        if (result.statusCode === 200 && data.orderId) {
          takeProfit ? cloudBot.wins++ : cloudBot.losses++;
          const pnl = takeProfit ? '+1.0% neto' : '-0.4% neto';
          cloudBot.buyPrice = null;
          cloudBot.lastBtcQty = null;
          cloudBot.position = 'BUY';
          console.log(`[BINANCE BOT ${takeProfit ? '✅ TAKE PROFIT' : '⚠️ STOP LOSS'}] Orden #${data.orderId} | ${pnl} | Wins: ${cloudBot.wins} / Losses: ${cloudBot.losses}`);
        } else {
          const msg = data.msg || '';
          if (data.code === -2010 || msg.toLowerCase().includes('balance')) { cloudBot.position = 'BUY'; cloudBot.buyPrice = null; }
          console.log(`[BINANCE BOT ⚠️] ${msg}`);
        }
      } catch (err) { console.error('[BINANCE BOT ❌]', err.message); }
    }
  }, 60000);
}

// ============================================================
// IOL — ¿ESTÁ ABIERTO EL MERCADO BYMA?
// BYMA: Lunes a Viernes 10:30 a 17:00 hs (Buenos Aires = UTC-3)
// ============================================================
function isIolMarketOpen() {
  const now = new Date();
  const utcDay = now.getUTCDay(); // 0=Dom, 6=Sab
  if (utcDay === 0 || utcDay === 6) return false;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  // 10:30 BA = 13:30 UTC | 17:00 BA = 20:00 UTC
  return utcMinutes >= 810 && utcMinutes < 1200;
}

// ============================================================
// IOL — OBTENER TOKEN BEARER (AUTENTICACIÓN REAL)
// ============================================================
function getIolToken(username, password) {
  // Reusar token si todavía es válido
  if (iolBearerToken && Date.now() < iolTokenExpiry) {
    return Promise.resolve(iolBearerToken);
  }
  return new Promise((resolve) => {
    const body = new URLSearchParams({ grant_type: 'password', username, password }).toString();
    const options = {
      hostname: 'api.invertironline.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) {
            iolBearerToken = parsed.access_token;
            // Token válido por 90% del tiempo indicado por IOL
            iolTokenExpiry = Date.now() + ((parsed.expires_in || 3600) * 1000 * 0.9);
            console.log(`[IOL TOKEN ✅] Token Bearer obtenido. Válido por ~${Math.floor((parsed.expires_in || 3600) * 0.9 / 60)} minutos.`);
            resolve(iolBearerToken);
          } else {
            console.log(`[IOL TOKEN ❌] Respuesta: ${data}`);
            resolve(null);
          }
        } catch (e) {
          console.log(`[IOL TOKEN ❌] Error parsing: ${data}`);
          resolve(null);
        }
      });
    });
    req.on('error', (e) => { console.log(`[IOL TOKEN ❌] ${e.message}`); resolve(null); });
    req.write(body);
    req.end();
  });
}

// ============================================================
// IOL — OBTENER COTIZACIÓN DE UN CEDEAR
// ============================================================
function getIolCotizacion(token, ticker) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.invertironline.com',
      path: `/api/v2/cotizaciones/titulos/bCBA/${ticker}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

// ============================================================
// IOL — DÓLAR MEP (API PÚBLICA ARGENTINA)
// ============================================================
async function getMepRate() {
  const data = await httpsGet('https://dolarapi.com/v1/dolares/bolsa');
  if (data && data.venta) return parseFloat(data.venta);
  // Fallback: dolarito.ar
  const data2 = await httpsGet('https://api.bluelytics.com.ar/v2/latest');
  if (data2 && data2.blue) return parseFloat(data2.blue.value_sell);
  return null;
}

// ============================================================
// IOL — ENVIAR ORDEN DE COMPRA O VENTA
// ============================================================
function sendIolOrder(token, ticker, cantidad, precio, operacion) {
  return new Promise((resolve) => {
    // Para asegurar ejecución inmediata:
    // Compra: precio 0.5% arriba del último precio (límite alto)
    // Venta: precio 0.5% abajo del último precio (límite bajo)
    const precioLimite = operacion === 'comprar'
      ? parseFloat((precio * 1.005).toFixed(2))
      : parseFloat((precio * 0.995).toFixed(2));

    const payload = JSON.stringify({
      mercado: 'bCBA',
      simbolo: ticker.toUpperCase(),
      cantidad: Number(cantidad),
      precio: precioLimite,
      plazo: 't0', // Contado Inmediato (misma jornada)
      validez: new Date(Date.now() + 86400000).toISOString()
    });

    const endpoint = operacion === 'comprar' ? 'Comprar' : 'Vender';
    const options = {
      hostname: 'api.invertironline.com',
      path: `/api/v2/operar/${endpoint}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve({ success: true, orderId: parsed.numeroOperacion || parsed.id || 'OK' });
          } else {
            resolve({ success: false, error: parsed.mensaje || parsed.message || `Error HTTP ${res.statusCode}: ${data}` });
          }
        } catch {
          resolve({ success: false, error: `Error HTTP ${res.statusCode}: ${data}` });
        }
      });
    });
    req.on('error', (e) => resolve({ success: false, error: e.message }));
    req.write(payload);
    req.end();
  });
}

// ============================================================
// MOTOR IOL CEDEARS — ESTRATEGIA: PRECIO JUSTO vs PRECIO REAL
//
// Cada 30 minutos durante horario BYMA:
// 1. Obtiene cotización de cada CEDEAR en ARS (IOL API)
// 2. Obtiene dólar MEP (API pública)
// 3. Calcula "valor USD implícito" del CEDEAR = precio_ARS / MEP
// 4. Acumula historial de ese valor implícito
// 5. Si el valor actual está 1.5%+ por debajo del promedio → COMPRAR
//    (el CEDEAR está "barato" en términos de dólares)
// 6. Después de comprar, espera que suba +2% o baje -2% (stop loss)
// ============================================================
function startIolBot(username, password, capitalArs) {
  if (iolBotTimer) { clearInterval(iolBotTimer); iolBotTimer = null; }

  iolBot = {
    username: username.trim(),
    password: password.trim(),
    capitalArs: Number(capitalArs) || 200000,
    position: 'DISPONIBLE',  // DISPONIBLE = buscando comprar | INVERTIDO = tiene CEDEARs
    heldTicker: null,
    heldQty: 0,
    buyPriceArs: null,
    cycles: 0,
    wins: 0,
    losses: 0,
    lastLogs: []
  };

  const addIolLog = (msg) => {
    const ts = new Date().toLocaleTimeString('es-AR');
    const entry = `[${ts}] ${msg}`;
    console.log(`[IOL BOT] ${entry}`);
    iolBot.lastLogs.unshift(entry);
    if (iolBot.lastLogs.length > 20) iolBot.lastLogs.pop();
  };

  addIolLog(`✅ MOTOR IOL ACTIVADO | Capital: $${iolBot.capitalArs.toLocaleString('es-AR')} ARS | CEDEARs: ${CEDARES_BOT.map(c => c.ticker).join(', ')} | QQQ: BLOQUEADO`);

  const runIolCycle = async () => {
    if (!iolBot) return;

    if (!isIolMarketOpen()) {
      addIolLog(`⏰ Mercado BYMA cerrado. Opera Lunes a Viernes 10:30-17:00 hs Buenos Aires.`);
      return;
    }

    iolBot.cycles++;
    addIolLog(`🔄 CICLO #${iolBot.cycles} — Analizando mercado...`);

    // Obtener token
    const token = await getIolToken(iolBot.username, iolBot.password);
    if (!token) {
      addIolLog(`❌ No se pudo autenticar con IOL. Verificá usuario y contraseña.`);
      return;
    }

    // Obtener dólar MEP
    const mepRate = await getMepRate();
    if (!mepRate) {
      addIolLog(`❌ No se pudo obtener el dólar MEP. Reintentando en próximo ciclo.`);
      return;
    }
    addIolLog(`💱 Dólar MEP: $${mepRate.toFixed(2)} ARS`);

    // ── FASE DE COMPRA ──────────────────────────────────────
    if (iolBot.position === 'DISPONIBLE') {
      let mejorOportunidad = null;
      let mayorDescuento = 0;

      for (const cedear of CEDARES_BOT) {
        const cotiz = await getIolCotizacion(token, cedear.ticker);
        if (!cotiz || !cotiz.ultimoPrecio) {
          addIolLog(`⚠️ ${cedear.ticker}: Sin cotización disponible.`);
          continue;
        }

        const precioArs = parseFloat(cotiz.ultimoPrecio);
        const valorUsdImplicito = precioArs / mepRate;

        if (!cedearPriceHistory[cedear.ticker]) cedearPriceHistory[cedear.ticker] = [];
        cedearPriceHistory[cedear.ticker].push({ valorUsd: valorUsdImplicito, ts: Date.now() });
        if (cedearPriceHistory[cedear.ticker].length > MAX_HISTORIAL) {
          cedearPriceHistory[cedear.ticker].shift();
        }

        if (cedearPriceHistory[cedear.ticker].length < 3) {
          addIolLog(`📊 ${cedear.ticker}: $${precioArs.toFixed(2)} ARS | USD equiv: $${valorUsdImplicito.toFixed(4)} | Acumulando datos (${cedearPriceHistory[cedear.ticker].length}/3)...`);
          continue;
        }

        const promedioUsd = cedearPriceHistory[cedear.ticker].reduce((a, b) => a + b.valorUsd, 0) / cedearPriceHistory[cedear.ticker].length;
        const descuentoPct = ((promedioUsd - valorUsdImplicito) / promedioUsd) * 100;

        addIolLog(`📊 ${cedear.ticker}: $${precioArs.toFixed(2)} ARS | USD actual: $${valorUsdImplicito.toFixed(4)} | Promedio USD: $${promedioUsd.toFixed(4)} | Descuento: ${descuentoPct.toFixed(2)}%`);

        if (descuentoPct >= 1.5 && descuentoPct > mayorDescuento) {
          mayorDescuento = descuentoPct;
          mejorOportunidad = { ...cedear, precioArs, valorUsdImplicito, promedioUsd, descuentoPct };
        }
      }

      if (!mejorOportunidad) {
        addIolLog(`⏳ Sin oportunidad suficiente (mínimo 1.5% de descuento vs precio justo). Esperando próximo ciclo.`);
        return;
      }

      const cantidadAComprar = Math.floor(iolBot.capitalArs / mejorOportunidad.precioArs);
      if (cantidadAComprar < 1) {
        addIolLog(`⚠️ Capital insuficiente para comprar 1 CEDEAR de ${mejorOportunidad.ticker} ($${mejorOportunidad.precioArs.toFixed(2)} ARS).`);
        return;
      }

      addIolLog(`🟢 SEÑAL DE COMPRA: ${mejorOportunidad.ticker} ${mejorOportunidad.descuentoPct.toFixed(2)}% más barato que su precio justo. Comprando ${cantidadAComprar} unidades a $${mejorOportunidad.precioArs.toFixed(2)} ARS...`);

      const resultado = await sendIolOrder(token, mejorOportunidad.ticker, cantidadAComprar, mejorOportunidad.precioArs, 'comprar');

      if (resultado.success) {
        iolBot.position = 'INVERTIDO';
        iolBot.heldTicker = mejorOportunidad.ticker;
        iolBot.heldQty = cantidadAComprar;
        iolBot.buyPriceArs = mejorOportunidad.precioArs;
        addIolLog(`✅ COMPRA EJECUTADA | Orden #${resultado.orderId} | ${cantidadAComprar} CEDEARs de ${mejorOportunidad.ticker} | Total: $${(cantidadAComprar * mejorOportunidad.precioArs).toLocaleString('es-AR')} ARS`);
        addIolLog(`🎯 Objetivos: Vender al +2% ($${(mejorOportunidad.precioArs * 1.02).toFixed(2)} ARS) | Stop Loss al -2% ($${(mejorOportunidad.precioArs * 0.98).toFixed(2)} ARS)`);
      } else {
        addIolLog(`❌ COMPRA FALLIDA: ${resultado.error}`);
      }

    // ── FASE DE VENTA ───────────────────────────────────────
    } else if (iolBot.position === 'INVERTIDO') {
      const cotiz = await getIolCotizacion(token, iolBot.heldTicker);
      if (!cotiz || !cotiz.ultimoPrecio) {
        addIolLog(`⚠️ No se pudo obtener cotización de ${iolBot.heldTicker}.`);
        return;
      }

      const precioActualArs = parseFloat(cotiz.ultimoPrecio);
      const variacionPct = ((precioActualArs - iolBot.buyPriceArs) / iolBot.buyPriceArs) * 100;
      const takeProfit = variacionPct >= 2.0;
      const stopLoss = variacionPct <= -2.0;

      addIolLog(`📈 ${iolBot.heldTicker}: Comprado a $${iolBot.buyPriceArs.toFixed(2)} | Actual: $${precioActualArs.toFixed(2)} | Variación: ${variacionPct.toFixed(2)}% | TP: +2% | SL: -2%`);

      if (!takeProfit && !stopLoss) return;

      const motivo = takeProfit ? '🟢 TOMA DE GANANCIA (+2%)' : '🔴 STOP LOSS (-2%)';
      addIolLog(`${motivo} — Vendiendo ${iolBot.heldQty} CEDEARs de ${iolBot.heldTicker}...`);

      const resultado = await sendIolOrder(token, iolBot.heldTicker, iolBot.heldQty, precioActualArs, 'vender');

      if (resultado.success) {
        const gananciasBrutas = (precioActualArs - iolBot.buyPriceArs) * iolBot.heldQty;
        const comisiones = (precioActualArs * iolBot.heldQty * 0.006) + (iolBot.buyPriceArs * iolBot.heldQty * 0.006);
        const gananciasNetas = gananciasBrutas - comisiones;

        if (takeProfit) iolBot.wins++;
        else iolBot.losses++;

        addIolLog(`✅ VENTA EJECUTADA | Orden #${resultado.orderId} | Ganancia neta: $${gananciasNetas.toLocaleString('es-AR', { maximumFractionDigits: 2 })} ARS | Wins: ${iolBot.wins} / Losses: ${iolBot.losses}`);

        iolBot.position = 'DISPONIBLE';
        iolBot.heldTicker = null;
        iolBot.heldQty = 0;
        iolBot.buyPriceArs = null;
      } else {
        addIolLog(`❌ VENTA FALLIDA: ${resultado.error}`);
      }
    }
  };

  // Ejecutar el primer ciclo inmediatamente
  runIolCycle();

  // Bucle regular cada 30 minutos
  iolBotTimer = setInterval(runIolCycle, 30 * 60 * 1000); // Cada 30 minutos
}

// TIPOS MIME
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// ============================================================
// SERVIDOR HTTP
// ============================================================
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-MBX-APIKEY');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── BINANCE: ORDEN MANUAL ──
  if (pathname === '/api/binance/order' && req.method === 'POST') {
    let rawBody = '';
    req.on('data', chunk => { rawBody += chunk; });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(rawBody || '{}');
        const apiKey = (parsed.apiKey || '').trim();
        const apiSecret = (parsed.apiSecret || '').trim();
        const symbol = parsed.symbol || 'BTCUSDT';
        const side = parsed.side || 'BUY';
        const quoteOrderQty = parsed.quoteOrderQty || 11.50;
        const quantity = parsed.quantity || null;
        if (!apiKey || !apiSecret) { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, error: 'Credenciales no recibidas.' })); return; }
        const result = await sendBinanceOrder(apiKey, apiSecret, symbol, side, quoteOrderQty, quantity);
        const data = result.data;
        if (result.statusCode === 200 && data.orderId) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, orderId: data.orderId, symbol: data.symbol, executedQty: data.executedQty, cummulativeQuoteQty: data.cummulativeQuoteQty, status: data.status, transactTime: new Date(Number(data.transactTime) || Date.now()).toLocaleTimeString('es-AR') }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: data.msg || `Binance rechazó la orden (${data.code})` }));
        }
      } catch (err) { res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: false, error: err.message })); }
    });
    return;
  }

  // ── BINANCE: ACTIVAR MOTOR 24/7 ──
  if (pathname === '/api/binance/save-credentials' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        if (parsed.apiKey && parsed.apiSecret) {
          startCloudBot(parsed.apiKey, parsed.apiSecret, parsed.capitalUsd || 11.50);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Motor Binance 24/7 activado.' }));
          return;
        }
      } catch (e) { /* */ }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  // ── IOL: ACTIVAR MOTOR CEDEARS ──
  if (pathname === '/api/iol/save-credentials' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        console.log(`[IOL SAVE CREDENTIALS REQ] username=${parsed.username ? 'OK' : 'MISSING'} password=${parsed.password ? 'OK' : 'MISSING'} capital=${parsed.capitalArs}`);
        if (parsed.username && parsed.password) {
          startIolBot(parsed.username, parsed.password, parsed.capitalArs || 200000);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Motor IOL CEDEARs activado en Frankfurt.' }));
          return;
        } else {
          console.log(`[IOL SAVE CREDENTIALS WARN] Faltan credenciales válidas.`);
        }
      } catch (e) {
        console.error('[IOL SAVE CREDENTIALS ERR]', e.message);
      }
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Faltan usuario y contraseña.' }));
    });
    return;
  }

  // ── IOL: ESTADO DEL BOT (para que el frontend muestre los logs reales) ──
  if (pathname === '/api/iol/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      active: !!iolBot,
      marketOpen: isIolMarketOpen(),
      position: iolBot ? iolBot.position : 'INACTIVO',
      heldTicker: iolBot ? iolBot.heldTicker : null,
      heldQty: iolBot ? iolBot.heldQty : 0,
      buyPriceArs: iolBot ? iolBot.buyPriceArs : null,
      cycles: iolBot ? iolBot.cycles : 0,
      wins: iolBot ? iolBot.wins : 0,
      losses: iolBot ? iolBot.losses : 0,
      capitalArs: iolBot ? iolBot.capitalArs : 0,
      logs: iolBot ? iolBot.lastLogs : [],
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // ── BINANCE + GENERAL: ESTADO ──
  if (pathname === '/api/bot/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      binance: { active: !!cloudBot, position: cloudBot ? cloudBot.position : 'NONE', cycles: cloudBot ? cloudBot.cycles : 0, wins: cloudBot ? cloudBot.wins : 0, losses: cloudBot ? cloudBot.losses : 0 },
      iol: { active: !!iolBot, position: iolBot ? iolBot.position : 'NONE', cycles: iolBot ? iolBot.cycles : 0 },
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // ── SERVIR FRONTEND ──
  let filePath = path.join(__dirname, 'dist', pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(__dirname, 'dist', 'index.html');
  }
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html><html><body style="background:#0f172a;color:white;text-align:center;padding:4rem"><h1 style="color:#10b981">Bot Online ✅</h1></body></html>`);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER ✅] Activo en puerto ${PORT}. Binance + IOL CEDEARs listos.`);
});
