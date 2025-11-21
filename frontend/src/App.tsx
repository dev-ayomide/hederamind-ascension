import { useState } from 'react'
import Header from './components/Header'
import ClaimVerifier from './components/ClaimVerifier'
import LiveStats from './components/LiveStats'
import Marketplace from './components/Marketplace'
import BadgeGallery from './components/BadgeGallery'
import Leaderboard from './components/Leaderboard'
import ActivityFeed from './components/ActivityFeed'

function App() {
  const [activeTab, setActiveTab] = useState<'verify' | 'marketplace' | 'badges' | 'stats'>('verify')

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 text-slate-900 tracking-tight">
            Hedera Mind: Ascension
          </h1>
          <p className="text-lg sm:text-xl text-slate-700 mb-2 font-medium">
            The AI That Never Lies
          </p>
          <p className="text-base sm:text-lg text-slate-600 px-2">
            Autonomous truth verification marketplace on Hedera blockchain
          </p>
        </div>

        <LiveStats />

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-8 flex-wrap px-2">
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm sm:text-base ${
              activeTab === 'verify'
                ? 'bg-primary-100 text-slate-900 border-2 border-primary-300 shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>🔍</span>
            <span className="whitespace-nowrap">Verify Claims</span>
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm sm:text-base ${
              activeTab === 'marketplace'
                ? 'bg-primary-100 text-slate-900 border-2 border-primary-300 shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>🛒</span>
            <span className="whitespace-nowrap">Marketplace</span>
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm sm:text-base ${
              activeTab === 'badges'
                ? 'bg-primary-100 text-slate-900 border-2 border-primary-300 shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>🏆</span>
            <span className="whitespace-nowrap">Badges</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm sm:text-base ${
              activeTab === 'stats'
                ? 'bg-primary-100 text-slate-900 border-2 border-primary-300 shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>📊</span>
            <span className="whitespace-nowrap">Stats</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'verify' && <ClaimVerifier />}
            {activeTab === 'marketplace' && <Marketplace />}
            {activeTab === 'badges' && <BadgeGallery />}
            {activeTab === 'stats' && <ActivityFeed />}
          </div>
          
          <div className="space-y-6">
            <Leaderboard />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 sm:py-8 mt-12 sm:mt-16">
        <div className="container mx-auto px-4 text-center text-slate-600">
          <p className="mb-2 text-sm sm:text-base font-medium">Built with ❤️ for the Hedera Ascension Hackathon</p>
          {/* <p className="text-xs sm:text-sm text-slate-500 px-2">
            🏆 Hackathon Submission: Legacy Builders + AI & Agents (Basic + Intermediate)
          </p> */}
        </div>
      </footer>
    </div>
  )
}

export default App
