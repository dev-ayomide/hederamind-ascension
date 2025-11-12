#!/usr/bin/env node
/**
 * HederaMind Demo Script
 * Showcases the key features of the truth verification system
 */

import { HederaMind } from './src/main.js';
import { ClaimsStorage } from './src/storage.js';

console.log(`
🧠 ========================================
   HederaMind Demo - Truth Verification
========================================

Welcome to HederaMind! This demo will show you:
✅ Single claim processing  
✅ System dashboard
✅ Batch processing
✅ Local storage capabilities
✅ Hedera blockchain integration

`);

const hederaMind = new HederaMind();

async function runDemo() {
  try {
    console.log('🔄 STEP 1: Processing a single claim...\n');
    
    // Process a single claim
    const singleResult = await hederaMind.processClaim(
      "Artificial intelligence can process information faster than humans",
      {
        saveLocally: true,
        submitToHedera: true,
        verificationOptions: {
          useAI: true,
          mockMode: false
        }
      }
    );

    if (singleResult.success) {
      console.log('✅ Single claim processed successfully!\n');
    } else {
      console.log('❌ Single claim processing failed:', singleResult.error, '\n');
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('📊 STEP 2: Displaying system dashboard...\n');
    await hederaMind.showDashboard();

    console.log('\n🔄 STEP 3: Processing multiple claims in batch...\n');

    // Batch processing
    const batchClaims = [
      "The speed of light is approximately 300,000 km/s",
      "Water freezes at 0°C at standard pressure",
      "The human brain has about 86 billion neurons"
    ];

    const batchResults = await hederaMind.processClaimsBatch(batchClaims, {
      saveLocally: true,
      submitToHedera: true,
      verificationOptions: {
        useAI: true,
        mockMode: false
      }
    });

    const successCount = batchResults.filter(r => r.success).length;
    console.log(`\n✅ Batch processing complete: ${successCount}/${batchResults.length} claims processed successfully\n`);

    console.log('📊 STEP 4: Final system statistics...\n');
    await hederaMind.showDashboard();

    console.log('\n💾 STEP 5: Local storage summary...\n');
    const stats = await ClaimsStorage.getClaimsStats();
    const latestClaims = await ClaimsStorage.getLatestClaims(5);

    console.log('📈 Storage Summary:');
    console.log(`   Total Claims: ${stats.total}`);
    console.log(`   Accuracy Rate: ${stats.accuracy}%`);
    console.log(`   Latest Claims: ${latestClaims.length} records`);

    console.log(`
🎉 ========================================
   Demo Complete! 
========================================

What you just saw:
✅ AI-powered claim verification using Grok
✅ Local JSON storage for quick access  
✅ Immutable logging to Hedera blockchain
✅ Real-time analytics and dashboard
✅ Batch processing capabilities
✅ Error handling and fallback systems

Next steps:
🔍 Try: npm start process "Your own claim here"
📊 View: npm start stats  
🚀 Run: npm run submit (for full demo)

Your claims are now permanently stored on:
🌐 Local File: claims_log.json
⛓️  Blockchain: Hedera Topic ${process.env.TOPIC_ID || 'Not configured'}

Happy verifying! 🧠✨
`);

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your .env file configuration');
    console.log('   2. Ensure you have internet connection');
    console.log('   3. Verify Hedera testnet credentials');
    console.log('   4. Try running: npm start stats');
  }
}

// Run the demo
runDemo();
