import { 
  type SocialPlatform,
  type PlatformInfo,
  type MotherAccount,
  type ChildAccount,
  type PlatformAuthUrl,
  type EngagementStats
} from '../social-platforms.service';
import { platformsMock, motherAccountsMock, childAccountsMock } from './platforms.mock';

class MockSocialPlatformsService {
  private platforms = platformsMock;
  private motherAccounts = motherAccountsMock;
  private childAccounts = childAccountsMock;

  async getPlatformStats(platform: SocialPlatform) {
    return {
      followers: 1000,
      following: 500,
      posts: 100
    };
  }

  async getPlatformInfo(platform: SocialPlatform): Promise<PlatformInfo> {
    return this.platforms.find(p => p.type === platform) || {
      type: platform,
      name: platform.charAt(0).toUpperCase() + platform.slice(1),
      icon: `/assets/icons/${platform}.svg`,
      isConnected: false
    };
  }

  async getPlatforms(): Promise<PlatformInfo[]> {
    return this.platforms;
  }

  async connectPlatform(platform: SocialPlatform): Promise<PlatformAuthUrl> {
    return {
      authUrl: `http://localhost:3001/mock-auth/${platform}`
    };
  }

  async refreshPlatform(platform: SocialPlatform): Promise<void> {
    // Mock refresh - no action needed
    return;
  }

  async syncPlatform(platform: SocialPlatform): Promise<void> {
    // Mock sync - no action needed
    return;
  }

  async addMotherAccount(platform: SocialPlatform, username: string): Promise<MotherAccount> {
    const newAccount: MotherAccount = {
      id: `${platform}-m-${Date.now()}`,
      username,
      isAutomated: false
    };
    this.motherAccounts[platform].push(newAccount);
    return newAccount;
  }

  async getMotherAccounts(platform: SocialPlatform): Promise<MotherAccount[]> {
    return this.motherAccounts[platform] || [];
  }

  async enableMotherAccountAutomation(platform: SocialPlatform, accountId: string): Promise<PlatformAuthUrl> {
    const account = this.motherAccounts[platform]?.find(a => a.id === accountId);
    if (account) {
      account.isAutomated = true;
    }
    return {
      authUrl: `http://localhost:3001/mock-auth/${platform}/mother/${accountId}`
    };
  }

  async removeMotherAccount(platform: SocialPlatform, accountId: string): Promise<void> {
    if (this.motherAccounts[platform]) {
      this.motherAccounts[platform] = this.motherAccounts[platform].filter(a => a.id !== accountId);
    }
  }

  async addChildAccount(platform: SocialPlatform): Promise<PlatformAuthUrl> {
    return {
      authUrl: `http://localhost:3001/mock-auth/${platform}/child`
    };
  }

  async getChildAccounts(platform: SocialPlatform): Promise<ChildAccount[]> {
    return this.childAccounts[platform] || [];
  }

  async updateChildAccountMotherConnections(
    platform: SocialPlatform,
    childAccountId: string,
    motherAccountIds: string[]
  ): Promise<void> {
    const account = this.childAccounts[platform]?.find(a => a.id === childAccountId);
    if (account) {
      account.connectedMotherAccounts = motherAccountIds;
    }
  }

  async executeEngagementStrategy(platform: SocialPlatform, targetUsername: string): Promise<void> {
    // Mock engagement - no action needed
    return;
  }

  async getEngagementStats(platform: SocialPlatform): Promise<EngagementStats> {
    const accounts = this.childAccounts[platform] || [];
    return {
      totalChildAccounts: accounts.length,
      totalInteractions: accounts.reduce((sum, acc) => sum + acc.totalInteractions, 0),
      interactionsByType: {
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 500),
        shares: Math.floor(Math.random() * 200)
      },
      childAccountStats: accounts.map(child => ({
        username: child.username,
        dailyInteractions: child.dailyInteractions,
        totalInteractions: child.totalInteractions
      }))
    };
  }

  // New methods for personality features
  async updateChildAccountPersonality(
    platform: SocialPlatform,
    childAccountId: string,
    personality: any
  ): Promise<void> {
    const account = this.childAccounts[platform]?.find(a => a.id === childAccountId);
    if (account) {
      account.personality = {
        ...account.personality,
        ...personality
      };
    }
  }

  async updateChildAccountInteractionStyle(
    platform: SocialPlatform,
    childAccountId: string,
    style: any
  ): Promise<void> {
    const account = this.childAccounts[platform]?.find(a => a.id === childAccountId);
    if (account) {
      account.interactionStyle = {
        ...account.interactionStyle,
        ...style
      };
    }
  }

  async updateChildAccountProfileSettings(
    platform: SocialPlatform,
    childAccountId: string,
    settings: any
  ): Promise<void> {
    const account = this.childAccounts[platform]?.find(a => a.id === childAccountId);
    if (account) {
      account.profileSettings = {
        ...account.profileSettings,
        ...settings
      };
    }
  }
}

export const mockSocialPlatformsService = new MockSocialPlatformsService();
export default mockSocialPlatformsService;
