import React from 'react';
import { AutomationFeature } from './AutomationFeature';
import { FeatureRoutes } from '../../routers/FeatureRoutes';

interface AutomationProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that sets up all necessary automation feature components
 * This keeps the automation feature isolated from the rest of the application
 */
export const AutomationProvider: React.FC<AutomationProviderProps> = ({ children }) => {
  return (
    <AutomationFeature>
      {children}
      <FeatureRoutes />
    </AutomationFeature>
  );
};

// Export everything needed for the automation feature
export * from './AutomationNavItem';
export * from './automationRoutes';
export * from './automationService';
export * from './aiContentService';
export * from './types';
