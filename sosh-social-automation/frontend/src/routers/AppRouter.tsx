import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  PostAdd as PostAddIcon,
  Analytics as AnalyticsIcon,
  Insights as InsightsIcon,
  AccountCircle as AccountCircleIcon,
  AutoFixHigh as AutomationIcon,
} from '@mui/icons-material';
import CreatePostPage from '../pages/create-post/CreatePostPage';
import AnalyticsPage from '../pages/analytics/AnalyticsPage';
import InsightsPage from '../pages/insights/InsightsPage';
import { AccountsPage } from '../pages/accounts/AccountsPage';
import { AutomationPage } from '../pages/automation/AutomationPage';
import AuthCallback from '../pages/auth/AuthCallback';
import { ChildAccountCallback } from '../pages/auth/ChildAccountCallback';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../hooks/useAuth';

interface NavigationItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

export const navigationConfig: NavigationItem[] = [
  {
    path: '/create',
    name: 'Create Post',
    icon: <PostAddIcon />,
  },
  {
    path: '/analytics',
    name: 'Analytics',
    icon: <AnalyticsIcon />,
  },
  {
    path: '/insights',
    name: 'Insights',
    icon: <InsightsIcon />,
  },
  {
    path: '/accounts',
    name: 'Accounts',
    icon: <AccountCircleIcon />,
  },
  {
    path: '/automation',
    name: 'AI Automation',
    icon: <AutomationIcon />,
  },
];

interface PrivateRouteProps {
  element: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{element}</Layout>;
};

const PublicRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { user, loading } = useAuth();
  
  // Only redirect if we have a confirmed authenticated user
  if (!loading && user) {
    return <Navigate to="/accounts" replace />;
  }

  // Show the public route during loading or when no user is authenticated
  return element;
};

// Temporary development route component that bypasses auth
const DevRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  return <Layout>{element}</Layout>;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/child-callback" element={<ChildAccountCallback />} />
      <Route path="/login" element={<PublicRoute element={<LoginPage />} />} />
      <Route path="/register" element={<PublicRoute element={<RegisterPage />} />} />

      {/* Protected Routes */}
      <Route path="/" element={<PrivateRoute element={<CreatePostPage />} />} />
      <Route path="/create" element={<PrivateRoute element={<CreatePostPage />} />} />
      <Route path="/analytics" element={<PrivateRoute element={<AnalyticsPage />} />} />
      <Route path="/insights" element={<PrivateRoute element={<InsightsPage />} />} />
      <Route path="/accounts" element={<PrivateRoute element={<AccountsPage />} />} />
      <Route path="/automation" element={<PrivateRoute element={<AutomationPage />} />} />

      {/* Temporary development routes for testing */}
      <Route path="/dev/accounts" element={<DevRoute element={<AccountsPage />} />} />
      <Route path="/dev/create" element={<DevRoute element={<CreatePostPage />} />} />
      <Route path="/dev/analytics" element={<DevRoute element={<AnalyticsPage />} />} />
      <Route path="/dev/insights" element={<DevRoute element={<InsightsPage />} />} />
      <Route path="/dev/automation" element={<DevRoute element={<AutomationPage />} />} />

      {/* Catch-all redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
