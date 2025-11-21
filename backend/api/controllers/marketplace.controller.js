import { storageService } from '../../services/storage.service.js';
import { hederaService } from '../../services/hedera.service.js';
import { aiService } from '../../services/ai.service.js';
import { agentRegistryService } from '../../services/agentRegistry.service.js';
import { badgeService } from '../../services/badge.service.js';

const BADGE_IMAGE_MAP = {
  BRONZE: process.env.BADGE_BRONZE_IPFS_URL,
  UNCOMMON: process.env.BADGE_UNCOMMON_IPFS_URL,
  RARE: process.env.BADGE_RARE_IPFS_URL,
  EPIC: process.env.BADGE_EPIC_IPFS_URL,
  LEGENDARY: process.env.BADGE_LEGENDARY_IPFS_URL
};

function getBadgeImage(tier) {
  return BADGE_IMAGE_MAP[tier] || null;
}

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
      const { claim, buyerAccountId, transactionId } = req.body;

      if (!claim || !buyerAccountId) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Claim and buyerAccountId are required'
        });
      }

      if (!transactionId || typeof transactionId !== 'string') {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'transactionId is required from wallet payment'
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

      const agentId = process.env.TRUTH_AGENT_ID || 'truth-agent';
      let agentProof = null;

      if (agentRegistryService.isEnabled()) {
        agentProof = await agentRegistryService.getAgentProof(agentId);

        if (agentProof?.error) {
          return res.status(503).json({
            success: false,
            error: 'Agent unavailable',
            message: `TruthAgent proof unavailable: ${agentProof.error}`
          });
        }

        if (!agentProof.active) {
          return res.status(503).json({
            success: false,
            error: 'Agent inactive',
            message: 'TruthAgent is not active on-chain'
          });
        }
      }

      // Step 1: Check if claim already exists (to get original submitter)
      const existingClaims = await storageService.getClaims();
      const existingClaim = existingClaims.find(c => c.claim === claim && c.verdict === 'TRUE');
      
      // Determine seller: original submitter if exists, otherwise TruthAgent
      const sellerAccountId = existingClaim?.submittedBy && existingClaim.submittedBy !== 'anonymous'
        ? existingClaim.submittedBy
        : hederaService.operatorId; // TruthAgent as fallback

      // Step 2: Verify the claim (or use existing verification)
      let verification;
      if (existingClaim) {
        // Use existing verification
        verification = {
          verdict: existingClaim.verdict,
          confidence: existingClaim.confidence,
          reasoning: existingClaim.reasoning,
          verifier: existingClaim.verifier
        };
      } else {
        // New verification
        verification = await aiService.verifyClaim(claim);
      }

      // Step 3: Only sell TRUE claims
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

      // Step 4: Create sale record
      const saleData = {
        claim,
        verdict: verification.verdict,
        confidence: verification.confidence,
        reasoning: verification.reasoning,
        buyer: buyerAccountId,
        seller: sellerAccountId, // Original submitter or TruthAgent
        submittedBy: existingClaim?.submittedBy || 'truth-agent', // Track original submitter
        price: 0.01,
        transactionId,
        agent: {
          id: agentId,
          proof: agentProof
        }
      };

      const savedSale = await storageService.addSale(saleData);

      // Step 5: Revenue sharing (if submitter exists and is not TruthAgent)
      const revenueDistribution = {
        submitter: null,
        truthAgent: null,
        platform: null,
        total: 0.01
      };

      if (sellerAccountId && sellerAccountId !== hederaService.operatorId && existingClaim?.submittedBy && existingClaim.submittedBy !== 'anonymous' && existingClaim.submittedBy !== 'truth-agent') {
        try {
          // Calculate revenue split: 70% submitter, 20% TruthAgent, 10% platform
          // Use Math.round to avoid decimal precision issues with tinybars
          const totalTinybars = 1000000; // 0.01 HBAR = 1,000,000 tinybars
          const submitterTinybars = Math.round(totalTinybars * 0.70); // 700,000 tinybars = 0.007 HBAR
          const truthAgentTinybars = Math.round(totalTinybars * 0.20); // 200,000 tinybars = 0.002 HBAR
          const platformTinybars = totalTinybars - submitterTinybars - truthAgentTinybars; // 100,000 tinybars = 0.001 HBAR
          
          // Convert back to HBAR for display
          const submitterShare = submitterTinybars / 100000000; // Convert tinybars to HBAR
          const truthAgentShare = truthAgentTinybars / 100000000;
          const platformShare = platformTinybars / 100000000;

          // Transfer to submitter using tinybars to avoid decimal issues
          const transferResult = await hederaService.transferHbarTinybars(sellerAccountId, submitterTinybars);
          revenueDistribution.submitter = {
            accountId: sellerAccountId,
            amount: submitterShare,
            transactionId: transferResult.transactionId
          };
          
          revenueDistribution.truthAgent = {
            accountId: hederaService.operatorId,
            amount: truthAgentShare,
            note: 'Retained in treasury'
          };
          
          revenueDistribution.platform = {
            amount: platformShare,
            note: 'Retained in treasury'
          };

          console.log(`💰 Revenue shared: ${submitterShare} HBAR (${submitterTinybars} tinybars) to ${sellerAccountId}`);
        } catch (transferError) {
          console.error('⚠️  Revenue sharing failed:', transferError.message);
          // Continue anyway - sale is still valid
          revenueDistribution.error = transferError.message;
        }
      } else {
        // TruthAgent-generated claim - all revenue to treasury
        revenueDistribution.truthAgent = {
          accountId: hederaService.operatorId,
          amount: 0.01,
          note: 'TruthAgent-generated claim'
        };
      }

      // Step 6: Update or create user
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
        const tier = calculateBadgeTier(purchaseCount);
        const badgeImage = getBadgeImage(tier);

        // Try to mint real NFT badge
        try {
          const mintedBadge = await badgeService.mintBadge(buyerAccountId, purchaseCount);
          
          if (mintedBadge) {
            // Real NFT was minted
            badge = {
              recipient: buyerAccountId,
              tier,
              purchaseCount,
              tokenId: mintedBadge.tokenId,
              serialNumber: mintedBadge.serialNumber,
              transactionId: mintedBadge.transactionId,
              metadata: {
                ...mintedBadge.metadata,
                image: mintedBadge.metadata?.image || badgeImage
              },
              mintedAt: mintedBadge.mintedAt
            };
            console.log(`✅ Real NFT badge minted: ${badge.tokenId} #${badge.serialNumber}`);
          } else {
            // Fallback to demo badge if minting failed
            badge = {
              recipient: buyerAccountId,
              tier,
              purchaseCount,
              tokenId: process.env.BADGE_TOKEN_ID || '0.0.DEMO_BADGE',
              serialNumber: `${Date.now()}`,
              metadata: {
                name: `Truth Seeker Badge - ${tier}`,
                description: `Earned after ${purchaseCount} verified claim purchases`,
                image: badgeImage
              }
            };
            console.log(`⚠️  Using demo badge (NFT minting unavailable)`);
          }
        } catch (mintError) {
          console.error('❌ Badge minting error:', mintError.message);
          // Fallback to demo badge
          badge = {
            recipient: buyerAccountId,
            tier,
            purchaseCount,
            tokenId: process.env.BADGE_TOKEN_ID || '0.0.DEMO_BADGE',
            serialNumber: `${Date.now()}`,
            metadata: {
              name: `Truth Seeker Badge - ${tier}`,
              description: `Earned after ${purchaseCount} verified claim purchases`,
              image: badgeImage
            }
          };
        }

        // Save badge to storage
        await storageService.addBadge(badge);
        
        // Update user badge count
        await storageService.updateUser(buyerAccountId, {
          badgesEarned: (user.badgesEarned || 0) + 1
        });

        console.log(`🏆 Badge recorded for ${buyerAccountId}!`);
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
        agentProof,
        revenue: revenueDistribution, // Add revenue distribution info
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
