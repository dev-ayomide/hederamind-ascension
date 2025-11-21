import { Wallet, Loader2 } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'

export default function Header() {
  const { accountId, isConnected, isConnecting, connect, disconnect } = useWallet()

  const handleWalletClick = async () => {
    if (isConnected) {
      await disconnect()
    } else {
      try {
        await connect()
      } catch (error) {
        console.error('Wallet connection failed:', error)
        alert('Failed to connect wallet. Please check your account ID and private key.')
      }
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex-shrink-0">
              <img 
                src="/hederamind-logo.png" 
                alt="Hedera Mind Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-slate-900 truncate">Hedera Mind</h2>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">Truth Verification Network</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-semibold text-emerald-700">Hedera Testnet</span>
            </div>
            
            <button 
              onClick={handleWalletClick}
              disabled={isConnecting}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold transition-all text-xs sm:text-sm whitespace-nowrap ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300 hover:bg-emerald-100 shadow-sm'
                  : 'bg-primary-100 text-slate-900 border-2 border-primary-300 hover:bg-primary-200 shadow-md'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              {isConnecting ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  <span className="hidden sm:inline">Connecting...</span>
                </span>
              ) : isConnected ? (
                <span className="font-medium truncate max-w-[100px] sm:max-w-none">{accountId?.substring(0, 10)}...</span>
              ) : (
                <span>Connect Wallet</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
