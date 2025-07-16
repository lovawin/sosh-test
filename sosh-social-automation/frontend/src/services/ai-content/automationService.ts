import { type SocialPlatform } from '../../services/social-platforms.service';
import { type ContentGenerationResult, type ContentStatus, type AutomationConfig, type AIContentParams } from './types';
import { aiContentService } from './aiContentService';
import { childAccountService, type ChildAccountProfile } from '../childAccount.service';

interface ScheduledPost {
  id: string;
  content: ContentGenerationResult;
  scheduledTime: Date;
  platform: SocialPlatform;
  status: ContentStatus;
}

interface AutomationState {
  enabled: boolean;
  requireApproval: boolean;
  schedule: {
    timeSlots: string[];
    timezone: string;
    maxPostsPerDay: number;
  };
}

interface CrossPlatformConflict {
  type: 'timing' | 'content' | 'messaging';
  severity: 'warning' | 'error';
  description: string;
  posts: Array<{
    id: string;
    platform: SocialPlatform;
    scheduledTime: Date;
    content: string;
  }>;
  suggestion: string;
}

interface PlatformTimingRule {
  minGap: number; // minimum minutes between posts
  optimalTimes: string[]; // optimal posting times for the platform
  maxPostsPerDay: number;
  allowedMediaTypes: string[]; // Types of media supported by the platform
}

interface AITrainingFeedback {
  contentAccuracy: number;
  personalityMatch: number;
  voiceCalibration: number;
}

class AutomationService {
  private scheduledPosts: Map<string, ScheduledPost> = new Map();
  private automationStates: Map<string, AutomationState> = new Map(); // childAccountId -> state
  private checkInterval: number = 60000; // Check every minute
  private intervalId?: NodeJS.Timeout;
  private trainingFeedback: Map<string, AITrainingFeedback[]> = new Map(); // childAccountId -> feedback history

  /**
   * Start automation for a child account
   * Supports both legacy config-based and new profile-based automation
   */
  async startAutomation(
    childAccountId: string,
    configOrPlatform: AutomationConfig | SocialPlatform,
    motherAccountId?: string,
    schedule?: AutomationState['schedule']
  ) {
    // Handle legacy config-based calls
    if (typeof configOrPlatform === 'object') {
      const config = configOrPlatform as AutomationConfig;
      this.automationStates.set(childAccountId, {
        enabled: config.enabled,
        requireApproval: config.requireApproval,
        schedule: {
          timeSlots: config.schedule.timeSlots,
          timezone: config.schedule.timezone,
          maxPostsPerDay: config.schedule.maxPostsPerDay
        }
      });
    }
    // Handle new profile-based calls
    else if (typeof configOrPlatform === 'string' && motherAccountId && schedule) {
      const platform = configOrPlatform;
      // Get child account profile
      const profileResponse = await childAccountService.getProfile(platform, motherAccountId);
      if (!profileResponse) {
        throw new Error(`No profile found for child account ${childAccountId}`);
      }

      this.automationStates.set(childAccountId, {
        enabled: true,
        requireApproval: true, // Default to requiring approval for safety
        schedule
      });
    } else {
      throw new Error('Invalid arguments provided to startAutomation');
    }
    
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.checkScheduledPosts(), this.checkInterval);
    }
  }

  /**
   * Stop automation for a child account
   */
  stopAutomation(childAccountId: string) {
    this.automationStates.delete(childAccountId);
    
    // Clean up scheduled posts for this account
    for (const [postId, post] of this.scheduledPosts.entries()) {
      if (post.content.metadata.personality.relationship === childAccountId) {
        this.scheduledPosts.delete(postId);
      }
    }

    // If no more automated accounts, stop checking
    if (this.automationStates.size === 0 && this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  /**
   * Cancel all pending posts for a child account
   * New method for emergency cancellation
   */
  async cancelPendingPosts(childAccountId: string): Promise<void> {
    let cancelCount = 0;
    for (const [postId, post] of this.scheduledPosts.entries()) {
      if (post.content.metadata.personality.relationship === childAccountId && 
          post.status === 'pending_approval') {
        this.scheduledPosts.delete(postId);
        cancelCount++;
      }
    }
    
    if (cancelCount === 0) {
      throw new Error('No pending posts found to cancel');
    }
  }

  /**
   * Submit AI training feedback to improve content generation
   */
  async submitTrainingFeedback(
    childAccountId: string,
    platform: SocialPlatform,
    feedback: AITrainingFeedback
  ): Promise<void> {
    // Store feedback history
    const existingFeedback = this.trainingFeedback.get(childAccountId) || [];
    existingFeedback.push(feedback);
    this.trainingFeedback.set(childAccountId, existingFeedback);

    // Apply feedback to AI content generation
    const state = this.automationStates.get(childAccountId);
    if (state?.enabled) {
      // Adjust content generation based on feedback
      const aiParams = await this.getAdjustedAIParams(childAccountId, platform);
      await aiContentService.updateContentParams(childAccountId, aiParams);
    }
  }

  /**
   * Get adjusted AI parameters based on feedback history
   */
  private async getAdjustedAIParams(childAccountId: string, platform: SocialPlatform): Promise<AIContentParams> {
    const feedbackHistory = this.trainingFeedback.get(childAccountId) || [];
    
    // Calculate average scores (default to 0.5 if no feedback)
    const avgAccuracy = feedbackHistory.length > 0
      ? feedbackHistory.reduce((sum, f) => sum + f.contentAccuracy, 0) / feedbackHistory.length
      : 0.5;
    const avgPersonality = feedbackHistory.length > 0
      ? feedbackHistory.reduce((sum, f) => sum + f.personalityMatch, 0) / feedbackHistory.length
      : 0.5;
    const avgVoice = feedbackHistory.length > 0
      ? feedbackHistory.reduce((sum, f) => sum + f.voiceCalibration, 0) / feedbackHistory.length
      : 0.5;

    // Get current profile or use defaults
    const profileResponse = await childAccountService.getProfile(platform, 'mother_account_id');
    // Get engagement rules based on platform
    const defaultEngagementRules = {
      likeFrequency: this.platformTimingRules[platform].maxPostsPerDay / 24, // Scale based on max posts per day
      commentFrequency: (this.platformTimingRules[platform].maxPostsPerDay / 24) * 0.5, // Half as often as likes
      shareFrequency: (this.platformTimingRules[platform].maxPostsPerDay / 24) * 0.25 // Quarter as often as likes
    };

    // Create default profile based on platform characteristics
    const defaultInterests = [
      `${platform} content`,
      'social media',
      'digital engagement'
    ];

    const defaultConstraints = [
      'no inappropriate content',
      'follow platform guidelines',
      `maintain ${platform} best practices`
    ];

    const profile = profileResponse?.profile || {
      engagementStyle: 'neutral' as const,
      relationshipToMother: 'child',
      personality: 'balanced',
      engagementRules: {
        likeFrequency: this.platformTimingRules[platform].maxPostsPerDay / 24,
        commentFrequency: (this.platformTimingRules[platform].maxPostsPerDay / 24) * 0.5,
        shareFrequency: (this.platformTimingRules[platform].maxPostsPerDay / 24) * 0.25
      },
      interests: defaultInterests,
      constraints: defaultConstraints
    } satisfies ChildAccountProfile;

    // Adjust AI parameters based on feedback
    return {
      ...this.convertProfileToAIParams(profile),
      accuracyWeight: avgAccuracy / 5, // Normalize to 0-1 range
      personalityWeight: avgPersonality / 5,
      voiceWeight: avgVoice / 100
    };
  }

  /**
   * Schedule content generation and posting using child account profile
   */
  private async scheduleContent(
    childAccountId: string,
    platform: SocialPlatform,
    motherAccountId: string,
    scheduledTime: Date
  ): Promise<string> {
    const state = this.automationStates.get(childAccountId);
    if (!state || !state.enabled) {
      throw new Error(`Automation not enabled for account ${childAccountId}`);
    }

    // Get child account profile
    const profileResponse = await childAccountService.getProfile(platform, motherAccountId);
    if (!profileResponse) {
      throw new Error(`No profile found for child account ${childAccountId}`);
    }

    // Convert child account profile to AI content parameters
    const aiPersonality = this.convertProfileToAIParams(profileResponse.profile);

    // Generate content using AI service with profile personality and rules
    const content = await aiContentService.generateContent(
      aiPersonality,
      platform,
      {
        topics: profileResponse.profile.interests,
        forbidden: profileResponse.profile.constraints,
        mediaTypes: this.platformTimingRules[platform].allowedMediaTypes || ['image', 'text']
      }
    );

    // Create scheduled post
    const postId = this.generatePostId();
    const scheduledPost: ScheduledPost = {
      id: postId,
      content,
      scheduledTime,
      platform,
      status: state.requireApproval ? 'pending_approval' : 'scheduled'
    };

    this.scheduledPosts.set(postId, scheduledPost);
    return postId;
  }

  /**
   * Convert child account profile to AI personality parameters
   */
  private convertProfileToAIParams(profile: ChildAccountProfile) {
    return {
      tone: profile.engagementStyle,
      relationship: profile.relationshipToMother,
      interests: profile.interests,
      style: profile.personality,
      constraints: profile.constraints
    };
  }

  /**
   * Approve a pending post
   */
  approvePost(postId: string) {
    const post = this.scheduledPosts.get(postId);
    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }

    post.status = 'scheduled';
    this.scheduledPosts.set(postId, post);
  }

  /**
   * Get next posting time based on schedule
   */
  private getNextPostingTime(schedule: AutomationState['schedule']): Date {
    const now = new Date();
    const timeSlots = schedule.timeSlots
      .map(slot => {
        const [hours, minutes] = slot.split(':').map(Number);
        const date = new Date(now);
        date.setHours(hours, minutes, 0, 0);
        if (date <= now) {
          date.setDate(date.getDate() + 1);
        }
        return date;
      })
      .sort((a, b) => a.getTime() - b.getTime());

    return timeSlots[0];
  }

  /**
   * Check and process scheduled posts
   */
  private async checkScheduledPosts() {
    const now = new Date();

    for (const [postId, post] of this.scheduledPosts.entries()) {
      if (post.status === 'scheduled' && post.scheduledTime <= now) {
        try {
          await this.publishPost(post);
          post.status = 'posted';
          this.scheduledPosts.set(postId, post);

          // Schedule next post if automation is still enabled
          const accountId = post.content.metadata.personality.relationship;
          const state = this.automationStates.get(accountId);
          if (state?.enabled) {
            const nextTime = this.getNextPostingTime(state.schedule);
            // Note: This assumes we can get motherAccountId from somewhere
            // In a real implementation, you'd need to store or retrieve this
            await this.scheduleContent(accountId, post.platform, 'mother_account_id', nextTime);
          }
        } catch (error) {
          console.error(`Failed to publish post ${postId}:`, error);
          post.status = 'failed';
          this.scheduledPosts.set(postId, post);
        }
      }
    }
  }

  /**
   * Publish post to platform
   */
  private async publishPost(post: ScheduledPost): Promise<void> {
    // Here we would integrate with the platform-specific services
    // This is a placeholder for the actual implementation
    console.log(`Publishing to ${post.platform}:`, post.content);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Generate unique post ID
   */
  private generatePostId(): string {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Platform-specific timing rules
   */
  private platformTimingRules: Record<SocialPlatform, PlatformTimingRule> = {
    twitter: {
      minGap: 30, // 30 minutes between posts
      optimalTimes: ['9:00', '12:00', '15:00', '17:00'],
      maxPostsPerDay: 4,
      allowedMediaTypes: ['image', 'video', 'gif']
    },
    instagram: {
      minGap: 120, // 2 hours between posts
      optimalTimes: ['11:00', '14:00', '19:00'],
      maxPostsPerDay: 3,
      allowedMediaTypes: ['image', 'video', 'carousel']
    },
    tiktok: {
      minGap: 180, // 3 hours between posts
      optimalTimes: ['10:00', '15:00', '20:00'],
      maxPostsPerDay: 3,
      allowedMediaTypes: ['video']
    },
    youtube: {
      minGap: 1440, // 24 hours between posts
      optimalTimes: ['15:00'],
      maxPostsPerDay: 1,
      allowedMediaTypes: ['video']
    }
  };

  /**
   * Check for cross-platform conflicts
   */
  async checkCrossPlatformConflicts(childAccountId: string): Promise<CrossPlatformConflict[]> {
    const conflicts: CrossPlatformConflict[] = [];
    const accountPosts = Array.from(this.scheduledPosts.values())
      .filter(post => post.content.metadata.personality.relationship === childAccountId);

    // Check timing conflicts
    accountPosts.forEach((post, i) => {
      accountPosts.slice(i + 1).forEach(otherPost => {
        const timeDiff = Math.abs(post.scheduledTime.getTime() - otherPost.scheduledTime.getTime());
        const minGapMs = Math.min(
          this.platformTimingRules[post.platform].minGap,
          this.platformTimingRules[otherPost.platform].minGap
        ) * 60 * 1000;

        if (timeDiff < minGapMs) {
          conflicts.push({
            type: 'timing',
            severity: 'warning',
            description: `Posts scheduled too close together on ${post.platform} and ${otherPost.platform}`,
            posts: [
              { id: post.id, platform: post.platform, scheduledTime: post.scheduledTime, content: post.content.content.text },
              { id: otherPost.id, platform: otherPost.platform, scheduledTime: otherPost.scheduledTime, content: otherPost.content.content.text }
            ],
            suggestion: `Consider spacing posts at least ${minGapMs / (60 * 1000)} minutes apart`
          });
        }
      });
    });

    // Check content similarity
    accountPosts.forEach((post, i) => {
      accountPosts.slice(i + 1).forEach(otherPost => {
        if (post.platform !== otherPost.platform) {
          // Simple similarity check (in practice, use a proper text similarity algorithm)
          const similarity = post.content.content.text === otherPost.content.content.text ? 1 : 0;
          if (similarity > 0.7) {
            conflicts.push({
              type: 'content',
              severity: 'warning',
              description: 'Very similar content detected across platforms',
              posts: [
                { id: post.id, platform: post.platform, scheduledTime: post.scheduledTime, content: post.content.content.text },
                { id: otherPost.id, platform: otherPost.platform, scheduledTime: otherPost.scheduledTime, content: otherPost.content.content.text }
              ],
              suggestion: 'Consider customizing content for each platform'
            });
          }
        }
      });
    });

    // Check messaging consistency
    const platformGroups = new Map<string, typeof accountPosts>();
    accountPosts.forEach(post => {
      const date = post.scheduledTime.toDateString();
      const group = platformGroups.get(date) || [];
      group.push(post);
      platformGroups.set(date, group);
    });

    platformGroups.forEach(group => {
      if (group.length > 1) {
        const tones = new Set(group.map(post => post.content.metadata.personality.tone));
        if (tones.size > 1) {
          conflicts.push({
            type: 'messaging',
            severity: 'warning',
            description: 'Inconsistent messaging tone across platforms',
            posts: group.map(post => ({
              id: post.id,
              platform: post.platform,
              scheduledTime: post.scheduledTime,
              content: post.content.content.text
            })),
            suggestion: 'Consider maintaining consistent tone across platforms for the same day'
          });
        }
      }
    });

    return conflicts;
  }

  /**
   * Optimize post timing across platforms
   */
  async optimizePostTiming(childAccountId: string): Promise<void> {
    const accountPosts = Array.from(this.scheduledPosts.values())
      .filter(post => post.content.metadata.personality.relationship === childAccountId);

    // Group posts by day
    const postsByDay = new Map<string, typeof accountPosts>();
    accountPosts.forEach(post => {
      const date = post.scheduledTime.toDateString();
      const group = postsByDay.get(date) || [];
      group.push(post);
      postsByDay.set(date, group);
    });

    // Optimize each day's schedule
    postsByDay.forEach((posts, date) => {
      posts.sort((a, b) => {
        const aRule = this.platformTimingRules[a.platform];
        const bRule = this.platformTimingRules[b.platform];
        // Prioritize platforms with stricter posting limits
        return aRule.maxPostsPerDay - bRule.maxPostsPerDay;
      });

      // Assign optimal times based on platform rules
      posts.forEach((post, index) => {
        const rule = this.platformTimingRules[post.platform];
        const optimalTime = rule.optimalTimes[index % rule.optimalTimes.length];
        const [hours, minutes] = optimalTime.split(':').map(Number);
        
        const newTime = new Date(post.scheduledTime);
        newTime.setHours(hours, minutes, 0, 0);
        post.scheduledTime = newTime;
        
        this.scheduledPosts.set(post.id, post);
      });
    });
  }

  /**
   * Update schedule for a specific post
   */
  async updatePostSchedule(postId: string, newTime: Date): Promise<void> {
    const post = this.scheduledPosts.get(postId);
    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }
    post.scheduledTime = newTime;
    this.scheduledPosts.set(postId, post);
  }

  /**
   * Get current automation status for a child account
   */
  async getStatus(childAccountId: string): Promise<{
    isEnabled: boolean;
    pendingPosts: number;
    lastPostTime?: Date;
    nextScheduledTime?: Date;
    pendingContent: ContentGenerationResult[];
  }> {
    const state = this.automationStates.get(childAccountId);
    const accountPosts = Array.from(this.scheduledPosts.values())
      .filter(post => post.content.metadata.personality.relationship === childAccountId);
    
    const pendingPosts = accountPosts.filter(post => post.status === 'pending_approval');
    const scheduledPosts = accountPosts.filter(post => post.status === 'scheduled')
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());

    return {
      isEnabled: state?.enabled || false,
      pendingPosts: pendingPosts.length,
      lastPostTime: accountPosts.find(p => p.status === 'posted')?.scheduledTime,
      nextScheduledTime: scheduledPosts[0]?.scheduledTime,
      pendingContent: pendingPosts.map(post => post.content)
    };
  }
}

// Export singleton instance
export const automationService = new AutomationService();
