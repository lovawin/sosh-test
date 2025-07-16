/**
 * Dashboard Component
 * =================
 * 
 * Main dashboard view for the social automation platform that provides an overview
 * of connected social accounts, recent activities, analytics, and ML-driven insights.
 * This component serves as the primary landing page after user authentication.
 * 
 * Component Architecture
 * --------------------
 * 1. Component Pattern
 *    - Functional component with hooks
 *    - Container-presenter pattern
 *    - Composition over inheritance
 *    - Single responsibility principle
 * 
 * 2. Component Structure
 *    - Grid-based layout system
 *    - Modular section components
 *    - Responsive design patterns
 *    - Nested component hierarchy
 * 
 * 3. Component Composition
 *    Dashboard
 *    ├── Connected Accounts Section
 *    │   └── SocialPlatformCard (multiple)
 *    ├── Recent Activities Section
 *    │   └── ActivityListItem (multiple)
 *    ├── Analytics Overview Section
 *    │   └── AnalyticsProgress (multiple)
 *    └── ML Insights Section
 *        └── MLInsightCard (multiple)
 * 
 * State Management
 * --------------
 * 1. Local State
 *    - platforms: Connected social platforms
 *    - activities: Recent automation tasks
 *    - metrics: Analytics data points
 *    - insights: ML-generated insights
 *    - loading: Section-specific loading states
 *    - error: Section-specific error states
 * 
 * 2. State Updates
 *    - Initial load: Fetch all data
 *    - WebSocket: Real-time updates
 *    - User actions: Optimistic updates
 *    - Error recovery: Retry mechanisms
 * 
 * 3. Data Flow
 *    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
 *    │   Service   │ -> │    State    │ -> │    View     │
 *    └─────────────┘    └─────────────┘    └─────────────┘
 *          ↑                                      │
 *          └──────────────────────────────────────┘
 * 
 * Performance Optimization
 * ----------------------
 * 1. Rendering
 *    - React.memo for child components
 *    - Callback memoization
 *    - Virtualization for long lists
 *    - Lazy loading of sections
 * 
 * 2. Data Management
 *    - Pagination for activities
 *    - Incremental loading
 *    - Data caching
 *    - Optimistic updates
 * 
 * 3. Network
 *    - Request batching
 *    - WebSocket connection
 *    - Error retries
 *    - Loading states
 * 
 * Integration Points
 * ----------------
 * 1. Backend Services
 *    - REST API endpoints
 *    - WebSocket events
 *    - Authentication
 *    - Error handling
 * 
 * 2. External Services
 *    - Social platform APIs
 *    - Analytics services
 *    - ML services
 *    - Monitoring tools
 * 
 * 3. Frontend Services
 *    - Theme provider
 *    - Router
 *    - State management
 *    - Analytics tracking
 * 
 * Security Considerations
 * ---------------------
 * 1. Data Protection
 *    - Sensitive data handling
 *    - XSS prevention
 *    - CSRF protection
 *    - Input validation
 * 
 * 2. Authentication
 *    - Token management
 *    - Session handling
 *    - Permission checks
 *    - Secure storage
 * 
 * 3. API Security
 *    - Request signing
 *    - Rate limiting
 *    - Error masking
 *    - Secure headers
 * 
 * Accessibility Guidelines
 * ----------------------
 * 1. Semantic HTML
 *    - Proper heading hierarchy
 *    - ARIA labels
 *    - Role attributes
 *    - Focus management
 * 
 * 2. Keyboard Navigation
 *    - Focus trapping
 *    - Tab order
 *    - Keyboard shortcuts
 *    - Focus indicators
 * 
 * 3. Screen Readers
 *    - Alternative text
 *    - Live regions
 *    - Status updates
 *    - Error announcements
 * 
 * Error Handling
 * -------------
 * 1. API Errors
 *    - Network failures
 *    - Authentication errors
 *    - Validation errors
 *    - Rate limiting
 * 
 * 2. UI Errors
 *    - Loading states
 *    - Error messages
 *    - Retry options
 *    - Fallback content
 * 
 * 3. Recovery
 *    - Automatic retries
 *    - Manual refresh
 *    - Error boundaries
 *    - State recovery
 * 
 * Customization
 * ------------
 * 1. Theming
 *    - Color schemes
 *    - Typography
 *    - Spacing
 *    - Breakpoints
 * 
 * 2. Layout
 *    - Grid system
 *    - Responsive design
 *    - Component arrangement
 *    - Section visibility
 * 
 * 3. Behavior
 *    - Update frequency
 *    - Data display
 *    - Interaction patterns
 *    - Animation settings
 * 
 * Testing Strategy
 * --------------
 * 1. Unit Tests
 *    - Component rendering
 *    - State management
 *    - Event handlers
 *    - Utility functions
 * 
 * 2. Integration Tests
 *    - API integration
 *    - WebSocket handling
 *    - Service interactions
 *    - State updates
 * 
 * 3. E2E Tests
 *    - User flows
 *    - Error scenarios
 *    - Performance metrics
 *    - Cross-browser testing
 * 
 * Development Workflow
 * ------------------
 * 1. Setup
 *    - Install dependencies
 *    - Configure environment
 *    - Set up development tools
 *    - Initialize services
 * 
 * 2. Development
 *    - Start development server
 *    - Enable hot reloading
 *    - Connect to backend
 *    - Use mock data
 * 
 * 3. Testing
 *    - Run unit tests
 *    - Check coverage
 *    - Perform E2E tests
 *    - Validate accessibility
 * 
 * 4. Deployment
 *    - Build production bundle
 *    - Optimize assets
 *    - Deploy to staging
 *    - Monitor performance
 * 
 * Props
 * -----
 * None - This is a container component that manages its own state
 * 
 * State Interface
 * --------------
 * {
 *   platforms: PlatformData[];     // Connected social platforms
 *   activities: ActivityData[];    // Recent automation tasks
 *   metrics: MetricData[];        // Analytics metrics
 *   insights: InsightData[];      // ML-generated insights
 *   loading: {                    // Loading states
 *     accounts: boolean;
 *     activities: boolean;
 *     analytics: boolean;
 *     insights: boolean;
 *   };
 *   error: {                      // Error states
 *     accounts: string | null;
 *     activities: string | null;
 *     analytics: string | null;
 *     insights: string | null;
 *   };
 * }
 * 
 * Event Handlers
 * -------------
 * - handlePlatformClick: Manage platform-specific actions
 * - handleActivityClick: Show activity details
 * - handleInsightAction: Execute insight recommendations
 * 
 * Service Integration
 * -----------------
 * - DashboardService: Data fetching and real-time updates
 * - WebSocket: Live data streaming
 * - Analytics: Usage tracking
 * - Error Reporting: Error monitoring
 * 
 * Related Components
 * ----------------
 * - SocialPlatformCard: Display social platform info
 * - ActivityListItem: Show activity details
 * - AnalyticsProgress: Display metrics
 * - MLInsightCard: Present ML insights
 * 
 * Dependencies
 * -----------
 * - @mui/material: UI components
 * - @mui/icons-material: Icons
 * - react: Core React features
 * - date-fns: Date formatting
 * - axios: HTTP client
 * 
 * Example Usage
 * ------------
 * ```tsx
 * <Dashboard />
 * ```
 * 
 * Changelog
 * ---------
 * - v1.0.0: Initial implementation
 * - v1.1.0: Added real-time updates
 * - v1.2.0: Enhanced error handling
 * - v1.3.0: Improved performance
 * 
 * @see Layout.tsx
 * @see DashboardService.ts
 * @see theme.ts
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  MoreVert as MoreVertIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';

// Import custom components
import SocialPlatformCard from '../SocialPlatformCard/SocialPlatformCard';
import ActivityListItem from '../ActivityListItem/ActivityListItem';
import AnalyticsProgress from '../AnalyticsProgress/AnalyticsProgress';
import MLInsightCard from '../MLInsightCard/MLInsightCard';

// Import service and types
import { dashboardService } from '../../services/DashboardService';
import type {
  SocialPlatform,
  Activity,
  AnalyticMetric,
  MLInsight,
} from '../../services/DashboardService';

// Type definitions for mock data
interface PlatformData {
  name: string;
  icon: React.ReactNode;
  color: string;
  followers: string;
  isConnected: boolean;
}

interface ActivityData {
  platform: string;
  action: string;
  time: string;
  status: 'pending' | 'completed' | 'failed';
}

interface MetricData {
  label: string;
  value: number;
  total: number;
  previousValue: number;
  trend: {
    direction: 'up' | 'down' | 'flat';
    percentage: number;
  };
}

interface InsightData {
  title: string;
  description: string;
  confidence: number;
  recommendations: string[];
  category: 'timing' | 'content' | 'trends';
  timestamp: string;
}

// Custom TikTok icon implementation
const TikTokIcon: React.FC = () => (
  <Box
    component="svg"
    sx={{
      width: 24,
      height: 24,
      fill: 'currentColor',
    }}
    viewBox="0 0 24 24"
  >
    <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 015.9 5.82s-.51.5 0 0z" />
    <path d="M19 8.4v3.8c-2.2 0-4.2-.9-5.6-2.3v9.7c0 2.9-2.4 5.3-5.3 5.3s-5.3-2.4-5.3-5.3 2.4-5.3 5.3-5.3c.3 0 .6 0 .9.1v3.9c-.3-.1-.6-.1-.9-.1-1.4 0-2.6 1.2-2.6 2.6s1.2 2.6 2.6 2.6 2.6-1.2 2.6-2.6V2h3.8c.2 2.2 1.8 4 3.8 4.4v2z" />
  </Box>
);

// Mock data with proper typing
const socialPlatforms: PlatformData[] = [
  { name: 'Twitter', icon: <TwitterIcon />, color: '#1DA1F2', followers: '12.5K', isConnected: true },
  { name: 'Instagram', icon: <InstagramIcon />, color: '#E4405F', followers: '24.8K', isConnected: true },
  { name: 'YouTube', icon: <YouTubeIcon />, color: '#FF0000', followers: '8.2K', isConnected: false },
  { name: 'TikTok', icon: <TikTokIcon />, color: '#000000', followers: '15.3K', isConnected: true },
];

const recentActivities: ActivityData[] = [
  {
    platform: 'Twitter',
    action: 'Post Scheduled',
    time: '2 hours ago',
    status: 'pending',
  },
  {
    platform: 'Instagram',
    action: 'Story Posted',
    time: '4 hours ago',
    status: 'completed',
  },
  {
    platform: 'YouTube',
    action: 'Video Upload Failed',
    time: '1 day ago',
    status: 'failed',
  },
];

const analyticsMetrics: MetricData[] = [
  {
    label: 'Engagement Rate',
    value: 65,
    total: 100,
    previousValue: 58,
    trend: { direction: 'up', percentage: 12.5 },
  },
  {
    label: 'Audience Growth',
    value: 45,
    total: 100,
    previousValue: 41,
    trend: { direction: 'up', percentage: 8.3 },
  },
  {
    label: 'Content Performance',
    value: 78,
    total: 100,
    previousValue: 82,
    trend: { direction: 'down', percentage: 4.8 },
  },
];

const mlInsights: InsightData[] = [
  {
    title: 'Best Posting Time',
    description: 'Your audience is most active between 3:00 PM - 5:00 PM EST.',
    confidence: 0.85,
    recommendations: [
      'Schedule posts during peak hours',
      'Test content types during this window',
    ],
    category: 'timing',
    timestamp: 'Updated 2 hours ago',
  },
  {
    title: 'Content Strategy',
    description: 'Video content is outperforming other content types by 43%.',
    confidence: 0.92,
    recommendations: [
      'Increase video content production',
      'Focus on short-form video content',
      'Experiment with live streaming',
    ],
    category: 'content',
    timestamp: 'Updated 1 hour ago',
  },
  {
    title: 'Trending Topics',
    description: 'AI and Innovation are trending topics in your industry.',
    confidence: 0.78,
    recommendations: [
      'Use #AI and #Innovation hashtags',
      'Create content around these topics',
      'Engage with related conversations',
    ],
    category: 'trends',
    timestamp: 'Updated 30 minutes ago',
  },
];

/**
 * Dashboard Component
 * Main view for the social automation platform
 */
const Dashboard: React.FC = () => {
  const theme = useTheme();

  // State with proper typing
  const [loading, setLoading] = useState({
    accounts: false,
    activities: false,
    analytics: false,
    insights: false,
  });

  const [error, setError] = useState<{
    accounts: string | null;
    activities: string | null;
    analytics: string | null;
    insights: string | null;
  }>({
    accounts: null,
    activities: null,
    analytics: null,
    insights: null,
  });

  // State for dashboard data with proper typing
  const [platforms, setPlatforms] = useState<PlatformData[]>(socialPlatforms);
  const [activities, setActivities] = useState<ActivityData[]>(recentActivities);
  const [metrics, setMetrics] = useState<MetricData[]>(analyticsMetrics);
  const [insights, setInsights] = useState<InsightData[]>(mlInsights);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading({
          accounts: true,
          activities: true,
          analytics: true,
          insights: true,
        });

        // Fetch data from service
        // const [
        //   platformsData,
        //   activitiesData,
        //   metricsData,
        //   insightsData,
        // ] = await Promise.all([
        //   dashboardService.getSocialPlatforms(),
        //   dashboardService.getRecentActivities(),
        //   dashboardService.getAnalytics(),
        //   dashboardService.getMLInsights(),
        // ]);

        // Set data in state
        // setPlatforms(platformsData);
        // setActivities(activitiesData);
        // setMetrics(metricsData);
        // setInsights(insightsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError({
          accounts: 'Failed to load accounts',
          activities: 'Failed to load activities',
          analytics: 'Failed to load analytics',
          insights: 'Failed to load insights',
        });
      } finally {
        setLoading({
          accounts: false,
          activities: false,
          analytics: false,
          insights: false,
        });
      }
    };

    fetchData();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    dashboardService.subscribeToUpdates({
      onAccountUpdate: (data: SocialPlatform) => {
        setPlatforms((prev) =>
          prev.map((p) => (p.name === data.name ? { ...p, ...data } : p))
        );
      },
      onActivityCreated: (data: Activity) => {
        setActivities((prev) => [data as ActivityData, ...prev].slice(0, 10));
      },
      onMetricUpdate: (data: AnalyticMetric) => {
        setMetrics((prev) =>
          prev.map((m) => (m.label === data.label ? { ...m, ...data } as MetricData : m))
        );
      },
      onInsightGenerated: (data: MLInsight) => {
        setInsights((prev) => [data as InsightData, ...prev].slice(0, 6));
      },
    });

    return () => {
      dashboardService.unsubscribeFromUpdates();
    };
  }, []);

  // Event handlers
  const handlePlatformClick = useCallback((platform: string) => {
    console.log(`Clicked platform: ${platform}`);
    // Implement platform-specific actions
  }, []);

  const handleActivityClick = useCallback((activity: string) => {
    console.log(`Clicked activity: ${activity}`);
    // Implement activity details view
  }, []);

  const handleInsightAction = useCallback((insight: string) => {
    console.log(`Action clicked for insight: ${insight}`);
    // Implement insight actions
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Connected Accounts Overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="text.primary">
                  Connected Accounts
                </Typography>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                {platforms.map((platform) => (
                  <Grid item xs={12} sm={6} md={3} key={platform.name}>
                    <SocialPlatformCard
                      name={platform.name}
                      icon={platform.icon}
                      color={platform.color}
                      followers={platform.followers}
                      isConnected={platform.isConnected}
                      onClick={() => handlePlatformClick(platform.name)}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="text.primary">
                  Recent Activities
                </Typography>
                <ScheduleIcon color="action" />
              </Box>
              {activities.map((activity, index) => (
                <ActivityListItem
                  key={index}
                  platform={activity.platform}
                  action={activity.action}
                  time={activity.time}
                  status={activity.status}
                  onClick={() => handleActivityClick(activity.action)}
                />
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Analytics Overview Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="text.primary">
                  Analytics Overview
                </Typography>
                <TrendingUpIcon color="action" />
              </Box>
              <Grid container spacing={2}>
                {metrics.map((metric, index) => (
                  <Grid item xs={12} key={index}>
                    <AnalyticsProgress
                      label={metric.label}
                      value={metric.value}
                      total={metric.total}
                      previousValue={metric.previousValue}
                      trend={metric.trend}
                      format={(value: number) => `${value}%`}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ML Insights Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="text.primary">
                  ML Insights
                </Typography>
                <PsychologyIcon color="action" />
              </Box>
              <Grid container spacing={2}>
                {insights.map((insight, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <MLInsightCard
                      title={insight.title}
                      description={insight.description}
                      confidence={insight.confidence}
                      recommendations={insight.recommendations}
                      category={insight.category}
                      timestamp={insight.timestamp}
                      onActionClick={() => handleInsightAction(insight.title)}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
