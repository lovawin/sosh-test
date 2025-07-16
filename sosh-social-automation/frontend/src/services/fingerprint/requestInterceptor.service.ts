import axios, { type InternalAxiosRequestConfig } from 'axios';
import { deviceFingerprintService } from './deviceFingerprint.service';
import { proxyRotationService } from './proxyRotation.service';
import { type SocialPlatform } from '../social-platforms.service';

/**
 * Service to intercept and modify requests with device fingerprinting and proxy rotation
 * This keeps the fingerprinting logic isolated from the rest of the application
 */
class RequestInterceptorService {
  /**
   * Initialize request interceptor for a specific axios instance
   * @param axiosInstance Optional axios instance to intercept
   */
  initialize(axiosInstance = axios) {
    axiosInstance.interceptors.request.use(
      async (config) => {
        // Only intercept requests to social media platforms
        if (this.isSocialMediaRequest(config.url)) {
          return this.modifyRequest(config);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Modify request configuration with device fingerprint and proxy
   * @param config Original axios request config
   * @returns Modified config with fingerprinting
   */
  private async modifyRequest(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
    const accountId = this.extractAccountId(config);
    const platform = this.extractPlatform(config.url);
    
    if (!accountId || !platform) {
      return config;
    }

    // Get device fingerprint headers
    const fingerprintHeaders = deviceFingerprintService.getRequestHeaders(accountId, platform);
    
    // Get proxy configuration
    const proxyConfig = proxyRotationService.getProxyConfig(accountId);

    // Keep the original headers instance and add our custom headers
    Object.entries(fingerprintHeaders).forEach(([key, value]) => {
      config.headers.set(key, value);
    });

    return {
      ...config,
      proxy: proxyConfig
    };
  }

  /**
   * Extract account ID from request config
   * Looks for accountId in headers, params, or URL
   */
  private extractAccountId(config: InternalAxiosRequestConfig): string | null {
    // Try to get from custom header
    const accountId = config.headers?.['X-Account-ID'];
    if (accountId) {
      return accountId as string;
    }

    // Try to get from URL path
    const match = config.url?.match(/\/accounts\/([^\/]+)/);
    if (match) {
      return match[1];
    }

    return null;
  }

  /**
   * Extract platform from request URL
   */
  private extractPlatform(url?: string): SocialPlatform | null {
    if (!url) return null;

    const platforms: SocialPlatform[] = ['twitter', 'instagram', 'tiktok', 'youtube'];
    for (const platform of platforms) {
      if (url.includes(platform)) {
        return platform;
      }
    }

    return null;
  }

  /**
   * Check if URL is for a social media platform
   */
  private isSocialMediaRequest(url?: string): boolean {
    if (!url) return false;
    return /\/(twitter|instagram|tiktok|youtube)\//.test(url);
  }
}

// Export singleton instance
export const requestInterceptorService = new RequestInterceptorService();
