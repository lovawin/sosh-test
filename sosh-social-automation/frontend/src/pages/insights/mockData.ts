import { type SocialPlatform } from '../../services/social-platforms.service';

export interface InsightData {
  title: string;
  value: string;
  change: number;
  category: 'timing' | 'growth' | 'trends' | 'reach';
}

// Mock data for insights
export const mockInsights: Record<SocialPlatform, InsightData[]> = {
  twitter: [
    {
      title: 'Best Time to Post',
      value: '2 PM - 4 PM',
      change: 15,
      category: 'timing'
    },
    {
      title: 'Audience Growth',
      value: '+250',
      change: 8,
      category: 'growth'
    },
    {
      title: 'Trending Topics',
      value: '#tech, #AI',
      change: 12,
      category: 'trends'
    },
    {
      title: 'Reach Potential',
      value: '45K',
      change: 5,
      category: 'reach'
    }
  ],
  instagram: [
    {
      title: 'Best Time to Post',
      value: '6 PM - 9 PM',
      change: 10,
      category: 'timing'
    },
    {
      title: 'Audience Growth',
      value: '+180',
      change: 15,
      category: 'growth'
    },
    {
      title: 'Trending Hashtags',
      value: '#lifestyle',
      change: 20,
      category: 'trends'
    },
    {
      title: 'Story Views',
      value: '12K',
      change: 18,
      category: 'reach'
    }
  ],
  tiktok: [
    {
      title: 'Peak Hours',
      value: '8 PM - 11 PM',
      change: 25,
      category: 'timing'
    },
    {
      title: 'New Followers',
      value: '+450',
      change: 30,
      category: 'growth'
    },
    {
      title: 'Viral Potential',
      value: 'High',
      change: 40,
      category: 'trends'
    },
    {
      title: 'FYP Appearances',
      value: '28K',
      change: 22,
      category: 'reach'
    }
  ],
  youtube: [
    {
      title: 'Upload Schedule',
      value: 'Wed, Sat',
      change: 5,
      category: 'timing'
    },
    {
      title: 'Subscriber Growth',
      value: '+120',
      change: 12,
      category: 'growth'
    },
    {
      title: 'Popular Topics',
      value: 'Tutorials',
      change: 8,
      category: 'trends'
    },
    {
      title: 'Avg. Watch Time',
      value: '6:30',
      change: 15,
      category: 'reach'
    }
  ]
};

// Helper function to get mock data for a specific platform
export const getMockInsights = (platform: SocialPlatform): InsightData[] => {
  return mockInsights[platform];
};
