import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import solc from 'solc';
import dotenv from 'dotenv';
import {
  Client,
  PrivateKey,
  ContractCreateTransaction
} from '@hashgraph/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });

const SOURCE_PATH = path.join(rootDir, 'contracts', 'AgentRegistry.sol');
const BUILD_DIR = path.join(rootDir, 'contracts', 'build');
const ARTIFACT_PATH = path.join(BUILD_DIR, 'AgentRegistry.json');

function compileContract() {
  if (!fs.existsSync(SOURCE_PATH)) {
    throw new Error(`Contract not found at ${SOURCE_PATH}`);
  }

  const source = fs.readFileSync(SOURCE_PATH, 'utf8');
  const input = {
    language: 'Solidity',
    sources: {
      'AgentRegistry.sol': { content: source }
    },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode', 'metadata']
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  if (output.errors && output.errors.length) {
    const fatal = output.errors.filter((err) => err.severity === 'error');
    fatal.forEach((err) => console.error(`❌ ${err.formattedMessage}`));
    if (fatal.length) {
      throw new Error('Solidity compilation failed');
    }
  }

  const contract = output.contracts['AgentRegistry.sol']['AgentRegistry'];
  if (!contract?.abi || !contract?.evm?.bytecode?.object) {
    throw new Error('Compiled contract missing ABI or bytecode');
  }

  const bytecodeObject = contract.evm.bytecode.object;
  if (!/^[0-9a-fA-F]*$/.test(bytecodeObject)) {
    console.warn('⚠️  Bytecode contains non-hex characters; sanitizing output.');
  }

  return {
    abi: contract.abi,
    bytecode: bytecodeObject.replace(/[^0-9a-fA-F]/g, ''),
    metadata: contract.metadata ? JSON.parse(contract.metadata) : {}
  };
}

async function deploy(bytecodeHex) {
  const operatorId = process.env.OPERATOR_ID;
  const operatorKey = process.env.OPERATOR_KEY;

  if (!operatorId || !operatorKey) {
    throw new Error('Missing OPERATOR_ID or OPERATOR_KEY in .env');
  }

  const privateKey = PrivateKey.fromString(operatorKey);
  const client = Client.forTestnet().setOperator(operatorId, privateKey);
  const sanitizedHex = (bytecodeHex.startsWith('0x') ? bytecodeHex.slice(2) : bytecodeHex).trim();
  if (sanitizedHex.length % 2 !== 0) {
    throw new Error('Compiled bytecode length must be even, received malformed hex string');
  }
  const bytecodeBuffer = Buffer.from(sanitizedHex, 'hex');
  const bytecode = Uint8Array.from(bytecodeBuffer);

  const contractCreate = await new ContractCreateTransaction()
    .setGas(4_000_000)
    .setBytecode(bytecode)
    .setAdminKey(privateKey.publicKey)
    .execute(client);

  const receipt = await contractCreate.getReceipt(client);

  if (!receipt.contractId) {
    throw new Error('Deployment failed: no contract ID returned');
  }

  console.log(`✅ Contract deployed: ${receipt.contractId.toString()}`);
  return {
    contractId: receipt.contractId.toString(),
    transactionId: contractCreate.transactionId.toString()
  };
}

async function main() {
  try {
    console.log('🛠️  Compiling AgentRegistry.sol...');
    const { abi, bytecode, metadata } = compileContract();

    console.log('📦 Writing build artifacts...');
    fs.mkdirSync(BUILD_DIR, { recursive: true });

    const { contractId, transactionId } = await deploy(bytecode);

    const artifact = {
      contractId,
      network: 'testnet',
      transactionId,
      abi,
      bytecode,
      metadata,
      deployedAt: new Date().toISOString()
    };

    fs.writeFileSync(ARTIFACT_PATH, JSON.stringify(artifact, null, 2));

    console.log(`📝 Artifact saved to ${ARTIFACT_PATH}`);
    console.log('\n🔑 Next steps:');
    console.log(`   1. Add this to backend/.env → AGENT_REGISTRY_CONTRACT=${contractId}`);
    console.log('   2. Restart the backend server so agents can register themselves\n');
  } catch (error) {
    console.error('❌ AgentRegistry deployment failed:', error.message);
    process.exit(1);
  }
}

main();

