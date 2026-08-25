import React, { useState } from 'react';
import { Navbar, NavTabs } from './components/Navbar';
import { GaliciaTracker } from './components/GaliciaTracker';
import { BrokerBotConnector } from './components/BrokerBotConnector';
import { NexoScalperConnector } from './components/NexoScalperConnector';
import { MacroRadar } from './components/MacroRadar';
import { InteractiveChart } from './components/InteractiveChart';
import { LiveTerminal } from './components/LiveTerminal';
import { BacktestSimulator } from './components/BacktestSimulator';
import { CedearCalculator } from './components/CedearCalculator';
import { StrategyGuide } from './components/StrategyGuide';
import { ShieldCheck } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('galicia');

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Navigation Tabs */}
      <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Dynamic Tab Content */}
      <main style={{ minHeight: '600px' }}>
        {activeTab === 'galicia' && <GaliciaTracker />}
        {activeTab === 'bot' && <BrokerBotConnector />}
        {activeTab === 'nexo' && <NexoScalperConnector />}
        {activeTab === 'radar' && <MacroRadar />}
        {activeTab === 'chart' && <InteractiveChart />}
        {activeTab === 'terminal' && <LiveTerminal />}
        {activeTab === 'simulator' && <BacktestSimulator />}
        {activeTab === 'calculator' && <CedearCalculator />}
        {activeTab === 'guide' && <StrategyGuide />}
      </main>

      {/* Footer Disclaimer & Branding */}
      <footer style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem', lineHeight: '1.6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={16} color="var(--color-emerald)" />
          <strong>SPXL QUANT GUARD TERMINAL v3.0</strong>
        </div>
        <p>
          Plataforma Institucional de Trading Cuantitativo de CEDEARs (IOL/BYMA) y Micro-Scalping 24/7 en Nexo Pro.
        </p>
        <p style={{ marginTop: '0.3rem', fontSize: '0.75rem' }}>
          * Los rendimientos pasados no garantizan resultados futuros. La inversión en ETFs y criptoactivos requiere una estricta gestión de riesgo.
        </p>
      </footer>
    </div>
  );
}

export default App;
