import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshStatus } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    const handleCallback = async () => {
      const platform = searchParams.get('platform');
      const error = searchParams.get('error');
      const code = searchParams.get('code');

      if (error) {
        showNotification(`Authentication failed: ${error}`, 'error');
        
        // Send error message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth_callback',
            platform,
            success: false,
            error
          }, window.location.origin);
          setTimeout(() => window.close(), 1000);
        }
        return;
      }

      if (!platform || !code) {
        showNotification('Invalid callback URL', 'error');
        
        // Send error message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth_callback',
            platform,
            success: false,
            error: 'Invalid callback URL'
          }, window.location.origin);
          setTimeout(() => window.close(), 1000);
        } else {
          navigate('/accounts');
        }
        return;
      }

      try {
        // Refresh platform statuses to reflect new connection
        await refreshStatus();
        showNotification(`Successfully connected to ${platform}`, 'success');

        // Send success message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth_callback',
            platform,
            success: true
          }, window.location.origin);
          setTimeout(() => window.close(), 1000);
        } else {
          navigate('/accounts');
        }
      } catch (err) {
        showNotification(
          `Failed to complete ${platform} authentication`,
          'error'
        );

        // Send error message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth_callback',
            platform,
            success: false,
            error: err instanceof Error ? err.message : 'Authentication failed'
          }, window.location.origin);
          setTimeout(() => window.close(), 1000);
        } else {
          navigate('/accounts');
        }
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshStatus, showNotification]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="h6">Completing authentication...</Typography>
    </Box>
  );
};

export default AuthCallback;
