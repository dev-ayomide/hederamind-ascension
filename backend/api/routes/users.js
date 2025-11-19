import express from 'express';
import { usersController } from '../controllers/users.controller.js';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Public
 */
router.get('/', usersController.getAllUsers);

/**
 * @route   GET /api/users/:accountId/dashboard
 * @desc    Get user dashboard data
 * @access  Public
 */
router.get('/:accountId/dashboard', usersController.getUserDashboard);

/**
 * @route   GET /api/users/:accountId
 * @desc    Get user by account ID
 * @access  Public
 */
router.get('/:accountId', usersController.getUserByAccountId);

export default router;
