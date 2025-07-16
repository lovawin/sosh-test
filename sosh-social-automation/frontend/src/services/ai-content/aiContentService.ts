import {
  type PersonalityTemplate,
  type PlatformRequirements,
  type GeneratedContent,
  type ContentGenerationResult,
  type AIServiceConfig,
  type ContentRules,
  type AIContentParams
} from './types';
import { type SocialPlatform } from '../../services/social-platforms.service';

/**
 * Platform-specific requirements
 */
const platformRequirements: Record<SocialPlatform, PlatformRequirements> = {
  twitter: {
    maxLength: 280,
    maxHashtags: 3,
    allowedMediaTypes: ['image', 'video', 'gif'],
    postFrequencyLimit: 48,
    characterLimits: {}
  },
  instagram: {
    maxLength: 2200,
    maxHashtags: 30,
    allowedMediaTypes: ['image', 'video', 'carousel'],
    postFrequencyLimit: 24,
    characterLimits: {
      comment: 2200
    }
  },
  tiktok: {
    maxLength: 2200,
    maxHashtags: 10,
    allowedMediaTypes: ['video'],
    postFrequencyLimit: 24,
    characterLimits: {
      description: 2200
    }
  },
  youtube: {
    maxLength: 5000,
    maxHashtags: 15,
    allowedMediaTypes: ['video'],
    postFrequencyLimit: 12,
    characterLimits: {
      title: 100,
      description: 5000
    }
  }
};

class AIContentService {
  private config: AIServiceConfig;
  private platformReqs: Record<SocialPlatform, PlatformRequirements>;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.platformReqs = platformRequirements;
  }

  /**
   * Update AI service configuration
   */
  setConfig(config: Partial<AIServiceConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Generate content based on personality and platform requirements
   */
  async generateContent(
    personality: PersonalityTemplate,
    platform: SocialPlatform,
    contentRules: ContentRules
  ): Promise<ContentGenerationResult> {
    const requirements = this.platformReqs[platform];
    const prompt = this.createPrompt(personality, requirements, contentRules);

    let content: GeneratedContent;

    if (this.config.provider === 'mock') {
      content = await this.generateMockContent(platform, personality);
    } else {
      content = await this.generateAIContent(prompt, platform);
    }

    return {
      content,
      status: 'draft',
      generatedAt: new Date(),
      approvalNeeded: true,
      metadata: {
        prompt,
        model: this.config.model,
        personality,
        platformRules: requirements
      }
    };
  }

  /**
   * Create AI prompt from personality and requirements
   */
  private createPrompt(
    personality: PersonalityTemplate,
    requirements: PlatformRequirements,
    contentRules: ContentRules
  ): string {
    return `
      Create content with the following characteristics:
      Tone: ${personality.tone}
      Style: ${personality.style}
      Topics: ${contentRules.topics.join(', ')}
      Avoid: ${contentRules.forbidden.join(', ')}
      Maximum length: ${requirements.maxLength}
      Maximum hashtags: ${requirements.maxHashtags}
      
      Additional context:
      - Relationship to main account: ${personality.relationship}
      - Interests: ${personality.interests.join(', ')}
      - Content constraints: ${personality.constraints.join(', ')}
      
      Format the response as a social media post including appropriate hashtags.
    `.trim();
  }

  /**
   * Generate content using AI service
   */
  private async generateAIContent(
    prompt: string,
    platform: SocialPlatform
  ): Promise<GeneratedContent> {
    if (!this.config.apiKey) {
      throw new Error('AI service API key not configured');
    }

    // Make API call to chosen AI provider
    const response = await fetch(`https://api.${this.config.provider}.com/v1/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        prompt,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }

    const result = await response.json();
    const text = result.choices[0].text.trim();
    const hashtags = this.extractHashtags(text);

    return {
      text,
      hashtags,
      platform,
      mediaPrompt: this.generateMediaPrompt(text, platform)
    };
  }

  /**
   * Generate mock content for testing
   */
  private async generateMockContent(
    platform: SocialPlatform,
    personality: PersonalityTemplate
  ): Promise<GeneratedContent> {
    // Use mockData if provided, otherwise generate simple mock content
    const mockText = this.config.mockData?.[platform] || 
      `Mock ${personality.tone} post about ${personality.interests[0]} #mock`;
    
    return {
      text: mockText,
      hashtags: this.extractHashtags(mockText),
      platform,
      mediaPrompt: 'Mock media prompt'
    };
  }

  /**
   * Extract hashtags from text
   */
  private extractHashtags(text: string): string[] {
    const matches = text.match(/#[\w\u0590-\u05ff]+/g);
    return matches ? matches : [];
  }

  /**
   * Generate prompt for media creation/selection
   */
  private generateMediaPrompt(text: string, platform: SocialPlatform): string {
    const requirements = this.platformReqs[platform];
    const mediaTypes = requirements.allowedMediaTypes.join(' or ');
    
    return `Create ${mediaTypes} content that matches the following post: ${text}`;
  }

  /**
   * Check content overlap between posts
   * Returns similarity score between 0 and 1
   */
  checkContentOverlap(content1: GeneratedContent, content2: GeneratedContent): number {
    // Simple text similarity check (can be enhanced with more sophisticated algorithms)
    const text1 = content1.text.toLowerCase();
    const text2 = content2.text.toLowerCase();
    
    // Count matching words
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    
    // Calculate Jaccard similarity
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }

  /**
   * Get optimal posting time for a platform
   * Returns Date object with the optimal time
   */
  getOptimalPostingTime(platform: SocialPlatform, existingTimes: Date[] = []): Date {
    const reqs = this.platformReqs[platform];
    const now = new Date();
    
    // Default optimal times for each platform (can be customized)
    const optimalHours = {
      twitter: [9, 12, 15, 17],
      instagram: [11, 14, 19],
      tiktok: [10, 15, 20],
      youtube: [15]
    };

    // Find the next available optimal time that doesn't conflict with existing posts
    const platformHours = optimalHours[platform];
    let optimalTime = new Date(now);
    
    for (let day = 0; day < 7; day++) {
      for (const hour of platformHours) {
        optimalTime.setDate(now.getDate() + day);
        optimalTime.setHours(hour, 0, 0, 0);
        
        // Skip if time is in the past
        if (optimalTime <= now) continue;
        
        // Check if this time conflicts with existing posts
        const hasConflict = existingTimes.some(existing => {
          const diffHours = Math.abs(optimalTime.getTime() - existing.getTime()) / (1000 * 60 * 60);
          return diffHours < 2; // Minimum 2-hour gap between posts
        });
        
        if (!hasConflict) {
          return optimalTime;
        }
      }
    }
    
    return optimalTime;
  }

  /**
   * Check messaging consistency across platforms
   * Returns array of inconsistencies found
   */
  checkMessagingConsistency(contents: GeneratedContent[]): Array<{
    type: 'tone' | 'hashtags';
    description: string;
    platforms: SocialPlatform[];
  }> {
    const inconsistencies: Array<{
      type: 'tone' | 'hashtags';
      description: string;
      platforms: SocialPlatform[];
    }> = [];
    
    // Group contents by day
    const contentsByDay = new Map<string, GeneratedContent[]>();
    contents.forEach(content => {
      const date = new Date().toDateString(); // Use scheduled date in real implementation
      const dayContents = contentsByDay.get(date) || [];
      dayContents.push(content);
      contentsByDay.set(date, dayContents);
    });
    
    // Check each day's contents for consistency
    contentsByDay.forEach(dayContents => {
      // Check tone consistency
      const tones = new Set(dayContents.map(content => 
        this.detectTone(content.text)
      ));
      
      if (tones.size > 1) {
        inconsistencies.push({
          type: 'tone',
          description: 'Inconsistent tone across platforms',
          platforms: dayContents.map(c => c.platform)
        });
      }
      
      // Check hashtag consistency
      const hashtagSets = dayContents.map(c => new Set(c.hashtags));
      const commonHashtags = new Set(
        [...hashtagSets[0]].filter(tag => 
          hashtagSets.every(set => set.has(tag))
        )
      );
      
      if (commonHashtags.size === 0 && hashtagSets.some(set => set.size > 0)) {
        inconsistencies.push({
          type: 'hashtags',
          description: 'No common hashtags across platforms',
          platforms: dayContents.map(c => c.platform)
        });
      }
    });
    
    return inconsistencies;
  }

  /**
   * Helper: Detect tone of text
   * Simple implementation - can be enhanced with NLP
   */
  private detectTone(text: string): 'professional' | 'casual' | 'humorous' | 'neutral' {
    const toneIndicators: Record<'professional' | 'casual' | 'humorous', string[]> = {
      professional: ['announce', 'proud', 'excited to share'],
      casual: ['hey', 'check this out', 'cool'],
      humorous: ['lol', 'haha', '😂']
    };
    
    const lowerText = text.toLowerCase();
    for (const [tone, indicators] of Object.entries(toneIndicators) as Array<[keyof typeof toneIndicators, string[]]>) {
      if (indicators.some(indicator => lowerText.includes(indicator))) {
        return tone;
      }
    }
    
    return 'neutral';
  }

  /**
   * Update AI content generation parameters
   */
  async updateContentParams(childAccountId: string, params: AIContentParams): Promise<void> {
    // Store parameters for future content generation
    // In a real implementation, this would update the AI model's parameters
    console.log('Updating AI parameters for account', childAccountId, params);
    
    // Update config with new weights
    this.config = {
      ...this.config,
      temperature: Math.min(1, Math.max(0, params.personalityWeight)), // Use personality weight to adjust temperature
    };
  }
}

// Export singleton instance
export const aiContentService = new AIContentService({
  provider: 'mock', // Default to mock provider
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000
});
