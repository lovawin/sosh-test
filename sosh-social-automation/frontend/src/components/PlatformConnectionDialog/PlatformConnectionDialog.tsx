import React, { useState, useCallback, useEffect } from 'react';
import { socialPlatformsService } from '../../services/social-platforms.service';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import { darken, lighten } from '@mui/system';
import {
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

// Custom TikTok icon component
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

// Platform configuration
const platformConfig = {
  twitter: {
    name: 'Twitter',
    icon: <TwitterIcon />,
    color: '#1DA1F2',
    steps: ['Authorize', 'Verify', 'Connect'],
    scopes: ['tweet.read', 'tweet.write', 'users.read'],
  },
  instagram: {
    name: 'Instagram',
    icon: <InstagramIcon />,
    color: '#E4405F',
    steps: ['Login', 'Authorize', 'Connect'],
    scopes: ['basic', 'comments', 'relationships'],
  },
  youtube: {
    name: 'YouTube',
    icon: <YouTubeIcon />,
    color: '#FF0000',
    steps: ['Sign In', 'Choose Account', 'Authorize'],
    scopes: ['youtube.readonly', 'youtube.upload'],
  },
  tiktok: {
    name: 'TikTok',
    icon: <TikTokIcon />,
    color: '#000000',
    steps: ['Authorize', 'Verify', 'Connect'],
    scopes: ['user.info.basic', 'video.list'],
  },
};

export type PlatformType = keyof typeof platformConfig;

interface ConnectionState {
  currentStep: number;
  error: string | null;
  isLoading: boolean;
}

interface PlatformConnectionDialogProps {
  /**
   * The platform to connect (twitter, instagram, youtube, tiktok)
   */
  platform: PlatformType;
  
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Callback when the dialog should be closed
   */
  onClose: () => void;
  
  /**
   * Callback when the connection is successful
   * @param platform The platform that was connected
   * @param data Platform-specific connection data
   */
  onSuccess?: (platform: PlatformType, data: any) => void;
  
  /**
   * Callback when the connection fails
   * @param platform The platform that failed to connect
   * @param error The error message
   */
  onError?: (platform: PlatformType, error: string) => void;
}

/**
 * PlatformConnectionDialog Component
 * =================================
 * 
 * A dialog component that handles the connection flow for different social media platforms.
 * Supports OAuth-based authentication flows and provides step-by-step guidance through
 * the connection process.
 */
const PlatformConnectionDialog: React.FC<PlatformConnectionDialogProps> = ({
  platform,
  open,
  onClose,
  onSuccess,
  onError,
}) => {
  const theme = useTheme();
  const config = platformConfig[platform];
  
  // Connection state
  const [state, setState] = useState<ConnectionState>({
    currentStep: 0,
    error: null,
    isLoading: false,
  });

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setState({
        currentStep: 0,
        error: null,
        isLoading: false,
      });
    }
  }, [open]);

  // Handle OAuth window messaging
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'OAUTH_SUCCESS') {
        handleConnectionSuccess(event.data.platform, event.data.data);
      } else if (event.data?.type === 'OAUTH_ERROR') {
        handleConnectionError(event.data.platform, event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handle starting the connection process
  const handleConnect = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get OAuth URL from the backend
      const { authUrl } = await socialPlatformsService.connectPlatform(platform);

      // Open OAuth popup window
      const width = 600;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        authUrl,
        `Connect ${config.name}`,
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Check if popup was blocked
      if (!popup) {
        throw new Error('Popup blocked. Please allow popups and try again.');
      }

      // Move to next step
      setState(prev => ({
        ...prev,
        currentStep: prev.currentStep + 1,
        isLoading: false,
      }));
    } catch (error) {
      handleConnectionError(platform, error instanceof Error ? error.message : 'Connection failed');
    }
  }, [platform, config.name]);

  // Handle successful connection
  const handleConnectionSuccess = useCallback(async (connectedPlatform: PlatformType, data: any) => {
    if (connectedPlatform === platform) {
      try {
        // Sync platform data after successful connection
        await socialPlatformsService.syncPlatform(platform);
        
        setState(prev => ({
          ...prev,
          currentStep: config.steps.length - 1,
          isLoading: false,
          error: null,
        }));
        
        onSuccess?.(platform, data);
      } catch (error) {
        handleConnectionError(platform, 'Failed to sync platform data');
      }
    }
  }, [platform, config.steps.length, onSuccess]);

  // Handle connection error
  const handleConnectionError = useCallback((errorPlatform: PlatformType, error: string) => {
    if (errorPlatform === platform) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error,
      }));
      onError?.(platform, error);
    }
  }, [platform, onError]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderTop: 4,
          borderColor: config.color,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {config.icon}
          <Typography variant="h6">
            Connect {config.name}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Progress Stepper */}
        <Stepper
          activeStep={state.currentStep}
          sx={{ mb: 4 }}
        >
          {config.steps.map((label, index) => (
            <Step key={label} completed={index < state.currentStep}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Status Content */}
        <Box sx={{ textAlign: 'center', py: 2 }}>
          {state.error ? (
            // Error State
            <Alert
              severity="error"
              icon={<ErrorIcon />}
              sx={{ mb: 2 }}
            >
              {state.error}
            </Alert>
          ) : state.currentStep === config.steps.length - 1 ? (
            // Success State
            <Box>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: theme.palette.success.main,
                  color: theme.palette.success.contrastText,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 2,
                }}
              >
                <CheckIcon />
              </Box>
              <Typography variant="h6" gutterBottom>
                Successfully Connected!
              </Typography>
              <Typography color="text.secondary">
                You can now post and manage content on {config.name}
              </Typography>
            </Box>
          ) : (
            // Connection State
            <Box>
              <Typography variant="body1" gutterBottom>
                {state.currentStep === 0 ? (
                  `Connect your ${config.name} account to start posting and managing content`
                ) : (
                  `Completing ${config.steps[state.currentStep].toLowerCase()}...`
                )}
              </Typography>
              {state.isLoading && (
                <CircularProgress sx={{ mt: 2 }} />
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {state.currentStep === config.steps.length - 1 ? 'Done' : 'Cancel'}
        </Button>
        {state.currentStep === 0 && (
          <Button
            variant="contained"
            onClick={handleConnect}
            disabled={state.isLoading}
            sx={{
              bgcolor: config.color,
              '&:hover': {
                bgcolor: theme.palette.mode === 'light'
                  ? darken(config.color, 0.1)
                  : lighten(config.color, 0.1),
              },
            }}
          >
            Connect
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PlatformConnectionDialog;
