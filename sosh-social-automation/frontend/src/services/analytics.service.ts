import { apiClient } from './api-client';
import { 
  API_ENDPOINTS, 
  ApiSuccess, 
  TwitterAnalysis 
} from '../types/api.types';

export interface AnalyticsTimeframe {
  startDate: Date;
  endDate: Date;
  granularity: 'hour' | 'day' | 'week' | 'month';
}

export interface AnalyticsMetrics {
  engagement: {
    total: number;
    rate: number;
    trend: number;
  };
  reach: {
    total: number;
    organic: number;
    paid: number;
  };
  followers: {
    total: number;
    gained: number;
    lost: number;
    trend: number;
  };
  posts: {
    total: number;
    engagement: number;
    topPerforming: string[];
  };
}

export interface PlatformAnalytics extends AnalyticsMetrics {
  platform: string;
  lastUpdated: Date;
}

export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async getOverallAnalytics(timeframe: AnalyticsTimeframe): Promise<AnalyticsMetrics> {
    const response = await apiClient.get<ApiSuccess<AnalyticsMetrics>>(
      '/analytics/overall',
      { params: timeframe }
    );
    return response.data;
  }

  public async getPlatformAnalytics(
    platform: string,
    timeframe: AnalyticsTimeframe
  ): Promise<PlatformAnalytics> {
    const response = await apiClient.get<ApiSuccess<PlatformAnalytics>>(
      `/analytics/platforms/${platform}`,
      { params: timeframe }
    );
    return response.data;
  }

  public async getEngagementTimeline(
    platform: string,
    timeframe: AnalyticsTimeframe
  ): Promise<{ timestamp: Date; value: number }[]> {
    const response = await apiClient.get<ApiSuccess<{ timestamp: string; value: number }[]>>(
      `/analytics/platforms/${platform}/engagement`,
      { params: timeframe }
    );
    
    // Convert timestamp strings to Date objects
    return response.data.map(point => ({
      timestamp: new Date(point.timestamp),
      value: point.value
    }));
  }

  public async getTopPerformingContent(
    platform: string,
    timeframe: AnalyticsTimeframe,
    limit = 10
  ): Promise<any[]> {
    const response = await apiClient.get<ApiSuccess<any[]>>(
      `/analytics/platforms/${platform}/top-content`,
      { params: { ...timeframe, limit } }
    );
    return response.data;
  }

  public async getAudienceInsights(platform: string): Promise<any> {
    const response = await apiClient.get<ApiSuccess<any>>(
      `/analytics/platforms/${platform}/audience`
    );
    return response.data;
  }

  public async exportAnalytics(
    platform: string,
    timeframe: AnalyticsTimeframe,
    format: 'csv' | 'pdf' | 'xlsx'
  ): Promise<Blob> {
    const response = await apiClient.get<Blob>(
      `/analytics/platforms/${platform}/export`,
      {
        params: { ...timeframe, format },
        responseType: 'blob'
      }
    );
    return response;
  }

  // Helper method to calculate growth rate
  public calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  // Helper method to calculate engagement rate
  public calculateEngagementRate(engagement: number, followers: number): number {
    if (followers === 0) return 0;
    return (engagement / followers) * 100;
  }
}

export const analyticsService = AnalyticsService.getInstance();
