import { 
  TokenCreateTransaction, 
  TokenType, 
  TokenSupplyType,
  TokenMintTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  PrivateKey
} from "@hashgraph/sdk";

/**
 * BadgeAgent - Mints NFT badges for truth seekers
 * 
 * This agent:
 * 1. Tracks purchases from TruthAgent
 * 2. Mints "Truth Seeker Badge" NFT after 5 purchases
 * 3. Manages badge collection and rarities
 */
export class BadgeAgent {
  constructor(client, operatorId, operatorKey) {
    this.client = client;
    this.operatorId = operatorId;
    this.operatorKey = operatorKey;
    this.purchaseTracker = new Map(); // accountId -> purchase count
    this.badgeTokenId = null; // Will be set after token creation
    this.mintedBadges = new Map(); // accountId -> [badges]
    this.purchaseThreshold = 5; // Purchases needed for badge
  }

  /**
   * Initialize the badge token (create NFT collection)
   */
  async initializeBadgeToken() {
    console.log('\n🏆 BadgeAgent: Initializing Truth Seeker Badge NFT...');

    try {
      // Check if we already have a token ID from environment
      if (process.env.BADGE_TOKEN_ID) {
        this.badgeTokenId = process.env.BADGE_TOKEN_ID;
        console.log(`✅ Using existing badge token: ${this.badgeTokenId}`);
        return this.badgeTokenId;
      }

      // Create new NFT token
      const privateKey = PrivateKey.fromString(this.operatorKey);
      
      const tokenCreateTx = await new TokenCreateTransaction()
        .setTokenName("Truth Seeker Badge")
        .setTokenSymbol("TRUTH")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setSupplyType(TokenSupplyType.Infinite)
        .setTreasuryAccountId(this.operatorId)
        .setAdminKey(privateKey)
        .setSupplyKey(privateKey)
        .setMaxTransactionFee(20) // 20 HBAR max
        .freezeWith(this.client);

      const signedTx = await tokenCreateTx.sign(privateKey);
      const txResponse = await signedTx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      this.badgeTokenId = receipt.tokenId.toString();
      
      console.log(`✅ Badge Token Created: ${this.badgeTokenId}`);
      console.log(`💡 Add this to your .env: BADGE_TOKEN_ID=${this.badgeTokenId}`);
      
      return this.badgeTokenId;

    } catch (error) {
      console.error('❌ Badge token creation failed:', error.message);
      // For demo purposes, use a mock token ID
      this.badgeTokenId = '0.0.DEMO_BADGE_TOKEN';
      console.log('⚠️  Using demo badge token ID for testing');
      return this.badgeTokenId;
    }
  }

  /**
   * Record a purchase for an account
   * @param {string} accountId - Buyer's account ID
   * @returns {Object} Purchase record with badge minting status
   */
  async recordPurchase(accountId) {
    console.log(`\n🏷️  BadgeAgent: Recording purchase for ${accountId}`);

    // Increment purchase count
    const currentCount = this.purchaseTracker.get(accountId) || 0;
    const newCount = currentCount + 1;
    this.purchaseTracker.set(accountId, newCount);

    console.log(`📊 Purchase count: ${newCount}/${this.purchaseThreshold}`);

    const result = {
      accountId,
      purchaseCount: newCount,
      threshold: this.purchaseThreshold,
      badgeMinted: false,
      badge: null
    };

    // Check if threshold reached
    if (newCount >= this.purchaseThreshold && newCount % this.purchaseThreshold === 0) {
      console.log('🎉 Threshold reached! Minting badge...');
      
      try {
        const badge = await this.mintBadge(accountId, newCount);
        result.badgeMinted = true;
        result.badge = badge;
        
        console.log('✅ Badge minted successfully!');
      } catch (error) {
        console.error('❌ Badge minting failed:', error.message);
        result.error = error.message;
      }
    } else {
      const remaining = this.purchaseThreshold - (newCount % this.purchaseThreshold);
      console.log(`💭 ${remaining} more purchase(s) until next badge`);
    }

    return result;
  }

  /**
   * Mint a Truth Seeker Badge NFT
   * @param {string} accountId - Recipient account ID
   * @param {number} purchaseCount - Total purchases made
   * @returns {Object} Badge details
   */
  async mintBadge(accountId, purchaseCount) {
    console.log(`\n🎨 Minting Truth Seeker Badge for ${accountId}...`);

    // Ensure token is initialized
    if (!this.badgeTokenId) {
      await this.initializeBadgeToken();
    }

    try {
      // Determine badge tier based on purchase count
      const tier = this.calculateBadgeTier(purchaseCount);
      
      // Create metadata for the NFT
      const metadata = {
        name: `Truth Seeker Badge - ${tier}`,
        tier,
        purchaseCount,
        mintedAt: new Date().toISOString(),
        recipient: accountId,
        description: `Awarded for verifying ${purchaseCount} truthful claims on Hedera Mind: Ascension`
      };

      // For production: mint actual NFT
      let serialNumber = null;
      let transactionId = null;

      if (this.badgeTokenId !== '0.0.DEMO_BADGE_TOKEN') {
        try {
          // Convert metadata to bytes
          const metadataBytes = Buffer.from(JSON.stringify(metadata));
          
          const privateKey = PrivateKey.fromString(this.operatorKey);
          
          // Mint NFT
          const mintTx = await new TokenMintTransaction()
            .setTokenId(this.badgeTokenId)
            .setMetadata([metadataBytes])
            .freezeWith(this.client);
          
          const signedMintTx = await mintTx.sign(privateKey);
          const mintResponse = await signedMintTx.execute(this.client);
          const mintReceipt = await mintResponse.getReceipt(this.client);
          
          serialNumber = mintReceipt.serials[0].toString();
          transactionId = mintResponse.transactionId.toString();
          
          console.log(`✅ NFT Minted: Token ${this.badgeTokenId}, Serial #${serialNumber}`);
          
          // TODO: Transfer to recipient (requires token association)
          // For now, it stays in treasury
          
        } catch (mintError) {
          console.error('⚠️  NFT minting failed, using demo badge:', mintError.message);
          serialNumber = `demo_${Date.now()}`;
          transactionId = `demo_tx_${Date.now()}`;
        }
      } else {
        // Demo mode
        serialNumber = `demo_${Date.now()}`;
        transactionId = `demo_tx_${Date.now()}`;
        console.log('⚠️  Demo mode: Badge created without blockchain transaction');
      }

      const badge = {
        tokenId: this.badgeTokenId,
        serialNumber,
        transactionId,
        metadata,
        recipient: accountId,
        mintedAt: metadata.mintedAt
      };

      // Store the minted badge
      if (!this.mintedBadges.has(accountId)) {
        this.mintedBadges.set(accountId, []);
      }
      this.mintedBadges.get(accountId).push(badge);

      console.log(`🏆 Badge created: ${metadata.name} (Serial #${serialNumber})`);

      return badge;

    } catch (error) {
      throw new Error(`Badge minting failed: ${error.message}`);
    }
  }

  /**
   * Calculate badge tier based on purchase count
   * @param {number} purchaseCount - Number of purchases
   * @returns {string} Badge tier
   */
  calculateBadgeTier(purchaseCount) {
    if (purchaseCount >= 50) return 'LEGENDARY';
    if (purchaseCount >= 25) return 'EPIC';
    if (purchaseCount >= 15) return 'RARE';
    if (purchaseCount >= 10) return 'UNCOMMON';
    return 'BRONZE';
  }

  /**
   * Get purchase statistics for an account
   * @param {string} accountId - Account to check
   * @returns {Object} Statistics
   */
  getAccountStats(accountId) {
    const purchaseCount = this.purchaseTracker.get(accountId) || 0;
    const badges = this.mintedBadges.get(accountId) || [];
    const remaining = this.purchaseThreshold - (purchaseCount % this.purchaseThreshold);

    return {
      accountId,
      purchaseCount,
      badgesEarned: badges.length,
      nextBadgeIn: remaining === this.purchaseThreshold ? this.purchaseThreshold : remaining,
      badges,
      currentTier: badges.length > 0 ? badges[badges.length - 1].metadata.tier : 'NONE'
    };
  }

  /**
   * Get all system statistics
   * @returns {Object} Overall statistics
   */
  getSystemStats() {
    const totalAccounts = this.purchaseTracker.size;
    const totalPurchases = Array.from(this.purchaseTracker.values())
      .reduce((sum, count) => sum + count, 0);
    const totalBadges = Array.from(this.mintedBadges.values())
      .reduce((sum, badges) => sum + badges.length, 0);

    return {
      badgeTokenId: this.badgeTokenId,
      totalAccounts,
      totalPurchases,
      totalBadgesMinted: totalBadges,
      purchaseThreshold: this.purchaseThreshold,
      activeUsers: Array.from(this.purchaseTracker.entries())
        .map(([accountId, count]) => ({
          accountId,
          purchases: count,
          badges: (this.mintedBadges.get(accountId) || []).length
        }))
    };
  }
}
