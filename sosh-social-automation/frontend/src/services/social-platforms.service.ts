import axios from 'axios';
import { mockSocialPlatformsService } from './mock/platforms.service.mock';

export type SocialPlatform = 'twitter' | 'instagram' | 'tiktok' | 'youtube';

export type AccountType = 'mother' | 'child';

export interface PlatformStatuses {
  twitter: boolean;
  instagram: boolean;
  tiktok: boolean;
  youtube: boolean;
}

export interface PlatformStats {
  followers: number;
  following: number;
  posts: number;
}

export interface MotherAccount {
  id: string;
  username: string;
  isAutomated: boolean;
}

export interface PersonalityTraits {
  openness: number;          // 1-10: curiosity and openness to new experiences
  conscientiousness: number; // 1-10: organization and responsibility
  extraversion: number;      // 1-10: sociability and energy
  agreeableness: number;     // 1-10: friendliness and cooperation
  emotionality: number;      // 1-10: emotional range and expression
}

export interface InteractionStyle {
  responseSpeed: number;     // 1-10: how quickly they respond
  engagementType: 'passive' | 'reactive' | 'proactive';
  tonePreference: 'formal' | 'casual' | 'playful' | 'professional';
  contentFocus: string[];   // e.g., ['tech', 'gaming', 'lifestyle']
}

export interface ProfileSettings {
  bio: string;
  interests: string[];
  preferredPostTimes: string[];
  hashtagStyle: 'minimal' | 'moderate' | 'heavy';
  mediaPreference: 'text' | 'images' | 'videos' | 'mixed';
}

export interface ChildAccount {
  id: string;
  username: string;
  dailyInteractions: number;
  totalInteractions: number;
  connectedMotherAccounts: string[]; // Array of mother account IDs
  personality: PersonalityTraits;
  interactionStyle: InteractionStyle;
  profileSettings: ProfileSettings;
}

export interface EngagementStats {
  totalChildAccounts: number;
  totalInteractions: number;
  interactionsByType: Record<string, number>;
  childAccountStats: {
    username: string;
    dailyInteractions: number;
    totalInteractions: number;
  }[];
}

export interface PlatformInfo {
  type: SocialPlatform;
  name: string;
  icon: string;
  isConnected: boolean;
  username?: string;
  profileUrl?: string;
  stats?: PlatformStats;
  isChildAccount?: boolean;
  motherAccountId?: string;
}

export interface PlatformAuthUrl {
  authUrl: string;
}

class SocialPlatformsService {
  private static readonly API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';
  private axiosInstance;

  constructor() {
    // Get the token from localStorage during initialization
    const token = localStorage.getItem('token');

    this.axiosInstance = axios.create({
      baseURL: SocialPlatformsService.API_URL,
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    // Add auth token to requests
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token refresh on 401 errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const token = localStorage.getItem('token');
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (err) {
            console.error('Token refresh failed:', err);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async getPlatformStats(platform: SocialPlatform): Promise<PlatformStats> {
    const response = await this.axiosInstance.get<PlatformStats>(
      `/platforms/${platform}/stats`
    );
    return response.data;
  }

  async getPlatformInfo(platform: SocialPlatform): Promise<PlatformInfo> {
    const response = await this.axiosInstance.get<PlatformInfo>(
      `/platforms/${platform}`
    );
    return response.data;
  }

  async getPlatforms(): Promise<PlatformInfo[]> {
    const response = await this.axiosInstance.get<PlatformInfo[]>('/platforms');
    return response.data;
  }

  async connectPlatform(platform: SocialPlatform): Promise<PlatformAuthUrl> {
    const response = await this.axiosInstance.post<{ success: true; data: PlatformAuthUrl }>(
      `/platforms/${platform}/connect`
    );
    return response.data.data;
  }

  async refreshPlatform(platform: SocialPlatform): Promise<void> {
    await this.axiosInstance.post(
      `/platforms/${platform}/refresh`
    );
  }

  async syncPlatform(platform: SocialPlatform): Promise<void> {
    await this.axiosInstance.post(
      `/platforms/${platform}/sync`
    );
  }

  async addMotherAccount(platform: SocialPlatform, username: string): Promise<MotherAccount> {
    const response = await this.axiosInstance.post<{ success: true; data: MotherAccount }>(
      `/platforms/${platform}/mother-accounts`,
      { username }
    );
    return response.data.data;
  }

  async getMotherAccounts(platform: SocialPlatform): Promise<MotherAccount[]> {
    const response = await this.axiosInstance.get<MotherAccount[]>(
      `/platforms/${platform}/mother-accounts`
    );
    return response.data;
  }

  async enableMotherAccountAutomation(platform: SocialPlatform, accountId: string): Promise<PlatformAuthUrl> {
    const response = await this.axiosInstance.post<{ success: true; data: PlatformAuthUrl }>(
      `/platforms/${platform}/mother-accounts/${accountId}/enable-automation`
    );
    return response.data.data;
  }

  async removeMotherAccount(platform: SocialPlatform, accountId: string): Promise<void> {
    await this.axiosInstance.delete(
      `/platforms/${platform}/mother-accounts/${accountId}`
    );
  }

  async addChildAccount(platform: SocialPlatform): Promise<PlatformAuthUrl> {
    const response = await this.axiosInstance.post<{ success: true; data: PlatformAuthUrl }>(
      `/platforms/${platform}/child-accounts`
    );
    return response.data.data;
  }

  async getChildAccounts(platform: SocialPlatform): Promise<ChildAccount[]> {
    const response = await this.axiosInstance.get<ChildAccount[]>(
      `/platforms/${platform}/child-accounts`
    );
    return response.data;
  }

  async updateChildAccountMotherConnections(
    platform: SocialPlatform,
    childAccountId: string,
    motherAccountIds: string[]
  ): Promise<void> {
    await this.axiosInstance.put(
      `/platforms/${platform}/child-accounts/${childAccountId}/mother-connections`,
      { motherAccountIds }
    );
  }

  async executeEngagementStrategy(platform: SocialPlatform, targetUsername: string): Promise<void> {
    const response = await this.axiosInstance.post<{ success: true; message: string }>(
      `/platforms/${platform}/engage`,
      { targetUsername }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || `Failed to execute engagement strategy on ${platform}`);
    }
  }

  async getEngagementStats(platform: SocialPlatform): Promise<EngagementStats> {
    const response = await this.axiosInstance.get<EngagementStats>(
      `/platforms/${platform}/engagement-stats`
    );
    return response.data;
  }

  // Personality feature methods
  async updateChildAccountPersonality(
    platform: SocialPlatform,
    childAccountId: string,
    personality: Partial<PersonalityTraits>
  ): Promise<void> {
    await this.axiosInstance.patch(
      `/platforms/${platform}/child-accounts/${childAccountId}/personality`,
      { personality }
    );
  }

  async updateChildAccountInteractionStyle(
    platform: SocialPlatform,
    childAccountId: string,
    style: Partial<InteractionStyle>
  ): Promise<void> {
    await this.axiosInstance.patch(
      `/platforms/${platform}/child-accounts/${childAccountId}/interaction-style`,
      { style }
    );
  }

  async updateChildAccountProfileSettings(
    platform: SocialPlatform,
    childAccountId: string,
    settings: Partial<ProfileSettings>
  ): Promise<void> {
    await this.axiosInstance.patch(
      `/platforms/${platform}/child-accounts/${childAccountId}/profile-settings`,
      { settings }
    );
  }
}

// Create service instance based on environment
const realService = new SocialPlatformsService();
const mockService = mockSocialPlatformsService;

// Export the appropriate service based on environment
export const socialPlatformsService = (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK === 'true') 
  ? mockService 
  : realService;

export default socialPlatformsService;
