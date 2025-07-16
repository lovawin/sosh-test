import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
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
import { type SocialPlatform } from '../../services/social-platforms.service';
import { useInsights } from './useInsights';
import { type InsightData } from './insights.mock';
import { USE_INSIGHTS_MOCK } from './config';

interface PlatformConfig {
  name: string;
  icon: React.ReactNode;
  color: string;
}

const platformConfigs: Record<SocialPlatform, PlatformConfig> = {
  twitter: {
    name: 'Twitter',
    icon: <TwitterIcon />,
    color: '#1DA1F2',
  },
  instagram: {
    name: 'Instagram',
    icon: <InstagramIcon />,
    color: '#E1306C',
  },
  tiktok: {
    name: 'TikTok',
    icon: <TikTokIcon />,
    color: '#000000',
  },
  youtube: {
    name: 'YouTube',
    icon: <YouTubeIcon />,
    color: '#FF0000',
  },
};

const getIconAndColor = (category: InsightData['category']) => {
  switch (category) {
    case 'timing':
      return { icon: <Schedule />, color: '#2196F3' };
    case 'growth':
      return { icon: <Group />, color: '#4CAF50' };
    case 'trends':
      return { icon: <TrendingUp />, color: '#FF9800' };
    case 'reach':
      return { icon: <Visibility />, color: '#9C27B0' };
  }
};

export const InsightsPage: React.FC = () => {
  // When using mock data, treat all platforms as connected
  const connectedPlatforms = USE_INSIGHTS_MOCK
    ? Object.keys(platformConfigs) as SocialPlatform[]
    : [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Platform Insights
      </Typography>
      <Grid container spacing={3}>
        {connectedPlatforms.map((platform) => {
          const config = platformConfigs[platform];

          // Get insights data for this platform
          const { data: insights, loading, error } = useInsights(platform);

          return (
            <Grid item xs={12} key={platform}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: config.color,
                      mr: 2,
                    }}
                  >
                    {config.icon}
                  </Box>
                  <Typography variant="h6">{config.name}</Typography>
                </Box>
                <Grid container spacing={3}>
                  {/* Show loading state */}
                  {loading && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                      </Box>
                    </Grid>
                  )}

                  {/* Show error state */}
                  {error && (
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, color: 'error.main' }}>
                        Failed to load insights data
                      </Box>
                    </Grid>
                  )}

                  {/* Show insights when data is available */}
                  {insights && insights.map((insight, index) => {
                    const { icon, color } = getIconAndColor(insight.category);
                    return (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: 'background.default',
                            height: '100%',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mb: 2,
                            }}
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: `${color}20`,
                                color: color,
                                mr: 2,
                              }}
                            >
                              {icon}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {insight.title}
                            </Typography>
                          </Box>
                          <Typography variant="h6" gutterBottom>
                            {insight.value}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                              variant="body2"
                              color={insight.change > 0 ? 'success.main' : 'error.main'}
                              sx={{ mr: 1 }}
                            >
                              {insight.change > 0 ? '+' : ''}
                              {insight.change}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={Math.abs(insight.change)}
                              color={insight.change > 0 ? 'success' : 'error'}
                              sx={{ flexGrow: 1, height: 4, borderRadius: 2 }}
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default InsightsPage;
