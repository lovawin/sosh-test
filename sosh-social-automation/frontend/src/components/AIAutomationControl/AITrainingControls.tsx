import React, { useState } from 'react';
import {
  Box,
  Typography,
  Rating,
  Slider,
  Card,
  CardContent,
  Button,
  Alert,
  Stack
} from '@mui/material';
import {
  Psychology as PersonalityIcon,
  RecordVoiceOver as VoiceIcon,
  RateReview as ContentIcon
} from '@mui/icons-material';

interface AITrainingControlsProps {
  childAccountId: string;
  platform: string;
  onFeedbackSubmit?: (feedback: AITrainingFeedback) => Promise<void>;
}

interface AITrainingFeedback {
  contentAccuracy: number;
  personalityMatch: number;
  voiceCalibration: number;
}

export const AITrainingControls: React.FC<AITrainingControlsProps> = ({
  childAccountId,
  platform,
  onFeedbackSubmit
}) => {
  const [feedback, setFeedback] = useState<AITrainingFeedback>({
    contentAccuracy: 0,
    personalityMatch: 0,
    voiceCalibration: 0
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      if (onFeedbackSubmit) {
        await onFeedbackSubmit(feedback);
        setSuccess(true);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
      setSuccess(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        AI Training Controls
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Training feedback submitted successfully
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Content Accuracy */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <ContentIcon sx={{ mr: 1 }} />
            <Typography>Content Accuracy</Typography>
          </Box>
          <Rating
            value={feedback.contentAccuracy}
            onChange={(_, value) => setFeedback(prev => ({ ...prev, contentAccuracy: value || 0 }))}
            max={5}
          />
          <Typography variant="caption" color="text.secondary">
            Rate how well the AI captures the intended message and tone
          </Typography>
        </Box>

        {/* Personality Match */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PersonalityIcon sx={{ mr: 1 }} />
            <Typography>Personality Match</Typography>
          </Box>
          <Rating
            value={feedback.personalityMatch}
            onChange={(_, value) => setFeedback(prev => ({ ...prev, personalityMatch: value || 0 }))}
            max={5}
          />
          <Typography variant="caption" color="text.secondary">
            Rate how well the AI matches the account's personality
          </Typography>
        </Box>

        {/* Voice Calibration */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <VoiceIcon sx={{ mr: 1 }} />
            <Typography>Voice Calibration</Typography>
          </Box>
          <Slider
            value={feedback.voiceCalibration}
            onChange={(_, value) => setFeedback(prev => ({ ...prev, voiceCalibration: value as number }))}
            min={0}
            max={100}
            step={1}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
          />
          <Typography variant="caption" color="text.secondary">
            Adjust how closely the AI should match the account's voice pattern
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!feedback.contentAccuracy || !feedback.personalityMatch}
        >
          Submit Training Feedback
        </Button>
      </Stack>
    </Box>
  );
};
