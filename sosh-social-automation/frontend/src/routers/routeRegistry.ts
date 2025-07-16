import { ReactElement } from 'react';
import { Route } from 'react-router-dom';

/**
 * Registry for dynamically adding routes to the application
 * This allows features to register their routes without modifying the main router
 */
class RouteRegistry {
  private featureRoutes: Map<string, ReactElement<typeof Route>> = new Map();

  /**
   * Register routes for a feature
   */
  registerFeatureRoutes(featureId: string, routes: ReactElement<typeof Route>) {
    this.featureRoutes.set(featureId, routes);
  }

  /**
   * Get all registered feature routes
   */
  getFeatureRoutes(): ReactElement<typeof Route>[] {
    return Array.from(this.featureRoutes.values());
  }

  /**
   * Remove routes for a feature
   */
  unregisterFeatureRoutes(featureId: string) {
    this.featureRoutes.delete(featureId);
  }
}

// Export singleton instance
export const routeRegistry = new RouteRegistry();

// Register automation routes
import { AutomationRoutes } from '../services/ai-content/automationRoutes';
routeRegistry.registerFeatureRoutes('automation', AutomationRoutes);
