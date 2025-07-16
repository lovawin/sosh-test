import { type ChildAccount } from '../../types/account';
import { type SocialPlatform } from '../../services/social-platforms.service';

/**
 * Mock data for testing automation features
 */
const mockAccounts: ChildAccount[] = [
  {
    id: 'community_manager_1',
    name: 'Community Manager',
    role: 'Community Management',
    platforms: ['twitter', 'instagram'] as SocialPlatform[],
    automationConfig: {
      enabled: false,
      requireApproval: true,
      personality: {
        tone: "friendly and professional",
        relationship: "community_manager_1",
        interests: ["tech news", "industry updates"],
        style: "informative with a personal touch",
        constraints: ["no politics", "family-friendly"]
      },
      schedule: {
        frequency: "daily",
        timeSlots: ["09:00", "12:00", "15:00"],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        maxPostsPerDay: 3
      },
      contentRules: {
        topics: ["company updates", "tech news", "industry insights"],
        forbidden: ["competitors", "politics"],
        mediaTypes: ["image", "link"]
      }
    }
  },
  {
    id: 'support_team_1',
    name: 'Support Team',
    role: 'Customer Support',
    platforms: ['twitter', 'facebook'] as SocialPlatform[],
    automationConfig: {
      enabled: false,
      requireApproval: true,
      personality: {
        tone: "helpful and concise",
        relationship: "support_team_1",
        interests: ["customer support", "product updates"],
        style: "clear and straightforward",
        constraints: ["stick to facts"]
      },
      schedule: {
        frequency: "daily",
        timeSlots: ["08:00", "13:00", "16:00"],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        maxPostsPerDay: 3
      },
      contentRules: {
        topics: ["product tips", "FAQs", "support updates"],
        forbidden: ["unreleased features", "pricing"],
        mediaTypes: ["image"]
      }
    }
  }
];

/**
 * Dedicated provider for fetching accounts in the automation context
 * This keeps automation-specific data handling separate from the main accounts functionality
 */
class AutomationAccountsProvider {
  /**
   * Get accounts with their automation configurations
   */
  async getAccounts(): Promise<ChildAccount[]> {
    console.log('AutomationAccountsProvider: getAccounts called');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('AutomationAccountsProvider: returning mock accounts', mockAccounts);
    return mockAccounts;
  }

  /**
   * Update account automation config
   */
  async updateAutomationConfig(accountId: string, config: ChildAccount['automationConfig']): Promise<void> {
    const account = mockAccounts.find(a => a.id === accountId);
    if (account && config) {
      account.automationConfig = config;
    }
  }
}

// Export singleton instance
export const automationAccountsProvider = new AutomationAccountsProvider();
