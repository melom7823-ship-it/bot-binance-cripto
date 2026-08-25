import React from 'react';
import { Activity, ShieldAlert, LineChart, Calculator, BookOpen, Building2, BarChart2, Globe, Bot, Zap } from 'lucide-react';
import { LIVE_MARKET } from '../data/marketData';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const cedearPrice = LIVE_MARKET.cedearPriceArs || LIVE_MARKET.priceArs || 18850;
  const spxlUsd = LIVE_MARKET.spxlPriceUsd || 142.50;
  const cclRate = LIVE_MARKET.cclRate || LIVE_MARKET.dollarCcl || 1584.50;

  return (
    <header className="header-container">
      <div className="brand-badge">
        <div className="logo-icon">
          <Activity size={26} />
        </div>
        <div>
          <h1 className="brand-title">SPXL QUANT GUARD</h1>
          <span className="brand-sub">CEDEAR 3X STRATEGY TERMINAL</span>
        </div>
      </div>

      <div className="market-stats-header">
        <div className="stat-pill">
          <span className="label">CEDEAR SPXL (BYMA)</span>
          <span className="value">${cedearPrice.toLocaleString('es-AR')} ARS</span>
        </div>
        <div className="stat-pill">
          <span className="label">ETF SPXL (USD)</span>
          <span className="value">${spxlUsd} USD</span>
        </div>
        <div className="stat-pill">
          <span className="label">CCL IMPLÍCITO</span>
          <span className="value" style={{ color: 'var(--color-gold)' }}>
            ${cclRate} ARS
          </span>
        </div>
        <div className="stat-pill">
          <span className="label">RATIO CEDEAR</span>
          <span className="value" style={{ color: 'var(--color-cyan)' }}>
            20 : 1
          </span>
        </div>
      </div>
    </header>
  );
};

export const NavTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'galicia', label: '🏦 Mi Cartera Galicia (143 SPXL)', icon: Building2 },
    { id: 'bot', label: '🤖 Bot CEDEARs (IOL)', icon: Bot },
    { id: 'nexo', label: '⚡ Nexo Pro Scalper (24/7 USD)', icon: Zap },
    { id: 'radar', label: '🚨 Radar Macro & Alarmero', icon: Globe },
    { id: 'chart', label: '📈 Gráfico Interactivo & Indicadores', icon: BarChart2 },
    { id: 'terminal', label: 'Terminal de Señales', icon: ShieldAlert },
    { id: 'simulator', label: 'Simulador & Backtest', icon: LineChart },
    { id: 'calculator', label: 'Calculadora CEDEAR / CCL', icon: Calculator },
    { id: 'guide', label: 'Guía de la Estrategia 3X', icon: BookOpen }
  ];

  return (
    <nav className="nav-tabs">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
