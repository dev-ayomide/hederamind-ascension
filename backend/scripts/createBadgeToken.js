/**
 * Script to create the Truth Seeker Badge NFT token on Hedera
 * 
 * This creates the NFT collection that will hold all badge NFTs
 * Run this ONCE to set up the badge system
 * 
 * Usage: node backend/scripts/createBadgeToken.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { 
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType
} from '@hashgraph/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
// Try backend/.env first, then root .env
const backendEnvPath = join(__dirname, '../.env');
const rootEnvPath = join(__dirname, '../../.env');
dotenv.config({ path: backendEnvPath });
// Also try root if backend/.env doesn't exist
if (!process.env.OPERATOR_ID && !process.env.HEDERA_OPERATOR_ID) {
  dotenv.config({ path: rootEnvPath });
}

async function createBadgeToken() {
  console.log('\n🏆 Creating Truth Seeker Badge NFT Token...\n');

  // Check if token already exists
  if (process.env.BADGE_TOKEN_ID) {
    console.log(`✅ Badge token already exists: ${process.env.BADGE_TOKEN_ID}`);
    console.log(`💡 View on HashScan: https://hashscan.io/testnet/token/${process.env.BADGE_TOKEN_ID}\n`);
    return process.env.BADGE_TOKEN_ID;
  }

  // Validate environment variables
  const operatorId = process.env.OPERATOR_ID || process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.OPERATOR_KEY || process.env.HEDERA_OPERATOR_KEY;
  const network = process.env.HEDERA_NETWORK || process.env.NETWORK || 'testnet';

  if (!operatorId || !operatorKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   OPERATOR_ID and OPERATOR_KEY must be set in .env file');
    console.error('\n💡 Create a .env file in the root directory with:');
    console.error('   OPERATOR_ID=0.0.xxxxx');
    console.error('   OPERATOR_KEY=302e...');
    console.error('   NETWORK=testnet');
    process.exit(1);
  }

  try {
    // Initialize Hedera client
    const client = Client.forName(network);
    const privateKey = PrivateKey.fromString(operatorKey);
    client.setOperator(AccountId.fromString(operatorId), privateKey);

    console.log(`📡 Network: ${network}`);
    console.log(`👤 Operator: ${operatorId}\n`);

    // Create NFT token
    console.log('⏳ Creating NFT token...');
    
    const tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName("Truth Seeker Badge")
      .setTokenSymbol("TRUTH")
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setSupplyType(TokenSupplyType.Infinite) // Can mint unlimited badges
      .setTreasuryAccountId(AccountId.fromString(operatorId))
      .setAdminKey(privateKey.publicKey)
      .setSupplyKey(privateKey.publicKey)
      .setMaxTransactionFee(20) // 20 HBAR max
      .freezeWith(client);

    const signedTx = await tokenCreateTx.sign(privateKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);
    
    const tokenId = receipt.tokenId.toString();
    
    console.log(`\n✅ Badge Token Created Successfully!`);
    console.log(`\n📋 Token Details:`);
    console.log(`   Token ID: ${tokenId}`);
    console.log(`   Name: Truth Seeker Badge`);
    console.log(`   Symbol: TRUTH`);
    console.log(`   Type: Non-Fungible Unique (NFT)`);
    console.log(`   Supply: Infinite`);
    console.log(`\n🔗 View on HashScan:`);
    console.log(`   https://hashscan.io/${network}/token/${tokenId}`);
    console.log(`\n💡 Add this to your .env file:`);
    console.log(`   BADGE_TOKEN_ID=${tokenId}\n`);

    return tokenId;

  } catch (error) {
    console.error('\n❌ Failed to create badge token:', error.message);
    if (error.message.includes('INSUFFICIENT_PAYER_BALANCE')) {
      console.error('\n💡 Your account needs HBAR to create the token.');
      console.error('   Get testnet HBAR from: https://portal.hedera.com/');
    }
    process.exit(1);
  }
}

// Run the script
createBadgeToken()
  .then(() => {
    console.log('✨ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

