import { type SocialPlatform } from '../../services/social-platforms.service';
import { type ReactNode } from 'react';

export interface Insight {
  title: string;
  value: string;
  change: number;
  icon: ReactNode;
  color: string;
}

export interface PlatformConfig {
  name: string;
  icon: ReactNode;
  color: string;
  insights: Insight[];
}

export type PlatformInsights = Record<SocialPlatform, PlatformConfig>;
