import express from 'express';
import { statsController } from '../controllers/stats.controller.js';

const router = express.Router();

/**
 * @route   GET /api/stats
 * @desc    Get overall system statistics
 * @access  Public
 */
router.get('/', statsController.getSystemStats);

/**
 * @route   GET /api/stats/leaderboard
 * @desc    Get user leaderboard
 * @access  Public
 */
router.get('/leaderboard', statsController.getLeaderboard);

/**
 * @route   GET /api/stats/activity
 * @desc    Get real-time activity feed
 * @access  Public
 */
router.get('/activity', statsController.getActivity);

/**
 * @route   GET /api/stats/analytics
 * @desc    Get detailed analytics
 * @access  Public
 */
router.get('/analytics', statsController.getAnalytics);

export default router;
