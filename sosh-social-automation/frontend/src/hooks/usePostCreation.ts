import { useState } from 'react';
import { type SocialPlatform } from '../services/social-platforms.service';

export interface ValidationError {
  field: string;
  message: string;
}

export interface UsePostCreationReturn {
  caption: string;
  setCaption: (caption: string) => void;
  media: MediaFile[];
  setMedia: (media: MediaFile[]) => void;
  hashtags: string[];
  setHashtags: (hashtags: string[]) => void;
  validationErrors: ValidationError[];
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

interface MediaFile {
  file: File;
  preview: string;
}

export const usePostCreation = (
  platforms: SocialPlatform[],
  onSuccess?: () => void,
  onError?: (error: Error) => void
): UsePostCreationReturn => {
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errors: ValidationError[] = [];

    if (platforms.length === 0) {
      errors.push({
        field: 'platforms',
        message: 'Please select at least one platform',
      });
    }

    if (media.length === 0) {
      errors.push({
        field: 'media',
        message: 'Please upload at least one media file',
      });
    }

    if (hashtags.length === 0) {
      errors.push({
        field: 'hashtags',
        message: 'Please add at least one hashtag',
      });
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onSuccess?.();
      setValidationErrors([]);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to create post'));
    } finally {
      setLoading(false);
    }
  };

  return {
    caption,
    setCaption,
    media,
    setMedia,
    hashtags,
    setHashtags,
    validationErrors,
    loading,
    handleSubmit,
  };
};

export default usePostCreation;
