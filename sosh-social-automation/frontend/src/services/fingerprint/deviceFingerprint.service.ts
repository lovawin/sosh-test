import { type SocialPlatform } from '../social-platforms.service';

interface DeviceProfile {
  userAgent: string;
  screenResolution: { width: number; height: number };
  timezone: string;
  language: string;
  platform: string;
}

// Pre-configured device profiles to ensure realistic combinations
const deviceProfiles: DeviceProfile[] = [
  {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    screenResolution: { width: 375, height: 812 },
    timezone: 'America/New_York',
    language: 'en-US',
    platform: 'iOS'
  },
  {
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Mobile Safari/537.36',
    screenResolution: { width: 360, height: 800 },
    timezone: 'Europe/London',
    language: 'en-GB',
    platform: 'Android'
  },
  // Add more profiles as needed
];

class DeviceFingerprintService {
  private accountProfiles: Map<string, DeviceProfile> = new Map();
  
  /**
   * Get or create a device profile for a child account
   * @param accountId The child account ID
   * @returns A consistent device profile for the account
   */
  getDeviceProfile(accountId: string): DeviceProfile {
    if (!this.accountProfiles.has(accountId)) {
      // Deterministically select profile based on accountId to ensure consistency
      const profileIndex = this.getHashIndex(accountId, deviceProfiles.length);
      this.accountProfiles.set(accountId, deviceProfiles[profileIndex]);
    }
    return this.accountProfiles.get(accountId)!;
  }

  /**
   * Get request headers for platform API calls
   * @param accountId The child account ID
   * @param platform The social media platform
   * @returns Headers to use for API requests
   */
  getRequestHeaders(accountId: string, platform: SocialPlatform): Record<string, string> {
    const profile = this.getDeviceProfile(accountId);
    
    return {
      'User-Agent': profile.userAgent,
      'Accept-Language': profile.language,
      'X-Device-Platform': profile.platform,
      'X-Device-Timezone': profile.timezone,
      'X-Device-Resolution': `${profile.screenResolution.width}x${profile.screenResolution.height}`
    };
  }

  private getHashIndex(str: string, max: number): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % max;
  }
}

// Export singleton instance
export const deviceFingerprintService = new DeviceFingerprintService();
