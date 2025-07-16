import { useState, useEffect } from 'react';
import { type SocialPlatform } from '../../services/social-platforms.service';
import { getInsightsData, type InsightData } from './insightsDataProvider';

export const useInsightsData = (platform: SocialPlatform) => {
  const [data, setData] = useState<InsightData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const insights = await getInsightsData(platform);
        setData(insights);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch insights'));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [platform]);

  return { data, loading, error };
};
