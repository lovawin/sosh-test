import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button
} from '@mui/material';
import { type SocialPlatform } from '../../services/social-platforms.service';
import { aiContentService } from '../../services/ai-content/aiContentService';
import { type GeneratedContent } from '../../services/ai-content/types';

interface CrossPlatformCoordinatorProps {
  contents: GeneratedContent[];
  onOptimizeTiming?: (optimizedTimes: Array<{ id: string; optimizedTime: Date }>) => void;
}

export const CrossPlatformCoordinator: React.FC<CrossPlatformCoordinatorProps> = ({
  contents,
  onOptimizeTiming
}) => {
  const [inconsistencies, setInconsistencies] = useState<Array<{
    type: 'tone' | 'hashtags';
    description: string;
    platforms: SocialPlatform[];
  }>>([]);

  const [overlaps, setOverlaps] = useState<Array<{
    platforms: [SocialPlatform, SocialPlatform];
    similarity: number;
  }>>([]);

  useEffect(() => {
    // Check for messaging inconsistencies
    const messageInconsistencies = aiContentService.checkMessagingConsistency(contents);
    setInconsistencies(messageInconsistencies);

    // Check for content overlaps
    const contentOverlaps: typeof overlaps = [];
    contents.forEach((content1, i) => {
      contents.slice(i + 1).forEach(content2 => {
        const similarity = aiContentService.checkContentOverlap(content1, content2);
        if (similarity > 0.7) { // Threshold for significant overlap
          contentOverlaps.push({
            platforms: [content1.platform, content2.platform],
            similarity
          });
        }
      });
    });
    setOverlaps(contentOverlaps);
  }, [contents]);

  const handleOptimizeTiming = () => {
    if (!onOptimizeTiming) return;

    // Get optimal times for each platform
    const existingTimes = contents.map(c => new Date()); // Replace with actual scheduled times
    const optimizedSchedule = contents.map(content => ({
      id: content.platform, // Use actual content ID in real implementation
      optimizedTime: aiContentService.getOptimalPostingTime(content.platform, existingTimes)
    }));

    onOptimizeTiming(optimizedSchedule);
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Cross-Platform Coordination
      </Typography>

      {/* Content Overlap Warnings */}
      {overlaps.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="warning">
            Similar content detected across platforms
          </Alert>
          <List dense>
            {overlaps.map((overlap, i) => (
              <ListItem key={i}>
                <ListItemText
                  primary={`${overlap.platforms[0]} ↔ ${overlap.platforms[1]}`}
                  secondary={`${Math.round(overlap.similarity * 100)}% similar content`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Messaging Inconsistencies */}
      {inconsistencies.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="info">
            Messaging inconsistencies detected
          </Alert>
          <List dense>
            {inconsistencies.map((inconsistency, i) => (
              <ListItem key={i}>
                <ListItemText
                  primary={inconsistency.description}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      {inconsistency.platforms.map(platform => (
                        <Chip
                          key={platform}
                          label={platform}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      ))}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Timing Optimization */}
      {onOptimizeTiming && (
        <Button
          variant="outlined"
          onClick={handleOptimizeTiming}
          sx={{ mt: 1 }}
        >
          Optimize Posting Times
        </Button>
      )}
    </Box>
  );
};
