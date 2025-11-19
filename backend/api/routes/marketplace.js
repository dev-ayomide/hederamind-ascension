import express from 'express';
import { marketplaceController } from '../controllers/marketplace.controller.js';

const router = express.Router();

/**
 * @route   POST /api/marketplace/buy
 * @desc    Buy a verified claim (TruthAgent functionality)
 * @access  Public
 */
router.post('/buy', marketplaceController.buyClaim);

/**
 * @route   GET /api/marketplace/sales
 * @desc    Get all sales history
 * @access  Public
 */
router.get('/sales', marketplaceController.getAllSales);

/**
 * @route   GET /api/marketplace/stats
 * @desc    Get marketplace statistics
 * @access  Public
 */
router.get('/stats', marketplaceController.getMarketplaceStats);

export default router;
