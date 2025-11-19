import { useQuery } from '@tanstack/react-query'
import { Award } from 'lucide-react'
import { getAllBadges } from '../services/api'
import type { Badge } from '../types'

const BADGE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  BRONZE: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
  UNCOMMON: { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-700' },
  RARE: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
  EPIC: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
  LEGENDARY: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-700' },
}

export default function BadgeGallery() {
  const { data: badges = [], isLoading } = useQuery({
    queryKey: ['allBadges'],
    queryFn: () => getAllBadges(50),
  })

  if (isLoading) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Badge Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-shimmer h-40 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Badge Gallery</h2>
        <span className="badge badge-info">{badges?.length || 0} badges</span>
      </div>

      {badges?.length === 0 ? (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No badges earned yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Purchase 5 verified claims to earn your first badge!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {badges?.map((badge: Badge) => {
            const colors = BADGE_COLORS[badge.tier] || BADGE_COLORS.BRONZE
            return (
              <div
                key={badge.id}
                className={`${colors.bg} ${colors.border} border-2 rounded-lg p-4 hover:shadow-lg transition-all`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${colors.bg} p-3 rounded-lg`}>
                    <Award className={`w-8 h-8 ${colors.text}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-bold ${colors.text}`}>{badge.tier}</h3>
                      <span className="text-xs text-gray-500">
                        #{badge.serialNumber}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      {badge.metadata.description}
                    </p>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Owner: {badge.recipient.substring(0, 12)}...</p>
                      <p>Purchases: {badge.purchaseCount}</p>
                      <p>Token: {badge.tokenId}</p>
                      <p>Minted: {new Date(badge.mintedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
