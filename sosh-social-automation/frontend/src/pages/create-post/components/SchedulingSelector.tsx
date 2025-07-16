/**
 * SchedulingSelector Component
 * ===========================
 * 
 * Manages post scheduling functionality, including:
 * - Date/time selection
 * - Timezone handling
 * - Best time recommendations
 * - Schedule validation
 * 
 * @author Your Name
 * @version 1.0.0
 */

import React from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  TextField,
  Alert,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import { Schedule as ScheduleIcon } from '@mui/icons-material';
import { PostTimingRecommendation } from '../../../services/insights.service';

interface SchedulingSelectorProps {
  scheduling: boolean;
  scheduledTime: string;
  onSchedulingChange: (enabled: boolean) => void;
  onTimeChange: (time: string) => void;
  recommendations?: PostTimingRecommendation[];
  selectedPlatforms: string[];
}

export const SchedulingSelector: React.FC<SchedulingSelectorProps> = ({
  scheduling,
  scheduledTime,
  onSchedulingChange,
  onTimeChange,
  recommendations = [],
  selectedPlatforms,
}) => {
  // Get minimum allowed date/time (now + 5 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  };

  // Format day of week
  const formatDayOfWeek = (day: number): string => {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
  };

  // Check if a recommendation is for selected platforms
  const isRecommendationRelevant = (recommendation: PostTimingRecommendation): boolean => {
    return selectedPlatforms.length > 0 && recommendation.confidence > 0.7;
  };

  // Handle recommendation click
  const handleRecommendationClick = (recommendation: PostTimingRecommendation) => {
    const [hour, minute] = recommendation.timeRange.split(':');
    const date = new Date();
    
    // Set to next occurrence of the recommended day
    const currentDay = date.getDay();
    const daysUntilTarget = (recommendation.dayOfWeek - currentDay + 7) % 7;
    date.setDate(date.getDate() + daysUntilTarget);
    
    // Set time
    date.setHours(parseInt(hour), parseInt(minute), 0, 0);
    
    // If the calculated time is in the past, add a week
    if (date.getTime() < Date.now()) {
      date.setDate(date.getDate() + 7);
    }

    onTimeChange(date.toISOString().slice(0, 16));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Scheduling
      </Typography>

      {/* Scheduling Toggle */}
      <FormControlLabel
        control={
          <Switch
            checked={scheduling}
            onChange={(e) => onSchedulingChange(e.target.checked)}
          />
        }
        label="Schedule for later"
      />

      {/* Date/Time Selection */}
      {scheduling && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => onTimeChange(e.target.value)}
            inputProps={{
              min: getMinDateTime(),
            }}
            sx={{ mb: 2 }}
          />

          {/* Time Recommendations */}
          {recommendations.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Recommended Times
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {recommendations
                  .filter(isRecommendationRelevant)
                  .map((recommendation, index) => (
                    <Tooltip
                      key={index}
                      title={`Expected engagement: ${Math.round(recommendation.expectedEngagement * 100)}%`}
                    >
                      <Chip
                        icon={<ScheduleIcon />}
                        label={`${formatDayOfWeek(recommendation.dayOfWeek)} ${recommendation.timeRange}`}
                        onClick={() => handleRecommendationClick(recommendation)}
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          mb: 1,
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      />
                    </Tooltip>
                  ))}
              </Stack>
            </Box>
          )}

          {/* Scheduling Info */}
          <Alert severity="info" sx={{ mb: 2 }}>
            Posts can be scheduled up to 30 days in advance. Times are shown in your local timezone.
          </Alert>

          {/* Platform-specific Notes */}
          {selectedPlatforms.includes('instagram') && (
            <Alert severity="info">
              Instagram posts will be submitted for review before publishing.
              Approval typically takes 5-10 minutes.
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
};
