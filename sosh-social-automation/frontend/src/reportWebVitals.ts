/**
 * Web Vitals Reporting Utility
 * ===========================
 *
 * Comprehensive utility for measuring, analyzing, and reporting Core Web Vitals
 * and custom performance metrics. Provides detailed performance monitoring
 * capabilities for the application.
 *
 * Core Web Vitals
 * --------------
 * 1. LCP (Largest Contentful Paint)
 *    - Measures loading performance
 *    - Should occur within 2.5 seconds
 *    - Affected by server time, resource load time, rendering
 *
 * 2. FID (First Input Delay)
 *    - Measures interactivity
 *    - Should occur within 100 milliseconds
 *    - Affected by JavaScript execution time
 *
 * 3. CLS (Cumulative Layout Shift)
 *    - Measures visual stability
 *    - Should be less than 0.1
 *    - Affected by dynamic content, web fonts
 *
 * Additional Metrics
 * ----------------
 * 1. TTFB (Time to First Byte)
 *    - Initial server response time
 *    - Target: < 600ms
 *
 * 2. FCP (First Contentful Paint)
 *    - First content render time
 *    - Target: < 1.8s
 *
 * Custom Metrics
 * -------------
 * - Route change timing
 * - API response times
 * - Resource load timing
 * - Component render timing
 * - User interaction timing
 *
 * Metric Categories
 * ---------------
 * 1. Loading Performance
 *    - LCP, TTFB, FCP
 *    - Resource timing
 *    - API calls
 *
 * 2. Interactivity
 *    - FID
 *    - Time to Interactive
 *    - Long tasks
 *
 * 3. Visual Stability
 *    - CLS
 *    - Layout shifts
 *    - Animation frames
 *
 * Implementation Notes
 * ------------------
 * - Uses web-vitals library for core metrics
 * - Implements custom metric tracking
 * - Supports multiple reporting destinations
 * - Includes metric analysis utilities
 * - TypeScript implementation for type safety
 *
 * Reporting Options
 * ---------------
 * 1. Analytics Services
 *    - Google Analytics
 *    - Custom analytics
 *    - Performance monitoring services
 *
 * 2. Logging
 *    - Console logging
 *    - Remote logging
 *    - Error tracking
 *
 * 3. Custom Endpoints
 *    - API endpoints
 *    - Monitoring services
 *    - Data warehouses
 *
 * Usage Examples
 * -------------
 * ```typescript
 * // Basic console logging
 * reportWebVitals(console.log);
 *
 * // Send to analytics
 * reportWebVitals((metric) => {
 *   analytics.send({
 *     name: metric.name,
 *     value: metric.value,
 *     rating: getMetricRating(metric),
 *   });
 * });
 *
 * // Custom metric tracking
 * trackCustomMetric('api_response', 250);
 * ```
 *
 * Performance Budgets
 * -----------------
 * - LCP: 2.5s (Good), 4s (Needs Improvement)
 * - FID: 100ms (Good), 300ms (Needs Improvement)
 * - CLS: 0.1 (Good), 0.25 (Needs Improvement)
 * - TTFB: 600ms (Good), 1s (Needs Improvement)
 * - FCP: 1.8s (Good), 3s (Needs Improvement)
 */

import { ReportHandler, Metric } from 'web-vitals';

/**
 * Metric rating thresholds based on Core Web Vitals criteria
 */
const thresholds = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  TTFB: { good: 600, needsImprovement: 1000 },
  FCP: { good: 1800, needsImprovement: 3000 },
};

/**
 * Custom metric type for application-specific measurements
 */
interface CustomMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

/**
 * Rating type for metric evaluation
 */
type MetricRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Get rating for a given metric based on its value and type
 */
export const getMetricRating = (metric: Metric): MetricRating => {
  const threshold = thresholds[metric.name as keyof typeof thresholds];
  if (!threshold) return 'poor';

  if (metric.value <= threshold.good) return 'good';
  if (metric.value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
};

/**
 * Custom metric storage for application-specific measurements
 */
const customMetrics: CustomMetric[] = [];

/**
 * Track a custom performance metric
 */
export const trackCustomMetric = (
  name: string,
  value: number,
  tags?: Record<string, string>
) => {
  const metric: CustomMetric = {
    name,
    value,
    timestamp: Date.now(),
    tags,
  };
  customMetrics.push(metric);
  return metric;
};

/**
 * Get custom metrics for analysis
 */
export const getCustomMetrics = (
  name?: string,
  startTime?: number,
  endTime?: number
) => {
  return customMetrics.filter((metric) => {
    if (name && metric.name !== name) return false;
    if (startTime && metric.timestamp < startTime) return false;
    if (endTime && metric.timestamp > endTime) return false;
    return true;
  });
};

/**
 * Calculate statistics for a set of metrics
 */
export const calculateMetricStats = (metrics: number[]) => {
  const sorted = [...metrics].sort((a, b) => a - b);
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median: sorted[Math.floor(sorted.length / 2)],
    average: metrics.reduce((a, b) => a + b, 0) / metrics.length,
    p95: sorted[Math.floor(sorted.length * 0.95)],
  };
};

/**
 * Main web vitals reporting function
 */
const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
