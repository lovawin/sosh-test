import { useState, useCallback, useEffect } from 'react';
import { automationService } from '../services/ai-content/automationService';
import { type SocialPlatform } from '../services/social-platforms.service';
import { type ContentGenerationResult } from '../services/ai-content/types';

interface AutomationStatus {
  isEnabled: boolean;
  pendingPosts: number;
  lastPostTime?: Date;
  nextScheduledTime?: Date;
  error?: string;
  pendingContent: ContentGenerationResult[];
}

interface UseAIAutomationParams {
  childAccountId: string;
  platform: SocialPlatform;
  motherAccountId: string;
}

export const useAIAutomation = ({ childAccountId, platform, motherAccountId }: UseAIAutomationParams) => {
  const [status, setStatus] = useState<AutomationStatus>({
    isEnabled: false,
    pendingPosts: 0,
    pendingContent: [] // Store pending post content
  });

  // Fetch initial automation status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const currentStatus = await automationService.getStatus(childAccountId);
        setStatus(prev => ({
          ...prev,
          ...currentStatus,
          error: undefined
        }));
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to fetch automation status'
        }));
      }
    };

    fetchStatus();
  }, [childAccountId]);

  // Start automation with schedule
  const startAutomation = useCallback(async (schedule: {
    timeSlots: string[];
    timezone: string;
    maxPostsPerDay: number;
  }) => {
    try {
      await automationService.startAutomation(
        childAccountId,
        platform,
        motherAccountId,
        schedule
      );

      setStatus(prev => ({
        ...prev,
        isEnabled: true,
        error: undefined
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start automation'
      }));
    }
  }, [childAccountId, platform, motherAccountId]);

  // Stop automation
  const stopAutomation = useCallback(() => {
    try {
      automationService.stopAutomation(childAccountId);
      setStatus(prev => ({
        ...prev,
        isEnabled: false,
        error: undefined
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to stop automation'
      }));
    }
  }, [childAccountId]);

  // Approve a pending post
  const approvePost = useCallback(async (postId: string) => {
    try {
      automationService.approvePost(postId);
      setStatus(prev => ({
        ...prev,
        pendingPosts: Math.max(0, prev.pendingPosts - 1),
        error: undefined
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to approve post'
      }));
    }
  }, []);

  // Default schedules based on engagement style
  const schedules = {
    supportive: {
      timeSlots: ["09:00", "12:00", "15:00", "17:00"],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      maxPostsPerDay: 4
    },
    critical: {
      timeSlots: ["10:00", "14:00", "16:00"],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      maxPostsPerDay: 3
    },
    neutral: {
      timeSlots: ["11:00", "15:00"],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      maxPostsPerDay: 2
    },
    humorous: {
      timeSlots: ["10:00", "13:00", "16:00", "19:00"],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      maxPostsPerDay: 4
    }
  };

  // Submit AI training feedback
  const submitTrainingFeedback = useCallback(async (feedback: {
    contentAccuracy: number;
    personalityMatch: number;
    voiceCalibration: number;
  }) => {
    try {
      await automationService.submitTrainingFeedback(
        childAccountId,
        platform,
        feedback
      );
      setStatus(prev => ({
        ...prev,
        error: undefined
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to submit training feedback'
      }));
    }
  }, [childAccountId, platform]);

  // Update post scheduling times
  const updateScheduledTimes = useCallback(async (updates: Array<{ id: string; optimizedTime: Date }>) => {
    try {
      // Update each post's scheduled time
      for (const update of updates) {
        await automationService.updatePostSchedule(update.id, update.optimizedTime);
      }
      // Refresh status to get updated schedule
      const updatedStatus = await automationService.getStatus(childAccountId);
      setStatus(prev => ({
        ...prev,
        ...updatedStatus
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update post schedules'
      }));
    }
  }, [childAccountId]);

  return {
    status,
    startAutomation,
    stopAutomation,
    approvePost,
    schedules,
    submitTrainingFeedback,
    updateScheduledTimes
  };
};
