interface ProxyConfig {
  host: string;
  port: number;
  country: string;
  city: string;
  isp: string;
}

// Pre-configured proxy pools by region
// Bright Data ISP proxy configuration
const PROXY_HOST = 'brd.superproxy.io';
const PROXY_PORT = 33335;

const proxyPools: Record<string, ProxyConfig[]> = {
  'north-america': [
    {
      host: PROXY_HOST,
      port: PROXY_PORT,
      country: 'US',
      city: 'New York',
      isp: 'Verizon'
    },
    {
      host: PROXY_HOST,
      port: PROXY_PORT,
      country: 'CA',
      city: 'Toronto',
      isp: 'Rogers'
    }
  ],
  'europe': [
    {
      host: PROXY_HOST,
      port: PROXY_PORT,
      country: 'GB',
      city: 'London',
      isp: 'BT'
    },
    {
      host: PROXY_HOST,
      port: PROXY_PORT,
      country: 'DE',
      city: 'Berlin',
      isp: 'Deutsche Telekom'
    }
  ]
};

// Bright Data authentication credentials
const BRIGHT_DATA_USERNAME = 'brd-customer-hl_6bf0feca-zone-isp_proxy1';
const BRIGHT_DATA_PASSWORD = 'cuqn0fxdn8qf';

// Get proxy authentication with session ID for consistent IP assignment
const getProxyAuth = (accountId: string) => ({
  username: `${BRIGHT_DATA_USERNAME}-session-${accountId}`,  // Append session ID for sticky session
  password: BRIGHT_DATA_PASSWORD
});

class ProxyRotationService {
  private accountProxies: Map<string, ProxyConfig> = new Map();
  private lastRotation: Map<string, number> = new Map();
  private readonly ROTATION_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

  /**
   * Get or assign a proxy for a child account
   * @param accountId The child account ID
   * @param region Optional preferred region
   * @returns Proxy configuration to use
   */
  getProxy(accountId: string, region: 'north-america' | 'europe' = 'north-america'): ProxyConfig {
    const now = Date.now();
    const lastRotationTime = this.lastRotation.get(accountId) || 0;

    // Check if we need to rotate the proxy
    if (now - lastRotationTime >= this.ROTATION_INTERVAL) {
      const pool = proxyPools[region];
      const proxyIndex = this.getHashIndex(accountId + now.toString(), pool.length);
      this.accountProxies.set(accountId, pool[proxyIndex]);
      this.lastRotation.set(accountId, now);
    }

    return this.accountProxies.get(accountId)!;
  }

  /**
   * Get proxy configuration for API requests
   * @param accountId The child account ID
   * @returns Proxy configuration object
   */
  getProxyConfig(accountId: string): { host: string; port: number; auth: { username: string; password: string } } {
    const proxy = this.getProxy(accountId);
    return {
      host: proxy.host,
      port: proxy.port,
      auth: getProxyAuth(accountId)  // Pass accountId for session management
    };
  }

  private getHashIndex(str: string, max: number): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % max;
  }
}

// Export singleton instance
export const proxyRotationService = new ProxyRotationService();
