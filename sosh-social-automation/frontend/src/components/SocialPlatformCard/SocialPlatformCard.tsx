import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Button,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Settings as SettingsIcon,
  LinkOff as LinkOffIcon,
} from '@mui/icons-material';

interface SocialPlatformCardProps {
  name: string;
  icon: React.ReactNode;
  color: string;
  followers: string;
  isConnected: boolean;
  onClick?: () => void;
  onDisconnect?: () => void;
}

/**
 * SocialPlatformCard Component
 * ===========================
 * 
 * Displays information about a connected social media platform including
 * its icon, connection status, and follower count.
 * 
 * Props
 * -----
 * - name: Platform name (e.g., "Twitter", "Instagram")
 * - icon: Platform icon component
 * - color: Brand color for the platform
 * - followers: Number of followers (formatted string)
 * - isConnected: Connection status
 * - onClick: Optional click handler
 * - onDisconnect: Optional handler for disconnecting the platform
 * 
 * Example
 * -------
 * ```tsx
 * <SocialPlatformCard
 *   name="Twitter"
 *   icon={<TwitterIcon />}
 *   color="#1DA1F2"
 *   followers="12.5K"
 *   isConnected={true}
 *   onClick={() => handlePlatformClick('twitter')}
 *   onDisconnect={() => handleDisconnect('twitter')}
 * />
 * ```
 */
const SocialPlatformCard: React.FC<SocialPlatformCardProps> = ({
  name,
  icon,
  color,
  followers,
  isConnected,
  onClick,
  onDisconnect,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        } : {},
      }}
                onClick={(e: React.MouseEvent) => {
        // Only trigger onClick if not clicking the disconnect button
        if (!e.defaultPrevented && onClick) {
          onClick();
        }
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {/* Platform Icon */}
          <Box
            sx={{
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: `${color}15`,
              mb: 1,
            }}
          >
            {icon}
          </Box>

          {/* Platform Name */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.text.primary,
            }}
          >
            {name}
          </Typography>

          {/* Followers Count */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            {followers} followers
          </Typography>

          {/* Connection Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isConnected ? (
              <Tooltip title="Connected">
                <CheckCircleIcon
                  sx={{
                    color: theme.palette.success.main,
                    fontSize: 20,
                  }}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Not Connected">
                <CancelIcon
                  sx={{
                    color: theme.palette.error.main,
                    fontSize: 20,
                  }}
                />
              </Tooltip>
            )}
            <Typography
              variant="body2"
              color={isConnected ? 'success.main' : 'error.main'}
            >
              {isConnected ? 'Connected' : 'Not Connected'}
            </Typography>
          </Box>

          {/* Platform Actions */}
          <Box 
            sx={{ 
              mt: 'auto', 
              pt: 1,
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              gap: 1
            }}
          >
            {isConnected ? (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<LinkOffIcon />}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onDisconnect) {
                    if (window.confirm(`Are you sure you want to disconnect ${name}?`)) {
                      onDisconnect();
                    }
                  }
                }}
                sx={{
                  minWidth: 140,
                  textTransform: 'none'
                }}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<SettingsIcon />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onClick) {
                    onClick();
                  }
                }}
                sx={{
                  minWidth: 140,
                  textTransform: 'none'
                }}
              >
                Connect
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SocialPlatformCard;
