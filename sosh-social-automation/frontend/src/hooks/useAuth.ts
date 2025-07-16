import { useState, useCallback, useEffect } from 'react';
import { authService, type User, type PlatformAuthResult } from '../services/auth.service';
import { useNotification } from '../contexts/NotificationContext';
import { type SocialPlatform } from '../services/social-platforms.service';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  authenticatedPlatforms: Record<SocialPlatform, boolean>;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  connectPlatforms: (platforms: SocialPlatform[], useOAuth?: boolean) => Promise<void>;
  disconnectPlatform: (platform: SocialPlatform) => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [authenticatedPlatforms, setAuthenticatedPlatforms] = useState<Record<SocialPlatform, boolean>>({
    twitter: false,
    instagram: false,
    tiktok: false,
    youtube: false,
  });
  const { showNotification } = useNotification();

  const refreshStatus = useCallback(async () => {
    if (!authService.isAuthenticated()) return;

    // Check if enough time has passed since last refresh
    const lastRefresh = localStorage.getItem('lastStatusRefresh');
    const now = Date.now();
    if (lastRefresh && now - parseInt(lastRefresh) < 60 * 1000) { // 1 minute minimum between refreshes
      return;
    }

    setLoading(true);
    try {
      const status = await authService.checkAuthStatus();
      setAuthenticatedPlatforms(status);
      setError(null);
      // Update last refresh timestamp
      localStorage.setItem('lastStatusRefresh', now.toString());
    } catch (err) {
      // Only show error notification if it's not a rate limit error
      if (!(err instanceof Error && err.message.includes('429'))) {
        setError(err instanceof Error ? err : new Error('Failed to refresh status'));
        showNotification('Failed to refresh platform status', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Platform status refresh logic with optimizations
  useEffect(() => {
    // Only check status if user is authenticated
    if (!user) return;

    // Check status immediately on mount or user change
    refreshStatus();

    // Then check periodically at a much lower frequency (every 15 minutes)
    const checkInterval = setInterval(refreshStatus, 15 * 60 * 1000);

    // Also check on window focus, but with a debounce
    let focusTimeout: NodeJS.Timeout;
    const handleFocus = () => {
      if (user) {
        clearTimeout(focusTimeout);
        focusTimeout = setTimeout(() => {
          const lastRefresh = localStorage.getItem('lastStatusRefresh');
          const now = Date.now();
          // Only refresh on focus if it's been at least 5 minutes since last refresh
          if (!lastRefresh || now - parseInt(lastRefresh) > 5 * 60 * 1000) {
            refreshStatus();
          }
        }, 1000); // 1 second debounce
      }
    };

    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      clearInterval(checkInterval);
      clearTimeout(focusTimeout);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshStatus, user]);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        console.log('useAuth: initializing user');
        const currentUser = await authService.getUser();
        console.log('useAuth: got user', currentUser);
        setUser(currentUser);
        if (currentUser) {
          await refreshStatus();
        }
      } catch (err) {
        console.error('Failed to initialize user:', err);
      }
    };
    initializeUser();
  }, [refreshStatus]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      await refreshStatus();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to login'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const response = await authService.register(email, password, name);
      setUser(response.user);
      setError(null);
      showNotification('Registration successful! Welcome aboard.', 'success');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to register');
      setError(error);
      showNotification(error.message, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setAuthenticatedPlatforms({
        twitter: false,
        instagram: false,
        tiktok: false,
        youtube: false,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to logout'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const connectPlatforms = async (platforms: SocialPlatform[], useOAuth: boolean = false) => {
    setLoading(true);
    try {
      const results = await authService.authenticatePlatforms(platforms, useOAuth);

      // Update local state with results
      const newStatuses: Partial<Record<SocialPlatform, boolean>> = {};
      results.forEach((result: PlatformAuthResult) => {
        newStatuses[result.platform] = result.success;
      });

      setAuthenticatedPlatforms(prev => ({
        ...prev,
        ...newStatuses,
      }));

      // Show success/error notifications
      results.forEach((result: PlatformAuthResult) => {
        if (result.success) {
          showNotification(
            `Successfully connected to ${result.platform}`,
            'success'
          );
        } else {
          showNotification(
            `Failed to connect to ${result.platform}: ${result.error}`,
            'error'
          );
        }
      });

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect platforms'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disconnectPlatform = async (platform: SocialPlatform) => {
    setLoading(true);
    try {
      await authService.revokePlatform(platform);

      // Update local state
      setAuthenticatedPlatforms(prev => ({
        ...prev,
        [platform]: false,
      }));

      showNotification(`Successfully disconnected from ${platform}`, 'success');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to disconnect platform'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    authenticatedPlatforms,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    connectPlatforms,
    disconnectPlatform,
    refreshStatus,
  };
};

export default useAuth;
