import React from 'react';
import {
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  TrendingUp,
  Schedule,
  Group,
  Visibility,
} from '@mui/icons-material';
import { TikTokIcon } from '../../components/icons/TikTokIcon';
import { type PlatformInsights } from './types';

// Keep the exact same mock data structure and values
export const mockPlatformInsights: PlatformInsights = {
  twitter: {
    name: 'Twitter',
    icon: React.createElement(TwitterIcon),
    color: '#1DA1F2',
    insights: [
      {
        title: 'Best Time to Post',
        value: '2 PM - 4 PM',
        change: 15,
        icon: React.createElement(Schedule),
        color: '#2196F3',
      },
      {
        title: 'Audience Growth',
        value: '+250',
        change: 8,
        icon: React.createElement(Group),
        color: '#4CAF50',
      },
      {
        title: 'Trending Topics',
        value: '#tech, #AI',
        change: 12,
        icon: React.createElement(TrendingUp),
        color: '#FF9800',
      },
      {
        title: 'Reach Potential',
        value: '45K',
        change: 5,
        icon: React.createElement(Visibility),
        color: '#9C27B0',
      },
    ],
  },
  instagram: {
    name: 'Instagram',
    icon: React.createElement(InstagramIcon),
    color: '#E1306C',
    insights: [
      {
        title: 'Best Time to Post',
        value: '6 PM - 9 PM',
        change: 10,
        icon: React.createElement(Schedule),
        color: '#2196F3',
      },
      {
        title: 'Audience Growth',
        value: '+180',
        change: 15,
        icon: React.createElement(Group),
        color: '#4CAF50',
      },
      {
        title: 'Trending Hashtags',
        value: '#lifestyle',
        change: 20,
        icon: React.createElement(TrendingUp),
        color: '#FF9800',
      },
      {
        title: 'Story Views',
        value: '12K',
        change: 18,
        icon: React.createElement(Visibility),
        color: '#9C27B0',
      },
    ],
  },
  tiktok: {
    name: 'TikTok',
    icon: React.createElement(TikTokIcon),
    color: '#000000',
    insights: [
      {
        title: 'Peak Hours',
        value: '8 PM - 11 PM',
        change: 25,
        icon: React.createElement(Schedule),
        color: '#2196F3',
      },
      {
        title: 'New Followers',
        value: '+450',
        change: 30,
        icon: React.createElement(Group),
        color: '#4CAF50',
      },
      {
        title: 'Viral Potential',
        value: 'High',
        change: 40,
        icon: React.createElement(TrendingUp),
        color: '#FF9800',
      },
      {
        title: 'FYP Appearances',
        value: '28K',
        change: 22,
        icon: React.createElement(Visibility),
        color: '#9C27B0',
      },
    ],
  },
  youtube: {
    name: 'YouTube',
    icon: React.createElement(YouTubeIcon),
    color: '#FF0000',
    insights: [
      {
        title: 'Upload Schedule',
        value: 'Wed, Sat',
        change: 5,
        icon: React.createElement(Schedule),
        color: '#2196F3',
      },
      {
        title: 'Subscriber Growth',
        value: '+120',
        change: 12,
        icon: React.createElement(Group),
        color: '#4CAF50',
      },
      {
        title: 'Popular Topics',
        value: 'Tutorials',
        change: 8,
        icon: React.createElement(TrendingUp),
        color: '#FF9800',
      },
      {
        title: 'Avg. Watch Time',
        value: '6:30',
        change: 15,
        icon: React.createElement(Visibility),
        color: '#9C27B0',
      },
    ],
  },
};
