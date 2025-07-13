/// <reference types="../vite-env.d.ts" />

// Environment configuration utility
class Config {
  // Get environment variables with fallbacks
  static get API_BASE_URL(): string {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333';
  }

  static get WS_BASE_URL(): string {
    return import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3333';
  }

  static get AUTH_ENDPOINT(): string {
    return import.meta.env.VITE_AUTH_ENDPOINT || '/api/auth';
  }

  static get POSTS_ENDPOINT(): string {
    return import.meta.env.VITE_POSTS_ENDPOINT || '/api/posts';
  }

  static get MARKETPLACE_ENDPOINT(): string {
    return import.meta.env.VITE_MARKETPLACE_ENDPOINT || '/api/marketplace';
  }

  static get MESSAGES_ENDPOINT(): string {
    return import.meta.env.VITE_MESSAGES_ENDPOINT || '/api/messages';
  }

  static get EVENTS_ENDPOINT(): string {
    return import.meta.env.VITE_EVENTS_ENDPOINT || '/api/events';
  }

  // Feature flags
  static get ENABLE_WEBSOCKETS(): boolean {
    return import.meta.env.VITE_ENABLE_WEBSOCKETS === 'true';
  }

  static get ENABLE_MARKETPLACE(): boolean {
    return import.meta.env.VITE_ENABLE_MARKETPLACE !== 'false'; // Default to true
  }

  static get ENABLE_MESSAGING(): boolean {
    return import.meta.env.VITE_ENABLE_MESSAGING !== 'false'; // Default to true
  }

  // Environment detection
  static get IS_DEVELOPMENT(): boolean {
    return import.meta.env.DEV;
  }

  static get IS_PRODUCTION(): boolean {
    return import.meta.env.PROD;
  }

  // Full API URLs
  static get AUTH_API_URL(): string {
    return `${this.API_BASE_URL}${this.AUTH_ENDPOINT}`;
  }

  static get POSTS_API_URL(): string {
    return `${this.API_BASE_URL}${this.POSTS_ENDPOINT}`;
  }

  static get MARKETPLACE_API_URL(): string {
    return `${this.API_BASE_URL}${this.MARKETPLACE_ENDPOINT}`;
  }

  static get MESSAGES_API_URL(): string {
    return `${this.API_BASE_URL}${this.MESSAGES_ENDPOINT}`;
  }

  static get EVENTS_API_URL(): string {
    return `${this.API_BASE_URL}${this.EVENTS_ENDPOINT}`;
  }

  static get WEBSOCKET_URL(): string {
    return `${this.WS_BASE_URL}/ws`;
  }

  // Utility method to log configuration in development
  static logConfig(): void {
    if (this.IS_DEVELOPMENT) {
      console.log('🔧 Application Configuration:');
      console.log('API Base URL:', this.API_BASE_URL);
      console.log('WebSocket URL:', this.WS_BASE_URL);
      console.log('Environment:', import.meta.env.MODE);
      console.log('Features enabled:', {
        websockets: this.ENABLE_WEBSOCKETS,
        marketplace: this.ENABLE_MARKETPLACE,
        messaging: this.ENABLE_MESSAGING,
      });
    }
  }
}

export default Config;