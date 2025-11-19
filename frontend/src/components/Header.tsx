import { Brain, Wallet } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'

export default function Header() {
  const { accountId, isConnected, connect, disconnect } = useWallet()

  const handleWalletClick = async () => {
    if (isConnected) {
      disconnect()
    } else {
      try {
        await connect()
      } catch (error) {
        console.error('Wallet connection failed:', error)
        alert('Failed to connect wallet. Make sure you have a Hedera wallet extension installed.')
      }
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-2 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Hedera Mind
              </h2>
              <p className="text-xs text-gray-500">Truth Verification Network</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Hedera Testnet</span>
            </div>
            
            <button 
              onClick={handleWalletClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isConnected
                  ? 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              <Wallet className="w-4 h-4" />
              {isConnected ? (
                <span className="text-sm">{accountId?.substring(0, 10)}...</span>
              ) : (
                <span className="text-sm">Connect Wallet</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
