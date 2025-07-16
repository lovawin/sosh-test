import React from 'react';
import { routeRegistry } from './routeRegistry';

/**
 * Component that renders all registered feature routes
 * This allows features to add routes without modifying the main router
 */
export const FeatureRoutes: React.FC = () => {
  return <>{routeRegistry.getFeatureRoutes()}</>;
};
