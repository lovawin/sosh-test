import React, { useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../contexts/NotificationContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

export const ChildAccountCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshStatus } = useAuth();
  const { showNotification } = useNotification();

  const handleCallbackResult = useCallback(
    (platform: string | null, success: boolean, error?: string) => {
      // Send result to parent window if opened in popup
      if (window.opener) {
        window.opener.postMessage({
          type: 'child_oauth_callback',
          platform,
          success,
          ...(error && { error })
        }, window.location.origin);
        setTimeout(() => window.close(), 1000);
      } else {
        // Navigate back to accounts page if not in popup
        navigate('/accounts');
      }
    },
    [navigate]
  );

  useEffect(() => {
    const handleCallback = async () => {
      const platform = searchParams.get('platform');
      const error = searchParams.get('error');
      const code = searchParams.get('code');

      if (error) {
        showNotification(`Child account authentication failed: ${error}`, 'error');
        handleCallbackResult(platform, false, error);
        return;
      }

      if (!platform || !code) {
        showNotification('Invalid callback URL', 'error');
        handleCallbackResult(platform, false, 'Invalid callback URL');
        return;
      }

      try {
        // Exchange authorization code for access token
        const response = await axios.get(`${API_URL}/platforms/callback/${platform}`, {
          params: { code }
        });

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to complete child account authentication');
        }

        // Refresh platform statuses to reflect new child account connection
        await refreshStatus();
        showNotification(`Successfully connected child account to ${platform}`, 'success');
        handleCallbackResult(platform, true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Child account authentication failed';
        showNotification(`Failed to complete ${platform} child account authentication`, 'error');
        handleCallbackResult(platform, false, errorMessage);
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshStatus, showNotification, handleCallbackResult]);


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
      <Typography variant="h6">Completing child account authentication...</Typography>
    </Box>
  );
};

export default ChildAccountCallback;
