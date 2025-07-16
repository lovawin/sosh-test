import axios from 'axios';
import { API_BASE_URL } from '../config';

export interface ChildAccountProfile {
  personality: string;
  relationshipToMother: string;
  engagementStyle: 'supportive' | 'critical' | 'neutral' | 'humorous';
  engagementRules: {
    likeFrequency: number;
    commentFrequency: number;
    shareFrequency: number;
  };
  interests: string[]; // Topics and themes the child account focuses on
  constraints: string[]; // Content restrictions and guidelines
}

export interface ProfileResponse {
  id: string;
  userId: string;
  platform: string;
  motherAccountId: string;
  profile: ChildAccountProfile;
  createdAt: string;
  updatedAt: string;
}

class ChildAccountService {
  private baseUrl = `${API_BASE_URL}/child-accounts`;

  async setProfile(
    platform: string,
    motherAccountId: string,
    profileData: ChildAccountProfile
  ): Promise<ProfileResponse> {
    const response = await axios.post(
      `${this.baseUrl}/${platform}/profile`,
      { motherAccountId, profileData }
    );
    return response.data;
  }

  async getProfile(
    platform: string,
    motherAccountId: string
  ): Promise<ProfileResponse | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${platform}/profile`,
        { params: { motherAccountId } }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getMotherProfiles(
    platform: string,
    motherAccountId: string
  ): Promise<ProfileResponse[]> {
    const response = await axios.get(
      `${this.baseUrl}/${platform}/mother/${motherAccountId}/profiles`
    );
    return response.data;
  }

  async deleteProfile(
    platform: string,
    motherAccountId: string
  ): Promise<void> {
    await axios.delete(
      `${this.baseUrl}/${platform}/profile`,
      { data: { motherAccountId } }
    );
  }
}

export const childAccountService = new ChildAccountService();
