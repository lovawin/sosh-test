import React, { useEffect, type PropsWithChildren } from 'react';
import { routeRegistry } from '../../routers/routeRegistry';
import { AutomationRoutes } from './automationRoutes';

const FEATURE_ID = 'automation';

/**
 * Component that manages the lifecycle of automation feature routes
 * Registers routes when mounted and cleans up when unmounted
 */
export const AutomationFeature: React.FC<PropsWithChildren> = ({ children }) => {
  useEffect(() => {
    // Register automation routes
    routeRegistry.registerFeatureRoutes(FEATURE_ID, AutomationRoutes);

    // Cleanup on unmount
    return () => {
      routeRegistry.unregisterFeatureRoutes(FEATURE_ID);
    };
  }, []);

  return <>{children}</>;
};
