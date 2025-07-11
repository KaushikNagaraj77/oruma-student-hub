interface TokenData {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

export class TokenManager {
  private static readonly TOKEN_KEY = 'oruma_token';
  private static readonly REFRESH_TOKEN_KEY = 'oruma_refresh_token';
  private static readonly EXPIRES_AT_KEY = 'oruma_token_expires_at';

  static setTokens(token: string, refreshToken: string): void {
    const expiresAt = this.getTokenExpiration(token);
    
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString());
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }

  static isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    if (!expiresAt) return true;
    
    const expirationTime = parseInt(expiresAt, 10);
    const currentTime = Date.now() / 1000;
    
    // Consider token expired if it expires within the next 5 minutes
    return currentTime >= (expirationTime - 300);
  }

  static isTokenValid(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired();
  }

  static shouldRefreshToken(): boolean {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    if (!expiresAt) return false;
    
    const expirationTime = parseInt(expiresAt, 10);
    const currentTime = Date.now() / 1000;
    
    // Refresh token if it expires within the next 15 minutes
    return currentTime >= (expirationTime - 900);
  }

  private static getTokenExpiration(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp || 0;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return 0;
    }
  }

  static getTokenPayload(token?: string): any {
    const tokenToUse = token || this.getToken();
    if (!tokenToUse) return null;
    
    try {
      const payload = JSON.parse(atob(tokenToUse.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Failed to decode token payload:', error);
      return null;
    }
  }
}

export const tokenManager = TokenManager;