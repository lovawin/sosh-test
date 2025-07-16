import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { PauseCircle as PauseIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { automationService } from '../../services/ai-content/automationService';

interface EmergencyControlsProps {
  childAccountId: string;
  platform: string;
}

export const EmergencyControls: React.FC<EmergencyControlsProps> = ({
  childAccountId,
  platform
}) => {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [actionType, setActionType] = React.useState<'pause' | 'cancel'>('pause');
  const [error, setError] = React.useState<string | null>(null);

  const handleEmergencyAction = async () => {
    try {
      if (actionType === 'pause') {
        await automationService.stopAutomation(childAccountId);
      } else {
        // Cancel all pending posts
        // This will be implemented in automationService
        // await automationService.cancelPendingPosts(childAccountId);
      }
      setConfirmOpen(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform emergency action');
    }
  };

  const openConfirm = (type: 'pause' | 'cancel') => {
    setActionType(type);
    setConfirmOpen(true);
  };

  return (
    <Card sx={{ mt: 2, bgcolor: 'background.default' }}>
      <CardContent>
        <Typography variant="h6" color="error" gutterBottom>
          Emergency Controls
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<PauseIcon />}
            onClick={() => openConfirm('pause')}
            fullWidth
          >
            Emergency Pause
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => openConfirm('cancel')}
            fullWidth
          >
            Cancel All Pending
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Use these controls only in emergency situations. Emergency pause will stop all automated posting immediately.
        </Typography>
      </CardContent>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>
          {actionType === 'pause' ? 'Confirm Emergency Pause' : 'Confirm Cancel All'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {actionType === 'pause'
              ? 'This will immediately stop all automated posting for this account. Are you sure?'
              : 'This will cancel all pending posts for this account. This action cannot be undone. Are you sure?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleEmergencyAction} color="error" variant="contained">
            Confirm {actionType === 'pause' ? 'Pause' : 'Cancel All'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
