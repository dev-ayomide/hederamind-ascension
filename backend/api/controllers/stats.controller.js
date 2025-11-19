import { storageService } from '../../services/storage.service.js';
import { hederaService } from '../../services/hedera.service.js';
import { aiService } from '../../services/ai.service.js';

/**
 * Stats Controller - Handles system statistics
 */
export const statsController = {
  /**
   * Get overall system statistics
   * GET /api/stats
   */
  async getSystemStats(req, res) {
    try {
      const stats = await storageService.getStats();
      const hederaInfo = hederaService.getOperatorInfo();
      const aiStats = aiService.getStats();

      const systemStats = {
        ...stats,
        hedera: hederaInfo,
        ai: aiStats,
        badgeThreshold: 5,
        pricePerClaim: 0.01
      };

      res.json({
        success: true,
        stats: systemStats
      });

    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      res.status(500).json({
        error: 'Failed to retrieve stats',
        message: error.message
      });
    }
  },

  /**
   * Get leaderboard
   * GET /api/stats/leaderboard
   */
  async getLeaderboard(req, res) {
    try {
      const { limit = 10 } = req.query;
      const leaderboard = await storageService.getLeaderboard(parseInt(limit));

      res.json({
        success: true,
        leaderboard,
        count: leaderboard.length
      });

    } catch (error) {
      console.error('❌ Failed to get leaderboard:', error);
      res.status(500).json({
        error: 'Failed to retrieve leaderboard',
        message: error.message
      });
    }
  },

  /**
   * Get real-time activity feed
   * GET /api/stats/activity
   */
  async getActivity(req, res) {
    try {
      const { limit = 20 } = req.query;

      const [claims, sales, badges] = await Promise.all([
        storageService.getClaims(),
        storageService.getSales(),
        storageService.getBadges()
      ]);

      // Combine and sort all activities
      const activities = [
        ...claims.map(c => ({
          type: 'claim_verified',
          data: c,
          timestamp: c.timestamp
        })),
        ...sales.map(s => ({
          type: 'claim_purchased',
          data: s,
          timestamp: s.timestamp
        })),
        ...badges.map(b => ({
          type: 'badge_minted',
          data: b,
          timestamp: b.mintedAt
        }))
      ];

      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, parseInt(limit));

      res.json({
        success: true,
        activities: sortedActivities,
        count: sortedActivities.length
      });

    } catch (error) {
      console.error('❌ Failed to get activity:', error);
      res.status(500).json({
        error: 'Failed to retrieve activity',
        message: error.message
      });
    }
  },

  /**
   * Get analytics data
   * GET /api/stats/analytics
   */
  async getAnalytics(req, res) {
    try {
      const [claims, sales, users, badges] = await Promise.all([
        storageService.getClaims(),
        storageService.getSales(),
        storageService.getUsers(),
        storageService.getBadges()
      ]);

      // Calculate analytics
      const analytics = {
        overview: {
          totalClaims: claims.length,
          totalSales: sales.length,
          totalUsers: users.length,
          totalBadges: badges.length,
          totalRevenue: (sales.length * 0.01).toFixed(2)
        },
        verdicts: {
          true: claims.filter(c => c.verdict === 'TRUE').length,
          false: claims.filter(c => c.verdict === 'FALSE').length,
          uncertain: claims.filter(c => c.verdict === 'UNCERTAIN').length
        },
        confidence: {
          high: claims.filter(c => c.confidence >= 85).length,
          medium: claims.filter(c => c.confidence >= 70 && c.confidence < 85).length,
          low: claims.filter(c => c.confidence < 70).length,
          average: claims.length > 0
            ? (claims.reduce((sum, c) => sum + c.confidence, 0) / claims.length).toFixed(1)
            : 0
        },
        tiers: badges.reduce((acc, b) => {
          acc[b.tier] = (acc[b.tier] || 0) + 1;
          return acc;
        }, {}),
        growth: {
          dailyUsers: calculateDailyGrowth(users),
          dailyClaims: calculateDailyGrowth(claims),
          dailySales: calculateDailyGrowth(sales)
        }
      };

      res.json({
        success: true,
        analytics
      });

    } catch (error) {
      console.error('❌ Failed to get analytics:', error);
      res.status(500).json({
        error: 'Failed to retrieve analytics',
        message: error.message
      });
    }
  }
};

// Helper function to calculate daily growth
function calculateDailyGrowth(items) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayItems = items.filter(item => {
    const itemDate = new Date(item.timestamp || item.createdAt || item.mintedAt);
    return itemDate >= today;
  });

  return todayItems.length;
}
