import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { HashConnect, HashConnectConnectionState, type SessionData } from 'hashconnect'
import { LedgerId } from '@hashgraph/sdk'

interface WalletContextType {
  accountId: string | null
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  provider: 'hashconnect' | 'manual'
  connectionState: HashConnectConnectionState | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)
const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

function getSavedAccount() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('hederaAccountId')
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [accountId, setAccountId] = useState<string | null>(null)
  const [isPairing, setIsPairing] = useState(false)
  const [connectionState, setConnectionState] = useState<HashConnectConnectionState | null>(null)
  const [hashconnectReady, setHashconnectReady] = useState(false)
  const hashconnectRef = useRef<HashConnect | null>(null)

  const appMetadata = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return {
      name: 'Hedera Mind: Ascension',
      description: 'Autonomous truth marketplace on Hedera',
      icons: [`${baseUrl}/vite.svg`],
      url: baseUrl || 'https://hederamind.app'
    }
  }, [])

  useEffect(() => {
    const saved = getSavedAccount()
    if (saved) {
      setAccountId(saved)
    }
  }, [])

  useEffect(() => {
    if (!PROJECT_ID || typeof window === 'undefined') {
      return
    }

    let isMounted = true
    const hashconnect = new HashConnect(LedgerId.TESTNET, PROJECT_ID, appMetadata, true)
    hashconnectRef.current = hashconnect

    const handlePairing = (sessionData: SessionData) => {
      if (!isMounted) return
      const connectedAccountId = sessionData.accountIds?.[0]
      if (connectedAccountId) {
        setAccountId(connectedAccountId)
        localStorage.setItem('hederaAccountId', connectedAccountId)
      }
    }

    const handleConnectionChange = (state: HashConnectConnectionState) => {
      if (!isMounted) return
      setConnectionState(state)
    }

    const handleDisconnect = () => {
      if (!isMounted) return
      localStorage.removeItem('hederaAccountId')
      setAccountId(null)
      setConnectionState(HashConnectConnectionState.Disconnected)
    }

    hashconnect.pairingEvent.on(handlePairing)
    hashconnect.connectionStatusChangeEvent.on(handleConnectionChange)
    hashconnect.disconnectionEvent.on(handleDisconnect)

    hashconnect.init()
      .then(() => {
        if (isMounted) {
          setHashconnectReady(true)
        }
      })
      .catch((error) => {
        console.error('HashConnect initialization failed:', error)
      })

    return () => {
      isMounted = false
      hashconnect.pairingEvent.off(handlePairing)
      hashconnect.connectionStatusChangeEvent.off(handleConnectionChange)
      hashconnect.disconnectionEvent.off(handleDisconnect)
      hashconnect.disconnect().catch(() => undefined)
      hashconnectRef.current = null
    }
  }, [appMetadata])

  const manualConnect = async () => {
    const message =
      'Enter your Hedera Testnet Account ID:\n\n' +
      'Example: 0.0.6398676\n\n' +
      '(Tip: use HashPack or Blade wallet for real signatures)'

    const accountInput = typeof window !== 'undefined'
      ? prompt(message, accountId ?? '')
      : null

    if (!accountInput) return

    const trimmed = accountInput.trim()
    if (trimmed.match(/^0\.0\.\d+$/)) {
      setAccountId(trimmed)
      if (typeof window !== 'undefined') {
        localStorage.setItem('hederaAccountId', trimmed)
      }
      console.log('✅ Connected to account:', trimmed)
    } else {
      alert('Invalid account format. Please use format: 0.0.123456')
    }
  }

  const connect = async () => {
    if (PROJECT_ID && hashconnectReady && hashconnectRef.current) {
      try {
        setIsPairing(true)
        await hashconnectRef.current.openPairingModal(
          'dark',
          '#0f172a',
          '#6d28d9',
          '#f1f5f9',
          '16px'
        )
        return
      } catch (error) {
        console.error('HashConnect pairing failed, falling back to manual input:', error)
      } finally {
        setIsPairing(false)
      }
    }

    await manualConnect()
  }

  const disconnect = async () => {
    if (hashconnectRef.current) {
      try {
        await hashconnectRef.current.disconnect()
      } catch (error) {
        console.warn('HashConnect disconnect error:', error)
      }
    }

    setAccountId(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hederaAccountId')
    }
    setConnectionState(HashConnectConnectionState.Disconnected)
  }

  return (
    <WalletContext.Provider
      value={{
        accountId,
        isConnected: !!accountId,
        isConnecting: isPairing,
        connect,
        disconnect,
        provider: PROJECT_ID ? 'hashconnect' : 'manual',
        connectionState
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
