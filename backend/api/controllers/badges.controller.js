import { storageService } from '../../services/storage.service.js';

/**
 * Badges Controller - Handles NFT badge operations
 */
export const badgesController = {
  /**
   * Get badges for a user
   * GET /api/badges/:accountId
   */
  async getUserBadges(req, res) {
    try {
      const { accountId } = req.params;

      const badges = await storageService.getBadgesByUser(accountId);

      res.json({
        success: true,
        accountId,
        badges,
        count: badges.length
      });

    } catch (error) {
      console.error('❌ Failed to get badges:', error);
      res.status(500).json({
        error: 'Failed to retrieve badges',
        message: error.message
      });
    }
  },

  /**
   * Get all badges
   * GET /api/badges
   */
  async getAllBadges(req, res) {
    try {
      const { limit = 50 } = req.query;
      const badges = await storageService.getBadges();

      const sortedBadges = badges
        .sort((a, b) => new Date(b.mintedAt) - new Date(a.mintedAt))
        .slice(0, parseInt(limit));

      res.json({
        success: true,
        badges: sortedBadges,
        count: sortedBadges.length,
        total: badges.length
      });

    } catch (error) {
      console.error('❌ Failed to get all badges:', error);
      res.status(500).json({
        error: 'Failed to retrieve badges',
        message: error.message
      });
    }
  },

  /**
   * Get badge statistics
   * GET /api/badges/stats
   */
  async getBadgeStats(req, res) {
    try {
      const badges = await storageService.getBadges();

      const tierCounts = badges.reduce((acc, badge) => {
        const tier = badge.tier || 'BRONZE';
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {});

      const stats = {
        totalBadges: badges.length,
        tierDistribution: tierCounts,
        latestBadge: badges.length > 0 
          ? badges.sort((a, b) => new Date(b.mintedAt) - new Date(a.mintedAt))[0]
          : null
      };

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('❌ Failed to get badge stats:', error);
      res.status(500).json({
        error: 'Failed to retrieve badge stats',
        message: error.message
      });
    }
  }
};
