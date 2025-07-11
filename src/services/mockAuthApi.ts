// Temporary mock authentication API for development
// Remove this when real backend is implemented

interface MockUser {
  id: string;
  name: string;
  email: string;
  university: string;
  avatar?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  university: string;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: MockUser;
}

class MockAuthApiService {
  private users: MockUser[] = [];
  private currentUserId = 1;

  private generateToken(userId: string): string {
    // Generate a fake JWT-like token for development
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      userId, 
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }));
    const signature = btoa('mock-signature');
    return `${header}.${payload}.${signature}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    await this.delay(500); // Simulate network delay

    const user = this.users.find(u => u.email === credentials.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // In real implementation, you'd verify the password
    // For mock, we'll just accept any password

    const token = this.generateToken(user.id);
    const refreshToken = this.generateToken(user.id + '_refresh');

    return {
      token,
      refreshToken,
      user,
    };
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    await this.delay(500); // Simulate network delay

    // Check if user already exists
    const existingUser = this.users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: MockUser = {
      id: this.currentUserId.toString(),
      name: userData.name,
      email: userData.email,
      university: userData.university,
    };

    this.users.push(newUser);
    this.currentUserId++;

    const token = this.generateToken(newUser.id);
    const refreshToken = this.generateToken(newUser.id + '_refresh');

    console.log('✅ Mock registration successful:', newUser);

    return {
      token,
      refreshToken,
      user: newUser,
    };
  }

  async getCurrentUser(): Promise<MockUser> {
    await this.delay(200);
    
    // For mock, return a default user
    // In real implementation, you'd decode the token
    return {
      id: '1',
      name: 'Mock User',
      email: 'mock@university.edu',
      university: 'Mock University',
    };
  }

  async logout(): Promise<void> {
    await this.delay(200);
    // In real implementation, you'd invalidate the token
    console.log('✅ Mock logout successful');
  }

  async refreshToken(): Promise<{ token: string; refreshToken: string }> {
    await this.delay(200);
    
    const token = this.generateToken('mock-user');
    const refreshToken = this.generateToken('mock-user_refresh');

    return { token, refreshToken };
  }
}

export const mockAuthApi = new MockAuthApiService();