import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';

interface AnalyticsProgressProps {
  label: string;
  value: number;
  total: number;
  previousValue: number;
  trend: {
    direction: 'up' | 'down' | 'flat';
    percentage: number;
  };
  format?: (value: number) => string;
}

/**
 * AnalyticsProgress Component
 * ==========================
 * 
 * Displays a metric with a progress bar, trend indicator, and percentage change.
 * 
 * Props
 * -----
 * - label: Metric name
 * - value: Current value
 * - total: Maximum value
 * - previousValue: Previous period's value
 * - trend: Object containing trend direction and percentage
 * - format: Optional function to format the value display
 * 
 * Example
 * -------
 * ```tsx
 * <AnalyticsProgress
 *   label="Engagement Rate"
 *   value={65}
 *   total={100}
 *   previousValue={58}
 *   trend={{ direction: 'up', percentage: 12.5 }}
 *   format={(value) => `${value}%`}
 * />
 * ```
 */
const AnalyticsProgress: React.FC<AnalyticsProgressProps> = ({
  label,
  value,
  total,
  previousValue,
  trend,
  format = (val) => val.toString(),
}) => {
  const theme = useTheme();

  // Calculate progress percentage
  const progress = (value / total) * 100;

  // Trend configurations
  const trendConfig = {
    up: {
      icon: <TrendingUpIcon fontSize="small" />,
      color: theme.palette.success.main,
      label: 'Increase',
    },
    down: {
      icon: <TrendingDownIcon fontSize="small" />,
      color: theme.palette.error.main,
      label: 'Decrease',
    },
    flat: {
      icon: <TrendingFlatIcon fontSize="small" />,
      color: theme.palette.text.secondary,
      label: 'No change',
    },
  };

  const { icon, color, label: trendLabel } = trendConfig[trend.direction];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Metric Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight="medium"
        >
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 'bold' }}
          >
            {format(value)}
          </Typography>
          <Tooltip
            title={`${trendLabel} of ${trend.percentage}% from previous period`}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color,
                bgcolor: `${color}15`,
                borderRadius: 1,
                px: 0.5,
                py: 0.25,
              }}
            >
              {icon}
              <Typography
                variant="caption"
                sx={{
                  ml: 0.5,
                  fontWeight: 'medium',
                }}
              >
                {trend.percentage}%
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ position: 'relative' }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: theme.palette.grey[200],
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              bgcolor: color,
            },
          }}
        />

        {/* Previous Value Marker */}
        <Box
          sx={{
            position: 'absolute',
            left: `${(previousValue / total) * 100}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 2,
            height: 16,
            bgcolor: theme.palette.grey[400],
          }}
        />
      </Box>

      {/* Comparison Label */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.5, display: 'block' }}
      >
        Previous: {format(previousValue)}
      </Typography>
    </Box>
  );
};

export default AnalyticsProgress;
