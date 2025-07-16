/**
 * Public API for the AI Content Automation feature
 * This keeps the feature's implementation details private while exposing only what's needed
 */

// Main provider component that sets up the feature
export { AutomationProvider } from './AutomationProvider';

// Navigation components
export { AutomationNavItem, isAutomationRoute } from './AutomationNavItem';

// Core types
export type {
  AutomationConfig,
  PersonalityTemplate,
  ContentRules,
  PostSchedule,
  ContentGenerationResult,
  ContentStatus
} from './types';

// Service implementations
export { aiContentService } from './aiContentService';
export { automationService } from './automationService';

// Hook for using automation in components
export { useAIAutomation } from '../../hooks/useAIAutomation';
export { useAutomationAccounts } from '../../hooks/useAutomationAccounts';

// Example configurations and usage patterns
export { examples } from './examples';
