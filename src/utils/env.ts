import * as dotenv from 'dotenv';
dotenv.config();

export default class ENV {
  static get(key: string): string {
    return process.env[key] || '';
  }

  static getMercadoPagoToken(): string {
    return this.get('MERCADO_PAGO_TOKEN') || '';
  }

  static isDev() {
    return this.get('NODE_ENV') === 'development';
  }
}