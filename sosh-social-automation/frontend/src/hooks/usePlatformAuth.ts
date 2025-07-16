import { useState, useCallback } from 'react';
import { authService, type PlatformAuthResult } from '../services/auth.service';
import { useNotification } from '../contexts/NotificationContext';
import { type SocialPlatform } from '../services/social-platforms.service';

interface UsePlatformAuthReturn {
  authenticatedPlatforms: Record<SocialPlatform, boolean>;
  loading: boolean;
  error: Error | null;
  connectPlatforms: (platforms: SocialPlatform[], useOAuth?: boolean) => Promise<void>;
  disconnectPlatform: (platform: SocialPlatform) => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export const usePlatformAuth = (): UsePlatformAuthReturn => {
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
    authenticatedPlatforms,
    loading,
    error,
    connectPlatforms,
    disconnectPlatform,
    refreshStatus,
  };
};

export default usePlatformAuth;
