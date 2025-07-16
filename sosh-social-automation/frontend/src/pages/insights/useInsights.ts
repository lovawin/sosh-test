import { useState, useEffect } from 'react';
import { type SocialPlatform } from '../../services/social-platforms.service';
import { getInsightsData, type InsightData } from './insightsDataProvider';

/**
 * Hook for managing insights data state
 * Uses insightsDataProvider to fetch data from configured source (mock or API)
 */
export const useInsights = (platform: SocialPlatform) => {
  const [data, setData] = useState<InsightData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const insights = await getInsightsData(platform);
        
        if (isMounted) {
          setData(insights);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch insights'));
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [platform]);

  return { data, loading, error };
};
