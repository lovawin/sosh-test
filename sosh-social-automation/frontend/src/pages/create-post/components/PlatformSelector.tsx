import React from 'react';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Alert,
} from '@mui/material';
import { type PlatformInfo, type SocialPlatform } from '../../../services/social-platforms.service';

interface PlatformSelectorProps {
  selectedPlatforms: SocialPlatform[];
  onPlatformToggle: (platforms: SocialPlatform[]) => void;
  connectedPlatforms: PlatformInfo[];
  validationErrors?: Record<string, string>;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatforms,
  onPlatformToggle,
  connectedPlatforms,
  validationErrors,
}) => {
  const handleToggle = (
    event: React.MouseEvent<HTMLElement>,
    newPlatforms: SocialPlatform[]
  ) => {
    onPlatformToggle(newPlatforms);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Select Platforms
      </Typography>
      {validationErrors?.platforms && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationErrors.platforms}
        </Alert>
      )}
      <ToggleButtonGroup
        value={selectedPlatforms}
        onChange={handleToggle}
        aria-label="platform selection"
      >
        {connectedPlatforms.map((platform) => (
          <ToggleButton
            key={platform.type}
            value={platform.type}
            aria-label={platform.name}
            sx={{
              px: 3,
              py: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <img
              src={platform.icon}
              alt={platform.name}
              style={{ width: 24, height: 24 }}
            />
            <Typography variant="body2">{platform.name}</Typography>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default PlatformSelector;
