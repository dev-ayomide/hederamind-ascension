import { storageService } from '../../services/storage.service.js';

/**
 * Users Controller - Handles user operations
 */
export const usersController = {
  /**
   * Get user by account ID
   * GET /api/users/:accountId
   */
  async getUserByAccountId(req, res) {
    try {
      const { accountId } = req.params;

      let user = await storageService.getUserByAccountId(accountId);

      if (!user) {
        // Create new user
        user = await storageService.addUser({ accountId });
      }

      // Get user's badges and purchases
      const [badges, purchases] = await Promise.all([
        storageService.getBadgesByUser(accountId),
        storageService.getSalesByBuyer(accountId)
      ]);

      res.json({
        success: true,
        user: {
          ...user,
          badges: badges.length,
          purchases: purchases.length
        }
      });

    } catch (error) {
      console.error('❌ Failed to get user:', error);
      res.status(500).json({
        error: 'Failed to retrieve user',
        message: error.message
      });
    }
  },

  /**
   * Get all users
   * GET /api/users
   */
  async getAllUsers(req, res) {
    try {
      const { limit = 50 } = req.query;
      const users = await storageService.getUsers();

      const sortedUsers = users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, parseInt(limit));

      res.json({
        success: true,
        users: sortedUsers,
        count: sortedUsers.length,
        total: users.length
      });

    } catch (error) {
      console.error('❌ Failed to get users:', error);
      res.status(500).json({
        error: 'Failed to retrieve users',
        message: error.message
      });
    }
  },

  /**
   * Get user dashboard data
   * GET /api/users/:accountId/dashboard
   */
  async getUserDashboard(req, res) {
    try {
      const { accountId } = req.params;

      const [user, badges, purchases] = await Promise.all([
        storageService.getUserByAccountId(accountId),
        storageService.getBadgesByUser(accountId),
        storageService.getSalesByBuyer(accountId)
      ]);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'No user found with this account ID'
        });
      }

      const dashboard = {
        user,
        stats: {
          totalPurchases: purchases.length,
          totalBadges: badges.length,
          totalSpent: (purchases.length * 0.01).toFixed(2),
          nextBadgeIn: 5 - (user.purchaseCount % 5),
          currentTier: badges.length > 0 
            ? badges[badges.length - 1].tier 
            : 'NONE'
        },
        recentPurchases: purchases
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5),
        badges: badges.sort((a, b) => new Date(b.mintedAt) - new Date(a.mintedAt))
      };

      res.json({
        success: true,
        dashboard
      });

    } catch (error) {
      console.error('❌ Failed to get dashboard:', error);
      res.status(500).json({
        error: 'Failed to retrieve dashboard',
        message: error.message
      });
    }
  }
};
