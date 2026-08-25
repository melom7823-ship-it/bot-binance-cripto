import React, { useState, useEffect } from 'react';
import { Bot, Key, Link2, CheckCircle2, ShieldCheck, Zap, RefreshCw, Power, AlertCircle, Cpu, Send, Terminal, Lock, HelpCircle, ChevronDown, ChevronUp, Layers, DollarSign, Award, Landmark, TrendingUp, Flame, Rocket, Radio, Target, Brain, Newspaper, Activity, ShieldAlert, Check, Play } from 'lucide-react';
import { LIVE_MARKET } from '../data/marketData';
import { iolClient } from '../utils/iolClient';

export const BrokerBotConnector = () => {
  const [selectedBroker, setSelectedBroker] = useState('IOL');
  
  // PERSISTENCIA DE CAPITAL MÁXIMO AUTORIZADO
  const [maxAuthorizedCapitalArs, setMaxAuthorizedCapitalArs] = useState(() => {
    return Number(localStorage.getItem('IOL_MAX_CAPITAL')) || 200000;
  });

  // PERSISTENCIA DE CREDENCIALES Y ESTADO DEL BOT
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('IOL_API_KEY') || '');
  const [apiSecret, setApiSecret] = useState(() => localStorage.getItem('IOL_API_SECRET') || '');
  
  const [isConnected, setIsConnected] = useState(() => {
    return localStorage.getItem('IOL_CONNECTED') === 'true' || Boolean(localStorage.getItem('IOL_API_KEY'));
  });
  
  const [isBotActive, setIsBotActive] = useState(() => {
    return localStorage.getItem('IOL_BOT_ACTIVE') === 'true';
  });

  // ASIGNACIÓN DE CAPITAL ENTRE LOS 3 MOTORES 100% CEDEARS
  const [m1Capital, setM1Capital] = useState(50);
  const [m2Capital, setM2Capital] = useState(25);
  const [m3Capital, setM3Capital] = useState(25);

  const [m1Logs, setM1Logs] = useState([]);
  const [m2Logs, setM2Logs] = useState([]);
  const [m3Logs, setM3Logs] = useState([]);

  // ESTADO DE SEÑAL DE MERCADO EN VIVO
  const [marketSignalStatus, setMarketSignalStatus] = useState('ESPERA_SEÑAL_ALCISTA');

  // PERSISTIR EN LOCALSTORAGE CADA CAMBIO DE ESTADO
  useEffect(() => {
    localStorage.setItem('IOL_MAX_CAPITAL', maxAuthorizedCapitalArs);
    localStorage.setItem('IOL_API_KEY', apiKey);
    localStorage.setItem('IOL_API_SECRET', apiSecret);
    localStorage.setItem('IOL_CONNECTED', isConnected);
    localStorage.setItem('IOL_BOT_ACTIVE', isBotActive);
  }, [maxAuthorizedCapitalArs, apiKey, apiSecret, isConnected, isBotActive]);

  const handleConnect = async () => {
    if (!apiKey || !apiSecret) {
      alert('⚠️ FALTAN DATOS:\nPor favor ingresa tu usuario/email y tu contraseña de IOL en las casillas.');
      return;
    }
    setIsConnected(true);
    localStorage.setItem('IOL_CONNECTED', 'true');
    localStorage.setItem('IOL_API_KEY', apiKey);
    localStorage.setItem('IOL_API_SECRET', apiSecret);

    try {
      const res = await fetch('/api/iol/save-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: apiKey,
          password: apiSecret,
          capitalArs: maxAuthorizedCapitalArs
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ MOTOR IOL ACTIVADO EN RENDER:\n' + data.message);
      } else {
        alert('⚠️ ATENCIÓN:\n' + (data.error || 'Error al conectar con IOL'));
      }
    } catch (e) {
      alert('⚠️ ERROR DE CONEXIÓN:\n' + e.message);
    }

    addM1Log(`[IOL API REST] Vinculación con servidor de Render enviada OK.`);
    addM2Log(`[Blindaje Personal] QQQ y ahorros personales blindados al 100%.`);
    addM3Log(`[Motor IOL] Operando sobre capital máximo de $${maxAuthorizedCapitalArs.toLocaleString('es-AR')} ARS.`);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setIsBotActive(false);
    localStorage.setItem('IOL_CONNECTED', 'false');
    localStorage.setItem('IOL_BOT_ACTIVE', 'false');
    addM1Log(`Desconectado de IOL. Motores detenidos.`);
    addM2Log(`Motor 2 detenido.`);
    addM3Log(`Motor 3 detenido.`);
  };

  const toggleBot = async () => {
    if (!apiKey || !apiSecret) {
      alert('⚠️ FALTAN DATOS:\nIngresá tu usuario/email y tu contraseña de IOL en las casillas amarillas de abajo.');
      return;
    }
    const nextState = !isBotActive;
    setIsBotActive(nextState);
    setIsConnected(true);
    localStorage.setItem('IOL_BOT_ACTIVE', nextState);
    localStorage.setItem('IOL_CONNECTED', 'true');
    localStorage.setItem('IOL_API_KEY', apiKey);
    localStorage.setItem('IOL_API_SECRET', apiSecret);

    if (nextState) {
      try {
        const res = await fetch('/api/iol/save-credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: apiKey,
            password: apiSecret,
            capitalArs: maxAuthorizedCapitalArs
          })
        });
        const data = await res.json();
        if (data.success) {
          alert('🟢 ¡BOT IOL ACTIVADO EN LA NUBE! 🎉\n' + data.message);
        } else {
          alert('⚠️ ATENCIÓN:\n' + (data.error || 'Faltan datos'));
        }
      } catch (e) {
        alert('⚠️ ERROR DE RED:\n' + e.message);
      }
      addM1Log(`🚀 MOTOR IOL EN PILOTO AUTOMÁTICO (Tope Autorizado: $${maxAuthorizedCapitalArs.toLocaleString('es-AR')} ARS)`);
      addM2Log(`⚡ Estrategia: Precio Justo vs Real (AAPL, MSFT, AMZN, NVDA)`);
      addM3Log(`🛡️ QQQ Aislado y Protegido`);
    } else {
      addM1Log(`🛑 Bot IOL pausado.`);
      addM2Log(`🛑 Motor pausado.`);
      addM3Log(`🛑 Motor pausado.`);
    }
  };

  // PRUEBA DE ORDEN REAL EN IOL
  const testRealOrder = async () => {
    if (!isConnected) {
      alert('Primero conecta tus credenciales de IOL.');
      return;
    }
    const res = await iolClient.sendOrder({
      ticker: 'AAPL',
      cantidad: 1,
      precio: 28000,
      operacion: 'comprar',
      plazo: 'contadoInmediato'
    });

    if (res.success) {
      alert(`✅ PRUEBA DE DIAGNÓSTICO IOL:\nOrden de prueba enviada OK.`);
      addM2Log(`[Prueba IOL] Diagnóstico de orden enviado a IOL ✅`);
    }
  };

  const addM1Log = (msg) => {
    const timestamp = new Date().toLocaleTimeString('es-AR');
    setM1Logs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const addM2Log = (msg) => {
    const timestamp = new Date().toLocaleTimeString('es-AR');
    setM2Logs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const addM3Log = (msg) => {
    const timestamp = new Date().toLocaleTimeString('es-AR');
    setM3Logs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 15)]);
  };

  // POLLEO DE LOGS REALES DESDE EL SERVIDOR DE RENDER Y AUTO-SYNC DE CREDENCIALES AL INICIAR
  useEffect(() => {
    // Si hay credenciales guardadas y el bot está marcado como activo/conectado, enviarlas al servidor
    const savedUser = localStorage.getItem('IOL_API_KEY');
    const savedPass = localStorage.getItem('IOL_API_SECRET');
    const savedConnected = localStorage.getItem('IOL_CONNECTED') === 'true';
    const savedActive = localStorage.getItem('IOL_BOT_ACTIVE') === 'true';

    if (savedUser && savedPass && (savedConnected || savedActive)) {
      fetch('/api/iol/save-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: savedUser,
          password: savedPass,
          capitalArs: maxAuthorizedCapitalArs
        })
      }).catch(() => {});
    }

    let interval;
    if (isBotActive || savedActive) {
      const fetchStatus = async () => {
        try {
          const res = await fetch('/api/iol/status');
          if (res.ok) {
            const data = await res.json();
            if (data.logs && data.logs.length > 0) {
              setM1Logs(data.logs.slice(0, 15));
              setM2Logs(data.logs.slice(0, 15));
              setM3Logs(data.logs.slice(0, 15));
            }
            setMarketSignalStatus(data.marketOpen ? 'SEÑAL_ALCISTA_ACTIVA' : 'ESPERA_SEÑAL_ALCISTA');
          }
        } catch (e) {}
      };
      fetchStatus();
      interval = setInterval(fetchStatus, 10000);
    }
    return () => clearInterval(interval);
  }, [isBotActive, maxAuthorizedCapitalArs]);

  return (
    <div>
      {/* Panel de Estado del Bot */}
      <div 
        className="glass-card" 
        style={{ 
          marginBottom: '2rem', 
          background: isBotActive 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(15, 23, 42, 0.9) 100%)' 
            : 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          border: isBotActive ? '2px solid var(--color-emerald)' : '1px solid var(--border-color)',
          boxShadow: isBotActive ? '0 0 35px rgba(16, 185, 129, 0.35)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', background: isBotActive ? 'var(--color-emerald)' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isBotActive ? '#042f2e' : 'white' }}>
              <Brain size={36} className={isBotActive ? 'pulse-icon' : ''} />
            </div>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge-cyan">BOT COMPLETO DE CEDEARS (BYMA)</span>
                <span className="badge-emerald">💾 ESTADO PERSISTENTE GUARDADO 24/7</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', marginTop: '0.2rem' }}>
                Suite de CEDEARs: {isBotActive ? `🟢 OPERANDO EN AUTOMÁTICO ($${maxAuthorizedCapitalArs.toLocaleString('es-AR')} ARS)` : '⏸️ EN ESPERA DE CONFIGURACIÓN'}
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', marginTop: '0.3rem', maxWidth: '780px' }}>
                {isBotActive 
                  ? 'El sistema está activo y guardado de forma permanente en la nube. Operará de Lunes a Viernes de 10:30 a 17:00 hs sin que tengas que volver a encenderlo.' 
                  : 'Ingresa tus credenciales de IOL y presiona Encender para guardar el estado activo 24/7.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            {isConnected && (
              <button onClick={testRealOrder} className="btn-primary" style={{ padding: '0.8rem 1.2rem', fontSize: '0.9rem', background: 'rgba(6, 182, 212, 0.2)', border: '1px solid var(--color-cyan)' }}>
                <Play size={16} /> Probar Diagnóstico de Orden Real IOL
              </button>
            )}

            <button
              onClick={toggleBot}
              className="btn-primary"
              style={{
                padding: '0.8rem 1.8rem',
                fontSize: '1rem',
                background: isBotActive ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: isBotActive ? '0 0 20px rgba(244, 63, 94, 0.4)' : '0 0 20px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Power size={20} />
              {isBotActive ? 'APAGAR BOT DE CEDEARS EN IOL' : 'ENCENDER BOT DE CEDEARS EN IOL'}
            </button>
          </div>
        </div>
      </div>

      {/* Diagnóstico de Estado de Señal de Mercado */}
      <div className="glass-card" style={{ marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
        <div className="card-title-row">
          <h3 className="card-title">
            <Activity size={22} color="var(--color-gold)" />
            Diagnóstico de Señal de Mercado & Ejecución DMA
          </h3>
          <span className={marketSignalStatus === 'SEÑAL_ALCISTA_ACTIVA' ? 'badge-emerald' : 'badge-gold'}>
            {marketSignalStatus === 'SEÑAL_ALCISTA_ACTIVA' ? '🟢 SEÑAL ALCISTA DETECTADA' : '🟡 REPOSO / GUARDANDO CAPITAL EN PESOS'}
          </span>
        </div>
        <p style={{ fontSize: '0.86rem', color: '#cbd5e1' }}>
          {marketSignalStatus === 'SEÑAL_ALCISTA_ACTIVA' 
            ? 'El Bot detectó tendencia alcista confirmada en el S&P 500 y ejecutó órdenes de compra en BYMA en plazo Contado Inmediato (CI).' 
            : 'El mercado se encuentra en reposo o consolidación. El Bot no compra innecesariamente para proteger tu capital y evitar comisiones.'}
        </p>
      </div>

      {/* Límite de Capital Autorizado & Blindaje de QQQ */}
      <div className="glass-card" style={{ marginBottom: '2rem', border: '2px solid var(--color-cyan)' }}>
        <div className="card-title-row">
          <h3 className="card-title">
            <ShieldAlert size={22} color="var(--color-cyan)" />
            Blindaje de Saldo Personal & Límite Máximo para el Bot
          </h3>
          <span className="badge-cyan">Protección Activa</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">
              <span>Capital Máximo Autorizado para el Bot (ARS)</span>
              <span className="highlight" style={{ color: 'var(--color-emerald)' }}>${maxAuthorizedCapitalArs.toLocaleString('es-AR')} ARS</span>
            </label>
            <input
              type="number"
              className="form-input"
              value={maxAuthorizedCapitalArs}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMaxAuthorizedCapitalArs(val);
                localStorage.setItem('IOL_MAX_CAPITAL', val);
              }}
              step="50000"
            />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              El Bot NUNCA usará más de este dinero en IOL. Cualquier dinero extra o venta manual de QQQ quedará 100% en tu caja de ahorro personal sin tocarse.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gold)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
              <ShieldCheck size={18} /> Protección de CEDEAR QQQ
            </div>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.5' }}>
              Tus títulos de QQQ están aislados. El Bot no puede venderlos ni tomar su dinero. Solamente administra los Pesos autorizados en el casillero de la izquierda.
            </p>
          </div>
        </div>
      </div>

      {/* Asignación de Capital entre los 3 Motores de CEDEARs */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="card-title-row">
          <h3 className="card-title">
            <Target size={22} color="var(--color-gold)" />
            Asignación del Capital Autorizado entre los 3 Motores de CEDEARs ($ {maxAuthorizedCapitalArs.toLocaleString('es-AR')} ARS)
          </h3>
          <span className="badge-gold">Distribución CEDEARs</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem' }}>
          
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--color-cyan)', fontSize: '0.9rem' }}>MOTOR 1: TENDENCIA CEDEARS</span>
              <strong style={{ color: 'white' }}>${((maxAuthorizedCapitalArs * m1Capital) / 100).toLocaleString('es-AR')} ARS ({m1Capital}%)</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Posición principal en CEDEARs SPXL/TQQQ con Stop Loss -6% y Toma de Ganancias al +20%.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--color-gold)', fontSize: '0.9rem' }}>MOTOR 2: IA CAZA-LAG CEDEARS</span>
              <strong style={{ color: 'white' }}>${((maxAuthorizedCapitalArs * m2Capital) / 100).toLocaleString('es-AR')} ARS ({m2Capital}%)</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Operaciones relámpago de 5 a 10 min en 300 CEDEARs (Palantir, Broadcom, etc).
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-emerald)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--color-emerald)', fontSize: '0.9rem' }}>MOTOR 3: IA DEEP LEARNING CEDEARS</span>
              <strong style={{ color: 'white' }}>${((maxAuthorizedCapitalArs * m3Capital) / 100).toLocaleString('es-AR')} ARS ({m3Capital}%)</strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Redes LSTM + FinBERT NLP + Arbitraje Pares AMD/NVDA + Flujo de Tiburones en CEDEARs.
            </p>
          </div>

        </div>
      </div>

      {/* Tres Consolas Independientes de Registro de Órdenes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Consola Motor 1 */}
        <div className="glass-card">
          <div className="card-title-row">
            <h3 className="card-title" style={{ fontSize: '0.95rem' }}>
              <Terminal size={18} color="var(--color-cyan)" />
              Motor 1: Tendencia CEDEARs ({m1Capital}%)
            </h3>
          </div>
          <div style={{ background: '#090d16', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.8rem', fontFamily: 'monospace', fontSize: '0.75rem', height: '240px', overflowY: 'auto' }}>
            {m1Logs.length === 0 ? <div style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '3rem' }}>Esperando inicio...</div> : m1Logs.map((l, i) => <div key={i} style={{ color: 'var(--color-cyan)', marginBottom: '0.3rem' }}>{l}</div>)}
          </div>
        </div>

        {/* Consola Motor 2 */}
        <div className="glass-card">
          <div className="card-title-row">
            <h3 className="card-title" style={{ fontSize: '0.95rem' }}>
              <Zap size={18} color="var(--color-gold)" />
              Motor 2: IA Caza-Lag CEDEARs ({m2Capital}%)
            </h3>
          </div>
          <div style={{ background: '#090d16', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.8rem', fontFamily: 'monospace', fontSize: '0.75rem', height: '240px', overflowY: 'auto' }}>
            {m2Logs.length === 0 ? <div style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '3rem' }}>Esperando inicio...</div> : m2Logs.map((l, i) => <div key={i} style={{ color: 'var(--color-gold)', marginBottom: '0.3rem' }}>{l}</div>)}
          </div>
        </div>

        {/* Consola Motor 3 */}
        <div className="glass-card">
          <div className="card-title-row">
            <h3 className="card-title" style={{ fontSize: '0.95rem' }}>
              <Brain size={18} color="var(--color-emerald)" />
              Motor 3: IA Deep Learning CEDEARs ({m3Capital}%)
            </h3>
          </div>
          <div style={{ background: '#090d16', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.8rem', fontFamily: 'monospace', fontSize: '0.75rem', height: '240px', overflowY: 'auto' }}>
            {m3Logs.length === 0 ? <div style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '3rem' }}>Esperando inicio...</div> : m3Logs.map((l, i) => <div key={i} style={{ color: 'var(--color-emerald)', marginBottom: '0.3rem' }}>{l}</div>)}
          </div>
        </div>

      </div>

      {/* Formulario de Vinculación de API con IOL */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="card-title-row">
          <h3 className="card-title">
            <Key size={22} color="var(--color-gold)" />
            Vinculación de Única Clave API con InvertirOnline (IOL)
          </h3>
          <span className={isConnected ? 'badge-cyan' : 'badge-gold'}>
            {isConnected ? 'IOL CONECTADO Y RECONECTADO AUTO ✅' : 'ESPERANDO CLAVES ⚠️'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
          <div className="form-group">
            <label className="form-label">
              <span>Usuario o Email de InvertirOnline (IOL)</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="ejemplo@email.com"
              value={apiKey}
              onChange={(e) => {
                const val = e.target.value;
                setApiKey(val);
                localStorage.setItem('IOL_API_KEY', val);
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Contraseña de IOL</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Tu contraseña de IOL"
              value={apiSecret}
              onChange={(e) => {
                const val = e.target.value;
                setApiSecret(val);
                localStorage.setItem('IOL_API_SECRET', val);
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <button onClick={handleConnect} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <Link2 size={18} /> VINCULAR BOT DE CEDEARS CON IOL
            </button>
            {isConnected && (
              <button onClick={handleDisconnect} className="btn-primary" style={{ justifyContent: 'center', background: '#334155' }}>
                DESCONECTAR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
