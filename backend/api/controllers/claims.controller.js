import { aiService } from '../../services/ai.service.js';
import { hederaService } from '../../services/hedera.service.js';
import { storageService } from '../../services/storage.service.js';

/**
 * Claims Controller - Handles claim verification operations
 */
export const claimsController = {
  /**
   * Verify a new claim
   * POST /api/claims/verify
   */
  async verifyClaim(req, res) {
    try {
      const { claim, accountId } = req.body;

      if (!claim || typeof claim !== 'string') {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Claim text is required'
        });
      }

      if (claim.length < 10) {
        return res.status(400).json({
          error: 'Invalid claim',
          message: 'Claim must be at least 10 characters long'
        });
      }

      console.log(`🔍 Verifying claim: "${claim}"`);

      // Step 1: Verify with AI
      const verification = await aiService.verifyClaim(claim);

      // Step 2: Create claim record
      const claimData = {
        claim,
        verdict: verification.verdict,
        confidence: verification.confidence,
        reasoning: verification.reasoning,
        verifier: verification.verifier,
        submittedBy: accountId || 'anonymous',
        status: 'verified'
      };

      // Step 3: Save to storage
      const savedClaim = await storageService.addClaim(claimData);

      // Step 4: Submit to Hedera HCS
      let hederaResult = null;
      try {
        hederaResult = await hederaService.submitToHCS({
          type: 'ClaimVerification',
          claimId: savedClaim.id,
          claim: savedClaim.claim,
          verdict: savedClaim.verdict,
          confidence: savedClaim.confidence,
          timestamp: savedClaim.timestamp
        });
      } catch (hcsError) {
        console.error('⚠️  HCS submission failed:', hcsError.message);
        // Continue anyway - claim is still verified
      }

      res.status(201).json({
        success: true,
        claim: savedClaim,
        hedera: hederaResult,
        message: 'Claim verified successfully'
      });

    } catch (error) {
      console.error('❌ Claim verification failed:', error);
      res.status(500).json({
        error: 'Verification failed',
        message: error.message
      });
    }
  },

  /**
   * Get all claims
   * GET /api/claims
   */
  async getAllClaims(req, res) {
    try {
      const { limit = 50, offset = 0, verdict } = req.query;

      let claims = await storageService.getClaims();

      // Filter by verdict if specified
      if (verdict) {
        claims = claims.filter(c => c.verdict === verdict.toUpperCase());
      }

      // Sort by timestamp (newest first)
      claims.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Pagination
      const total = claims.length;
      const paginatedClaims = claims.slice(
        parseInt(offset),
        parseInt(offset) + parseInt(limit)
      );

      res.json({
        success: true,
        claims: paginatedClaims,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      });

    } catch (error) {
      console.error('❌ Failed to get claims:', error);
      res.status(500).json({
        error: 'Failed to retrieve claims',
        message: error.message
      });
    }
  },

  /**
   * Get claim by ID
   * GET /api/claims/:id
   */
  async getClaimById(req, res) {
    try {
      const { id } = req.params;
      const claim = await storageService.getClaimById(id);

      if (!claim) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Claim not found'
        });
      }

      res.json({
        success: true,
        claim
      });

    } catch (error) {
      console.error('❌ Failed to get claim:', error);
      res.status(500).json({
        error: 'Failed to retrieve claim',
        message: error.message
      });
    }
  },

  /**
   * Get recent claims
   * GET /api/claims/recent
   */
  async getRecentClaims(req, res) {
    try {
      const { limit = 10 } = req.query;
      const claims = await storageService.getClaims();

      const recentClaims = claims
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, parseInt(limit));

      res.json({
        success: true,
        claims: recentClaims,
        count: recentClaims.length
      });

    } catch (error) {
      console.error('❌ Failed to get recent claims:', error);
      res.status(500).json({
        error: 'Failed to retrieve recent claims',
        message: error.message
      });
    }
  }
};
