import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAutomationAccounts } from '../../hooks/useAutomationAccounts';
import { AIAutomationControl } from '../../components/AIAutomationControl/AIAutomationControl';
import { type ChildAccount } from '../../types/account';
import { childAccountService, type ProfileResponse } from '../../services/childAccount.service';
import { useAuth } from '../../hooks/useAuth';
import { type SocialPlatform } from '../../services/social-platforms.service';

export const AutomationPage: React.FC = () => {
  const { data: accounts, loading, error } = useAutomationAccounts();
  const { user } = useAuth();
  
  console.log('AutomationPage:', { accounts, user, loading, error });
  const [profiles, setProfiles] = useState<Map<string, ProfileResponse>>(new Map());
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Map<string, SocialPlatform>>(new Map());

  // Fetch profiles for all accounts
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!accounts || !user) {
        console.log('fetchProfiles: no accounts or user');
        return;
      }
      
      setLoadingProfiles(true);
      const newProfiles = new Map<string, ProfileResponse>();
      const newSelectedPlatforms = new Map<string, SocialPlatform>();
      
      try {
        for (const account of accounts) {
          // Get profile for first platform (we'll let user switch between platforms)
          if (account.platforms.length > 0 && account.automationConfig?.personality) {
            const firstPlatform = account.platforms[0] as SocialPlatform;
            
            // Use mock profile data in development
            let profile: ProfileResponse | null;
            if (process.env.NODE_ENV === 'development') {
              profile = {
                id: account.id,
                userId: user.id,
                platform: firstPlatform,
                motherAccountId: user.id,
                profile: {
                  personality: account.automationConfig.personality.style || '',
                  relationshipToMother: account.automationConfig.personality.relationship || '',
                  engagementStyle: 'neutral',
                  engagementRules: {
                    likeFrequency: 50,
                    commentFrequency: 30,
                    shareFrequency: 20
                  },
                  interests: account.automationConfig.personality.interests || [],
                  constraints: account.automationConfig.personality.constraints || []
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
            } else {
              profile = await childAccountService.getProfile(
                firstPlatform,
                user.id // motherAccountId
              );
            }

            if (profile) {
              newProfiles.set(account.id, profile);
              newSelectedPlatforms.set(account.id, firstPlatform);
            }
          }
        }
        
        setProfiles(newProfiles);
        setSelectedPlatforms(newSelectedPlatforms);
      } catch (error) {
        console.error('Failed to fetch profiles:', error);
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, [accounts, user]);

  if (loading || loadingProfiles) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AI Content Automation
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Configure automated content generation for your child accounts. Content will be generated based on each account's personality settings.
      </Typography>

      <Grid container spacing={3}>
        {accounts?.map((account: ChildAccount) => {
          const profile = profiles.get(account.id);
          const selectedPlatform = selectedPlatforms.get(account.id);
          if (!profile || !selectedPlatform) return null;

          return (
            <Grid item xs={12} key={account.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {account.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {account.role} • {account.platforms.join(', ')}
                  </Typography>

                  {account.platforms.length > 1 && (
                    <Tabs
                      value={selectedPlatform}
                      onChange={(_, newValue: SocialPlatform) => {
                        setSelectedPlatforms(prev => new Map(prev).set(account.id, newValue));
                      }}
                      sx={{ mb: 2 }}
                    >
                      {account.platforms.map(platform => (
                        <Tab
                          key={platform}
                          label={platform}
                          value={platform}
                        />
                      ))}
                    </Tabs>
                  )}
                  
                  <AIAutomationControl
                    childAccountId={account.id}
                    platform={selectedPlatform}
                    motherAccountId={user?.id || ''}
                    engagementStyle={profile.profile.engagementStyle}
                  />
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        {(!accounts || accounts.length === 0) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom align="center">
                  No Child Accounts Found
                </Typography>
                <Typography color="text.secondary" align="center" paragraph>
                  To get started with AI automation, you'll need to create child accounts for your social media platforms.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/accounts"
                  >
                    Create Child Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AutomationPage;
