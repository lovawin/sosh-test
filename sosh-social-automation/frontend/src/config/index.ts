// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

// Platform Configuration
export const SUPPORTED_PLATFORMS = ['twitter', 'instagram', 'youtube', 'tiktok'] as const;

// Engagement Styles
export const ENGAGEMENT_STYLES = ['supportive', 'critical', 'neutral', 'humorous'] as const;

// Default Engagement Rules
export const DEFAULT_ENGAGEMENT_RULES = {
  likeFrequency: 50, // 50% of posts
  commentFrequency: 30, // 30% of posts
  shareFrequency: 20 // 20% of posts
};

// Validation
export const PROFILE_VALIDATION = {
  minPersonalityLength: 10,
  maxPersonalityLength: 500,
  minRelationshipLength: 10,
  maxRelationshipLength: 500,
  minFrequency: 0,
  maxFrequency: 100
};
