import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  Button,
  FormControl,
  FormControlLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAIAutomation } from '../../hooks/useAIAutomation';
import { PendingPostsDialog } from './PendingPostsDialog';
import { EmergencyControls } from './EmergencyControls';
import { AITrainingControls } from './AITrainingControls';
import { CrossPlatformCoordinator } from './CrossPlatformCoordinator';
import { type SocialPlatform } from '../../services/social-platforms.service';

interface AIAutomationControlProps {
  childAccountId: string;
  platform: SocialPlatform;
  motherAccountId: string;
  engagementStyle: 'supportive' | 'critical' | 'neutral' | 'humorous';
}

export const AIAutomationControl: React.FC<AIAutomationControlProps> = ({
  childAccountId,
  platform,
  motherAccountId,
  engagementStyle
}) => {
  const {
    status,
    startAutomation,
    stopAutomation,
    approvePost,
    schedules,
    submitTrainingFeedback,
    updateScheduledTimes
  } = useAIAutomation({
    childAccountId,
    platform,
    motherAccountId
  });

  const [showPendingPosts, setShowPendingPosts] = useState(false);

  const handleToggleAutomation = async () => {
    if (status.isEnabled) {
      stopAutomation();
    } else {
      // Use schedule based on engagement style
      await startAutomation(schedules[engagementStyle]);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            AI Content Automation
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={status.isEnabled}
                onChange={handleToggleAutomation}
                color="primary"
              />
            }
            label={status.isEnabled ? 'Automation Active' : 'Automation Inactive'}
          />
        </Box>

        {status.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {status.error}
          </Alert>
        )}

        {status.isEnabled && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Automation Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {status.pendingPosts > 0 && (
                <>
                  <CircularProgress size={20} />
                  <Typography variant="body2">
                    {status.pendingPosts} posts pending approval
                  </Typography>
                </>
              )}
              {status.nextScheduledTime && (
                <Typography variant="body2">
                  Next post scheduled for: {status.nextScheduledTime.toLocaleTimeString()}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {status.pendingPosts > 0 && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setShowPendingPosts(true)}
            >
              Review Pending Posts ({status.pendingPosts})
            </Button>
          </Box>
        )}
        
        {/* Emergency Controls */}
        {status.isEnabled && (
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <EmergencyControls
              childAccountId={childAccountId}
              platform={platform}
            />
          </Box>
        )}

        {/* AI Training Controls */}
        {status.isEnabled && (
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <AITrainingControls
              childAccountId={childAccountId}
              platform={platform}
              onFeedbackSubmit={async (feedback) => {
                await submitTrainingFeedback(feedback);
              }}
            />
          </Box>
        )}

        {/* Cross-Platform Coordination */}
        {status.isEnabled && status.pendingContent.length > 0 && (
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <CrossPlatformCoordinator
              contents={status.pendingContent.map(post => post.content)}
              onOptimizeTiming={updateScheduledTimes}
            />
          </Box>
        )}
      </CardContent>

      <PendingPostsDialog
        open={showPendingPosts}
        onClose={() => setShowPendingPosts(false)}
        posts={status.pendingContent}
        onApprove={approvePost}
        onReject={(postId) => console.log('Reject post:', postId)}
        onEdit={(post) => console.log('Edit post:', post)}
      />
    </Card>
  );
};
