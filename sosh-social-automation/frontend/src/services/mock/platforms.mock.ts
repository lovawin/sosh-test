import { type MotherAccount, type ChildAccount, type PlatformInfo } from '../social-platforms.service';

// Mock platform info
export const platformsMock: PlatformInfo[] = [
  {
    type: 'twitter',
    name: 'Twitter',
    icon: '/assets/icons/twitter.svg',
    isConnected: true,
  },
  {
    type: 'instagram',
    name: 'Instagram',
    icon: '/assets/icons/instagram.svg',
    isConnected: true,
  },
  {
    type: 'tiktok',
    name: 'TikTok',
    icon: '/assets/icons/tiktok.svg',
    isConnected: true,
  },
  {
    type: 'youtube',
    name: 'YouTube',
    icon: '/assets/icons/youtube.svg',
    isConnected: true,
  },
];

// Mock mother accounts
export const motherAccountsMock: Record<string, MotherAccount[]> = {
  twitter: [
    { id: 'tw-m1', username: 'techinfluencer', isAutomated: true },
    { id: 'tw-m2', username: 'digitaltrends', isAutomated: false },
  ],
  instagram: [
    { id: 'ig-m1', username: 'lifestyle_daily', isAutomated: true },
    { id: 'ig-m2', username: 'travel_pics', isAutomated: false },
  ],
  tiktok: [
    { id: 'tt-m1', username: 'dancechannel', isAutomated: false },
    { id: 'tt-m2', username: 'funnyvideos', isAutomated: false },
  ],
  youtube: [
    { id: 'yt-m1', username: 'techtutorials', isAutomated: true },
    { id: 'yt-m2', username: 'gamingchannel', isAutomated: false },
  ],
};

// Enhanced interfaces for child account personalities
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

export interface EnhancedChildAccount extends ChildAccount {
  personality: PersonalityTraits;
  interactionStyle: InteractionStyle;
  profileSettings: ProfileSettings;
}

// Mock child accounts with enhanced personality features
export const childAccountsMock: Record<string, EnhancedChildAccount[]> = {
  twitter: [
    {
      id: 'tw-c1',
      username: 'tech_enthusiast',
      dailyInteractions: 45,
      totalInteractions: 1250,
      connectedMotherAccounts: ['tw-m1'],
      personality: {
        openness: 8,
        conscientiousness: 7,
        extraversion: 6,
        agreeableness: 7,
        emotionality: 5
      },
      interactionStyle: {
        responseSpeed: 8,
        engagementType: 'proactive',
        tonePreference: 'professional',
        contentFocus: ['technology', 'innovation', 'startups']
      },
      profileSettings: {
        bio: "Tech enthusiast exploring the future of innovation. Always learning, always sharing.",
        interests: ['AI', 'blockchain', 'programming', 'tech news'],
        preferredPostTimes: ['9:00', '12:00', '17:00'],
        hashtagStyle: 'moderate',
        mediaPreference: 'mixed'
      }
    },
    {
      id: 'tw-c2',
      username: 'news_follower',
      dailyInteractions: 32,
      totalInteractions: 890,
      connectedMotherAccounts: ['tw-m1', 'tw-m2'],
      personality: {
        openness: 7,
        conscientiousness: 8,
        extraversion: 5,
        agreeableness: 6,
        emotionality: 4
      },
      interactionStyle: {
        responseSpeed: 7,
        engagementType: 'reactive',
        tonePreference: 'formal',
        contentFocus: ['news', 'politics', 'analysis']
      },
      profileSettings: {
        bio: "Following the latest developments in tech and society. Sharing insights and analysis.",
        interests: ['current events', 'technology', 'business'],
        preferredPostTimes: ['7:00', '13:00', '19:00'],
        hashtagStyle: 'minimal',
        mediaPreference: 'text'
      }
    }
  ],
  instagram: [
    {
      id: 'ig-c1',
      username: 'photo_lover',
      dailyInteractions: 65,
      totalInteractions: 2100,
      connectedMotherAccounts: ['ig-m1'],
      personality: {
        openness: 9,
        conscientiousness: 6,
        extraversion: 8,
        agreeableness: 8,
        emotionality: 7
      },
      interactionStyle: {
        responseSpeed: 9,
        engagementType: 'proactive',
        tonePreference: 'casual',
        contentFocus: ['photography', 'art', 'lifestyle']
      },
      profileSettings: {
        bio: "Capturing life's beautiful moments ✨ Photography enthusiast sharing daily inspiration",
        interests: ['photography', 'travel', 'art', 'fashion'],
        preferredPostTimes: ['8:00', '14:00', '20:00'],
        hashtagStyle: 'heavy',
        mediaPreference: 'images'
      }
    }
  ],
  tiktok: [
    {
      id: 'tt-c1',
      username: 'dance_fan',
      dailyInteractions: 85,
      totalInteractions: 3400,
      connectedMotherAccounts: ['tt-m1'],
      personality: {
        openness: 9,
        conscientiousness: 5,
        extraversion: 9,
        agreeableness: 8,
        emotionality: 8
      },
      interactionStyle: {
        responseSpeed: 9,
        engagementType: 'proactive',
        tonePreference: 'playful',
        contentFocus: ['dance', 'music', 'trends']
      },
      profileSettings: {
        bio: "Dancing through life 💃 Spreading joy one video at a time!",
        interests: ['dance', 'music', 'entertainment', 'trends'],
        preferredPostTimes: ['11:00', '15:00', '21:00'],
        hashtagStyle: 'heavy',
        mediaPreference: 'videos'
      }
    }
  ],
  youtube: [
    {
      id: 'yt-c1',
      username: 'tech_learner',
      dailyInteractions: 28,
      totalInteractions: 750,
      connectedMotherAccounts: ['yt-m1', 'yt-m2'],
      personality: {
        openness: 8,
        conscientiousness: 7,
        extraversion: 6,
        agreeableness: 7,
        emotionality: 5
      },
      interactionStyle: {
        responseSpeed: 6,
        engagementType: 'reactive',
        tonePreference: 'professional',
        contentFocus: ['tutorials', 'reviews', 'tech news']
      },
      profileSettings: {
        bio: "Exploring and sharing the latest in tech. Join me on this learning journey!",
        interests: ['technology', 'programming', 'gadgets', 'reviews'],
        preferredPostTimes: ['10:00', '16:00', '18:00'],
        hashtagStyle: 'moderate',
        mediaPreference: 'videos'
      }
    }
  ]
};
