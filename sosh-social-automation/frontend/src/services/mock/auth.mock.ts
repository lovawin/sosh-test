import { AuthResponse, User, authService } from '../auth.service';
import { SocialPlatform, PlatformStatuses } from '../social-platforms.service';
import axios from 'axios';

const mockUser: User = {
  id: 'mock-user-id',
  name: 'Test User',
  email: 'test@example.com'
};

const mockToken = 'mock-jwt-token';

class MockAuthService {
  private token: string | null = null;

  constructor() {
    // Initialize token from localStorage
    this.token = localStorage.getItem('token');
    if (this.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  private clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    this.setToken(mockToken);
    return {
      user: mockUser,
      token: mockToken
    };
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    this.setToken(mockToken);
    return {
      user: { ...mockUser, email, name },
      token: mockToken
    };
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  async getCurrentUser(): Promise<User | null> {
    return this.isAuthenticated() ? mockUser : null;
  }

  async refreshToken(): Promise<string | null> {
    return this.token;
  }

  // Use real API for platform-related functionality
  async authenticatePlatforms(platforms: SocialPlatform[], useOAuth: boolean = false): Promise<any> {
    return authService.authenticatePlatforms(platforms, useOAuth);
  }

  async revokePlatform(platform: SocialPlatform): Promise<void> {
    return authService.revokePlatform(platform);
  }

  async checkAuthStatus(): Promise<PlatformStatuses> {
    return {
      twitter: false,
      instagram: false,
      tiktok: false,
      youtube: false
    };
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getUser(): Promise<User | null> {
    return this.getCurrentUser();
  }

  setupAxiosInterceptors() {
    // No need to set up interceptors for mock auth
  }
}

// Create and export a single instance
export const mockAuthService = new MockAuthService();
export default mockAuthService;
