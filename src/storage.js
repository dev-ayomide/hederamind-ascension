import fs from 'fs/promises';
import path from 'path';

const CLAIMS_FILE = path.join(process.cwd(), 'claims_log.json');

/**
 * Storage utilities for managing claims data
 */
export class ClaimsStorage {
  /**
   * Load existing claims from the JSON file
   * @returns {Array} Array of claims
   */
  static async loadClaims() {
    try {
      const data = await fs.readFile(CLAIMS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty array
        return [];
      }
      throw new Error(`Failed to load claims: ${error.message}`);
    }
  }

  /**
   * Save claims array to the JSON file
   * @param {Array} claims - Array of claims to save
   */
  static async saveClaims(claims) {
    try {
      await fs.writeFile(CLAIMS_FILE, JSON.stringify(claims, null, 2), 'utf8');
      console.log(`💾 Claims saved to ${CLAIMS_FILE}`);
    } catch (error) {
      throw new Error(`Failed to save claims: ${error.message}`);
    }
  }

  /**
   * Add a new claim to storage
   * @param {Object} claim - The claim object to add
   */
  static async addClaim(claim) {
    const claims = await this.loadClaims();
    claims.push(claim);
    await this.saveClaims(claims);
    console.log(`✅ Added claim with ID: ${claim.id}`);
  }

  /**
   * Generate a unique claim ID
   * @returns {string} Unique claim ID
   */
  static generateClaimId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `claim_${timestamp}_${random}`;
  }

  /**
   * Find claims by status
   * @param {string} status - Status to filter by (TRUE, FALSE, PENDING, etc.)
   * @returns {Array} Filtered claims
   */
  static async getClaimsByStatus(status) {
    const claims = await this.loadClaims();
    return claims.filter(claim => claim.status === status);
  }

  /**
   * Get the latest N claims
   * @param {number} count - Number of claims to retrieve
   * @returns {Array} Latest claims
   */
  static async getLatestClaims(count = 10) {
    const claims = await this.loadClaims();
    return claims
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, count);
  }

  /**
   * Get claims statistics
   * @returns {Object} Statistics about claims
   */
  static async getClaimsStats() {
    const claims = await this.loadClaims();
    const total = claims.length;
    const verified = claims.filter(c => c.status === 'TRUE').length;
    const false_claims = claims.filter(c => c.status === 'FALSE').length;
    const pending = claims.filter(c => c.status === 'PENDING').length;

    return {
      total,
      verified,
      false: false_claims,
      pending,
      accuracy: total > 0 ? ((verified / total) * 100).toFixed(2) : 0
    };
  }
}
