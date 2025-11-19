import { storageService } from '../../services/storage.service.js';
import { hederaService } from '../../services/hedera.service.js';
import { aiService } from '../../services/ai.service.js';

/**
 * Marketplace Controller - Handles agent marketplace operations
 */
export const marketplaceController = {
  /**
   * Buy a verified claim
   * POST /api/marketplace/buy
   */
  async buyClaim(req, res) {
    try {
      const { claim, buyerAccountId } = req.body;

      if (!claim || !buyerAccountId) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Claim and buyerAccountId are required'
        });
      }

      // Validate Hedera account ID
      if (!hederaService.isValidAccountId(buyerAccountId)) {
        return res.status(400).json({
          error: 'Invalid account',
          message: 'Invalid Hedera account ID format'
        });
      }

      console.log(`💰 Processing purchase for: ${buyerAccountId}`);

      // Step 1: Verify the claim
      const verification = await aiService.verifyClaim(claim);

      // Step 2: Only sell TRUE claims
      if (verification.verdict !== 'TRUE') {
        return res.status(400).json({
          success: false,
          error: 'Claim rejected',
          message: 'Only TRUE claims can be purchased',
          verification: {
            verdict: verification.verdict,
            confidence: verification.confidence,
            reasoning: verification.reasoning
          }
        });
      }

      // Step 3: Create sale record
      const saleData = {
        claim,
        verdict: verification.verdict,
        confidence: verification.confidence,
        reasoning: verification.reasoning,
        buyer: buyerAccountId,
        seller: hederaService.operatorId,
        price: 0.01,
        transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const savedSale = await storageService.addSale(saleData);

      // Step 4: Update or create user
      let user = await storageService.getUserByAccountId(buyerAccountId);
      if (!user) {
        user = await storageService.addUser({ accountId: buyerAccountId });
      }

      // Increment purchase count
      const updatedUser = await storageService.updateUser(buyerAccountId, {
        purchaseCount: (user.purchaseCount || 0) + 1
      });

      // Step 5: Check if badge should be minted
      const purchaseCount = updatedUser.purchaseCount;
      const badgeThreshold = 5;
      let badge = null;

      if (purchaseCount % badgeThreshold === 0) {
        // Mint badge!
        badge = {
          recipient: buyerAccountId,
          tier: calculateBadgeTier(purchaseCount),
          purchaseCount,
          tokenId: process.env.BADGE_TOKEN_ID || '0.0.DEMO_BADGE',
          serialNumber: `${Date.now()}`,
          metadata: {
            name: `Truth Seeker Badge - ${calculateBadgeTier(purchaseCount)}`,
            description: `Earned after ${purchaseCount} verified claim purchases`
          }
        };

        await storageService.addBadge(badge);
        
        // Update user badge count
        await storageService.updateUser(buyerAccountId, {
          badgesEarned: (user.badgesEarned || 0) + 1
        });

        console.log(`🏆 Badge minted for ${buyerAccountId}!`);
      }

      // Step 6: Submit to HCS
      try {
        await hederaService.submitToHCS({
          type: 'ClaimPurchase',
          saleId: savedSale.id,
          buyer: buyerAccountId,
          claim,
          price: 0.01,
          timestamp: savedSale.timestamp
        });
      } catch (hcsError) {
        console.error('⚠️  HCS submission failed:', hcsError.message);
      }

      res.status(201).json({
        success: true,
        sale: savedSale,
        buyer: {
          accountId: buyerAccountId,
          purchaseCount: updatedUser.purchaseCount,
          badgesEarned: updatedUser.badgesEarned || 0,
          nextBadgeIn: badgeThreshold - (purchaseCount % badgeThreshold)
        },
        badge: badge ? {
          minted: true,
          badge
        } : {
          minted: false,
          nextIn: badgeThreshold - (purchaseCount % badgeThreshold)
        },
        message: badge ? '🎉 Purchase successful! Badge minted!' : 'Purchase successful!'
      });

    } catch (error) {
      console.error('❌ Purchase failed:', error);
      res.status(500).json({
        error: 'Purchase failed',
        message: error.message
      });
    }
  },

  /**
   * Get all sales
   * GET /api/marketplace/sales
   */
  async getAllSales(req, res) {
    try {
      const { limit = 50, buyer } = req.query;
      let sales = await storageService.getSales();

      if (buyer) {
        sales = sales.filter(s => s.buyer === buyer);
      }

      sales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      sales = sales.slice(0, parseInt(limit));

      const totalRevenue = sales.length * 0.01;

      res.json({
        success: true,
        sales,
        count: sales.length,
        totalRevenue: totalRevenue.toFixed(2)
      });

    } catch (error) {
      console.error('❌ Failed to get sales:', error);
      res.status(500).json({
        error: 'Failed to retrieve sales',
        message: error.message
      });
    }
  },

  /**
   * Get marketplace statistics
   * GET /api/marketplace/stats
   */
  async getMarketplaceStats(req, res) {
    try {
      const sales = await storageService.getSales();
      const users = await storageService.getUsers();

      const stats = {
        totalSales: sales.length,
        totalRevenue: (sales.length * 0.01).toFixed(2),
        pricePerClaim: 0.01,
        activeUsers: users.filter(u => u.purchaseCount > 0).length,
        avgPurchasesPerUser: users.length > 0
          ? (sales.length / users.length).toFixed(2)
          : 0,
        avgConfidence: sales.length > 0
          ? (sales.reduce((sum, s) => sum + s.confidence, 0) / sales.length).toFixed(1)
          : 0
      };

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('❌ Failed to get marketplace stats:', error);
      res.status(500).json({
        error: 'Failed to retrieve stats',
        message: error.message
      });
    }
  }
};

// Helper function
function calculateBadgeTier(purchaseCount) {
  if (purchaseCount >= 50) return 'LEGENDARY';
  if (purchaseCount >= 25) return 'EPIC';
  if (purchaseCount >= 15) return 'RARE';
  if (purchaseCount >= 10) return 'UNCOMMON';
  return 'BRONZE';
}
