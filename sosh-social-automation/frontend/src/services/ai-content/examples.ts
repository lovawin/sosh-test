import { automationService } from './automationService';
import { aiContentService } from './aiContentService';
import { type AutomationConfig } from './types';

/**
 * Example configurations and usage of the AI content automation system
 * Note: These examples use the legacy config format for backward compatibility
 */

// Example: Configure a community manager child account
const communityManagerConfig: AutomationConfig = {
  enabled: true,
  requireApproval: true,  // Require human approval before posting
  personality: {
    tone: "friendly and professional",
    relationship: "community_manager",
    interests: ["tech news", "industry updates", "company culture"],
    style: "informative with a personal touch",
    constraints: ["no politics", "family-friendly", "avoid controversy"]
  },
  schedule: {
    frequency: "daily",
    timeSlots: ["09:00", "12:00", "15:00", "17:00"],
    timezone: "America/New_York",
    maxPostsPerDay: 4
  },
  contentRules: {
    topics: [
      "company updates",
      "tech industry news",
      "product features",
      "user success stories"
    ],
    forbidden: [
      "competitors",
      "unreleased features",
      "political topics",
      "controversial subjects"
    ],
    mediaTypes: ["image", "link"]
  }
};

// Example: Configure a support team child account
const supportTeamConfig: AutomationConfig = {
  enabled: true,
  requireApproval: false,  // Auto-post without approval
  personality: {
    tone: "helpful and concise",
    relationship: "support_team",
    interests: ["customer support", "product tips", "user guides"],
    style: "clear and straightforward",
    constraints: ["stick to facts", "avoid speculation"]
  },
  schedule: {
    frequency: "daily",
    timeSlots: ["08:00", "13:00", "16:00"],
    timezone: "UTC",
    maxPostsPerDay: 3
  },
  contentRules: {
    topics: [
      "product tips",
      "FAQs",
      "feature tutorials",
      "support updates"
    ],
    forbidden: [
      "pricing discussions",
      "bug reports",
      "personal issues"
    ],
    mediaTypes: ["image", "video"]
  }
};

// Example: Usage of the automation system
export const examples = {
  // Start automation for a community manager account
  startCommunityManager: (accountId: string) => {
    // Configure AI service first
    aiContentService.setConfig({
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000
    });

    // Start automation using legacy config format
    automationService.startAutomation(accountId, communityManagerConfig);
  },

  // Start automation for a support team account
  startSupportTeam: (accountId: string) => {
    aiContentService.setConfig({
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.5,  // More focused/consistent
      maxTokens: 800
    });

    // Start automation using legacy config format
    automationService.startAutomation(accountId, supportTeamConfig);
  },

  // Use mock data for testing
  startMockAutomation: (accountId: string) => {
    // Configure AI service to use mock data
    aiContentService.setConfig({
      provider: 'mock',
      model: 'mock-model',
      temperature: 0.7,
      maxTokens: 1000,
      mockData: {
        twitter: "Check out our latest feature update! 🚀 #TechNews #Innovation",
        instagram: "Behind the scenes at our dev team's weekly standup 📱 #TechLife",
        linkedin: "Excited to announce our new partnership with...",
      }
    });

    // Start automation using legacy config format
    automationService.startAutomation(accountId, communityManagerConfig);
  },

  // Stop automation for an account
  stopAutomation: (accountId: string) => {
    automationService.stopAutomation(accountId);
  },

  // Approve a pending post
  approvePost: (postId: string) => {
    automationService.approvePost(postId);
  }
};

// Example: Using the automation system
/*
// Start automation with mock data for testing
examples.startMockAutomation('test_account_123');

// Start real automation for community manager
examples.startCommunityManager('community_manager_456');

// Start real automation for support team
examples.startSupportTeam('support_team_789');

// Stop automation
examples.stopAutomation('test_account_123');

// Approve a pending post
examples.approvePost('post_123');
*/
