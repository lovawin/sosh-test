import { type SocialPlatform } from '../../services/social-platforms.service';
import { type InsightData, getMockInsights } from './insights.mock';

// Define available data sources
export type DataSource = 'mock' | 'api';

// Configuration for each platform's data source
export interface DataSourceConfig {
  source: DataSource;
  endpoint?: string; // API endpoint if using 'api' source
}

/**
 * Configure data sources per platform
 * This makes it easy to:
 * 1. Use different sources for different platforms
 * 2. Switch between mock and real data per platform
 * 3. Add new data sources in the future
 */
const dataSourceConfig: Record<SocialPlatform, DataSourceConfig> = {
  twitter: { source: 'mock' },
  instagram: { source: 'mock' },
  tiktok: { source: 'mock' },
  youtube: { source: 'mock' }
};

/**
 * Update a platform's data source configuration
 * This allows runtime switching between mock and real data
 */
export const setDataSource = (platform: SocialPlatform, config: DataSourceConfig) => {
  dataSourceConfig[platform] = config;
};

/**
 * Get insights data for a platform using its configured data source
 */
export const getInsightsData = async (platform: SocialPlatform): Promise<InsightData[]> => {
  const config = dataSourceConfig[platform];

  switch (config.source) {
    case 'mock':
      return getMockInsights(platform);
    
    case 'api':
      if (!config.endpoint) {
        throw new Error(`API endpoint not configured for ${platform}`);
      }
      const response = await fetch(config.endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch insights for ${platform}`);
      }
      return response.json();

    default:
      throw new Error(`Unknown data source: ${config.source}`);
  }
};

// Re-export types needed by consumers
export type { InsightData };
