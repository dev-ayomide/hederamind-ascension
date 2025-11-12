import { Client, TopicMessageSubmitTransaction, PrivateKey } from "@hashgraph/sdk";
import { ClaimVerifier } from './verifyClaim.js';
import { ClaimsStorage } from './storage.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * HederaMind - Main orchestrator for the trust verification system
 */
export class HederaMind {
  constructor() {
    this.operatorId = process.env.OPERATOR_ID;
    this.operatorKey = process.env.OPERATOR_KEY;
    this.topicId = process.env.TOPIC_ID;
    this.client = null;
  }

  /**
   * Initialize Hedera client
   */
  async initialize() {
    if (!this.operatorId || !this.operatorKey || !this.topicId) {
      throw new Error("Missing OPERATOR_ID, OPERATOR_KEY, or TOPIC_ID in .env file");
    }

    try {
      const privateKey = PrivateKey.fromString(this.operatorKey);
      this.client = Client.forTestnet().setOperator(this.operatorId, privateKey);
      console.log('🔗 Connected to Hedera Testnet');
      console.log(`📡 Using Topic ID: ${this.topicId}`);
    } catch (error) {
      throw new Error(`Failed to initialize Hedera client: ${error.message}`);
    }
  }

  /**
   * Process a claim: verify it and submit to Hedera
   * @param {string} claimText - The claim to process
   * @param {Object} options - Processing options
   * @returns {Object} Processing result
   */
  async processClaim(claimText, options = {}) {
    const {
      saveLocally = true,
      submitToHedera = true,
      verificationOptions = {}
    } = options;

    console.log(`\n🚀 Processing claim: "${claimText}"`);
    console.log('='.repeat(50));

    try {
      // Step 1: Verify the claim
      console.log('\n📋 Step 1: Verifying claim...');
      const verifiedClaim = await ClaimVerifier.createVerifiedClaim(claimText, verificationOptions);
      
      console.log(`✅ Verification complete:`);
      console.log(`   Status: ${verifiedClaim.status}`);
      console.log(`   Confidence: ${verifiedClaim.confidence}%`);
      console.log(`   Verifier: ${verifiedClaim.verifier}`);

      // Step 2: Save locally (optional)
      if (saveLocally) {
        console.log('\n💾 Step 2: Saving to local storage...');
        await ClaimsStorage.addClaim(verifiedClaim);
      }

      // Step 3: Submit to Hedera (optional)
      let hederaResult = null;
      if (submitToHedera) {
        console.log('\n🌐 Step 3: Submitting to Hedera...');
        hederaResult = await this.submitToHedera(verifiedClaim);
      }

      const result = {
        success: true,
        claim: verifiedClaim,
        hedera: hederaResult,
        timestamp: new Date().toISOString()
      };

      console.log('\n🎉 Processing complete!');
      return result;

    } catch (error) {
      console.error(`❌ Processing failed: ${error.message}`);
      
      const result = {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      return result;
    }
  }

  /**
   * Submit verified claim to Hedera Consensus Service
   * @param {Object} verifiedClaim - The verified claim object
   * @returns {Object} Submission result
   */
  async submitToHedera(verifiedClaim) {
    if (!this.client) {
      await this.initialize();
    }

    try {
      // Prepare message for Hedera
      const hederaMessage = {
        type: "TrustVerification",
        id: verifiedClaim.id,
        claim: verifiedClaim.claim,
        status: verifiedClaim.status,
        confidence: verifiedClaim.confidence,
        verifier: verifiedClaim.verifier,
        reasoning: verifiedClaim.reasoning,
        timestamp: verifiedClaim.timestamp,
        submittedAt: new Date().toISOString()
      };

      const messageString = JSON.stringify(hederaMessage);

      // Submit to Hedera
      const sendTx = await new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId)
        .setMessage(messageString)
        .execute(this.client);

      const receipt = await sendTx.getReceipt(this.client);

      const result = {
        success: true,
        transactionId: sendTx.transactionId.toString(),
        topicId: this.topicId,
        status: receipt.status.toString(),
        timestamp: new Date().toISOString()
      };

      console.log(`✅ Submitted to Hedera topic ${this.topicId}`);
      console.log(`📄 Transaction ID: ${result.transactionId}`);
      console.log(`📊 Status: ${result.status}`);

      return result;

    } catch (error) {
      throw new Error(`Hedera submission failed: ${error.message}`);
    }
  }

  /**
   * Process multiple claims in batch
   * @param {Array} claims - Array of claim strings
   * @param {Object} options - Processing options
   * @returns {Array} Array of processing results
   */
  async processClaimsBatch(claims, options = {}) {
    console.log(`\n🔄 Processing ${claims.length} claims in batch...`);
    
    const results = [];
    for (let i = 0; i < claims.length; i++) {
      console.log(`\n[${i + 1}/${claims.length}] Processing: "${claims[i]}"`);
      const result = await this.processClaim(claims[i], options);
      results.push(result);
      
      // Small delay between submissions to avoid rate limits
      if (i < claims.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n📊 Batch processing complete: ${results.filter(r => r.success).length}/${results.length} successful`);
    return results;
  }

  /**
   * Get system statistics
   * @returns {Object} System statistics
   */
  async getSystemStats() {
    const claimsStats = await ClaimsStorage.getClaimsStats();
    
    return {
      ...claimsStats,
      operatorId: this.operatorId,
      topicId: this.topicId,
      systemTime: new Date().toISOString()
    };
  }

  /**
   * Display system dashboard
   */
  async showDashboard() {
    console.log('\n🎛️  HederaMind Dashboard');
    console.log('='.repeat(40));
    
    const stats = await this.getSystemStats();
    
    console.log(`📊 Total Claims: ${stats.total}`);
    console.log(`✅ Verified (TRUE): ${stats.verified}`);
    console.log(`❌ False Claims: ${stats.false}`);
    console.log(`⏳ Pending: ${stats.pending}`);
    console.log(`🎯 Accuracy: ${stats.accuracy}%`);
    console.log(`🔗 Hedera Topic: ${stats.topicId}`);
    console.log(`⏰ System Time: ${stats.systemTime}`);
    
    const latestClaims = await ClaimsStorage.getLatestClaims(3);
    if (latestClaims.length > 0) {
      console.log('\n📋 Latest Claims:');
      latestClaims.forEach((claim, i) => {
        console.log(`  ${i + 1}. [${claim.status}] ${claim.claim.substring(0, 50)}${claim.claim.length > 50 ? '...' : ''}`);
      });
    }
  }
}

// CLI interface for standalone usage
if (import.meta.url === new URL(process.argv[1], 'file:').href || process.argv[1]?.endsWith('main.js')) {
  const command = process.argv[2];
  const claimText = process.argv[3];

  const hederaMind = new HederaMind();

  try {
    if (command === 'process' && claimText) {
      // Process a single claim
      console.log('🚀 HederaMind - Truth Verification System\n');
      const result = await hederaMind.processClaim(claimText);
      
      if (result.success) {
        console.log('\n🎉 Success! Claim processed and logged to Hedera.');
      } else {
        console.log('\n❌ Failed to process claim.');
        process.exit(1);
      }
      
    } else if (command === 'stats') {
      // Show statistics
      await hederaMind.showDashboard();
      
    } else if (command === 'batch') {
      // Process sample batch
      const sampleClaims = [
        "The sky is blue during the day",
        "Water freezes at 0°C",
        "The Earth is flat",
        "AI will replace all human jobs by 2025"
      ];
      
      console.log('🚀 HederaMind - Batch Processing\n');
      await hederaMind.processClaimsBatch(sampleClaims);
      
    } else {
      console.log('🚀 HederaMind - Usage:');
      console.log('  node main.js process "Your claim to verify"');
      console.log('  node main.js stats');
      console.log('  node main.js batch');
      console.log('\nExamples:');
      console.log('  node main.js process "The sky is blue"');
      console.log('  node main.js stats');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}
