import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Storage Service - Handles all data persistence
 */
class StorageService {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.claimsFile = path.join(this.dataDir, 'claims.json');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.salesFile = path.join(this.dataDir, 'sales.json');
    this.badgesFile = path.join(this.dataDir, 'badges.json');
  }

  /**
   * Initialize storage directories
   */
  async initialize() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Initialize files if they don't exist
      const files = [
        { path: this.claimsFile, data: [] },
        { path: this.usersFile, data: [] },
        { path: this.salesFile, data: [] },
        { path: this.badgesFile, data: [] }
      ];

      for (const file of files) {
        try {
          await fs.access(file.path);
        } catch {
          await fs.writeFile(file.path, JSON.stringify(file.data, null, 2));
        }
      }

      console.log('✅ Storage service initialized');
    } catch (error) {
      console.error('❌ Storage initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Generic read function
   */
  async readFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Generic write function
   */
  async writeFile(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  // Claims operations
  async getClaims() {
    return this.readFile(this.claimsFile);
  }

  async addClaim(claim) {
    const claims = await this.getClaims();
    claims.push({
      ...claim,
      id: claim.id || this.generateId('claim'),
      timestamp: claim.timestamp || new Date().toISOString()
    });
    await this.writeFile(this.claimsFile, claims);
    return claims[claims.length - 1];
  }

  async getClaimById(id) {
    const claims = await this.getClaims();
    return claims.find(c => c.id === id);
  }

  // Users operations
  async getUsers() {
    return this.readFile(this.usersFile);
  }

  async addUser(user) {
    const users = await this.getUsers();
    const existingUser = users.find(u => u.accountId === user.accountId);
    
    if (existingUser) {
      return existingUser;
    }

    const newUser = {
      ...user,
      id: this.generateId('user'),
      createdAt: new Date().toISOString(),
      purchaseCount: 0,
      badgesEarned: 0
    };

    users.push(newUser);
    await this.writeFile(this.usersFile, users);
    return newUser;
  }

  async getUserByAccountId(accountId) {
    const users = await this.getUsers();
    return users.find(u => u.accountId === accountId);
  }

  async updateUser(accountId, updates) {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.accountId === accountId);
    
    if (index === -1) {
      throw new Error('User not found');
    }

    users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
    await this.writeFile(this.usersFile, users);
    return users[index];
  }

  // Sales operations
  async getSales() {
    return this.readFile(this.salesFile);
  }

  async addSale(sale) {
    const sales = await this.getSales();
    sales.push({
      ...sale,
      id: sale.id || this.generateId('sale'),
      timestamp: sale.timestamp || new Date().toISOString()
    });
    await this.writeFile(this.salesFile, sales);
    return sales[sales.length - 1];
  }

  async getSalesByBuyer(buyerAccountId) {
    const sales = await this.getSales();
    return sales.filter(s => s.buyer === buyerAccountId);
  }

  // Badges operations
  async getBadges() {
    return this.readFile(this.badgesFile);
  }

  async addBadge(badge) {
    const badges = await this.getBadges();
    badges.push({
      ...badge,
      id: badge.id || this.generateId('badge'),
      mintedAt: badge.mintedAt || new Date().toISOString()
    });
    await this.writeFile(this.badgesFile, badges);
    return badges[badges.length - 1];
  }

  async getBadgesByUser(accountId) {
    const badges = await this.getBadges();
    return badges.filter(b => b.recipient === accountId);
  }

  // Statistics
  async getStats() {
    const [claims, users, sales, badges] = await Promise.all([
      this.getClaims(),
      this.getUsers(),
      this.getSales(),
      this.getBadges()
    ]);

    const trueClaims = claims.filter(c => c.verdict === 'TRUE' || c.status === 'TRUE');
    const falseClaims = claims.filter(c => c.verdict === 'FALSE' || c.status === 'FALSE');

    return {
      totalClaims: claims.length,
      trueClaims: trueClaims.length,
      falseClaims: falseClaims.length,
      totalUsers: users.length,
      totalSales: sales.length,
      totalBadges: badges.length,
      totalRevenue: (sales.length * 0.01).toFixed(2),
      avgConfidence: claims.length > 0
        ? (claims.reduce((sum, c) => sum + (c.confidence || 0), 0) / claims.length).toFixed(1)
        : 0,
      timestamp: new Date().toISOString()
    };
  }

  // Leaderboard
  async getLeaderboard(limit = 10) {
    const users = await this.getUsers();
    return users
      .sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0))
      .slice(0, limit)
      .map(u => ({
        accountId: u.accountId,
        purchaseCount: u.purchaseCount || 0,
        badgesEarned: u.badgesEarned || 0,
        createdAt: u.createdAt
      }));
  }

  // Utilities
  generateId(prefix) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`;
  }

  // Clear all data (for testing)
  async clearAllData() {
    await Promise.all([
      this.writeFile(this.claimsFile, []),
      this.writeFile(this.usersFile, []),
      this.writeFile(this.salesFile, []),
      this.writeFile(this.badgesFile, [])
    ]);
    console.log('🗑️  All data cleared');
  }
}

// Export singleton instance
export const storageService = new StorageService();
