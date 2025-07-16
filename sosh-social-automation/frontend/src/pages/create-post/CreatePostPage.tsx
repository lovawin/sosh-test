import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  TextField,
} from '@mui/material';
import { useNotification } from '../../contexts/NotificationContext';
import { useSocialPlatforms } from '../../hooks/useSocialPlatforms';
import { usePostCreation } from '../../hooks/usePostCreation';
import { type SocialPlatform } from '../../services/social-platforms.service';
import PlatformSelector from './components/PlatformSelector';
import { MediaUploader } from './components/MediaUploader';
import { HashtagInput } from './components/HashtagInput';

export const CreatePostPage: React.FC = () => {
  const { platforms: connectedPlatforms, loading: platformsLoading } = useSocialPlatforms();
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const { showNotification } = useNotification();

  const {
    caption,
    setCaption,
    media,
    setMedia,
    hashtags,
    setHashtags,
    validationErrors,
    loading,
    handleSubmit,
  } = usePostCreation(
    selectedPlatforms,
    () => {
      showNotification(
        'Post created successfully! Your content will be published to the selected platforms.',
        'success'
      );
      // Reset form
      setCaption('');
      setMedia([]);
      setHashtags([]);
      setSelectedPlatforms([]);
    },
    (error) => {
      showNotification(
        error.message || 'Failed to create post. Please try again.',
        'error'
      );
    }
  );

  const handlePlatformToggle = (platforms: SocialPlatform[]) => {
    setSelectedPlatforms(platforms);
  };

  if (platformsLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create Post
        </Typography>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onPlatformToggle={handlePlatformToggle}
              connectedPlatforms={connectedPlatforms}
              validationErrors={
                validationErrors?.find(err => err.field === 'platforms')?.message
                  ? { platforms: validationErrors.find(err => err.field === 'platforms')!.message }
                  : undefined
              }
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              sx={{ mb: 3 }}
            />

            <MediaUploader
              media={media}
              onMediaChange={setMedia}
              validationErrors={
                validationErrors?.find(err => err.field === 'media')?.message
                  ? { media: validationErrors.find(err => err.field === 'media')!.message }
                  : undefined
              }
            />

            <HashtagInput
              hashtags={hashtags}
              onHashtagsChange={setHashtags}
              validationErrors={
                validationErrors?.find(err => err.field === 'hashtags')?.message
                  ? { hashtags: validationErrors.find(err => err.field === 'hashtags')!.message }
                  : undefined
              }
            />

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Post'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreatePostPage;
