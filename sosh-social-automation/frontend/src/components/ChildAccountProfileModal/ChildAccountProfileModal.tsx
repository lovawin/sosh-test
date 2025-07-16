import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Box
} from '@mui/material';
import { useNotification } from '../../contexts/NotificationContext';
import { childAccountService, ChildAccountProfile } from '../../services/childAccount.service';
import {
  ENGAGEMENT_STYLES,
  DEFAULT_ENGAGEMENT_RULES,
  PROFILE_VALIDATION
} from '../../config';

interface Props {
  open: boolean;
  onClose: () => void;
  platform: string;
  motherAccountId: string;
  childAccountId: string;
}

export const ChildAccountProfileModal: React.FC<Props> = ({
  open,
  onClose,
  platform,
  motherAccountId,
  childAccountId
}) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ChildAccountProfile>({
    personality: '',
    relationshipToMother: '',
    engagementStyle: 'neutral',
    engagementRules: { ...DEFAULT_ENGAGEMENT_RULES },
    interests: [], // Initialize with empty array
    constraints: [] // Initialize with empty array
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const existingProfile = await childAccountService.getProfile(platform, motherAccountId);
        if (existingProfile) {
          setProfile(existingProfile.profile);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        showNotification('Failed to load profile', 'error');
      }
    };

    if (open) {
      loadProfile();
    }
  }, [open, platform, motherAccountId, showNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await childAccountService.setProfile(platform, motherAccountId, profile);
      showNotification('Profile saved successfully', 'success');
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
      showNotification('Failed to save profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEngagementRuleChange = (rule: keyof typeof DEFAULT_ENGAGEMENT_RULES) => (
    event: Event,
    value: number | number[]
  ) => {
    setProfile(prev => ({
      ...prev,
      engagementRules: {
        ...prev.engagementRules,
        [rule]: value as number
      }
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Child Account Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Personality Description"
              multiline
              rows={4}
              value={profile.personality}
              onChange={(e) => setProfile(prev => ({ ...prev, personality: e.target.value }))}
              inputProps={{
                minLength: PROFILE_VALIDATION.minPersonalityLength,
                maxLength: PROFILE_VALIDATION.maxPersonalityLength
              }}
              required
              helperText={`Describe the account's personality (${PROFILE_VALIDATION.minPersonalityLength}-${PROFILE_VALIDATION.maxPersonalityLength} characters)`}
            />

            <TextField
              label="Relationship to Mother Account"
              multiline
              rows={3}
              value={profile.relationshipToMother}
              onChange={(e) => setProfile(prev => ({ ...prev, relationshipToMother: e.target.value }))}
              inputProps={{
                minLength: PROFILE_VALIDATION.minRelationshipLength,
                maxLength: PROFILE_VALIDATION.maxRelationshipLength
              }}
              required
              helperText={`Describe the relationship (${PROFILE_VALIDATION.minRelationshipLength}-${PROFILE_VALIDATION.maxRelationshipLength} characters)`}
            />

            <FormControl fullWidth>
              <InputLabel>Engagement Style</InputLabel>
              <Select
                value={profile.engagementStyle}
                onChange={(e) => setProfile(prev => ({ ...prev, engagementStyle: e.target.value as any }))}
                required
              >
                {ENGAGEMENT_STYLES.map(style => (
                  <MenuItem key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="h6" sx={{ mt: 2 }}>Engagement Rules</Typography>

            <Box>
              <Typography gutterBottom>Like Frequency (%)</Typography>
              <Slider
                value={profile.engagementRules.likeFrequency}
                onChange={handleEngagementRuleChange('likeFrequency')}
                min={PROFILE_VALIDATION.minFrequency}
                max={PROFILE_VALIDATION.maxFrequency}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box>
              <Typography gutterBottom>Comment Frequency (%)</Typography>
              <Slider
                value={profile.engagementRules.commentFrequency}
                onChange={handleEngagementRuleChange('commentFrequency')}
                min={PROFILE_VALIDATION.minFrequency}
                max={PROFILE_VALIDATION.maxFrequency}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box>
              <Typography gutterBottom>Share Frequency (%)</Typography>
              <Slider
                value={profile.engagementRules.shareFrequency}
                onChange={handleEngagementRuleChange('shareFrequency')}
                min={PROFILE_VALIDATION.minFrequency}
                max={PROFILE_VALIDATION.maxFrequency}
                valueLabelDisplay="auto"
              />
            </Box>

            <Typography variant="h6" sx={{ mt: 2 }}>Content Settings</Typography>

            <TextField
              label="Interests"
              multiline
              rows={3}
              value={profile.interests.join('\n')}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                interests: e.target.value.split('\n').filter(line => line.trim() !== '')
              }))}
              helperText="Enter interests/topics, one per line"
            />

            <TextField
              label="Content Constraints"
              multiline
              rows={3}
              value={profile.constraints.join('\n')}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                constraints: e.target.value.split('\n').filter(line => line.trim() !== '')
              }))}
              helperText="Enter content restrictions/guidelines, one per line"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            Save Profile
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
