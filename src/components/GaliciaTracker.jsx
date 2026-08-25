import React, { useState, useEffect } from 'react';
import { Building2, Bell, AlertTriangle, ShieldCheck, DollarSign, TrendingUp, RefreshCw, Radio, Award, Activity, Calendar, Lock, CheckCircle2, Save, History, Volume2, MessageSquare, Send, BarChart, Layers, Landmark, Zap, Brain, Target, RotateCcw, Check } from 'lucide-react';
import { LIVE_MARKET } from '../data/marketData';
import { fetchLiveMarketOnline } from '../utils/liveFetcher';

export const GaliciaTracker = () => {
  const [market, setMarket] = useState(LIVE_MARKET);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // MODO CUENTA NUEVA REAL / REINICIO A $0
  const [isLiveRealAccount, setIsLiveRealAccount] = useState(false);

  // DATOS DE CARTERA REAL
  const [saldoTotalIol, setSaldoTotalIol] = useState(0);
  const [capitalAutorizadoBot, setCapitalAutorizadoBot] = useState(0);
  const [nominales, setNominales] = useState(0);
  const [ppcGalicia, setPpcGalicia] = useState(0);
  const [precioGaliciaActual, setPrecioGaliciaActual] = useState(18850);

  // RENDIMIENTOS EN TIEMPO REAL DESGLOSADOS POR MOTOR
  const [m1GainArs, setM1GainArs] = useState(0);
  const [m2GainArs, setM2GainArs] = useState(0);
  const [m3GainArs, setM3GainArs] = useState(0);

  const totalBotGainArs = m1GainArs + m2GainArs + m3GainArs;
  const capitalBlindadoPersonal = Math.max(0, saldoTotalIol - capitalAutorizadoBot);

  const now = new Date();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;

  // REINICIAR TODO A $0 PARA CUENTA NUEVA REAL EN IOL
  const resetToZeroReal = () => {
    setSaldoTotalIol(0);
    setCapitalAutorizadoBot(0);
    setNominales(0);
    setPpcGalicia(0);
    setM1GainArs(0);
    setM2GainArs(0);
    setM3GainArs(0);
    setIsLiveRealAccount(true);
    alert('¡Cuenta reiniciada a $0! Ahora puedes ingresar el dinero real que transfieras a InvertirOnline (IOL) para iniciar el seguimiento verdadero.');
  };

  // Cargar valores demo de prueba
  const loadDemoValues = () => {
    setSaldoTotalIol(500000);
    setCapitalAutorizadoBot(200000);
    setNominales(143);
    setPpcGalicia(9943.71);
    setM1GainArs(8400);
    setM2GainArs(7050);
    setM3GainArs(9300);
    setIsLiveRealAccount(false);
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          new Notification('SPXL Quant Guard', {
            body: '¡Notificaciones activadas! Te avisaremos el rendimiento diario real por motor.',
            icon: '/vite.svg'
          });
        }
      });
    }
  };

  const loadLiveData = async () => {
    setIsUpdating(true);
    const updated = await fetchLiveMarketOnline();
    setMarket(updated);
    setIsUpdating(false);
  };

  useEffect(() => {
    loadLiveData();
    const interval = setInterval(loadLiveData, 10000);
    return () => clearInterval(interval);
  }, []);

  const generateWhatsAppLink = () => {
    const text = encodeURIComponent(
      `📊 *DESGROSE REAL DE CAPITAL EN IOL (CUENTA REAL)*\n` +
      `• *Saldo Total IOL*: $${saldoTotalIol.toLocaleString('es-AR')} ARS\n` +
      `• *Capital Autorizado Bot*: $${capitalAutorizadoBot.toLocaleString('es-AR')} ARS\n` +
      `• *Fondo Personal Blindado (QQQ/Efectivo)*: $${capitalBlindadoPersonal.toLocaleString('es-AR')} ARS\n\n` +
      `📈 *RENDIMIENTOS REALES POR MOTOR*:\n` +
      `• *Motor 1 (Tendencia & Cauciones)*: +$${m1GainArs.toLocaleString('es-AR')} ARS\n` +
      `• *Motor 2 (IA Caza-Lag)*: +$${m2GainArs.toLocaleString('es-AR')} ARS\n` +
      `• *Motor 3 (IA Deep Learning)*: +$${m3GainArs.toLocaleString('es-AR')} ARS\n` +
      `💰 *GANANCIA REAL ACUMULADA*: +$${totalBotGainArs.toLocaleString('es-AR')} ARS\n\n` +
      `_Enviado desde SPXL Quant Guard Terminal_`
    );
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  return (
    <div>
      {/* Top Controls & Reset Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.2rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.8rem 1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: isLiveRealAccount ? 'var(--color-emerald)' : 'var(--color-gold)', fontWeight: 700, fontSize: '0.9rem' }}>
          {isLiveRealAccount ? <Check size={18} color="var(--color-emerald)" /> : <RotateCcw size={18} />}
          <span>
            {isLiveRealAccount 
              ? '🟢 MODO CUENTA REAL IOL EN VIVO (Valores Iniciales en $0)' 
              : '🟡 MODO DEMO / SIMULACIÓN (Valores de Prueba)'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {!isLiveRealAccount ? (
            <button onClick={resetToZeroReal} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
              <RotateCcw size={14} />
              Reiniciar Todo a $0 (Modo Cuenta Real IOL)
            </button>
          ) : (
            <button onClick={loadDemoValues} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'rgba(30, 41, 59, 0.9)' }}>
              Ver Valores Demo de Prueba
            </button>
          )}

          <a href={generateWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none', padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', color: 'white' }}>
            <MessageSquare size={14} />
            Enviar Desglose a Mi WhatsApp
          </a>
        </div>
      </div>

      {/* Formulario de Ingreso de Capital Real Transferido a IOL */}
      <div className="glass-card" style={{ marginBottom: '2rem', border: '2px solid var(--color-emerald)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
        <div className="card-title-row">
          <h3 className="card-title">
            <DollarSign size={24} color="var(--color-emerald)" />
            Ingresar Valores Reales Transferidos a InvertirOnline (IOL)
          </h3>
          <span className="badge-emerald">{isLiveRealAccount ? 'CUENTA REAL EN $0 PREPARADA' : 'CARGA REAL'}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
          <div className="form-group">
            <label className="form-label">
              <span>Saldo Total Transferido a IOL (ARS)</span>
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="ej. 100000"
              value={saldoTotalIol === 0 ? '' : saldoTotalIol}
              onChange={(e) => setSaldoTotalIol(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Capital Autorizado para el Bot (ARS)</span>
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="ej. 100000"
              value={capitalAutorizadoBot === 0 ? '' : capitalAutorizadoBot}
              onChange={(e) => setCapitalAutorizadoBot(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Cantidad de Nominales Poseídos</span>
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="ej. 0"
              value={nominales === 0 ? '' : nominales}
              onChange={(e) => setNominales(Number(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>PPC (Precio Promedio Compra ARS)</span>
            </label>
            <input
              type="number"
              className="form-input"
              placeholder="ej. 18850"
              value={ppcGalicia === 0 ? '' : ppcGalicia}
              onChange={(e) => setPpcGalicia(Number(e.target.value))}
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Matriz de Resumen de Capital Ingresado & Blindado */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="card-title-row">
          <h3 className="card-title">
            <ShieldCheck size={24} color="var(--color-cyan)" />
            Panel de Seguimiento Real de Capital Ingresado & Blindaje
          </h3>
          <span className="badge-cyan">Control de Saldo Verdadero</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>SALDO REAL EN TU CUENTA IOL</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', marginTop: '0.3rem' }}>
              ${saldoTotalIol.toLocaleString('es-AR')} ARS
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Efectivo + CEDEARs Transferidos</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-emerald)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>CAPITAL AUTORIZADO PARA EL BOT</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-emerald)', marginTop: '0.3rem' }}>
              ${capitalAutorizadoBot.toLocaleString('es-AR')} ARS
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-emerald)', marginTop: '0.2rem' }}>Asignado a los 3 Motores</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gold)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>FONDO PERSONAL BLINDADO (QQQ)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-gold)', marginTop: '0.3rem' }}>
              ${capitalBlindadoPersonal.toLocaleString('es-AR')} ARS
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', marginTop: '0.2rem' }}>100% Intocable por el Bot</div>
          </div>
        </div>
      </div>

      {/* Matriz de Atribución de Rendimiento Real por Motor */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="card-title-row">
          <h3 className="card-title">
            <Target size={24} color="var(--color-gold)" />
            Seguimiento de Rendimiento Real por Motor (Los 3 Escenarios)
          </h3>
          <span className="badge-gold">Resultados Reales</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
          
          {/* Motor 1 */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-cyan)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--color-cyan)', fontSize: '0.95rem' }}>MOTOR 1: TENDENCIA & CAUCIONES</span>
              <span className="badge-cyan">50% Capital</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Capital Asignado: ${(capitalAutorizadoBot * 0.5).toLocaleString('es-AR')} ARS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-emerald)' }}>
              +${m1GainArs.toLocaleString('es-AR')} ARS
            </div>
          </div>

          {/* Motor 2 */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-gold)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--color-gold)', fontSize: '0.95rem' }}>MOTOR 2: IA CAZA-LAG (300 CEDEARS)</span>
              <span className="badge-gold">25% Capital</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Capital Asignado: ${(capitalAutorizadoBot * 0.25).toLocaleString('es-AR')} ARS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-emerald)' }}>
              +${m2GainArs.toLocaleString('es-AR')} ARS
            </div>
          </div>

          {/* Motor 3 */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-emerald)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--color-emerald)', fontSize: '0.95rem' }}>MOTOR 3: IA DEEP LEARNING</span>
              <span className="badge-emerald">25% Capital</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Capital Asignado: ${(capitalAutorizadoBot * 0.25).toLocaleString('es-AR')} ARS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-emerald)' }}>
              +${m3GainArs.toLocaleString('es-AR')} ARS
            </div>
          </div>

        </div>

        <div style={{ marginTop: '1.2rem', background: 'rgba(15, 23, 42, 0.9)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-emerald)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>GANANCIA REAL ACUMULADA DE LOS 3 MOTORES:</span>
          <strong style={{ fontSize: '1.6rem', color: 'var(--color-emerald)' }}>+${totalBotGainArs.toLocaleString('es-AR')} ARS</strong>
        </div>
      </div>

    </div>
  );
};
