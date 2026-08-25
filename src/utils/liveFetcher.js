import { LIVE_MARKET } from '../data/marketData';

/**
 * Consulta en tiempo real las APIs públicas de mercado:
 * 1. DolarAPI (CCL en ARS)
 * 2. Yahoo Finance (ETF SPXL en USD)
 */
export const fetchLiveMarketOnline = async () => {
  let liveData = { ...LIVE_MARKET };
  let isOnline = false;

  try {
    // 1. Obtener CCL en tiempo real desde DolarAPI Argentina
    const cclResponse = await fetch('https://dolarapi.com/v1/dolares/contadoconliqui');
    if (cclResponse.ok) {
      const cclJson = await cclResponse.json();
      if (cclJson && cclJson.venta) {
        liveData.cclRate = Number(cclJson.venta);
        isOnline = true;
      }
    }
  } catch (err) {
    console.warn('Usando cotización de respaldo para CCL:', err);
  }

  try {
    // 2. Obtener ETF SPXL en USD en tiempo real desde Yahoo Finance
    const spxlResponse = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/SPXL');
    if (spxlResponse.ok) {
      const spxlJson = await spxlResponse.json();
      const regularPrice = spxlJson?.chart?.result?.[0]?.meta?.regularMarketPrice;
      if (regularPrice) {
        liveData.spxlPriceUsd = Number(regularPrice);
        isOnline = true;
      }
    }
  } catch (err) {
    console.warn('Usando cotización de respaldo para SPXL USD:', err);
  }

  // 3. Recalcular precio del CEDEAR SPXL en ARS según el Ratio 20:1
  // Precio CEDEAR = (Precio ETF USD * CCL) / 20
  liveData.cedearPriceArs = Math.round((liveData.spxlPriceUsd * liveData.cclRate) / 20);
  liveData.lastUpdated = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  liveData.isOnline = isOnline;

  return liveData;
};
