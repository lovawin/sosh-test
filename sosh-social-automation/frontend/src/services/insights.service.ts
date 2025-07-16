import { apiClient } from './api-client';
import { 
  API_ENDPOINTS, 
  ApiSuccess, 
  TwitterAnalysis 
} from '../types/api.types';

export interface ContentSuggestion {
  text: string;
  confidence: number;
  hashtags: string[];
  bestTime: {
    dayOfWeek: number;
    timeRange: string;
  };
  estimatedEngagement: number;
}

export interface HashtagAnalysis {
  hashtag: string;
  volume: number;
  engagement: number;
  sentiment: number;
  trend: 'rising' | 'stable' | 'falling';
  relatedTags: string[];
}

export interface AudienceInsight {
  category: string;
  value: string;
  confidence: number;
  relevance: number;
}

export interface PostTimingRecommendation {
  dayOfWeek: number;
  timeRange: string;
  expectedEngagement: number;
  confidence: number;
  audienceActivity: number;
}

export class InsightsService {
  private static instance: InsightsService;

  private constructor() {}

  public static getInstance(): InsightsService {
    if (!InsightsService.instance) {
      InsightsService.instance = new InsightsService();
    }
    return InsightsService.instance;
  }

  public async generateContentSuggestions(
    prompt: string,
    platform: string
  ): Promise<ContentSuggestion[]> {
    const response = await apiClient.post<ApiSuccess<ContentSuggestion[]>>(
      '/insights/content/suggestions',
      { prompt, platform }
    );
    return response.data;
  }

  public async analyzeHashtags(hashtags: string[]): Promise<HashtagAnalysis[]> {
    const response = await apiClient.post<ApiSuccess<HashtagAnalysis[]>>(
      '/insights/hashtags/analysis',
      { hashtags }
    );
    return response.data;
  }

  public async getTrendingHashtags(
    platform: string,
    category?: string
  ): Promise<HashtagAnalysis[]> {
    const response = await apiClient.get<ApiSuccess<HashtagAnalysis[]>>(
      '/insights/hashtags/trending',
      { params: { platform, category } }
    );
    return response.data;
  }

  public async getAudienceInsights(platform: string): Promise<AudienceInsight[]> {
    const response = await apiClient.get<ApiSuccess<AudienceInsight[]>>(
      `/insights/audience/${platform}`
    );
    return response.data;
  }

  public async getBestPostingTimes(
    platform: string,
    contentType?: string
  ): Promise<PostTimingRecommendation[]> {
    const response = await apiClient.get<ApiSuccess<PostTimingRecommendation[]>>(
      '/insights/timing/recommendations',
      { params: { platform, contentType } }
    );
    return response.data;
  }

  public async getContentPerformancePrediction(
    content: string,
    platform: string,
    hashtags?: string[]
  ): Promise<{
    estimatedEngagement: number;
    confidence: number;
    suggestions: string[];
  }> {
    const response = await apiClient.post<ApiSuccess<{
      estimatedEngagement: number;
      confidence: number;
      suggestions: string[];
    }>>(
      '/insights/content/predict',
      { content, platform, hashtags }
    );
    return response.data;
  }

  public async getCompetitorAnalysis(
    platform: string,
    competitors: string[]
  ): Promise<any> {
    const response = await apiClient.post<ApiSuccess<any>>(
      '/insights/competitors/analysis',
      { platform, competitors }
    );
    return response.data;
  }

  // Helper method to sort recommendations by confidence
  public sortByConfidence<T extends { confidence: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => b.confidence - a.confidence);
  }

  // Helper method to filter high-confidence insights
  public filterHighConfidence<T extends { confidence: number }>(
    items: T[],
    threshold = 0.7
  ): T[] {
    return items.filter(item => item.confidence >= threshold);
  }
}

export const insightsService = InsightsService.getInstance();
