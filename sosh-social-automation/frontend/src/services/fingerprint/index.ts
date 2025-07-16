import { requestInterceptorService } from './requestInterceptor.service';

/**
 * Initialize device fingerprinting for social media requests
 * This is isolated from other application functionality
 */
export const initializeFingerprinting = (): void => {
  // Initialize request interceptor for device fingerprinting
  requestInterceptorService.initialize();
};
