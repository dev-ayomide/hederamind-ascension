import { Client, PrivateKey, TopicMessageSubmitTransaction, AccountId, TransferTransaction, Hbar } from "@hashgraph/sdk";
import dotenv from 'dotenv';

dotenv.config();

/**
 * Hedera Service - Centralized blockchain interaction layer
 */
class HederaService {
  constructor() {
    this.client = null;
    this.operatorId = process.env.OPERATOR_ID;
    this.operatorKey = process.env.OPERATOR_KEY;
    this.topicId = process.env.TOPIC_ID;
    this.isInitialized = false;
  }

  /**
   * Initialize Hedera client
   */
  async initialize() {
    if (this.isInitialized) return this.client;

    try {
      if (!this.operatorId || !this.operatorKey) {
        throw new Error('Missing OPERATOR_ID or OPERATOR_KEY in environment');
      }

      const privateKey = PrivateKey.fromString(this.operatorKey);
      this.client = Client.forTestnet().setOperator(this.operatorId, privateKey);
      
      this.isInitialized = true;
      console.log('✅ Hedera service initialized');
      
      return this.client;
    } catch (error) {
      console.error('❌ Hedera initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Get Hedera client instance
   */
  async getClient() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.client;
  }

  /**
   * Submit message to HCS topic
   */
  async submitToHCS(message) {
    try {
      const client = await this.getClient();
      
      const messageString = typeof message === 'string' 
        ? message 
        : JSON.stringify(message);

      const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId)
        .setMessage(messageString)
        .execute(client);

      const receipt = await transaction.getReceipt(client);

      return {
        success: true,
        transactionId: transaction.transactionId.toString(),
        topicId: this.topicId,
        status: receipt.status.toString(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ HCS submission failed:', error.message);
      throw new Error(`Failed to submit to HCS: ${error.message}`);
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId) {
    try {
      const client = await this.getClient();
      const account = AccountId.fromString(accountId);
      const balance = await client.getAccountBalance(account);
      
      return {
        hbar: balance.hbars.toString(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to get balance:', error.message);
      throw error;
    }
  }

  /**
   * Validate account ID
   */
  isValidAccountId(accountId) {
    try {
      AccountId.fromString(accountId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get operator info
   */
  getOperatorInfo() {
    return {
      operatorId: this.operatorId,
      topicId: this.topicId,
      network: 'testnet'
    };
  }

  /**
   * Transfer HBAR to an account
   * @param {string} recipientAccountId - Recipient account ID
   * @param {number} amountHbar - Amount in HBAR (e.g., 0.01)
   * @returns {Object} Transaction receipt
   */
  async transferHbar(recipientAccountId, amountHbar) {
    try {
      const client = await this.getClient();
      
      if (!this.operatorId || !this.operatorKey) {
        throw new Error('Operator credentials not set');
      }

      const recipientId = AccountId.fromString(recipientAccountId);
      const operatorId = AccountId.fromString(this.operatorId);
      const privateKey = PrivateKey.fromString(this.operatorKey);

      // Convert HBAR to tinybars to avoid decimal precision issues
      const amountHbarObj = Hbar.from(amountHbar);
      const tinybars = amountHbarObj.toTinybars();

      // Create transfer transaction using tinybars
      const transferTx = await new TransferTransaction()
        .addHbarTransfer(operatorId, Hbar.fromTinybars(-tinybars))
        .addHbarTransfer(recipientId, Hbar.fromTinybars(tinybars))
        .setTransactionMemo(`Revenue share: ${amountHbar} HBAR`)
        .freezeWith(client);

      // Sign and execute
      const signedTx = await transferTx.sign(privateKey);
      const txResponse = await signedTx.execute(client);
      const receipt = await txResponse.getReceipt(client);

      console.log(`✅ Transferred ${amountHbar} HBAR to ${recipientAccountId}`);

      return {
        success: true,
        transactionId: txResponse.transactionId.toString(),
        recipient: recipientAccountId,
        amount: amountHbar,
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error(`❌ HBAR transfer failed to ${recipientAccountId}:`, error.message);
      throw new Error(`Failed to transfer HBAR: ${error.message}`);
    }
  }

  /**
   * Transfer HBAR using tinybars (to avoid decimal precision issues)
   * @param {string} recipientAccountId - Recipient account ID
   * @param {number} tinybars - Amount in tinybars (e.g., 700000 for 0.007 HBAR)
   * @returns {Object} Transaction receipt
   */
  async transferHbarTinybars(recipientAccountId, tinybars) {
    try {
      const client = await this.getClient();
      
      if (!this.operatorId || !this.operatorKey) {
        throw new Error('Operator credentials not set');
      }

      const recipientId = AccountId.fromString(recipientAccountId);
      const operatorId = AccountId.fromString(this.operatorId);
      const privateKey = PrivateKey.fromString(this.operatorKey);

      // Ensure tinybars is an integer
      const tinybarsInt = Math.floor(tinybars);

      // Create transfer transaction using tinybars directly
      const transferTx = await new TransferTransaction()
        .addHbarTransfer(operatorId, Hbar.fromTinybars(-tinybarsInt))
        .addHbarTransfer(recipientId, Hbar.fromTinybars(tinybarsInt))
        .setTransactionMemo(`Revenue share: ${tinybarsInt} tinybars`)
        .freezeWith(client);

      // Sign and execute
      const signedTx = await transferTx.sign(privateKey);
      const txResponse = await signedTx.execute(client);
      const receipt = await txResponse.getReceipt(client);

      const amountHbar = tinybarsInt / 100000000;
      console.log(`✅ Transferred ${amountHbar} HBAR (${tinybarsInt} tinybars) to ${recipientAccountId}`);

      return {
        success: true,
        transactionId: txResponse.transactionId.toString(),
        recipient: recipientAccountId,
        amount: amountHbar,
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error(`❌ HBAR transfer failed to ${recipientAccountId}:`, error.message);
      throw new Error(`Failed to transfer HBAR: ${error.message}`);
    }
  }

  /**
   * Close client connection
   */
  async close() {
    if (this.client) {
      this.client.close();
      this.isInitialized = false;
      console.log('✅ Hedera client closed');
    }
  }
}

// Export singleton instance
export const hederaService = new HederaService();
