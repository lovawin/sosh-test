import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { type ContentGenerationResult } from '../../services/ai-content/types';

interface PendingPostsDialogProps {
  open: boolean;
  onClose: () => void;
  posts: ContentGenerationResult[];
  onApprove: (postId: string) => Promise<void>;
  onReject: (postId: string) => void;
  onEdit: (post: ContentGenerationResult) => void;
}

export const PendingPostsDialog: React.FC<PendingPostsDialogProps> = ({
  open,
  onClose,
  posts,
  onApprove,
  onReject,
  onEdit
}) => {
  const [processingPosts, setProcessingPosts] = useState<Set<string>>(new Set());

  const handleApprove = async (post: ContentGenerationResult) => {
    // Generate a unique ID from timestamp and content hash
    const postId = `${post.generatedAt.getTime()}_${post.content.text.slice(0, 10)}`;
    setProcessingPosts(prev => new Set(prev).add(postId));
    
    try {
      await onApprove(postId);
    } finally {
      setProcessingPosts(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        Pending Posts ({posts.length})
      </DialogTitle>
      
      <DialogContent>
        {posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No pending posts to review
            </Typography>
          </Box>
        ) : (
          <List>
            {posts.map((post, index) => {
              const postId = `${post.generatedAt.getTime()}_${post.content.text.slice(0, 10)}`;
              const isProcessing = processingPosts.has(postId);

              return (
                <React.Fragment key={postId || index}>
                  <ListItem
                    alignItems="flex-start"
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => onEdit(post)}
                          disabled={isProcessing}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => onReject(postId)}
                          disabled={isProcessing}
                        >
                          <CloseIcon />
                        </IconButton>
                        <IconButton
                          color="success"
                          onClick={() => handleApprove(post)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <CircularProgress size={24} />
                          ) : (
                            <CheckIcon />
                          )}
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="subtitle1">
                            {post.content.platform} Post
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Scheduled for: {post.scheduledFor?.toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{ mb: 1 }}
                          >
              {post.content.text}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {post.content.hashtags.map((tag: string, i: number) => (
                              <Chip
                                key={i}
                                label={tag}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                          {post.content.mediaPrompt && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 1, display: 'block' }}
                            >
                              Media: {post.content.mediaPrompt}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < posts.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
