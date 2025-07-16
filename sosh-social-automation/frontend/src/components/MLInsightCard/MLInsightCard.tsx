import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Create as CreateIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

interface MLInsightCardProps {
  title: string;
  description: string;
  confidence: number;
  recommendations: string[];
  category: 'timing' | 'content' | 'trends';
  timestamp: string;
  onActionClick?: () => void;
}

/**
 * MLInsightCard Component
 * ======================
 * 
 * Displays machine learning-generated insights with confidence scores,
 * recommendations, and actionable steps.
 * 
 * Props
 * -----
 * - title: Insight title
 * - description: Detailed explanation
 * - confidence: ML model confidence score (0-1)
 * - recommendations: Array of actionable recommendations
 * - category: Type of insight (timing/content/trends)
 * - timestamp: When the insight was generated
 * - onActionClick: Handler for action button
 * 
 * Categories
 * ---------
 * - timing: Best posting times and scheduling
 * - content: Content strategy and optimization
 * - trends: Trending topics and hashtags
 * 
 * Example
 * -------
 * ```tsx
 * <MLInsightCard
 *   title="Best Posting Time"
 *   description="Your audience is most active between 3-5 PM EST"
 *   confidence={0.85}
 *   recommendations={[
 *     "Schedule posts during peak hours",
 *     "Test content types during this window"
 *   ]}
 *   category="timing"
 *   timestamp="Updated 2 hours ago"
 *   onActionClick={() => handleInsightAction('timing')}
 * />
 * ```
 */
const MLInsightCard: React.FC<MLInsightCardProps> = ({
  title,
  description,
  confidence,
  recommendations,
  category,
  timestamp,
  onActionClick,
}) => {
  const theme = useTheme();

  // Category configurations
  const categoryConfig = {
    timing: {
      icon: <ScheduleIcon fontSize="small" />,
      color: theme.palette.primary.main,
      label: 'Timing',
    },
    content: {
      icon: <CreateIcon fontSize="small" />,
      color: theme.palette.secondary.main,
      label: 'Content',
    },
    trends: {
      icon: <TrendingUpIcon fontSize="small" />,
      color: theme.palette.info.main,
      label: 'Trends',
    },
  };

  const { icon, color, label } = categoryConfig[category];

  // Calculate confidence color
  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return theme.palette.success.main;
    if (score >= 0.6) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const confidenceColor = getConfidenceColor(confidence);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category and Confidence */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Chip
            icon={icon}
            label={label}
            size="small"
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              fontWeight: 500,
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: confidenceColor,
                fontWeight: 'medium',
              }}
            >
              {Math.round(confidence * 100)}% confidence
            </Typography>
            <LinearProgress
              variant="determinate"
              value={confidence * 100}
              sx={{
                width: 50,
                height: 4,
                borderRadius: 2,
                bgcolor: alpha(confidenceColor, 0.2),
                '& .MuiLinearProgress-bar': {
                  bgcolor: confidenceColor,
                },
              }}
            />
          </Box>
        </Box>

        {/* Title and Description */}
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {description}
        </Typography>

        {/* Recommendations */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ color: theme.palette.text.primary }}
          >
            Recommendations:
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            {recommendations.map((rec, index) => (
              <Typography
                key={index}
                component="li"
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                {rec}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Timestamp and Action */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 'auto',
            pt: 2,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {timestamp}
          </Typography>
          {onActionClick && (
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={onActionClick}
              size="small"
            >
              Take Action
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MLInsightCard;
