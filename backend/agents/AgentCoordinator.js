import EventEmitter from 'events';

/**
 * AgentCoordinator - Manages communication between TruthAgent and BadgeAgent
 * 
 * This creates an autonomous agent-to-agent (A2A) marketplace where:
 * - TruthAgent sells verified claims
 * - BadgeAgent listens for sales and tracks purchases
 * - Automatic badge minting when thresholds are reached
 */
export class AgentCoordinator extends EventEmitter {
  constructor(truthAgent, badgeAgent) {
    super();
    this.truthAgent = truthAgent;
    this.badgeAgent = badgeAgent;
    this.setupListeners();
  }

  /**
   * Setup event listeners for agent communication
   */
  setupListeners() {
    console.log('🔗 AgentCoordinator: Setting up agent communication...');
    
    // Listen for claim sales from TruthAgent
    this.on('claimSold', async (saleData) => {
      console.log('\n📡 AgentCoordinator: Claim sale detected!');
      console.log(`   Buyer: ${saleData.buyer}`);
      console.log(`   Price: ${saleData.price} HBAR`);
      
      // Notify BadgeAgent to record the purchase
      try {
        const purchaseResult = await this.badgeAgent.recordPurchase(saleData.buyer);
        
        if (purchaseResult.badgeMinted) {
          console.log('🎉 AgentCoordinator: Badge minting triggered!');
          this.emit('badgeMinted', {
            accountId: saleData.buyer,
            badge: purchaseResult.badge
          });
        }
        
        this.emit('purchaseRecorded', purchaseResult);
      } catch (error) {
        console.error('❌ AgentCoordinator: Purchase recording failed:', error.message);
        this.emit('error', error);
      }
    });

    console.log('✅ AgentCoordinator: Listeners configured');
  }

  /**
   * Process a claim sale (coordinates both agents)
   * @param {string} claim - The claim to verify and sell
   * @param {string} buyerAccountId - Buyer's account ID
   * @returns {Object} Complete transaction result
   */
  async processSale(claim, buyerAccountId) {
    console.log('\n🚀 AgentCoordinator: Processing coordinated sale...');
    console.log(`   Claim: "${claim}"`);
    console.log(`   Buyer: ${buyerAccountId}`);

    try {
      // Step 1: TruthAgent verifies and sells the claim
      const saleData = await this.truthAgent.sellVerifiedClaim(claim, buyerAccountId);
      
      if (!saleData) {
        return {
          success: false,
          reason: 'Claim verification failed or claim is FALSE',
          claim
        };
      }

      // Step 2: Emit event for BadgeAgent (automatic coordination)
      this.emit('claimSold', saleData);

      // Wait a moment for badge processing
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Get updated buyer stats
      const buyerStats = this.badgeAgent.getAccountStats(buyerAccountId);

      return {
        success: true,
        sale: saleData,
        buyerStats,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ AgentCoordinator: Sale processing failed:', error.message);
      return {
        success: false,
        error: error.message,
        claim
      };
    }
  }

  /**
   * Get combined statistics from both agents
   * @returns {Object} Complete system statistics
   */
  getMarketplaceStats() {
    const truthStats = this.truthAgent.getStats();
    const badgeStats = this.badgeAgent.getSystemStats();

    return {
      marketplace: {
        totalSales: truthStats.totalSales,
        totalRevenue: truthStats.totalRevenue,
        pricePerClaim: truthStats.pricePerClaim,
        averageConfidence: truthStats.averageConfidence
      },
      badges: {
        tokenId: badgeStats.badgeTokenId,
        totalBadgesMinted: badgeStats.totalBadgesMinted,
        totalAccounts: badgeStats.totalAccounts,
        totalPurchases: badgeStats.totalPurchases,
        purchaseThreshold: badgeStats.purchaseThreshold
      },
      system: {
        isOperational: true,
        agentsConnected: ['TruthAgent', 'BadgeAgent'],
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Display marketplace dashboard
   */
  displayDashboard() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 HEDERA MIND: ASCENSION - AGENT MARKETPLACE');
    console.log('='.repeat(60));

    const stats = this.getMarketplaceStats();

    console.log('\n📊 MARKETPLACE STATS:');
    console.log(`   Total Sales: ${stats.marketplace.totalSales}`);
    console.log(`   Revenue: ${stats.marketplace.totalRevenue.toFixed(2)} HBAR`);
    console.log(`   Price per Claim: ${stats.marketplace.pricePerClaim} HBAR`);
    console.log(`   Avg Confidence: ${stats.marketplace.averageConfidence.toFixed(1)}%`);

    console.log('\n🏆 BADGE SYSTEM:');
    console.log(`   Badge Token: ${stats.badges.tokenId || 'Not initialized'}`);
    console.log(`   Total Badges Minted: ${stats.badges.totalBadgesMinted}`);
    console.log(`   Active Accounts: ${stats.badges.totalAccounts}`);
    console.log(`   Total Purchases: ${stats.badges.totalPurchases}`);
    console.log(`   Badge Threshold: ${stats.badges.purchaseThreshold} purchases`);

    console.log('\n🤖 AGENT STATUS:');
    console.log(`   ${stats.system.agentsConnected.join(' ✓ ')}`);
    console.log(`   Status: ${stats.system.isOperational ? '✅ OPERATIONAL' : '❌ ERROR'}`);

    console.log('\n' + '='.repeat(60));
  }
}
