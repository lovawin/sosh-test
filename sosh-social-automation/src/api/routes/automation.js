const express = require('express');
const router = express.Router();
const automationService = require('../../services/automation.service');
const authMiddleware = require('../../middleware/auth');

/**
 * Automation Routes
 * 
 * These endpoints manage social media automation strategies:
 * - Strategy creation and configuration
 * - Automation control (start/stop/pause)
 * - Performance monitoring
 * - Settings management
 * 
 * Security:
 * - All routes require authentication
 * - Rate limiting enforced
 * - User permissions validated
 * - Action logging enabled
 */

/**
 * @route   POST /api/automation/start
 * @desc    Start a new automation strategy
 * @access  Private
 * 
 * Request Body:
 * {
 *   motherAccount: {
 *     username: string,
 *     id: string,
 *     platform: string
 *   },
 *   childAccounts: [{
 *     username: string,
 *     id: string,
 *     platform: string
 *   }],
 *   strategy: {
 *     actionsPerDay: number,
 *     interactionDelay: number,
 *     targetHashtags: string[],
 *     contentTypes: string[],
 *     engagementRules: {
 *       likeRatio: number,
 *       retweetRatio: number,
 *       replyRatio: number,
 *       followRatio: number
 *     }
 *   }
 * }
 * 
 * This endpoint:
 * 1. Validates strategy parameters
 * 2. Initializes automation
 * 3. Starts scheduled actions
 * 4. Returns monitoring details
 */
router.post('/start', authMiddleware, async (req, res) => {
    try {
        const { motherAccount, childAccounts, strategy } = req.body;

        // Validate request
        if (!motherAccount || !strategy) {
            return res.status(400).json({
                error: 'Mother account and strategy configuration required'
            });
        }

        // Attach user ID to accounts for tracking
        motherAccount.userId = req.user._id;
        childAccounts?.forEach(account => account.userId = req.user._id);

        // Start automation
        const automationId = await automationService.startAutomation(
            motherAccount,
            childAccounts || [],
            strategy
        );

        res.json({
            success: true,
            data: {
                automationId,
                message: 'Automation strategy started successfully',
                status: 'active'
            }
        });
    } catch (error) {
        console.error('Error starting automation:', error);
        res.status(500).json({ error: 'Failed to start automation strategy' });
    }
});

/**
 * @route   GET /api/automation/:automationId/status
 * @desc    Get automation status and metrics
 * @access  Private
 * 
 * Returns:
 * - Current status
 * - Performance metrics
 * - Error logs
 * - Action history
 */
router.get('/:automationId/status', authMiddleware, async (req, res) => {
    try {
        const { automationId } = req.params;
        const automation = automationService.activeAutomations.get(automationId);

        if (!automation) {
            return res.status(404).json({ error: 'Automation not found' });
        }

        // Verify ownership
        if (automation.motherAccount.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to access this automation' });
        }

        res.json({
            success: true,
            data: {
                status: automation.status,
                metrics: automation.metrics,
                lastUpdate: automation.lastSchedule,
                runningTime: Date.now() - automation.startTime
            }
        });
    } catch (error) {
        console.error('Error fetching automation status:', error);
        res.status(500).json({ error: 'Failed to fetch automation status' });
    }
});

/**
 * @route   PUT /api/automation/:automationId/pause
 * @desc    Pause running automation
 * @access  Private
 * 
 * This endpoint:
 * 1. Validates automation exists
 * 2. Checks user permissions
 * 3. Pauses scheduled actions
 * 4. Maintains current state
 */
router.put('/:automationId/pause', authMiddleware, async (req, res) => {
    try {
        const { automationId } = req.params;
        const automation = automationService.activeAutomations.get(automationId);

        if (!automation) {
            return res.status(404).json({ error: 'Automation not found' });
        }

        // Verify ownership
        if (automation.motherAccount.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to modify this automation' });
        }

        // Update automation status
        automation.status = 'paused';
        automation.pausedAt = Date.now();
        automationService.activeAutomations.set(automationId, automation);

        res.json({
            success: true,
            message: 'Automation paused successfully',
            data: {
                status: 'paused',
                pausedAt: automation.pausedAt
            }
        });
    } catch (error) {
        console.error('Error pausing automation:', error);
        res.status(500).json({ error: 'Failed to pause automation' });
    }
});

/**
 * @route   PUT /api/automation/:automationId/resume
 * @desc    Resume paused automation
 * @access  Private
 * 
 * This endpoint:
 * 1. Validates automation exists
 * 2. Checks user permissions
 * 3. Resumes scheduled actions
 * 4. Updates metrics tracking
 */
router.put('/:automationId/resume', authMiddleware, async (req, res) => {
    try {
        const { automationId } = req.params;
        const automation = automationService.activeAutomations.get(automationId);

        if (!automation) {
            return res.status(404).json({ error: 'Automation not found' });
        }

        // Verify ownership
        if (automation.motherAccount.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to modify this automation' });
        }

        // Update automation status
        automation.status = 'active';
        automation.resumedAt = Date.now();
        automationService.activeAutomations.set(automationId, automation);

        // Reschedule actions
        await automationService.scheduleActions(automationId);

        res.json({
            success: true,
            message: 'Automation resumed successfully',
            data: {
                status: 'active',
                resumedAt: automation.resumedAt
            }
        });
    } catch (error) {
        console.error('Error resuming automation:', error);
        res.status(500).json({ error: 'Failed to resume automation' });
    }
});

/**
 * @route   DELETE /api/automation/:automationId
 * @desc    Stop and remove automation
 * @access  Private
 * 
 * This endpoint:
 * 1. Validates automation exists
 * 2. Checks user permissions
 * 3. Stops all scheduled actions
 * 4. Removes automation data
 */
router.delete('/:automationId', authMiddleware, async (req, res) => {
    try {
        const { automationId } = req.params;
        const automation = automationService.activeAutomations.get(automationId);

        if (!automation) {
            return res.status(404).json({ error: 'Automation not found' });
        }

        // Verify ownership
        if (automation.motherAccount.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this automation' });
        }

        // Remove automation
        automationService.activeAutomations.delete(automationId);

        res.json({
            success: true,
            message: 'Automation stopped and removed successfully'
        });
    } catch (error) {
        console.error('Error deleting automation:', error);
        res.status(500).json({ error: 'Failed to delete automation' });
    }
});

module.exports = router;
