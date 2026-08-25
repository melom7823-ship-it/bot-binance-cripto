import React, { useState } from 'react';
import { Calculator, ArrowRightLeft, ShieldCheck, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { calculatePositionSize } from '../utils/quantEngine';
import { LIVE_MARKET } from '../data/marketData';

export const CedearCalculator = () => {
  const [portfolioArs, setPortfolioArs] = useState(2500000); // 2.5 millones ARS por defecto
  const [riskPercent, setRiskPercent] = useState(2); // 2% de riesgo máximo
  const [stopLoss, setStopLoss] = useState(6); // 6% de stop loss

  // Arbitraje CCL interactivo
  const [customSpxlUsd, setCustomSpxlUsd] = useState(LIVE_MARKET.spxlPriceUsd);
  const [customCcl, setCustomCcl] = useState(LIVE_MARKET.cclRate);

  // Cálculo del tamaño de posición
  const posResult = calculatePositionSize({
    portfolioValue: Number(portfolioArs),
    riskTolerancePercent: Number(riskPercent),
    stopLossPercent: Number(stopLoss),
    cclRate: Number(customCcl),
    cedearPriceArs: (customSpxlUsd * customCcl) / 20
  });

  const estimatedCedearPrice = (customSpxlUsd * customCcl) / 20;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.8rem' }}>
        
        {/* Calculadora de Tamaño de Posición (Position Sizing) */}
        <div className="glass-card">
          <div className="card-title-row">
            <h3 className="card-title">
              <Calculator size={22} color="var(--color-emerald)" />
              Calculadora de Gestión de Riesgo & Tamaño de Posición
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="form-group">
              <label className="form-label">
                <span>Tu Capital Total en Argentina (ARS)</span>
                <span className="highlight">${Number(portfolioArs).toLocaleString('es-AR')} ARS</span>
              </label>
              <input
                type="number"
                className="form-input"
                value={portfolioArs}
                onChange={(e) => setPortfolioArs(e.target.value)}
                step="50000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Riesgo Máximo por Operación (% de Cartera)</span>
                <span className="highlight">{riskPercent}%</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                className="custom-range"
                value={riskPercent}
                onChange={(e) => setRiskPercent(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem', display: 'block' }}>
                Recomendado en trading profesional: Máximo 1% a 2% de la cuenta por operación.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Distancia al Stop Loss</span>
                <span className="highlight">{stopLoss}%</span>
              </label>
              <input
                type="range"
                min="3"
                max="12"
                step="1"
                className="custom-range"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
              />
            </div>

            {/* Results Output */}
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cantidad Sugerida de CEDEARs:</span>
                <strong style={{ color: 'var(--color-emerald)', fontSize: '1.2rem' }}>
                  {posResult.suggestedCedears.toLocaleString()} nominales
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Monto Total a Invertir (ARS):</span>
                <strong>${posResult.totalInvestmentArs} ARS</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Equivalente en Dólares (USD):</span>
                <strong style={{ color: 'var(--color-gold)' }}>${posResult.investmentUsd} USD</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>% de tu Cartera Utilizado:</span>
                <strong>{posResult.investmentPercentOfPortfolio}%</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.6rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                <span style={{ color: 'var(--color-rose)', fontWeight: 600 }}>Pérdida Máxima si Toca Stop:</span>
                <strong style={{ color: 'var(--color-rose)' }}>-${posResult.maxRiskAmountArs} ARS</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Convertidor de Cotizaciones & Arbitraje CCL */}
        <div className="glass-card">
          <div className="card-title-row">
            <h3 className="card-title">
              <ArrowRightLeft size={22} color="var(--color-cyan)" />
              Calculadora de Cotización CEDEAR & CCL (BYMA)
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="form-group">
              <label className="form-label">
                <span>Precio ETF SPXL en USA (USD)</span>
                <span className="highlight">${customSpxlUsd} USD</span>
              </label>
              <input
                type="number"
                className="form-input"
                value={customSpxlUsd}
                onChange={(e) => setCustomSpxlUsd(e.target.value)}
                step="0.5"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Tipo de Cambio Contado Con Liquidación (CCL)</span>
                <span className="highlight">${customCcl} ARS</span>
              </label>
              <input
                type="number"
                className="form-input"
                value={customCcl}
                onChange={(e) => setCustomCcl(e.target.value)}
                step="5"
              />
            </div>

            <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: 'var(--radius-md)', padding: '1.2rem' }}>
              <h4 style={{ color: 'var(--color-cyan)', marginBottom: '0.8rem', fontSize: '1rem' }}>Fórmula Teórica del CEDEAR SPXL:</h4>
              <div style={{ fontFamily: 'monospace', background: '#0f172a', padding: '0.6rem 0.8rem', borderRadius: '4px', color: '#f8fafc', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Precio CEDEAR = (Precio ETF USD × CCL) / 20
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Precio Estimado 1 CEDEAR SPXL:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-cyan)' }}>
                  ${estimatedCedearPrice.toFixed(2)} ARS
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(251, 191, 36, 0.08)', borderLeft: '4px solid var(--color-gold)', padding: '1rem', borderRadius: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gold)', fontWeight: 700, marginBottom: '0.3rem' }}>
                <AlertCircle size={18} />
                <span>Consejo de Ejecución en Broker</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                En plataformas como Bull Market, IOL, Balanz o PPI, opera siempre en plazo **CI (Contado Inmediato)** o **24hs** mediante órdenes límite para garantizar el mejor precio frente al spread de mercado.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
