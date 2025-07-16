import { type SocialPlatform } from '../../services/social-platforms.service';
import { setDataSource } from './insightsDataProvider';

/**
 * Example usage of the insights data provider
 * Shows how to switch between mock and real data per platform
 */

// Use mock data for all platforms (default)
const useMockData = () => {
  const platforms: SocialPlatform[] = ['twitter', 'instagram', 'tiktok', 'youtube'];
  platforms.forEach(platform => {
    setDataSource(platform, { source: 'mock' });
  });
};

// Use real API for Twitter, mock for others
const useTwitterAPI = () => {
  // Switch Twitter to real API
  setDataSource('twitter', {
    source: 'api',
    endpoint: '/api/insights/twitter'
  });

  // Keep others on mock data
  ['instagram', 'tiktok', 'youtube'].forEach(platform => {
    setDataSource(platform as SocialPlatform, { source: 'mock' });
  });
};

// Use real API for all platforms
const useAllAPIs = () => {
  const endpoints: Record<SocialPlatform, string> = {
    twitter: '/api/insights/twitter',
    instagram: '/api/insights/instagram',
    tiktok: '/api/insights/tiktok',
    youtube: '/api/insights/youtube'
  };

  Object.entries(endpoints).forEach(([platform, endpoint]) => {
    setDataSource(platform as SocialPlatform, {
      source: 'api',
      endpoint
    });
  });
};

export const examples = {
  useMockData,
  useTwitterAPI,
  useAllAPIs
};
