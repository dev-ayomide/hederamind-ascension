import { HederaMind } from './main.js';
import dotenv from "dotenv";
dotenv.config();

/**
 * Standalone script for submitting claims
 * This script demonstrates the core functionality of HederaMind
 */
async function submitSampleClaim() {
  console.log('🚀 HederaMind - Claim Submission Demo');
  console.log('=====================================\n');

  const hederaMind = new HederaMind();
  
  // Sample claims to demonstrate the system
  const sampleClaims = [
    "The sky is blue during the day",
    "Water boils at 100°C at sea level", 
    "The Earth is approximately 4.5 billion years old",
    "Artificial intelligence can process information faster than humans"
  ];

  try {
    // Process each sample claim
    for (let i = 0; i < sampleClaims.length; i++) {
      const claim = sampleClaims[i];
      console.log(`\n[${i + 1}/${sampleClaims.length}] Processing claim...`);
      
      const result = await hederaMind.processClaim(claim, {
        saveLocally: true,
        submitToHedera: true,
        verificationOptions: {
          useAI: true,
          mockMode: false
        }
      });

      if (result.success) {
        console.log('✅ Claim successfully processed and submitted to Hedera!');
        if (result.hedera) {
          console.log(`📄 Transaction ID: ${result.hedera.transactionId}`);
        }
      } else {
        console.log(`❌ Failed to process claim: ${result.error}`);
      }

      // Small delay between submissions
      if (i < sampleClaims.length - 1) {
        console.log('⏱️  Waiting 2 seconds before next submission...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Show final dashboard
    console.log('\n' + '='.repeat(50));
    await hederaMind.showDashboard();

  } catch (error) {
    console.error('❌ Submission failed:', error.message);
    process.exit(1);
  }
}

// Run the demo if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  submitSampleClaim().catch(console.error);
}

export { submitSampleClaim };
