import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import {
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Compare as CompareIcon,
  ArrowRight as ArrowIcon
} from '@mui/icons-material';

interface ConflictDetectorProps {
  childAccountId: string;
  platform: string;
  scheduledPosts: Array<{
    id: string;
    platform: string;
    scheduledTime: Date;
    content: string;
  }>;
}

interface Conflict {
  type: 'timing' | 'content';
  severity: 'warning' | 'error';
  description: string;
  posts: string[];
  suggestion: string;
}

export const ConflictDetector: React.FC<ConflictDetectorProps> = ({
  childAccountId,
  platform,
  scheduledPosts
}) => {
  // Detect timing conflicts (posts scheduled too close together)
  const timingConflicts = React.useMemo(() => {
    const conflicts: Conflict[] = [];
    const MIN_TIME_GAP = 30 * 60 * 1000; // 30 minutes in milliseconds

    scheduledPosts.forEach((post, i) => {
      scheduledPosts.slice(i + 1).forEach(otherPost => {
        const timeDiff = Math.abs(
          post.scheduledTime.getTime() - otherPost.scheduledTime.getTime()
        );
        
        if (timeDiff < MIN_TIME_GAP) {
          conflicts.push({
            type: 'timing',
            severity: 'warning',
            description: `Posts scheduled ${Math.floor(timeDiff / (60 * 1000))} minutes apart`,
            posts: [post.id, otherPost.id],
            suggestion: 'Consider spacing posts at least 30 minutes apart'
          });
        }
      });
    });

    return conflicts;
  }, [scheduledPosts]);

  // Detect content conflicts (similar content across platforms)
  const contentConflicts = React.useMemo(() => {
    const conflicts: Conflict[] = [];
    const SIMILARITY_THRESHOLD = 0.7;

    scheduledPosts.forEach((post, i) => {
      scheduledPosts.slice(i + 1).forEach(otherPost => {
        if (post.platform !== otherPost.platform) {
          // Simple similarity check (in practice, use a proper similarity algorithm)
          const similarity = post.content === otherPost.content ? 1 : 0;
          
          if (similarity > SIMILARITY_THRESHOLD) {
            conflicts.push({
              type: 'content',
              severity: 'warning',
              description: 'Very similar content detected across platforms',
              posts: [post.id, otherPost.id],
              suggestion: 'Consider customizing content for each platform'
            });
          }
        }
      });
    });

    return conflicts;
  }, [scheduledPosts]);

  const allConflicts = [...timingConflicts, ...contentConflicts];

  if (allConflicts.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mt: 2, bgcolor: 'background.default' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="warning" sx={{ mr: 1 }} />
          Potential Conflicts Detected
        </Typography>

        <List>
          {allConflicts.map((conflict, index) => (
            <ListItem key={index}>
              <Alert 
                severity={conflict.severity}
                icon={conflict.type === 'timing' ? <ScheduleIcon /> : <CompareIcon />}
                sx={{ width: '100%' }}
              >
                <AlertTitle>{conflict.type === 'timing' ? 'Timing Conflict' : 'Content Conflict'}</AlertTitle>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    {conflict.description}
                  </Typography>
                  <Collapse in={true}>
                    <List dense>
                      {conflict.posts.map(postId => (
                        <ListItem key={postId}>
                          <ListItemIcon>
                            <ArrowIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={`Post ${postId}`}
                            secondary={
                              scheduledPosts.find(p => p.id === postId)?.scheduledTime.toLocaleString()
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Suggestion: {conflict.suggestion}
                    </Typography>
                  </Collapse>
                </Box>
              </Alert>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
