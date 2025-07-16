import { type SocialPlatform } from '../services/social-platforms.service';
import { type AutomationConfig } from '../services/ai-content/types';

export interface ChildAccount {
  id: string;
  name: string;
  role: string;
  platforms: SocialPlatform[];
  automationConfig?: AutomationConfig;
}

export interface UseAccountsReturn {
  data: ChildAccount[];
  loading: boolean;
  error: string | null;
}
