/**
 * Social Media Automation Platform Type Definitions
 * ============================================
 * 
 * This module contains comprehensive TypeScript type definitions for the
 * social media automation platform. These types ensure type safety and
 * provide clear interfaces for component development.
 * 
 * Type Categories:
 * 1. Platform Types - Core platform-specific types
 * 2. Account Types - User and social media account definitions
 * 3. Automation Types - Strategy and automation related types
 * 4. Analytics Types - Data and metrics types
 * 5. API Types - Request/Response types
 * 6. UI Types - Component and theme related types
 * 
 * Usage Examples:
 * ```typescript
 * // Account usage
 * const account: Account = {
 *   id: '123',
 *   platform: 'twitter',
 *   username: '@example',
 *   status: 'active',
 *   accountType: 'mother',
 *   metrics: {
 *     followers: 1000,
 *     engagement: 0.05
 *   }
 * };
 * 
 * // Strategy usage
 * const strategy: AutomationStrategy = {
 *   id: 'strat123',
 *   name: 'Growth Strategy',
 *   type: 'mother-child',
 *   status: 'active',
 *   accounts: [account],
 *   config: {
 *     postFrequency: 3,
 *     targetAudience: ['tech', 'startup']
 *   }
 * };
 * ```
 * 
 * @module Types
 */

/**
 * Platform Types
 * =============
 */

/**
 * Supported social media platforms
 * @category Platform
 */
export type Platform = 'twitter' | 'instagram' | 'youtube' | 'tiktok';

/**
 * Platform-specific features and capabilities
 * @category Platform
 */
export interface PlatformCapabilities {
  /** Maximum posts per day */
  maxPostsPerDay: number;
  /** Supported content types */
  contentTypes: string[];
  /** API rate limits */
  rateLimits: {
    requests: number;
    window: number;
  };
  /** Platform-specific features */
  features: string[];
}

/**
 * Account Types
 * ============
 */

/**
 * Account status types
 * @category Account
 */
export type AccountStatus = 
  | 'active'    // Account is connected and operational
  | 'inactive'  // Account is connected but not in use
  | 'pending'   // Account connection in progress
  | 'error';    // Account has connection/authentication issues

/**
 * Account role in mother-child strategy
 * @category Account
 */
export type AccountType = 
  | 'mother'    // Primary account that drives the strategy
  | 'child';    // Secondary account that follows the mother

/**
 * Account performance metrics
 * @category Account
 */
export interface AccountMetrics {
  /** Total number of followers */
  followers: number;
  /** Number of accounts following */
  following: number;
  /** Total number of posts */
  posts: number;
  /** Engagement rate (0-1) */
  engagement: number;
  /** Growth rate (followers/day) */
  growth: number;
  /** Custom metrics by platform */
  platformMetrics?: Record<string, number>;
}

/**
 * Social media account
 * @category Account
 */
export interface Account {
  /** Unique account identifier */
  id: string;
  /** Social media platform */
  platform: Platform;
  /** Account username/handle */
  username: string;
  /** Profile image URL */
  profileImage?: string;
  /** Current account status */
  status: AccountStatus;
  /** Role in mother-child strategy */
  accountType: AccountType;
  /** Account performance metrics */
  metrics: AccountMetrics;
  /** Last activity timestamp */
  lastActive?: string;
  /** Account creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Automation Types
 * ==============
 */

/**
 * Types of automation strategies
 * @category Automation
 */
export type StrategyType = 
  | 'mother-child'         // Mother-child relationship strategy
  | 'content-syndication'  // Cross-platform content sharing
  | 'engagement'           // Engagement automation
  | 'growth';             // Follower growth strategy

/**
 * Strategy execution status
 * @category Automation
 */
export type StrategyStatus = 
  | 'active'    // Strategy is running
  | 'paused'    // Strategy is temporarily paused
  | 'error'     // Strategy encountered an error
  | 'completed'; // Strategy completed its objectives

/**
 * Strategy configuration options
 * @category Automation
 */
export interface StrategyConfig {
  /** Posts per day */
  postFrequency: number;
  /** Target audience demographics/interests */
  targetAudience: string[];
  /** Supported content types */
  contentTypes: string[];
  /** Strategy hashtags */
  hashtags: string[];
  /** Timing configuration */
  timing: {
    /** Timezone for scheduling */
    timezone: string;
    /** Active hours window */
    activeHours: {
      start: string;
      end: string;
    };
    /** Active days (0-6, Sunday-Saturday) */
    daysOfWeek: number[];
  };
  /** Engagement configuration */
  engagement: {
    /** Like ratio (0-1) */
    likeRatio: number;
    /** Comment ratio (0-1) */
    commentRatio: number;
    /** Share ratio (0-1) */
    shareRatio: number;
  };
}

/**
 * Automation strategy definition
 * @category Automation
 */
export interface AutomationStrategy {
  /** Unique strategy identifier */
  id: string;
  /** Strategy name */
  name: string;
  /** Strategy type */
  type: StrategyType;
  /** Current status */
  status: StrategyStatus;
  /** Participating accounts */
  accounts: Account[];
  /** Strategy configuration */
  config: StrategyConfig;
  /** Performance metrics */
  metrics: {
    /** Success rate (0-1) */
    successRate: number;
    /** Engagement rate (0-1) */
    engagementRate: number;
    /** Growth rate (followers/day) */
    growthRate: number;
    /** Total actions performed */
    actions: number;
  };
  /** Strategy progress (0-1) */
  progress: number;
  /** Current action description */
  currentAction?: string;
  /** Last execution timestamp */
  lastRun?: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Analytics Types
 * =============
 */

/**
 * Analytics data point
 * @category Analytics
 */
export interface AnalyticsDataPoint {
  /** Measurement timestamp */
  timestamp: string;
  /** Engagement rate */
  engagement: number;
  /** Growth rate */
  growth: number;
  /** Total followers */
  followers: number;
  /** User interactions */
  interactions: number;
}

/**
 * Analytics data structure
 * @category Analytics
 */
export interface AnalyticsData {
  /** Overall metrics */
  metrics: {
    /** Total followers across platforms */
    totalFollowers: number;
    /** Average engagement rate */
    totalEngagement: number;
    /** Average growth rate */
    averageGrowth: number;
    /** Strategy success rate */
    successRate: number;
  };
  /** Historical data points */
  trends: AnalyticsDataPoint[];
  /** Metrics by platform */
  platforms: Record<Platform, {
    followers: number;
    engagement: number;
    growth: number;
  }>;
  /** Top performing entities */
  topPerforming: {
    /** Best performing accounts */
    accounts: Account[];
    /** Most successful posts */
    posts: any[]; // Define Post type when needed
    /** Most effective strategies */
    strategies: AutomationStrategy[];
  };
}

/**
 * API Types
 * ========
 */

/**
 * Generic API response wrapper
 * @category API
 */
export interface ApiResponse<T> {
  /** Operation success flag */
  success: boolean;
  /** Response data */
  data: T;
  /** Error information */
  error?: {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Additional error details */
    details?: any;
  };
  /** Response metadata */
  metadata?: {
    /** Response timestamp */
    timestamp: string;
    /** API version */
    version: string;
    /** Additional metadata */
    [key: string]: any;
  };
}

/**
 * UI Types
 * =======
 */

/**
 * Theme mode options
 * @category UI
 */
export type ThemeMode = 'light' | 'dark';

/**
 * User interface preferences
 * @category UI
 */
export interface UserPreferences {
  /** Theme mode preference */
  theme: ThemeMode;
  /** Notification settings */
  notifications: boolean;
  /** User timezone */
  timezone: string;
  /** Interface language */
  language: string;
  /** Dashboard layout configuration */
  dashboardLayout: {
    /** Widget visibility and order */
    [key: string]: {
      visible: boolean;
      order: number;
    };
  };
}

/**
 * Type Guards
 * ==========
 * 
 * Type guard functions for runtime type checking
 */

/**
 * Type guard for Account interface
 * @param obj Object to check
 * @returns True if object matches Account interface
 */
export function isAccount(obj: any): obj is Account {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.username === 'string' &&
    typeof obj.platform === 'string' &&
    typeof obj.status === 'string' &&
    typeof obj.accountType === 'string' &&
    typeof obj.metrics === 'object'
  );
}

/**
 * Type guard for AutomationStrategy interface
 * @param obj Object to check
 * @returns True if object matches AutomationStrategy interface
 */
export function isStrategy(obj: any): obj is AutomationStrategy {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.status === 'string' &&
    Array.isArray(obj.accounts) &&
    typeof obj.config === 'object'
  );
}
