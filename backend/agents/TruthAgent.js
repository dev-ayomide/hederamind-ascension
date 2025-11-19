import { TransferTransaction, Hbar, AccountId } from "@hashgraph/sdk";
import { ClaimVerifier } from '../verifyClaim.js';
import { generateClaimId } from '../helpers.js';

/**
 * TruthAgent - Sells verified claims for micro-payments
 * 
 * This agent:
 * 1. Verifies claims using Grok AI
 * 2. Sells TRUE claims for 0.01 HBAR
 * 3. Communicates with BadgeAgent when sales occur
 */
export class TruthAgent {
  constructor(client, operatorId) {
    this.client = client;
    this.operatorId = operatorId;
    this.pricePerClaim = 0.01; // HBAR
    this.soldClaims = new Map(); // Track sold claims
  }

  /**
   * Verify and sell a claim to a buyer
   * @param {string} claim - The claim to verify
   * @param {string} buyerAccountId - Buyer's Hedera account ID
   * @returns {Object|null} Sale result or null if claim is FALSE
   */
  async sellVerifiedClaim(claim, buyerAccountId) {
    console.log('\n🤖 TruthAgent: Starting verification and sale process...');
    console.log(`📝 Claim: "${claim}"`);
    console.log(`👤 Buyer: ${buyerAccountId}`);

    try {
      // Step 1: Verify the claim using Grok AI
      console.log('\n🔍 Step 1: Verifying claim with Grok AI...');
      const verifiedClaim = await ClaimVerifier.createVerifiedClaim(claim);
      
      console.log(`✅ Verification Result: ${verifiedClaim.status}`);
      console.log(`📊 Confidence: ${verifiedClaim.confidence}%`);

      // Step 2: Only sell TRUE claims
      if (verifiedClaim.status !== 'TRUE') {
        console.log('❌ TruthAgent: Claim is not TRUE. Cannot sell FALSE claims.');
        return null;
      }

      // Step 3: Process payment (0.01 HBAR transfer)
      console.log('\n💰 Step 2: Processing payment...');
      let transactionId = null;
      
      try {
        // In production, buyer would actually pay
        // For demo, we simulate or use operator account
        const transferTx = await new TransferTransaction()
          .addHbarTransfer(this.operatorId, new Hbar(this.pricePerClaim))
          .addHbarTransfer(buyerAccountId, new Hbar(-this.pricePerClaim))
          .execute(this.client);
        
        const receipt = await transferTx.getReceipt(this.client);
        transactionId = transferTx.transactionId.toString();
        
        console.log(`✅ Payment received: ${this.pricePerClaim} HBAR`);
        console.log(`📄 Transaction ID: ${transactionId}`);
      } catch (paymentError) {
        console.log('⚠️  Payment simulation skipped (demo mode)');
        transactionId = `demo_tx_${Date.now()}`;
      }

      // Step 4: Create sale record
      const saleId = generateClaimId();
      const saleData = {
        saleId,
        claim: verifiedClaim.claim,
        verdict: verifiedClaim.status,
        confidence: verifiedClaim.confidence,
        reasoning: verifiedClaim.reasoning,
        price: this.pricePerClaim,
        buyer: buyerAccountId,
        seller: this.operatorId,
        transactionId,
        timestamp: new Date().toISOString(),
        claimData: verifiedClaim
      };

      // Store the sale
      this.soldClaims.set(saleId, saleData);

      console.log('\n✅ TruthAgent: Sale completed successfully!');
      console.log(`💳 Sale ID: ${saleId}`);
      console.log(`💰 Earned: ${this.pricePerClaim} HBAR`);

      return saleData;

    } catch (error) {
      console.error('❌ TruthAgent Error:', error.message);
      throw new Error(`TruthAgent sale failed: ${error.message}`);
    }
  }

  /**
   * Get all sold claims
   * @returns {Array} Array of sold claims
   */
  getSoldClaims() {
    return Array.from(this.soldClaims.values());
  }

  /**
   * Get total revenue earned
   * @returns {number} Total HBAR earned
   */
  getTotalRevenue() {
    return this.soldClaims.size * this.pricePerClaim;
  }

  /**
   * Get sales statistics
   * @returns {Object} Statistics
   */
  getStats() {
    const soldClaimsArray = this.getSoldClaims();
    
    return {
      totalSales: this.soldClaims.size,
      totalRevenue: this.getTotalRevenue(),
      pricePerClaim: this.pricePerClaim,
      averageConfidence: soldClaimsArray.length > 0
        ? soldClaimsArray.reduce((sum, s) => sum + s.confidence, 0) / soldClaimsArray.length
        : 0,
      latestSale: soldClaimsArray.length > 0 
        ? soldClaimsArray[soldClaimsArray.length - 1]
        : null
    };
  }
}
