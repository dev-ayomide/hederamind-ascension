import { storageService } from '../services/storage.service.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

/**
 * Clean demo data - Keep only good sample data for hackathon demo
 */
async function cleanDemoData() {
  try {
    console.log('\n🧹 Cleaning demo data for hackathon submission...\n');
    
    // Initialize storage
    await storageService.initialize();
    
    // Get all data
    const claims = await storageService.getClaims();
    const sales = await storageService.getSales();
    const badges = await storageService.getBadges();
    const users = await storageService.getUsers();
    
    console.log(`📊 Current data:`);
    console.log(`   Claims: ${claims.length}`);
    console.log(`   Sales: ${sales.length}`);
    console.log(`   Badges: ${badges.length}`);
    console.log(`   Users: ${users.length}\n`);
    
    // Filter out mock/demo claims - only keep real GROQ AI verified claims
    const mockClaims = claims.filter(c => c.verifier && c.verifier.includes('Mock AI'));
    const realClaims = claims.filter(c => {
      // Remove mock AI claims
      if (c.verifier && c.verifier.includes('Mock AI')) {
        return false;
      }
      // Only keep TRUE claims verified by GROQ AI
      return c.verdict === 'TRUE' && 
             c.status === 'verified' && 
             c.verifier && 
             c.verifier.includes('GROQ');
    });
    
    console.log(`🗑️  Removing ${mockClaims.length} mock/demo claims`);
    
    // Keep top 10 best real claims (most recent, unique claims)
    const uniqueClaims = [];
    const seenClaims = new Set();
    for (const claim of realClaims.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))) {
      if (!seenClaims.has(claim.claim)) {
        uniqueClaims.push(claim);
        seenClaims.add(claim.claim);
        if (uniqueClaims.length >= 10) break;
      }
    }
    const goodClaims = uniqueClaims;
    
    // Filter sales to only include sales of real claims we're keeping
    const keptClaimTexts = new Set(goodClaims.map(c => c.claim));
    const realSales = sales.filter(s => {
      return keptClaimTexts.has(s.claim) && 
             s.agent && 
             s.agent.proof; // Only sales with agent proofs
    });
    
    const demoSales = sales.length - realSales.length;
    console.log(`🗑️  Removing ${demoSales} demo/mock sales`);
    
    // Keep top 5 most recent real sales
    const goodSales = realSales
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
    
    // Filter out demo badges - only keep real NFTs
    const demoBadges = badges.filter(b => {
      return b.tokenId === '0.0.DEMO_BADGE' ||
             (b.serialNumber && b.serialNumber.toString().startsWith('demo_')) ||
             (b.transactionId && b.transactionId.toString().startsWith('demo_'));
    });
    
    const realBadges = badges.filter(b => {
      // Remove demo badges
      if (b.tokenId === '0.0.DEMO_BADGE') {
        return false;
      }
      // Remove badges with demo serial numbers
      if (b.serialNumber && b.serialNumber.toString().startsWith('demo_')) {
        return false;
      }
      // Remove badges with demo transaction IDs
      if (b.transactionId && b.transactionId.toString().startsWith('demo_')) {
        return false;
      }
      // Only keep real badges with real token ID (0.0.7288739) and real serial numbers
      return b.tokenId === '0.0.7288739' && 
             b.serialNumber && 
             !b.serialNumber.toString().startsWith('demo') &&
             b.transactionId &&
             !b.transactionId.toString().startsWith('demo');
    });
    
    console.log(`🗑️  Removing ${demoBadges.length} demo badges`);
    
    const goodBadges = realBadges;
    
    // Update user badge counts to match real badges only
    const realBadgeCounts = {};
    realBadges.forEach(b => {
      realBadgeCounts[b.recipient] = (realBadgeCounts[b.recipient] || 0) + 1;
    });
    
    // Update users with correct badge counts and purchase counts
    const goodUsers = users.map(u => {
      const realBadgeCount = realBadgeCounts[u.accountId] || 0;
      // Recalculate purchase count based on real sales
      const userSales = goodSales.filter(s => s.buyer === u.accountId);
      return {
        ...u,
        badgesEarned: realBadgeCount,
        purchaseCount: userSales.length
      };
    }).filter(u => u.purchaseCount > 0 || u.badgesEarned > 0); // Only keep users with activity
    
    // Write cleaned data using storage service
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const dataDir = path.join(__dirname, '../../data');
    
    await fs.writeFile(
      path.join(dataDir, 'claims.json'),
      JSON.stringify(goodClaims, null, 2)
    );
    
    await fs.writeFile(
      path.join(dataDir, 'sales.json'),
      JSON.stringify(goodSales, null, 2)
    );
    
    await fs.writeFile(
      path.join(dataDir, 'badges.json'),
      JSON.stringify(goodBadges, null, 2)
    );
    
    await fs.writeFile(
      path.join(dataDir, 'users.json'),
      JSON.stringify(goodUsers, null, 2)
    );
    
    console.log('\n✅ Demo data cleaned!\n');
    console.log(`📊 Final data:`);
    console.log(`   Claims: ${goodClaims.length} (real GROQ AI verified, unique)`);
    console.log(`   Sales: ${goodSales.length} (real sales with agent proofs)`);
    console.log(`   Badges: ${goodBadges.length} (real NFTs on Hedera - Token: 0.0.7288739)`);
    console.log(`   Users: ${goodUsers.length} (users with real activity)\n`);
    console.log('✨ All mock/demo data removed - Ready for hackathon submission!\n');
    
  } catch (error) {
    console.error('❌ Failed to clean demo data:', error);
    process.exit(1);
  }
}

// Run if called directly
cleanDemoData().catch(console.error);

export { cleanDemoData };

