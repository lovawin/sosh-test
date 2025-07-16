import axios from 'axios';
import { SocialPlatform, PlatformStatuses } from './social-platforms.service';
// Import mock service synchronously
import { mockAuthService } from './mock/auth.mock';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

// Configure axios defaults
axios.defaults.withCredentials = true;

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PlatformAuthResult {
  platform: SocialPlatform;
  success: boolean;
  error?: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Initialize token from localStorage
    this.token = localStorage.getItem('token');
    // Set Authorization header if token exists
    if (this.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
    // Set default Authorization header for all future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    // Remove Authorization header when logging out
    delete axios.defaults.headers.common['Authorization'];
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/login`,
        { email, password }
      );
      
      // Ensure token is properly set in both localStorage and axios headers
      if (response.data.token) {
        this.setToken(response.data.token);
        // Force update axios defaults for all instances
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw new Error('Login failed');
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/register`,
        { email, password, name }
      );
      this.setToken(response.data.token);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        throw new Error(errorMessage);
      }
      throw new Error('Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${this.token}` } }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;

    try {
      const response = await axios.get<User>(
        `${API_URL}/auth/me`
      );
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async refreshToken(): Promise<string | null> {
    if (!this.token) return null;

    try {
      const response = await axios.post<{ token: string }>(
        `${API_URL}/auth/refresh-token`
      );
      const newToken = response.data.token;
      this.setToken(newToken);
      return newToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearToken();
      return null;
    }
  }

  async authenticatePlatforms(platforms: SocialPlatform[], useOAuth: boolean = false): Promise<PlatformAuthResult[]> {
    const results: PlatformAuthResult[] = [];

    for (const platform of platforms) {
      try {
        if (useOAuth) {
          // OAuth flow for mother accounts (optional) or child accounts (required)
          const response = await axios.post<{ success: boolean; data: { authUrl: string } }>(
            `${API_URL}/platforms/${platform}/connect`,
            { useOAuth: true }
          );

          if (!response.data.success || !response.data.data.authUrl) {
            throw new Error('Failed to get auth URL');
          }

          // Open OAuth popup
          const width = 600;
          const height = 600;
          const left = window.screen.width / 2 - width / 2;
          const top = window.screen.height / 2 - height / 2;

          const popup = window.open(
            response.data.data.authUrl,
            `${platform}-auth`,
            `width=${width},height=${height},left=${left},top=${top}`
          );

          if (!popup) {
            throw new Error('Popup blocked by browser');
          }

          // Wait for OAuth completion
          const result = await new Promise<PlatformAuthResult>((resolve) => {
            const checkInterval = setInterval(() => {
              if (popup.closed) {
                clearInterval(checkInterval);
                resolve({
                  platform,
                  success: false,
                  error: 'Authentication cancelled'
                });
              }
            }, 1000);

            // Listen for message from popup
            window.addEventListener('message', function onMessage(event) {
              // Verify origin
              if (event.origin !== window.location.origin) return;

              // Handle OAuth result
              if (event.data.type === 'oauth_callback' && event.data.platform === platform) {
                window.removeEventListener('message', onMessage);
                clearInterval(checkInterval);
                popup.close();

                resolve({
                  platform,
                  success: !event.data.error,
                  error: event.data.error
                });
              }
            });
          });

          results.push(result);
        } else {
          // Direct API authentication for mother accounts
          const response = await axios.post<{ success: boolean }>(
            `${API_URL}/platforms/${platform}/connect`,
            { useOAuth: false }
          );

          results.push({
            platform,
            success: response.data.success,
            error: response.data.success ? undefined : 'Direct authentication failed'
          });
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          results.push({
            platform,
            success: false,
            error: error.response?.data?.error || error.message
          });
        } else {
          results.push({
            platform,
            success: false,
            error: error instanceof Error ? error.message : 'Authentication failed'
          });
        }
      }
    }

    return results;
  }

  async revokePlatform(platform: SocialPlatform): Promise<void> {
    try {
      await axios.post(
        `${API_URL}/platforms/${platform}/revoke`
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || error.message);
      }
      throw new Error('Failed to revoke platform access');
    }
  }

  async checkAuthStatus(): Promise<PlatformStatuses> {
    try {
      const response = await axios.get<PlatformStatuses>(
        `${API_URL}/platforms`
      );
      return response.data;
    } catch (error) {
      console.error('Check auth status error:', error);
      return {
        twitter: false,
        instagram: false,
        tiktok: false,
        youtube: false,
      };
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getUser(): Promise<User | null> {
    return this.getCurrentUser();
  }

  // Setup axios interceptor for token refresh
  setupAxiosInterceptors() {
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const newToken = await this.refreshToken();
          if (newToken) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

// Create the appropriate service based on environment
const useMockAuth = process.env.REACT_APP_USE_MOCK_AUTH === 'true';

export const authService = useMockAuth ? mockAuthService : new AuthService();

if (!useMockAuth) {
  authService.setupAxiosInterceptors();
}

export default authService;
