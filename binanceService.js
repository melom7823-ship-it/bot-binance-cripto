import crypto from 'crypto';

/**
 * EJECUTOR REAL DE ÓRDENES BINANCE REST API v3
 * Firma criptográfica HMAC-SHA256 con ventana de tolerancia de reloj recvWindow=60000
 */
export class BinanceService {
  constructor(apiKey = '', apiSecret = '') {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = 'https://api.binance.com';
  }

  createSignature(queryString) {
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');
  }

  async placeOrder({ symbol = 'BTCUSDT', side = 'BUY', type = 'MARKET', quoteOrderQty = 12.50 }) {
    if (!this.apiKey || !this.apiSecret) {
      return { success: false, error: 'Credenciales de Binance vacías o no configuradas.' };
    }

    try {
      const timestamp = Date.now();
      const params = new URLSearchParams({
        symbol: symbol.toUpperCase(),
        side: side.toUpperCase(),
        type: type.toUpperCase(),
        quoteOrderQty: Number(quoteOrderQty).toFixed(2),
        recvWindow: '60000',
        timestamp: String(timestamp)
      });

      const signature = this.createSignature(params.toString());
      params.append('signature', signature);

      const response = await fetch(`${this.baseUrl}/api/v3/order`, {
        method: 'POST',
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          orderId: data.orderId,
          symbol: data.symbol,
          executedQty: data.executedQty,
          cummulativeQuoteQty: data.cummulativeQuoteQty,
          status: data.status,
          transactTime: new Date(data.transactTime || Date.now()).toLocaleTimeString('es-AR')
        };
      } else {
        console.error('[Binance API Error Resp]:', data);
        return { success: false, error: data.msg || `Error Binance HTTP ${response.status}` };
      }
    } catch (err) {
      console.error('[Binance Fetch Exception]:', err);
      return { success: false, error: err.message };
    }
  }
}
