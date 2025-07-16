import React from 'react';
import { Link } from 'react-router-dom';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { AutoFixHigh as AutomationIcon } from '@mui/icons-material';

/**
 * Navigation item for the AI automation feature
 * Can be conditionally rendered in the layout without modifying the main navigation
 */
export const AutomationNavItem: React.FC = () => {
  return (
    <ListItem
      button
      component={Link}
      to="/automation"
      sx={{
        '&.active': {
          backgroundColor: 'action.selected'
        }
      }}
    >
      <ListItemIcon>
        <AutomationIcon />
      </ListItemIcon>
      <ListItemText primary="AI Automation" />
    </ListItem>
  );
};

// Export a function to check if a path is an automation route
export const isAutomationRoute = (path: string): boolean => {
  return path.startsWith('/automation');
};
