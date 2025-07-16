import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Chip,
  Alert,
} from '@mui/material';

interface HashtagInputProps {
  hashtags: string[];
  onHashtagsChange: (hashtags: string[]) => void;
  validationErrors?: Record<string, string>;
}

export const HashtagInput: React.FC<HashtagInputProps> = ({
  hashtags,
  onHashtagsChange,
  validationErrors,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Remove # if user types it
    setInputValue(value.startsWith('#') ? value.substring(1) : value);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === ',') {
      event.preventDefault();
      const hashtag = inputValue.trim();
      if (hashtag && !hashtags.includes(hashtag)) {
        onHashtagsChange([...hashtags, hashtag]);
        setInputValue('');
      }
    } else if (event.key === 'Backspace' && !inputValue) {
      // Remove last hashtag when backspace is pressed and input is empty
      onHashtagsChange(hashtags.slice(0, -1));
    }
  };

  const handleDelete = (hashtagToDelete: string) => {
    onHashtagsChange(hashtags.filter((hashtag) => hashtag !== hashtagToDelete));
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Hashtags
      </Typography>
      {validationErrors?.hashtags && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationErrors.hashtags}
        </Alert>
      )}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Type hashtag and press Enter"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          InputProps={{
            startAdornment: (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mr: 1 }}>
                {hashtags.map((hashtag) => (
                  <Chip
                    key={hashtag}
                    label={`#${hashtag}`}
                    onDelete={() => handleDelete(hashtag)}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            ),
          }}
        />
      </Box>
    </Box>
  );
};
