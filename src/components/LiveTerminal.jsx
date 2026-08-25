import React from 'react';
import { ShieldCheck, AlertTriangle, TrendingUp, Cpu, Compass, CheckCircle2, RefreshCw } from 'lucide-react';
import { evaluateCurrentSignal } from '../utils/quantEngine';
import { LIVE_MARKET } from '../data/marketData';

export const LiveTerminal = () => {
  const signalInfo = evaluateCurrentSignal(LIVE_MARKET);

  const getSignalIcon = () => {
    if (signalInfo.signal === 'BUY') return <ShieldCheck size={36} />;
    if (signalInfo.signal === 'WAIT') return <Compass size={36} />;
    return <AlertTriangle size={36} />;
  };

  return (
    <div>
      {/* Dynamic Signal Banner */}
      <div className={`signal-banner ${signalInfo.signal}`}>
        <div className="signal-left">
          <div className="signal-icon-box">
            {getSignalIcon()}
          </div>
          <div>
            <span className="signal-badge">ESTADO ALGORÍTMICO ACTUAL</span>
            <h2 className="signal-main-text">{signalInfo.title}</h2>
            <p className="signal-subtext">{signalInfo.reason}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            Nivel de Confianza
          </div>
          <div style={{ fontSize: '2rem', fontStyle: 'normal', fontWeight: 800, color: 'white' }}>
            {signalInfo.confidence}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Actualizado: {LIVE_MARKET.lastUpdated} hs
          </span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid-metrics">
        <div className="metric-card">
          <div className="metric-header">
            <span>S&P 500 SPOT vs SMA 200</span>
            <TrendingUp size={16} color="var(--color-emerald)" />
          </div>
          <div className="metric-value">{LIVE_MARKET.sp500Index.toLocaleString()} pts</div>
          <div className="metric-sub positive">
            <span>+{signalInfo.metrics.smaDistance}% por encima de SMA 200 ({LIVE_MARKET.sp500Sma200.toLocaleString()} pts)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>RSI (14 Períodos)</span>
            <Cpu size={16} color="var(--color-cyan)" />
          </div>
          <div className="metric-value">{LIVE_MARKET.rsi14}</div>
          <div className="metric-sub positive">
            <span>Zona de Expansión (Óptimo entre 45 y 70)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>VOLATILIDAD (VIX)</span>
            <AlertTriangle size={16} color="var(--color-gold)" />
          </div>
          <div className="metric-value" style={{ color: LIVE_MARKET.vixIndex < 20 ? 'var(--color-emerald)' : 'var(--color-gold)' }}>
            {LIVE_MARKET.vixIndex} pts
          </div>
          <div className="metric-sub positive">
            <span>Volatilidad Baja (Favorable para Apalancamiento 3X)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>TIPO DE CAMBIO CCL (ARS)</span>
            <RefreshCw size={16} color="var(--color-purple)" />
          </div>
          <div className="metric-value">${LIVE_MARKET.cclRate} ARS</div>
          <div className="metric-sub neutral">
            <span>Brecha Estable en Mercado Bursátil (BYMA)</span>
          </div>
        </div>
      </div>

      {/* Quantitative Rules & Execution Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card">
          <div className="card-title-row">
            <h3 className="card-title">
              <CheckCircle2 size={20} color="var(--color-emerald)" />
              Matriz de Parámetros de Operación (SPXL)
            </h3>
            <span className="badge-gold">Brokers Locales (BYMA)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Ticker Operable en Argentina</span>
              <strong style={{ color: 'var(--color-gold)' }}>SPXL (ARS) / SPXLD (USD)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Precio Estimado Entrada CEDEAR</span>
              <strong>${LIVE_MARKET.cedearPriceArs.toLocaleString('es-AR')} ARS</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Stop Loss Fijo Sugerido</span>
              <strong style={{ color: 'var(--color-rose)' }}>-6.0% (ARS: ${(LIVE_MARKET.cedearPriceArs * 0.94).toFixed(0)})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Take Profit Parcial 1 (+15%)</span>
              <strong style={{ color: 'var(--color-emerald)' }}>${(LIVE_MARKET.cedearPriceArs * 1.15).toFixed(0)} ARS</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Take Profit Parcial 2 (+30%)</span>
              <strong style={{ color: 'var(--color-emerald)' }}>${(LIVE_MARKET.cedearPriceArs * 1.30).toFixed(0)} ARS</strong>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            <Cpu size={20} color="var(--color-cyan)" />
            Diagnóstico Cuantitativo del Algoritmo
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.2rem' }}>
            La estrategia **SPXL Quant Guard** protege tu capital contra el decaimiento matemático del apalancamiento 3X (*Beta Slippage*). Cuando el S&P 500 ingresa en tendencia alcista confirmada (sobre la SMA 200), el apalancamiento multiplicador acelera las ganancias en USD y ARS.
          </p>
          <div style={{ background: 'rgba(6, 182, 212, 0.1)', borderLeft: '4px solid var(--color-cyan)', padding: '1rem', borderRadius: '4px' }}>
            <h4 style={{ color: 'var(--color-cyan)', fontSize: '0.95rem', marginBottom: '0.4rem' }}>Regla de Oro en Argentina:</h4>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              Operar el CEDEAR en ARS te da doble cobertura: acompañar la suba del S&P 500 multiplicado x3 + proteger tu capital contra la devaluación vía tipo de cambio CCL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
