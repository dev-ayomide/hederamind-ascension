import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface WalletContextType {
  accountId: string | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [accountId, setAccountId] = useState<string | null>(() => {
    // Check localStorage for saved account
    return localStorage.getItem('hederaAccountId')
  })

  async function connect() {
    try {
      // Demo mode: Direct account ID input
      const accountInput = prompt(
        'Enter your Hedera Testnet Account ID:\n\n' +
        'Example: 0.0.6398676\n\n' +
        '(For demo purposes. In production, this would connect to HashPack wallet)'
      )
      
      if (accountInput) {
        const trimmed = accountInput.trim()
        
        // Validate format
        if (trimmed.match(/^0\.0\.\d+$/)) {
          setAccountId(trimmed)
          localStorage.setItem('hederaAccountId', trimmed)
          console.log('✅ Connected to account:', trimmed)
        } else {
          alert('Invalid account format. Please use format: 0.0.123456')
        }
      }
      
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }

  function disconnect() {
    setAccountId(null)
    localStorage.removeItem('hederaAccountId')
  }

  return (
    <WalletContext.Provider
      value={{
        accountId,
        isConnected: !!accountId,
        connect,
        disconnect,
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
