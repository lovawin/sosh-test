import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  TextField,
  Button,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import {
  Psychology as PersonalityIcon,
  Tune as ToneIcon,
  Style as StyleIcon
} from '@mui/icons-material';

interface AIFeedbackPanelProps {
  childAccountId: string;
  platform: string;
  onFeedbackSubmit?: (feedback: AIFeedback) => Promise<void>;
}

interface AIFeedback {
  personalityAccuracy: number;
  toneConsistency: number;
  contentQuality: number;
  comments: string;
  tags: string[];
}

export const AIFeedbackPanel: React.FC<AIFeedbackPanelProps> = ({
  childAccountId,
  platform,
  onFeedbackSubmit
}) => {
  const [feedback, setFeedback] = useState<AIFeedback>({
    personalityAccuracy: 0,
    toneConsistency: 0,
    contentQuality: 0,
    comments: '',
    tags: []
  });

  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    try {
      if (onFeedbackSubmit) {
        await onFeedbackSubmit(feedback);
        setSuccess(true);
        setError(null);
        
        // Reset form after successful submission
        setFeedback({
          personalityAccuracy: 0,
          toneConsistency: 0,
          contentQuality: 0,
          comments: '',
          tags: []
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
      setSuccess(false);
    }
  };

  const addTag = () => {
    if (newTag && !feedback.tags.includes(newTag)) {
      setFeedback(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFeedback(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          AI Content Feedback
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Feedback submitted successfully
          </Alert>
        )}

        <Stack spacing={2}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PersonalityIcon sx={{ mr: 1 }} />
              <Typography>Personality Accuracy</Typography>
            </Box>
            <Rating
              value={feedback.personalityAccuracy}
              onChange={(_, value) => setFeedback(prev => ({ ...prev, personalityAccuracy: value || 0 }))}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ToneIcon sx={{ mr: 1 }} />
              <Typography>Tone Consistency</Typography>
            </Box>
            <Rating
              value={feedback.toneConsistency}
              onChange={(_, value) => setFeedback(prev => ({ ...prev, toneConsistency: value || 0 }))}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <StyleIcon sx={{ mr: 1 }} />
              <Typography>Content Quality</Typography>
            </Box>
            <Rating
              value={feedback.contentQuality}
              onChange={(_, value) => setFeedback(prev => ({ ...prev, contentQuality: value || 0 }))}
            />
          </Box>

          <TextField
            multiline
            rows={3}
            label="Additional Comments"
            value={feedback.comments}
            onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
          />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Improvement Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                label="Add tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button variant="outlined" onClick={addTag}>
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {feedback.tags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => removeTag(tag)}
                />
              ))}
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!feedback.personalityAccuracy || !feedback.toneConsistency || !feedback.contentQuality}
          >
            Submit Feedback
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
