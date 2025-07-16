import { type SocialPlatform } from '../../services/social-platforms.service';

export interface PersonalityTemplate {
  tone: string;           // e.g., "professional", "casual", "funny"
  relationship: string;   // relationship to mother account
  interests: string[];    // key topics/interests
  style: string;         // writing/content style
  constraints: string[]; // any specific rules/limitations
}

export interface PostSchedule {
  frequency: 'daily' | 'weekly';
  timeSlots: string[];        // Preferred posting times
  timezone: string;
  maxPostsPerDay: number;
}

export interface ContentRules {
  topics: string[];        // What to post about
  forbidden: string[];     // Topics to avoid
  mediaTypes: string[];    // Types of media to include
}

export interface AutomationConfig {
  enabled: boolean;           // Master switch for automation
  requireApproval: boolean;   // Optional human review
  schedule: PostSchedule;
  contentRules: ContentRules;
  personality: PersonalityTemplate; // Added personality template
}

export interface GeneratedContent {
  text: string;
  hashtags: string[];
  mediaPrompt?: string;    // Prompt for generating/selecting media
  platform: SocialPlatform;
  scheduledTime?: Date;
}

export interface PlatformRequirements {
  maxLength: number;
  maxHashtags: number;
  allowedMediaTypes: string[];
  postFrequencyLimit: number;  // posts per day
  characterLimits: {
    title?: number;
    description?: number;
    comment?: number;
  };
}

export interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'mock';
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey?: string;
  mockData?: any;
}

// Status of generated content
export type ContentStatus = 
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'scheduled'
  | 'posted'
  | 'failed';

// Content generation result with metadata
export interface ContentGenerationResult {
  content: GeneratedContent;
  status: ContentStatus;
  generatedAt: Date;
  scheduledFor?: Date;
  approvalNeeded: boolean;
  metadata: {
    prompt: string;
    model: string;
    personality: PersonalityTemplate;
    platformRules: PlatformRequirements;
  };
}

// AI content parameters
export interface AIContentParams {
  accuracyWeight: number;
  personalityWeight: number;
  voiceWeight: number;
  tone: string;
  relationship: string;
  interests: string[];
  style: string;
  constraints: string[];
}
