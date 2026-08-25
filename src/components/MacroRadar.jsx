import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Calendar, Globe, Zap, Fuel, Landmark, Cpu, TrendingUp, TrendingDown, Clock, CheckCircle2, RefreshCw, Radio, Newspaper } from 'lucide-react';
import { fetchLiveMacroData } from '../utils/macroFetcher';

export const MacroRadar = () => {
  const [filterImpact, setFilterImpact] = useState('ALL');
  const [macroState, setMacroState] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadMacroData = async () => {
    setIsUpdating(true);
    const data = await fetchLiveMacroData();
    setMacroState(data);
    setIsUpdating(false);
  };

  useEffect(() => {
    loadMacroData();
    const interval = setInterval(loadMacroData, 15000); // Polling cada 15s
    return () => clearInterval(interval);
  }, []);

  if (!macroState) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <RefreshCw size={32} className="spin" color="var(--color-emerald)" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando datos macroeconómicos y noticias globales en vivo...</p>
      </div>
    );
  }

  const { macroIndicators, riskScore, riskLevel, riskTitle, riskMessage, dailyNews } = macroState;

  // Próximos eventos agendados del calendario económico mundial
  const upcomingEvents = [
    {
      id: 1,
      fecha: 'Próximo Miércoles 15:00 hs',
      categoria: 'EE.UU. - Reserva Federal (FED)',
      evento: 'Decisión de Tasa de Interés (Tasa Actual: ' + macroIndicators.fedRate + ')',
      impacto: 'HIGH',
      descripcion: 'La FED anunciará si modifica o mantiene la tasa de referencia en EE.UU.',
      efectoEsperado: '🟢 Si bajan la tasa: S&P 500 tiende a subir +1.5% a +2.5% (+4.5% a +7.5% en SPXL). 🔴 Si la mantienen alta: Volatilidad.',
      recomendacion: 'Mantener Stop Loss ajustado al 6%.'
    },
    {
      id: 2,
      fecha: 'Próximo Jueves 09:30 hs',
      categoria: 'EE.UU. - Inflación (CPI Report)',
      evento: 'Publicación del IPC (Nivel Actual: ' + macroIndicators.usCpiInflation + ')',
      impacto: 'HIGH',
      descripcion: 'Mide la inflación al consumidor en Estados Unidos.',
      efectoEsperado: '🟢 Si la inflación baja: Rally alcista en Big Tech y S&P 500. 🔴 Si sube: Corrección en bolsas.',
      recomendacion: 'Verificar que la señal de la app esté en VERDE.'
    },
    {
      id: 3,
      fecha: 'Primer Viernes del Mes 09:30 hs',
      categoria: 'EE.UU. - Mercado Laboral',
      evento: 'Informe de Desempleo (Tasa Actual: ' + macroIndicators.usUnemploymentRate + ')',
      impacto: 'HIGH',
      descripcion: 'Muestra la salud del empleo y creación de puestos de trabajo.',
      efectoEsperado: '🟢 Empleo estable: "Goldilocks Economy" (escenario ideal para SPXL). 🔴 Desempleo muy alto (>4.3%): Riesgo de recesión.',
      recomendacion: 'Monitorear apertura de rueda el viernes.'
    },
    {
      id: 4,
      fecha: 'Temporada de Balances',
      categoria: 'Tecnología - Magníficas 7',
      evento: 'Reportes Trimestrales de Nvidia, Apple y Microsoft',
      impacto: 'HIGH',
      descripcion: 'Las grandes tecnológicas representan más del 30% del índice S&P 500.',
      efectoEsperado: '🟢 Ganancias superiores: Fuerte impulso alcista a SPXL 3X. 🔴 Decepción: Corrección sectorial.',
      recomendacion: 'Revisar oscilador RSI en la solapa de Gráficos.'
    },
    {
      id: 5,
      fecha: 'Monitoreo en Vivo 24/7',
      categoria: 'Energía & Geopolítica',
      evento: 'Petróleo WTI ($' + macroIndicators.wtiOilPrice + '/barril)',
      impacto: 'MEDIUM',
      descripcion: 'El precio del crudo impacta en las expectativas de inflación.',
      efectoEsperado: '🟢 Crudo < $82: Entorno positivo para SPXL. 🔴 Crudo > $95: Alarma inflacionaria.',
      recomendacion: 'Crudo en $78.45 (Zona de tranquilidad).'
    }
  ];

  const filteredEvents = upcomingEvents.filter(e => filterImpact === 'ALL' || e.impacto === filterImpact);

  return (
    <div>
      {/* Dynamic Live Status Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.2rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.8rem 1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-emerald)', fontWeight: 700, fontSize: '0.9rem' }}>
          <Radio size={18} className="pulse-icon" />
          <span>RADAR MACRO ACTUALIZADO DÍA A DÍA ({macroIndicators.todayStr})</span>
        </div>
        <button onClick={loadMacroData} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
          <RefreshCw size={14} className={isUpdating ? 'spin' : ''} />
          {isUpdating ? 'Actualizando...' : `Última sincronización: ${macroIndicators.lastUpdate}`}
        </button>
      </div>

      {/* Top Risk Radar Meter */}
      <div className="glass-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}>
              <Globe size={32} />
            </div>
            <div>
              <span className="badge-cyan">DIAGNÓSTICO MACROECONÓMICO GLOBAL DÍA A DÍA</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', marginTop: '0.2rem' }}>
                {riskTitle}
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', marginTop: '0.3rem', maxWidth: '750px' }}>
                {riskMessage}
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1rem 1.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NIVEL DE RIESGO MACRO</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-emerald)' }}>{riskScore} / 100</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-emerald)', fontWeight: 700 }}>Semáforo Verde Cuantitativo</span>
          </div>
        </div>
      </div>

      {/* Tarjetas de Indicadores Macro en Tiempo Real */}
      <div className="grid-metrics" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '2rem' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span>TASA DE INTERÉS FED</span>
            <Landmark size={16} color="var(--color-gold)" />
          </div>
          <div className="metric-value" style={{ color: 'var(--color-gold)', fontSize: '1.4rem' }}>
            {macroIndicators.fedRate}
          </div>
          <div className="metric-sub neutral">Expectativa de baja de tasas</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>INFLACIÓN IPC EE.UU.</span>
            <TrendingUp size={16} color="var(--color-emerald)" />
          </div>
          <div className="metric-value" style={{ color: 'var(--color-emerald)', fontSize: '1.4rem' }}>
            {macroIndicators.usCpiInflation}
          </div>
          <div className="metric-sub positive">Trayectoria a la baja</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>TASA DESEMPLEO EE.UU.</span>
            <Cpu size={16} color="var(--color-cyan)" />
          </div>
          <div className="metric-value" style={{ color: 'var(--color-cyan)', fontSize: '1.4rem' }}>
            {macroIndicators.usUnemploymentRate}
          </div>
          <div className="metric-sub positive">Mercado laboral sólido</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>PETRÓLEO WTI (USD)</span>
            <Fuel size={16} color="var(--color-purple)" />
          </div>
          <div className="metric-value" style={{ color: 'var(--color-purple)', fontSize: '1.4rem' }}>
            ${macroIndicators.wtiOilPrice} / bbl
          </div>
          <div className="metric-sub positive">Zona de estabilidad</div>
        </div>
      </div>

      {/* Noticiero Financiero Diario & Catalizadores */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="card-title-row">
          <h3 className="card-title">
            <Newspaper size={24} color="var(--color-emerald)" />
            Noticias & Novedades Financieras del Día ({macroIndicators.todayStr})
          </h3>
          <span className="badge-gold">Actualización Diaria</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {dailyNews.map((n) => (
            <div key={n.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-cyan)', fontWeight: 700 }}>{n.categoria} • {n.hora}</span>
                <span className="badge-cyan">Noticia Relevante</span>
              </div>
              <h4 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.3rem' }}>{n.titulo}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '0.5rem' }}>{n.resumen}</p>
              <div style={{ fontSize: '0.83rem', color: 'var(--color-emerald)', fontWeight: 600 }}>{n.efectoCedear}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alarmero & Calendario de Eventos Futuros */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="card-title-row" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <h3 className="card-title">
            <Calendar size={24} color="var(--color-gold)" />
            Alarmero Económico & Próximos Anuncios (Impacto en SPXL)
          </h3>

          <div style={{ display: 'flex', gap: '0.4rem', background: '#0f172a', padding: '0.3rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <button onClick={() => setFilterImpact('ALL')} style={{ background: filterImpact === 'ALL' ? 'var(--color-gold)' : 'transparent', color: filterImpact === 'ALL' ? '#451a03' : 'var(--text-muted)', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
              TODOS
            </button>
            <button onClick={() => setFilterImpact('HIGH')} style={{ background: filterImpact === 'HIGH' ? 'var(--color-rose)' : 'transparent', color: filterImpact === 'HIGH' ? 'white' : 'var(--text-muted)', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
              IMPACTO ALTO 🔴
            </button>
            <button onClick={() => setFilterImpact('MEDIUM')} style={{ background: filterImpact === 'MEDIUM' ? 'var(--color-cyan)' : 'transparent', color: filterImpact === 'MEDIUM' ? '#042f2e' : 'var(--text-muted)', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
              MEDIO 🟡
            </button>
          </div>
        </div>

        {/* Lista de Alertas Programadas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {filteredEvents.map((evt) => (
            <div 
              key={evt.id}
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid var(--border-color)',
                borderLeft: evt.impacto === 'HIGH' ? '5px solid var(--color-rose)' : '5px solid var(--color-gold)',
                borderRadius: 'var(--radius-md)',
                padding: '1.4rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ background: 'rgba(15, 23, 42, 0.8)', color: 'var(--color-gold)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={14} /> {evt.fecha}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>{evt.categoria}</span>
                </div>

                <span className={evt.impacto === 'HIGH' ? 'badge-rose' : 'badge-gold'} style={{ background: evt.impacto === 'HIGH' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)', color: evt.impacto === 'HIGH' ? '#fca5a5' : '#fde047', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                  IMPACTO EN SPXL: {evt.impacto === 'HIGH' ? 'ALTO (3X)' : 'MODERADO'}
                </span>
              </div>

              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', marginBottom: '0.4rem' }}>{evt.evento}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.8rem', lineHeight: '1.5' }}>{evt.descripcion}</p>

              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.6rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-cyan)', marginBottom: '0.2rem' }}>
                  ⚡ EFECTO ESPERADO EN TU CEDEAR SPXL:
                </div>
                <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.4' }}>{evt.efectoEsperado}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-emerald)', fontSize: '0.85rem', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>Recomendación del Asesor: {evt.recomendacion}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
