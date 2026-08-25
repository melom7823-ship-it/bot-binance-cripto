import React from 'react';
import { BookOpen, ShieldCheck, AlertOctagon, TrendingUp, Zap, HelpCircle, Check } from 'lucide-react';

export const StrategyGuide = () => {
  return (
    <div>
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="card-title-row">
          <h3 className="card-title">
            <BookOpen size={22} color="var(--color-emerald)" />
            Manual Estratégico Cuantitativo: SPXL Quant Guard (3X)
          </h3>
          <span className="badge-gold">Inversión Profesional en BYMA</span>
        </div>

        <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1rem', marginBottom: '1.5rem' }}>
          El CEDEAR **SPXL** (Direxion Daily S&P 500 Bull 3X) es uno de los instrumentos más potentes y volátiles del mercado financiero. Replica el **300% (3x) del movimiento diario del índice S&P 500**. Para lograr rentabilidad consistente a largo plazo, **es imprescindible usar un filtro cuantitativo de tendencia**.
        </p>

        {/* Why Beta Slippage Exists */}
        <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem' }}>
          <h4 style={{ color: 'var(--color-rose)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.1rem', marginBottom: '0.6rem' }}>
            <AlertOctagon size={22} />
            ¿Por qué la estrategia "Comprar y Mantener" (Buy & Hold) no funciona sola en un ETF 3x?
          </h4>
          <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6' }}>
            Debido al **rebalanceo diario** del ETF apalancado, si el S&P 500 se mueve de forma lateral con alta volatilidad (por ejemplo, cae 5% un día y sube 5% al día siguiente), el ETF 3x sufre **degradación matemática (Beta Slippage)**. Por eso, la estrategia **SPXL Quant Guard** solo mantiene posiciones abiertas cuando el S&P 500 está en tendencia alcista primaria (sobre la media móvil de 200 días).
          </p>
        </div>

        {/* 4 Golden Rules */}
        <h4 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap color="var(--color-gold)" size={20} />
          Las 4 Reglas de Oro de la Estrategia
        </h4>

        <div className="rules-grid">
          <div className="rule-box">
            <div className="rule-number">1</div>
            <h5 className="rule-title">Filtro de Tendencia (S&amp;P 500 &gt; 200 SMA)</h5>
            <p className="rule-desc">
              Solo se compra CEDEAR SPXL cuando el S&P 500 spot cotiza por encima de su Media Móvil Simple de 200 días. Si rompe a la baja, se vende inmediatamente a Cauciones/Cash.
            </p>
          </div>

          <div className="rule-box">
            <div className="rule-number">2</div>
            <h5 className="rule-title">Filtro de Volatilidad VIX (&lt; 25)</h5>
            <p className="rule-desc">
              El apalancamiento 3X requiere baja turbulencia. Si el índice VIX supera los 25 puntos, el algoritmo pausa compras adicionales para prevenir caídas bruscas.
            </p>
          </div>

          <div className="rule-box">
            <div className="rule-number">3</div>
            <h5 className="rule-title">Trailing Stop ATR de Protección</h5>
            <p className="rule-desc">
              A medida que la posición acumula ganancias (+15%, +30%), el Stop Loss sube automáticamente siguiendo el precio (Trailing Stop a 2.5x ATR) para asegurar ganancias.
            </p>
          </div>

          <div className="rule-box">
            <div className="rule-number">4</div>
            <h5 className="rule-title">Doble Cobertura Pesos/Dólar (CCL)</h5>
            <p className="rule-desc">
              Al cotizar en Pesos ARS pero replicar un activo en USD, la posición te protege 100% contra la inflación y la devaluación del peso argentino a través del tipo de cambio CCL.
            </p>
          </div>
        </div>
      </div>

      {/* Broker Execution Guide & FAQ */}
      <div className="glass-card">
        <h3 className="card-title" style={{ marginBottom: '1.2rem' }}>
          <HelpCircle size={22} color="var(--color-cyan)" />
          Preguntas Frecuentes & Guía de Operación en Argentina
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <h4 style={{ color: 'var(--color-cyan)', fontSize: '1rem', marginBottom: '0.4rem' }}>
              ¿En qué brokers de Argentina puedo operar el CEDEAR SPXL?
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              En cualquier ALyC / Agente de Bolsa regulado por la CNV, como Bull Market Brokers, PPI (Portfolio Personal Inversiones), IOL (InvertirOnline), Balanz, Cocos Capital o tu banco tradicional.
            </p>
          </div>

          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <h4 style={{ color: 'var(--color-cyan)', fontSize: '1rem', marginBottom: '0.4rem' }}>
              ¿Cuál es el ticker y el ratio del CEDEAR?
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              El ticker en Pesos es **SPXL** (o **SPXLD** si compras en USD). El ratio de conversión es **20:1** (significa que 20 CEDEARs equivalen a 1 acción entera del ETF SPXL en Wall Street).
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--color-cyan)', fontSize: '1rem', marginBottom: '0.4rem' }}>
              ¿Puedo operar tanto en ARS como en USD?
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Sí. Puedes comprar en Pesos (SPXL) y vender en Dólares (SPXLD) para realizar operaciones de cambio de moneda (dólar CCL) cuando lo necesites.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
