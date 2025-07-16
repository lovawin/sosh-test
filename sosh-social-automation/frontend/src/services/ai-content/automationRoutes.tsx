import React from 'react';
import { Route } from 'react-router-dom';
import { AutomationPage } from '../../pages/automation/AutomationPage';

/**
 * Isolated routing configuration for AI automation features
 * Can be imported and composed into the main router without modifying it directly
 */
export const AutomationRoutes = (
  <Route path="/automation" element={<AutomationPage />} />
);
