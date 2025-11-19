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
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Hedera Mind: Ascension
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            The AI That Never Lies
          </p>
          <p className="text-lg text-gray-500">
            Autonomous truth verification marketplace on Hedera blockchain
          </p>
        </div>

        <LiveStats />

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'verify'
                ? 'bg-primary-50 text-primary-900 border-2 border-primary-600 shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span>🔍</span>
            <span>Verify Claims</span>
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'marketplace'
                ? 'bg-primary-50 text-primary-900 border-2 border-primary-600 shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span>🛒</span>
            <span>Marketplace</span>
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'badges'
                ? 'bg-primary-50 text-primary-900 border-2 border-primary-600 shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span>🏆</span>
            <span>Badges</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'stats'
                ? 'bg-primary-50 text-primary-900 border-2 border-primary-600 shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span>📊</span>
            <span>Stats</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="mb-2">Built on Hedera Hashgraph | Powered by GROQ AI</p>
          <p className="text-sm">
            🏆 Hackathon Submission: Legacy Builders + AI & Agents (Basic + Intermediate)
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
