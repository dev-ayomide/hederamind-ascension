import express from 'express';
import { claimsController } from '../controllers/claims.controller.js';

const router = express.Router();

/**
 * @route   POST /api/claims/verify
 * @desc    Verify a claim using AI
 * @access  Public
 */
router.post('/verify', claimsController.verifyClaim);

/**
 * @route   GET /api/claims
 * @desc    Get all claims with optional filtering
 * @access  Public
 */
router.get('/', claimsController.getAllClaims);

/**
 * @route   GET /api/claims/recent
 * @desc    Get recent claims
 * @access  Public
 */
router.get('/recent', claimsController.getRecentClaims);

/**
 * @route   GET /api/claims/:id
 * @desc    Get claim by ID
 * @access  Public
 */
router.get('/:id', claimsController.getClaimById);

export default router;
