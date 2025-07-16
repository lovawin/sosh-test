// Common API response types
export interface ApiError {
  error: string;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

// API endpoint configurations
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  SOCIAL: {
    PLATFORMS: '/social-platforms',
    CONNECT: (platform: string) => `/social-platforms/${platform}/connect`,
    DISCONNECT: (platform: string) => `/social-platforms/${platform}`,
    SYNC: (platform: string) => `/social-platforms/${platform}/sync`,
    STATS: (platform: string) => `/social-platforms/${platform}/stats`,
    ANALYZE: {
      TWITTER: '/social/twitter/analyze',
      SEARCH_TWEETS: '/social/twitter/search',
      USER: (username: string) => `/social/twitter/user/${username}`,
      FOLLOWERS: (userId: string) => `/social/twitter/followers/${userId}`,
    },
  },
  AUTOMATION: {
    START: '/automation/start',
    STATUS: (id: string) => `/automation/${id}/status`,
    PAUSE: (id: string) => `/automation/${id}/pause`,
    RESUME: (id: string) => `/automation/${id}/resume`,
    STOP: (id: string) => `/automation/${id}`,
  },
};

// Platform-specific types
export interface TwitterAnalysis {
  engagement: number;
  reach: number;
  sentiment: number;
  topics: string[];
  hashtags: string[];
}

export interface TwitterSearchParams {
  query: string;
  count?: number;
  result_type?: 'mixed' | 'recent' | 'popular';
}

export interface AutomationStatus {
  id: string;
  status: 'running' | 'paused' | 'stopped' | 'completed' | 'failed';
  progress: number;
  message?: string;
  startedAt: Date;
  updatedAt: Date;
}

export interface AutomationConfig {
  platforms: string[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time?: string;
    days?: number[];
  };
  content?: {
    type: 'text' | 'image' | 'video';
    template?: string;
    hashtags?: string[];
  };
  targeting?: {
    audience: string[];
    locations?: string[];
    interests?: string[];
  };
}
