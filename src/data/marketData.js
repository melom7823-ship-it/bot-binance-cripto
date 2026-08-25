export const LIVE_MARKET = {
  ticker: 'SPXL',
  name: 'Direxion Daily S&P 500 Bull 3X Shares (CEDEAR BYMA)',
  bymaTicker: 'SPXL',
  priceArs: 18850.00,
  changePercent: +3.42,
  dollarCcl: 1584.50,
  sp500Points: 5480.20,
  trendState: 'STRONG_BULLISH',
  botAction: 'HOLD_AND_ACCUMULATE',
  volatilityIndex: 'NORMAL',

  // CANASTA DE CEDEARS LÍDERES DISPONIBLES EN BYMA ARGENTINA
  availableCedears: [
    { ticker: 'SPXL', name: 'S&P 500 Bull 3X', price: 18850.00, type: 'ETF Leveraged' },
    { ticker: 'TQQQ', name: 'Nasdaq 100 Bull 3X', price: 24300.00, type: 'ETF Leveraged' },
    { ticker: 'NVDA', name: 'Nvidia Corp.', price: 5420.00, type: 'Semiconductores & IA' },
    { ticker: 'AMD', name: 'Advanced Micro Devices', price: 6850.00, type: 'Semiconductores & IA' },
    { ticker: 'AVGO', name: 'Broadcom Inc.', price: 12400.00, type: 'Semiconductores & IA' },
    { ticker: 'PLTR', name: 'Palantir Technologies', price: 5250.00, type: 'Inteligencia Artificial' }
  ]
};

export function generateHistoricalData(count = 30) {
  const data = [];
  let currentPrice = 14500;
  const now = new Date();

  for (let i = count; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.46) * 400;
    currentPrice = Math.max(10000, currentPrice + change);
    
    data.push({
      date: date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
      price: Math.round(currentPrice),
      ema20: Math.round(currentPrice * 0.97),
      ema50: Math.round(currentPrice * 0.94),
      stopLoss: Math.round(currentPrice * 0.94)
    });
  }

  return data;
}
