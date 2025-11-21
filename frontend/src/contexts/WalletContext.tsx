import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Client, PrivateKey, AccountId, TransferTransaction, Hbar, TransactionId, AccountBalanceQuery } from '@hashgraph/sdk'

interface WalletContextType {
  accountId: string | null
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  provider: 'direct' | 'manual'
  sendHbarTransfer: (input: { toAccountId: string; amountHbar: number; memo?: string }) => Promise<{ transactionId: string }>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Testnet client
const getClient = () => {
  return Client.forTestnet()
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [accountId, setAccountId] = useState<string | null>(null)
  const [privateKey, setPrivateKey] = useState<PrivateKey | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Load saved credentials on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAccountId = localStorage.getItem('hederaAccountId')
      const savedPrivateKey = localStorage.getItem('hederaPrivateKey')
      
      if (savedAccountId && savedPrivateKey) {
        try {
          const key = PrivateKey.fromString(savedPrivateKey)
          setAccountId(savedAccountId)
          setPrivateKey(key)
        } catch (error) {
          console.warn('Failed to load saved credentials:', error)
          localStorage.removeItem('hederaAccountId')
          localStorage.removeItem('hederaPrivateKey')
        }
      }
    }
  }, [])

  const connect = useCallback(async () => {
    setIsConnecting(true)
    try {
      const accountInput = prompt(
        'Enter your Hedera Testnet Account ID:\n\n' +
        'Example: 0.0.6398676\n\n' +
        '(You can get a testnet account from portal.hedera.com)',
        accountId || ''
      )

      if (!accountInput) {
        setIsConnecting(false)
        return
      }

      const trimmedAccount = accountInput.trim()
      if (!trimmedAccount.match(/^0\.0\.\d+$/)) {
        alert('Invalid account format. Please use format: 0.0.123456')
        setIsConnecting(false)
        return
      }

      const keyInput = prompt(
        'Enter your Private Key:\n\n' +
        'Example: 302e020100300506032b657004220420...\n\n' +
        '(This is stored locally in your browser only)',
        ''
      )

      if (!keyInput) {
        setIsConnecting(false)
        return
      }

      try {
        const key = PrivateKey.fromString(keyInput.trim())
        
        // Verify the key works by creating a client and checking balance
        const client = getClient()
        const accountIdObj = AccountId.fromString(trimmedAccount)
        client.setOperator(accountIdObj, key)
        
        // Test connection by getting account balance (this validates the key matches the account)
        try {
          const balance = await new AccountBalanceQuery()
            .setAccountId(accountIdObj)
            .execute(client)
          console.log(`✅ Account balance: ${balance.hbars.toString()} HBAR`)
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          if (errorMsg.includes('INVALID_SIGNATURE') || errorMsg.includes('INVALID_ACCOUNT_ID')) {
            client.close()
            throw new Error('Private key does not match this account ID. Please verify your credentials.')
          }
          console.warn('Balance check failed, but continuing:', error)
        } finally {
          // Always close the client after balance check
          client.close()
        }

        setAccountId(trimmedAccount)
        setPrivateKey(key)

        if (typeof window !== 'undefined') {
          localStorage.setItem('hederaAccountId', trimmedAccount)
          localStorage.setItem('hederaPrivateKey', keyInput.trim())
        }

        console.log('✅ Connected to account:', trimmedAccount)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        alert(`Connection failed: ${errorMsg}\n\nPlease verify:\n- Account ID format: 0.0.xxxxx\n- Private key matches the account\n- You're using testnet credentials`)
      }
    } catch (error) {
      console.error('Connection failed:', error)
      alert('Failed to connect. Please check your credentials.')
    } finally {
      setIsConnecting(false)
    }
  }, [accountId])

  const disconnect = useCallback(async () => {
    setAccountId(null)
    setPrivateKey(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hederaAccountId')
      localStorage.removeItem('hederaPrivateKey')
    }
  }, [])

  const sendHbarTransfer = useCallback(
    async ({ toAccountId, amountHbar, memo }: { toAccountId: string; amountHbar: number; memo?: string }) => {
      if (!accountId || !privateKey) {
        throw new Error('Wallet not connected. Please connect with your account ID and private key.')
      }

      try {
        // Create a fresh client for each transaction
        const client = Client.forTestnet()
        const payerAccount = AccountId.fromString(accountId)
        const receiverAccount = AccountId.fromString(toAccountId)
        
        // Set operator for signing - this is important for proper signing
        client.setOperator(payerAccount, privateKey)

        // Generate transaction ID from the payer account
        const txId = TransactionId.generate(payerAccount)

        // Build the transaction
        const transaction = new TransferTransaction()
          .addHbarTransfer(payerAccount, new Hbar(-amountHbar))
          .addHbarTransfer(receiverAccount, new Hbar(amountHbar))
          .setTransactionId(txId)
          .setNodeAccountIds([
            AccountId.fromString('0.0.3'),
            AccountId.fromString('0.0.4'),
            AccountId.fromString('0.0.5'),
            AccountId.fromString('0.0.6')
          ])
          .setTransactionMemo(memo ?? 'Hedera Mind purchase')
          .setMaxTransactionFee(new Hbar(1)) // Set max fee

        // Freeze the transaction with the client (this sets the node account IDs properly)
        await transaction.freezeWith(client)

        // Sign with the private key (sign the frozen transaction)
        const signedTx = await transaction.sign(privateKey)

        // Execute the transaction
        const txResponse = await signedTx.execute(client)
        
        // Get receipt
        const receipt = await txResponse.getReceipt(client)

        // Close the client
        client.close()

        if (receipt.status.toString() !== 'SUCCESS') {
          throw new Error(`Transfer failed with status ${receipt.status}`)
        }

        console.log(`✅ HBAR transfer successful! Transaction ID: ${txResponse.transactionId.toString()}`)
        return { transactionId: txResponse.transactionId.toString() }
      } catch (error) {
        console.error('HBAR transfer failed:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        
        // Provide more helpful error messages
        if (errorMessage.includes('INVALID_SIGNATURE')) {
          throw new Error(
            'Invalid signature error. This usually means:\n\n' +
            '1. Your private key does not match the account ID\n' +
            '2. You\'re using mainnet credentials on testnet (or vice versa)\n' +
            '3. The account might not have sufficient permissions\n\n' +
            'Please try:\n' +
            '- Disconnect and reconnect with fresh credentials\n' +
            '- Verify your account ID and private key from portal.hedera.com\n' +
            '- Make sure you\'re using TESTNET credentials'
          )
        }
        
        throw new Error(`Transfer failed: ${errorMessage}`)
      }
    },
    [accountId, privateKey]
  )

  return (
    <WalletContext.Provider
      value={{
        accountId,
        isConnected: !!accountId && !!privateKey,
        isConnecting,
        connect,
        disconnect,
        provider: 'direct',
        sendHbarTransfer
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
