import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractCallQuery,
  PrivateKey
} from '@hashgraph/sdk';
import { keccak256, toUtf8Bytes } from 'ethers';

import { hederaService } from './hedera.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARTIFACT_PATH = path.join(__dirname, '../contracts/build/AgentRegistry.json');

class AgentRegistryService {
  constructor() {
    this.contractId = process.env.AGENT_REGISTRY_CONTRACT || null;
    this.enabled = Boolean(this.contractId);
    this.operatorKey = process.env.OPERATOR_KEY || null;
    this.metadataBase = process.env.AGENT_METADATA_BASE || 'https://hederamind.app/agents';
    this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3002';
    this.artifact = this.loadArtifact();
  }

  loadArtifact() {
    try {
      if (fs.existsSync(ARTIFACT_PATH)) {
        return JSON.parse(fs.readFileSync(ARTIFACT_PATH, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Unable to load AgentRegistry artifact:', error.message);
    }
    return null;
  }

  isEnabled() {
    return this.enabled && this.contractId;
  }

  computeAgentKey(agentId) {
    return keccak256(toUtf8Bytes(agentId));
  }

  getDefaultPublicKeyBytes() {
    try {
      if (!this.operatorKey) return null;
      const key = PrivateKey.fromString(this.operatorKey);
      return Buffer.from(key.publicKey.toBytes());
    } catch {
      return null;
    }
  }

  getDefaultAgents() {
    const publicKey = this.getDefaultPublicKeyBytes();
    return [
      {
        agentId: process.env.TRUTH_AGENT_ID || 'truth-agent',
        role: 'truth-market-seller',
        metadataURI: `${this.metadataBase}/truth`,
        endpoint: `${this.apiBaseUrl}/api/marketplace/buy`,
        publicKeyBytes: publicKey
      },
      {
        agentId: process.env.BADGE_AGENT_ID || 'badge-agent',
        role: 'badge-minter',
        metadataURI: `${this.metadataBase}/badge`,
        endpoint: `${this.apiBaseUrl}/api/badges`,
        publicKeyBytes: publicKey
      }
    ];
  }

  formatBytes(input) {
    if (!input) return Buffer.from([]);
    if (typeof input === 'string') {
      const sanitized = input.startsWith('0x') ? input.slice(2) : Buffer.from(input).toString('hex');
      return Buffer.from(sanitized, 'hex');
    }
    if (input instanceof Uint8Array || Buffer.isBuffer(input)) {
      return Buffer.from(input);
    }
    throw new Error('Unsupported byte format for agent public key');
  }

  async registerAgent({ agentId, role, metadataURI, publicKeyBytes }) {
    if (!this.isEnabled()) {
      throw new Error('Agent registry contract not configured');
    }

    const client = await hederaService.getClient();
    const params = new ContractFunctionParameters()
      .addString(agentId)
      .addString(role)
      .addString(metadataURI)
      .addBytes(this.formatBytes(publicKeyBytes));

    const tx = await new ContractExecuteTransaction()
      .setContractId(this.contractId)
      .setFunction('registerAgent', params)
      .setGas(400_000)
      .execute(client);

    const receipt = await tx.getReceipt(client);

    return {
      agentId,
      agentKey: this.computeAgentKey(agentId),
      contractId: this.contractId,
      transactionId: tx.transactionId.toString(),
      status: receipt.status.toString(),
      registeredAt: new Date().toISOString()
    };
  }

  async getAgent(agentId) {
    if (!this.isEnabled()) {
      throw new Error('Agent registry contract not configured');
    }

    const client = await hederaService.getClient();
    const result = await new ContractCallQuery()
      .setContractId(this.contractId)
      .setGas(150_000)
      .setFunction('getAgent', new ContractFunctionParameters().addString(agentId))
      .execute(client);

    return {
      agentId,
      agentKey: this.computeAgentKey(agentId),
      contractId: this.contractId,
      owner: result.getAddress(0),
      role: result.getString(1),
      metadataURI: result.getString(2),
      publicKeyHash: `0x${Buffer.from(result.getBytes32(3)).toString('hex')}`,
      registeredAt: Number(result.getUint64(4)),
      active: result.getBool(5)
    };
  }

  async verifyAgent(agentId, publicKeyBytes) {
    if (!this.isEnabled()) {
      return { enabled: false };
    }

    const client = await hederaService.getClient();
    const result = await new ContractCallQuery()
      .setContractId(this.contractId)
      .setGas(60_000)
      .setFunction(
        'verifyPublicKey',
        new ContractFunctionParameters()
          .addString(agentId)
          .addBytes(this.formatBytes(publicKeyBytes))
      )
      .execute(client);

    const isValid = result.getBool(0);
    return {
      agentId,
      agentKey: this.computeAgentKey(agentId),
      contractId: this.contractId,
      valid: isValid
    };
  }

  async ensureAgent(agentConfig) {
    if (!this.isEnabled()) {
      return { enabled: false, reason: 'AGENT_REGISTRY_CONTRACT missing' };
    }

    try {
      const existing = await this.getAgent(agentConfig.agentId);
      return { ...existing, newlyRegistered: false };
    } catch {
      return this.registerAgent(agentConfig).then((res) => ({
        ...res,
        newlyRegistered: true
      }));
    }
  }

  async bootstrapDefaultAgents() {
    if (!this.isEnabled()) {
      console.warn('⚠️  Agent registry disabled (set AGENT_REGISTRY_CONTRACT to enable on-chain proofs)');
      return [];
    }

    const defaults = this.getDefaultAgents();
    const results = [];

    for (const agent of defaults) {
      const result = await this.ensureAgent(agent).catch((error) => ({
        agentId: agent.agentId,
        error: error.message
      }));
      results.push(result);
    }

    return results;
  }

  async getAgentProof(agentId) {
    try {
      const agent = await this.getAgent(agentId);
      return {
        agentId,
        agentKey: agent.agentKey,
        contractId: agent.contractId,
        metadataURI: agent.metadataURI,
        registeredAt: agent.registeredAt,
        active: agent.active
      };
    } catch (error) {
      return {
        agentId,
        error: error.message
      };
    }
  }
}

export const agentRegistryService = new AgentRegistryService();


