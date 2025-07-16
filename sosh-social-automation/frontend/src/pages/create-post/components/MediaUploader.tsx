import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

interface MediaFile {
  file: File;
  preview: string;
}

interface MediaUploaderProps {
  media: MediaFile[];
  onMediaChange: (media: MediaFile[]) => void;
  validationErrors?: Record<string, string>;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  media,
  onMediaChange,
  validationErrors,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      onMediaChange([...media, ...newFiles]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    const newMedia = [...media];
    URL.revokeObjectURL(newMedia[index].preview);
    newMedia.splice(index, 1);
    onMediaChange(newMedia);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Upload Media
      </Typography>
      {validationErrors?.media && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationErrors.media}
        </Alert>
      )}
      <Box sx={{ mb: 2 }}>
        <input
          accept="image/*,video/*"
          style={{ display: 'none' }}
          id="media-upload"
          type="file"
          multiple
          onChange={handleFileChange}
        />
        <label htmlFor="media-upload">
          <Button variant="outlined" component="span">
            Add Media
          </Button>
        </label>
      </Box>
      {media.length > 0 && (
        <ImageList sx={{ width: '100%', height: 'auto' }} cols={3} rowHeight={164}>
          {media.map((item, index) => (
            <ImageListItem key={index}>
              <img
                src={item.preview}
                alt={`Upload preview ${index + 1}`}
                loading="lazy"
                style={{ height: '100%', objectFit: 'cover' }}
              />
              <ImageListItemBar
                actionIcon={
                  <IconButton
                    sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                    onClick={() => handleRemoveMedia(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Box>
  );
};
