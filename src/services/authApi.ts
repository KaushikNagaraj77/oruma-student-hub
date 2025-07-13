import { tokenManager } from '../utils/tokenManager';
import { mockAuthApi } from './mockAuthApi';
import Config from '../utils/config';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    university: string;
    avatar?: string;
  };
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  university: string;
}

interface RegisterResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    university: string;
    avatar?: string;
  };
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  university: string;
  avatar?: string;
}

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

class AuthApiService {
  private baseUrl = Config.AUTH_ENDPOINT;
  private useMockApi = false; // Set to false when real backend is available

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private getAuthHeaders(): Record<string, string> {
    const token = tokenManager.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    if (this.useMockApi) {
      console.log('🔧 Using mock API for login');
      return mockAuthApi.login(credentials);
    }
    
    return this.request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    if (this.useMockApi) {
      console.log('🔧 Using mock API for registration');
      return mockAuthApi.register(userData);
    }
    
    return this.request<RegisterResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<UserResponse> {
    if (this.useMockApi) {
      console.log('🔧 Using mock API for getCurrentUser');
      return mockAuthApi.getCurrentUser();
    }
    
    return this.request<UserResponse>('/me', {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  async logout(): Promise<void> {
    if (this.useMockApi) {
      console.log('🔧 Using mock API for logout');
      return mockAuthApi.logout();
    }
    
    const refreshToken = tokenManager.getRefreshToken();
    
    if (refreshToken) {
      try {
        await this.request<void>('/logout', {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        // Continue with logout even if API call fails
        console.warn('Logout API call failed:', error);
      }
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    if (this.useMockApi) {
      console.log('🔧 Using mock API for refreshToken');
      return mockAuthApi.refreshToken();
    }
    
    const refreshToken = tokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.request<RefreshTokenResponse>('/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }
}

export const authApi = new AuthApiService();