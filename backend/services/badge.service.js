/**
 * Badge Service - Handles NFT badge minting on Hedera
 * 
 * This service wraps BadgeAgent functionality for use in controllers
 */

import { BadgeAgent } from '../agents/BadgeAgent.js';
import { hederaService } from './hedera.service.js';

class BadgeService {
  constructor() {
    this.badgeAgent = null;
    this.initialized = false;
  }

  /**
   * Initialize the badge service
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      const client = await hederaService.getClient();
      const operatorId = hederaService.operatorId;
      const operatorKey = hederaService.operatorKey;

      if (!client || !operatorId || !operatorKey) {
        console.log('⚠️  BadgeService: Hedera service not initialized, using demo mode');
        this.initialized = true;
        return;
      }

      // Initialize BadgeAgent
      this.badgeAgent = new BadgeAgent(client, operatorId, operatorKey);
      
      // Initialize badge token if needed
      if (process.env.BADGE_TOKEN_ID) {
        this.badgeAgent.badgeTokenId = process.env.BADGE_TOKEN_ID;
        console.log(`✅ BadgeService: Using badge token ${process.env.BADGE_TOKEN_ID}`);
      } else {
        console.log('⚠️  BadgeService: No BADGE_TOKEN_ID set, will use demo mode');
        console.log('💡 Run: node backend/scripts/createBadgeToken.js to create token');
      }

      this.initialized = true;
      console.log('✅ BadgeService initialized');

    } catch (error) {
      console.error('❌ BadgeService initialization failed:', error.message);
      this.initialized = true; // Mark as initialized to prevent retry loops
    }
  }

  /**
   * Mint a badge for a user
   * @param {string} accountId - User's Hedera account ID
   * @param {number} purchaseCount - Total purchase count
   * @returns {Object} Badge object or null
   */
  async mintBadge(accountId, purchaseCount) {
    if (!this.badgeAgent) {
      console.log('⚠️  BadgeService: BadgeAgent not initialized, skipping minting');
      return null;
    }

    try {
      // Ensure token is initialized
      if (!this.badgeAgent.badgeTokenId || this.badgeAgent.badgeTokenId === '0.0.DEMO_BADGE_TOKEN') {
        if (process.env.BADGE_TOKEN_ID) {
          this.badgeAgent.badgeTokenId = process.env.BADGE_TOKEN_ID;
        } else {
          console.log('⚠️  BadgeService: No badge token ID, using demo mode');
          return null;
        }
      }

      // Mint the badge
      const badge = await this.badgeAgent.mintBadge(accountId, purchaseCount);
      
      if (badge) {
        console.log(`✅ BadgeService: Minted ${badge.metadata.name} for ${accountId}`);
      }

      return badge;

    } catch (error) {
      console.error('❌ BadgeService: Minting failed:', error.message);
      return null;
    }
  }

  /**
   * Check if badge service is ready for production
   */
  isProductionReady() {
    return !!process.env.BADGE_TOKEN_ID && this.badgeAgent !== null;
  }
}

export const badgeService = new BadgeService();

