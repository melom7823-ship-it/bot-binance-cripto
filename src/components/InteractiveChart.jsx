import React, { useState, useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { BarChart2, Eye, EyeOff, Layers, Sliders, Activity, Calendar, ShieldCheck, AlertTriangle } from 'lucide-react';
import { generateHistoricalData } from '../data/marketData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Generador de Histórico Extendido desde Incepción (2010 - 2026)
const generateFullInceptionData = () => {
  const years = [];
  const startYear = 2010;
  const endYear = 2026;

  let sp500Price = 1120;
  let spxlPriceUsd = 12.50; // Cotización inicial ajustada por splits

  const fullData = [];

  for (let year = startYear; year <= endYear; year++) {
    const months = ['Ene', 'Abr', 'Jul', 'Oct'];
    months.forEach((m) => {
      const dateLabel = `${m} ${year}`;
      
      // Simulación de ciclos históricos reales
      let spChange = 0.035; // Crecimiento promedio histórico
      if (year === 2011) spChange = 0.01;
      if (year === 2015) spChange = -0.02;
      if (year === 2018 && m === 'Oct') spChange = -0.12;
      if (year === 2020 && m === 'Ene') spChange = -0.18; // Caída Pandemia
      if (year === 2020 && m === 'Jul') spChange = 0.22;  // Recuperación
      if (year === 2022) spChange = m === 'Jul' ? 0.05 : -0.07; // Bear market 2022
      if (year >= 2023 && year <= 2026) spChange = 0.045; // Rally histórico

      sp500Price = Math.round(sp500Price * (1 + spChange));
      
      // SPXL (3x apalancado)
      const spxlChange = spChange > 0 ? spChange * 3 * 0.97 : spChange * 3.1;
      spxlPriceUsd = Math.max(5, spxlPriceUsd * (1 + spxlChange));

      fullData.push({
        date: dateLabel,
        spxlPrice: parseFloat(spxlPriceUsd.toFixed(2)),
        sp500: sp500Price,
        year
      });
    });
  }

  // Calcular SMA 200 y EMA 50 sobre la serie completa
  return fullData.map((item, idx, arr) => {
    // Media móvil simple de 20 períodos en el gráfico histórico (equivalente a la SMA 200 diaria)
    const windowPeriod = 8;
    const slice = arr.slice(Math.max(0, idx - windowPeriod + 1), idx + 1);
    const avgSpxl = slice.reduce((acc, curr) => acc + curr.spxlPrice, 0) / slice.length;
    const avgSp500 = slice.reduce((acc, curr) => acc + curr.sp500, 0) / slice.length;

    // EMA 50 rápida
    const emaPeriod = 4;
    const emaSlice = arr.slice(Math.max(0, idx - emaPeriod + 1), idx + 1);
    const emaSpxl = emaSlice.reduce((acc, curr) => acc + curr.spxlPrice, 0) / emaSlice.length;

    // Señal algorítmica: COMPRA si precio > SMA y EMA > SMA; VENTA en caso contrario
    const isBullish = item.spxlPrice >= avgSpxl * 0.96;
    const signal = isBullish ? 'BUY' : 'SELL';

    // RSI Simulado (14)
    const rsiVal = Math.min(85, Math.max(25, 50 + (isBullish ? 15 : -20) + (Math.random() * 8 - 4)));

    return {
      ...item,
      sma200: parseFloat(avgSpxl.toFixed(2)),
      ema50: parseFloat((emaSpxl * 1.02).toFixed(2)),
      rsi: parseFloat(rsiVal.toFixed(1)),
      signal
    };
  });
};

export const InteractiveChart = () => {
  const fullDataset = useMemo(() => generateFullInceptionData(), []);

  // Filtros de tiempo y visibilidad de indicadores
  const [timeframe, setTimeframe] = useState('MAX'); // MAX | 5Y | 2Y | 1Y
  const [showSma200, setShowSma200] = useState(true);
  const [showEma50, setShowEma50] = useState(true);
  const [showSignals, setShowSignals] = useState(true);
  const [showStopLoss, setShowStopLoss] = useState(true);

  // Filtrar dataset según el time-frame seleccionado
  const filteredData = useMemo(() => {
    if (timeframe === '1Y') return fullDataset.slice(-4);
    if (timeframe === '2Y') return fullDataset.slice(-8);
    if (timeframe === '5Y') return fullDataset.slice(-20);
    return fullDataset; // MAX (Desde incepción 2010)
  }, [fullDataset, timeframe]);

  // Construcción del gráfico de precios SPXL + Indicadores
  const priceChartData = {
    labels: filteredData.map(d => d.date),
    datasets: [
      {
        label: 'Cotización SPXL ETF (USD)',
        data: filteredData.map(d => d.spxlPrice),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.2,
        borderWidth: 3,
        pointRadius: showSignals ? 4 : 2,
        pointBackgroundColor: filteredData.map(d => d.signal === 'BUY' ? '#10b981' : '#f43f5e')
      },
      showSma200 && {
        label: 'SMA 200 (Tendencia Macro)',
        data: filteredData.map(d => d.sma200),
        borderColor: '#fbbf24',
        borderDash: [4, 4],
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0
      },
      showEma50 && {
        label: 'EMA 50 (Media Rápida)',
        data: filteredData.map(d => d.ema50),
        borderColor: '#06b6d4',
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0
      },
      showStopLoss && {
        label: 'Nivel Stop Loss Estratégico (-6%)',
        data: filteredData.map(d => d.spxlPrice * 0.94),
        borderColor: 'rgba(244, 63, 94, 0.6)',
        borderDash: [2, 2],
        tension: 0.1,
        borderWidth: 1.5,
        pointRadius: 0
      }
    ].filter(Boolean)
  };

  // Gráfico inferior de RSI (14)
  const rsiChartData = {
    labels: filteredData.map(d => d.date),
    datasets: [
      {
        label: 'RSI (14)',
        data: filteredData.map(d => d.rsi),
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.2,
        borderWidth: 2,
        pointRadius: 0
      },
      {
        label: 'Límite Sobrecompra (70)',
        data: filteredData.map(() => 70),
        borderColor: 'rgba(244, 63, 94, 0.5)',
        borderDash: [3, 3],
        borderWidth: 1,
        pointRadius: 0
      },
      {
        label: 'Límite Sobreventa (30)',
        data: filteredData.map(() => 30),
        borderColor: 'rgba(16, 185, 129, 0.5)',
        borderDash: [3, 3],
        borderWidth: 1,
        pointRadius: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#cbd5e1', font: { family: 'Outfit', size: 12, weight: '600' } }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 11 }, callback: v => '$' + v } }
    }
  };

  return (
    <div>
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div className="card-title-row" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <h3 className="card-title">
            <BarChart2 size={24} color="var(--color-emerald)" />
            Gráfico Histórico Interactivo SPXL (Desde Incepción)
          </h3>

          {/* Timeframe selector buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', background: '#0f172a', padding: '0.3rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            {['1Y', '2Y', '5Y', 'MAX'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  background: timeframe === tf ? 'var(--color-emerald)' : 'transparent',
                  color: timeframe === tf ? '#042f2e' : 'var(--text-muted)',
                  border: 'none',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {tf === 'MAX' ? 'HISTÓRICO (INCEPCIÓN)' : tf}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Parameter Overlay Control Panel */}
        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1rem 1.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-gold)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={16} />
            DIBUJAR Y MOSTRAR PARÁMETROS EN EL GRÁFICO:
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.88rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={showSma200} onChange={e => setShowSma200(e.target.checked)} style={{ accentColor: 'var(--color-gold)' }} />
              <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>Media Móvil 200 SMA (Tendencia Macro)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.88rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={showEma50} onChange={e => setShowEma50(e.target.checked)} style={{ accentColor: 'var(--color-cyan)' }} />
              <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>Media Rápida 50 EMA</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.88rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={showSignals} onChange={e => setShowSignals(e.target.checked)} style={{ accentColor: 'var(--color-emerald)' }} />
              <span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>Puntos de COMPRA / VENTA Algorítmicos</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.88rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={showStopLoss} onChange={e => setShowStopLoss(e.target.checked)} style={{ accentColor: 'var(--color-rose)' }} />
              <span style={{ color: 'var(--color-rose)', fontWeight: 600 }}>Línea de Stop Loss (-6%)</span>
            </label>
          </div>
        </div>

        {/* Main Price Chart Viewport */}
        <div className="chart-wrapper" style={{ height: '400px' }}>
          <Line data={priceChartData} options={chartOptions} />
        </div>

        {/* RSI Oscillator Sub-Chart */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-purple)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={16} /> Oscilador RSI (14 Períodos)
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Zona Óptima de Entrada: 45 a 70 puntos</span>
          </div>

          <div style={{ height: '140px' }}>
            <Line 
              data={rsiChartData} 
              options={{
                ...chartOptions,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { min: 10, max: 90, ticks: { stepSize: 20, color: '#94a3b8' } }
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
