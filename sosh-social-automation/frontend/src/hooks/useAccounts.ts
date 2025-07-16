import { useState, useEffect, useCallback } from 'react';
import { 
  socialPlatformsService, 
  type SocialPlatform,
  type MotherAccount,
  type ChildAccount,
} from '../services/social-platforms.service';
import { useNotification } from '../contexts/NotificationContext';

interface UseAccountsReturn {
  motherAccounts: Record<SocialPlatform, MotherAccount[]>;
  childAccounts: Record<SocialPlatform, ChildAccount[]>;
  loading: boolean;
  error: Error | null;
  addMotherAccount: (platform: SocialPlatform, username: string) => Promise<void>;
  enableMotherAccountAutomation: (platform: SocialPlatform, accountId: string) => Promise<void>;
  removeMotherAccount: (platform: SocialPlatform, accountId: string) => Promise<void>;
  addChildAccount: (platform: SocialPlatform) => Promise<void>;
  updateChildMotherConnections: (
    platform: SocialPlatform,
    childAccountId: string,
    motherAccountIds: string[]
  ) => Promise<void>;
  refreshAccounts: () => Promise<void>;
}

export const useAccounts = (): UseAccountsReturn => {
  const { showNotification } = useNotification();
  const [motherAccounts, setMotherAccounts] = useState<Record<SocialPlatform, MotherAccount[]>>({
    twitter: [],
    instagram: [],
    youtube: [],
    tiktok: [],
  });
  const [childAccounts, setChildAccounts] = useState<Record<SocialPlatform, ChildAccount[]>>({
    twitter: [],
    instagram: [],
    youtube: [],
    tiktok: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const platforms: SocialPlatform[] = ['twitter', 'instagram', 'tiktok', 'youtube'];
      const mothers: Record<SocialPlatform, MotherAccount[]> = {
        twitter: [],
        instagram: [],
        youtube: [],
        tiktok: [],
      };
      const children: Record<SocialPlatform, ChildAccount[]> = {
        twitter: [],
        instagram: [],
        youtube: [],
        tiktok: [],
      };

      await Promise.all(
        platforms.map(async (platform) => {
          const [motherList, childList] = await Promise.all([
            socialPlatformsService.getMotherAccounts(platform),
            socialPlatformsService.getChildAccounts(platform),
          ]);
          mothers[platform] = motherList;
          children[platform] = childList;
        })
      );

      setMotherAccounts(mothers);
      setChildAccounts(children);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load accounts'));
      showNotification('Failed to load accounts', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  const addMotherAccount = async (platform: SocialPlatform, username: string) => {
    try {
      await socialPlatformsService.addMotherAccount(platform, username);
      showNotification('Mother account added successfully', 'success');
      await refreshAccounts();
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : 'Failed to add mother account',
        'error'
      );
      throw err;
    }
  };

  const enableMotherAccountAutomation = async (platform: SocialPlatform, accountId: string) => {
    try {
      const { authUrl } = await socialPlatformsService.enableMotherAccountAutomation(platform, accountId);
      window.location.href = authUrl;
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : 'Failed to enable automation',
        'error'
      );
      throw err;
    }
  };

  const removeMotherAccount = async (platform: SocialPlatform, accountId: string) => {
    try {
      await socialPlatformsService.removeMotherAccount(platform, accountId);
      showNotification('Mother account removed successfully', 'success');
      await refreshAccounts();
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : 'Failed to remove mother account',
        'error'
      );
      throw err;
    }
  };

  const addChildAccount = async (platform: SocialPlatform) => {
    try {
      const { authUrl } = await socialPlatformsService.addChildAccount(platform);
      
      // Open OAuth flow in a popup window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        authUrl,
        'Add Child Account',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (popup) {
        // Listen for the OAuth callback message
        const messageHandler = async (event: MessageEvent) => {
          if (
            event.origin === window.location.origin &&
            event.data?.type === 'child_oauth_callback' &&
            event.data?.platform === platform
          ) {
            window.removeEventListener('message', messageHandler);
            
            if (event.data.success) {
              showNotification('Child account added successfully', 'success');
              await refreshAccounts();
            } else {
              showNotification(
                event.data.error || 'Failed to add child account',
                'error'
              );
            }
          }
        };

        window.addEventListener('message', messageHandler);
      } else {
        throw new Error('Failed to open authentication window. Please allow popups for this site.');
      }
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : 'Failed to add child account',
        'error'
      );
      throw err;
    }
  };

  const updateChildMotherConnections = async (
    platform: SocialPlatform,
    childAccountId: string,
    motherAccountIds: string[]
  ) => {
    try {
      await socialPlatformsService.updateChildAccountMotherConnections(
        platform,
        childAccountId,
        motherAccountIds
      );
      showNotification('Mother connections updated successfully', 'success');
      await refreshAccounts();
    } catch (err) {
      showNotification(
        err instanceof Error ? err.message : 'Failed to update mother connections',
        'error'
      );
      throw err;
    }
  };

  return {
    motherAccounts,
    childAccounts,
    loading,
    error,
    addMotherAccount,
    enableMotherAccountAutomation,
    removeMotherAccount,
    addChildAccount,
    updateChildMotherConnections,
    refreshAccounts,
  };
};

export default useAccounts;
