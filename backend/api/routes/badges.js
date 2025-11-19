import express from 'express';
import { badgesController } from '../controllers/badges.controller.js';

const router = express.Router();

/**
 * @route   GET /api/badges/stats
 * @desc    Get badge statistics
 * @access  Public
 */
router.get('/stats', badgesController.getBadgeStats);

/**
 * @route   GET /api/badges
 * @desc    Get all badges
 * @access  Public
 */
router.get('/', badgesController.getAllBadges);

/**
 * @route   GET /api/badges/:accountId
 * @desc    Get badges for specific user
 * @access  Public
 */
router.get('/:accountId', badgesController.getUserBadges);

export default router;
