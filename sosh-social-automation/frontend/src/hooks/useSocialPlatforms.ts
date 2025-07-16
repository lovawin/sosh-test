import { useState, useEffect } from 'react';
import { 
  socialPlatformsService, 
  type PlatformInfo, 
  type SocialPlatform 
} from '../services/social-platforms.service';

interface UseSocialPlatformsReturn {
  platforms: PlatformInfo[];
  loading: boolean;
  error: Error | null;
  refreshPlatform: (platform: SocialPlatform) => Promise<void>;
}

export const useSocialPlatforms = (): UseSocialPlatformsReturn => {
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlatforms = async () => {
    try {
      const platformsData = await socialPlatformsService.getPlatforms();
      setPlatforms(platformsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch platforms'));
      // Use mock data in case of error
      setPlatforms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchPlatforms();
  }, []);

  const refreshPlatform = async (platform: SocialPlatform) => {
    try {
      // First refresh the platform tokens
      await socialPlatformsService.refreshPlatform(platform);
      // Then sync the latest data
      await socialPlatformsService.syncPlatform(platform);
      // Finally refresh the platforms list
      await fetchPlatforms();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh platform'));
    }
  };

  return {
    platforms,
    loading,
    error,
    refreshPlatform,
  };
};

export default useSocialPlatforms;
