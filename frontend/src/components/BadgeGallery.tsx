import { useQuery } from '@tanstack/react-query'
import { Award, Medal, Star, Crown, Sparkles, Trophy } from 'lucide-react'
import { getAllBadges } from '../services/api'
import type { Badge } from '../types'

const BADGE_CONFIG: Record<string, { 
  bg: string
  border: string
  text: string
  icon: typeof Award
  iconSize: string
  gradient?: string
  glow?: string
}> = {
  BRONZE: { 
    bg: 'bg-amber-50', 
    border: 'border-amber-300', 
    text: 'text-amber-700',
    icon: Medal,
    iconSize: 'w-8 h-8',
    gradient: 'from-amber-100 to-amber-50'
  },
  UNCOMMON: { 
    bg: 'bg-slate-50', 
    border: 'border-slate-300', 
    text: 'text-slate-700',
    icon: Award,
    iconSize: 'w-9 h-9',
    gradient: 'from-slate-100 to-slate-50'
  },
  RARE: { 
    bg: 'bg-primary-50', 
    border: 'border-primary-300', 
    text: 'text-primary-700',
    icon: Star,
    iconSize: 'w-10 h-10',
    gradient: 'from-primary-100 to-primary-50',
    glow: 'shadow-primary-200'
  },
  EPIC: { 
    bg: 'bg-secondary-50', 
    border: 'border-secondary-300', 
    text: 'text-secondary-700',
    icon: Sparkles,
    iconSize: 'w-11 h-11',
    gradient: 'from-secondary-100 to-secondary-50',
    glow: 'shadow-secondary-200'
  },
  LEGENDARY: { 
    bg: 'bg-gradient-to-br from-secondary-100 via-secondary-50 to-amber-50', 
    border: 'border-secondary-400', 
    text: 'text-secondary-800',
    icon: Crown,
    iconSize: 'w-12 h-12',
    gradient: 'from-secondary-200 via-secondary-100 to-amber-100',
    glow: 'shadow-secondary-300'
  },
}

export default function BadgeGallery() {
  const { data: badges = [], isLoading } = useQuery({
    queryKey: ['allBadges'],
    queryFn: () => getAllBadges(50),
  })

  if (isLoading) {
    return (
      <div className="card">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Badge Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-shimmer h-40 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Badge Gallery</h2>
        <span className="badge badge-info text-xs sm:text-sm whitespace-nowrap">{badges?.length || 0} badges</span>
      </div>

      {badges?.length === 0 ? (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No badges earned yet</p>
          <p className="text-sm text-slate-500 mt-2">
            Purchase 5 verified claims to earn your first badge!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badges?.map((badge: Badge) => {
            const config = BADGE_CONFIG[badge.tier] || BADGE_CONFIG.BRONZE
            const IconComponent = config.icon
            const isLegendary = badge.tier === 'LEGENDARY'
            const imageUrl = badge?.metadata?.image
            
            return (
              <div
                key={badge.id}
                className={`${config.bg} ${config.border} border-2 rounded-xl p-5 hover:shadow-xl transition-all ${
                  isLegendary ? 'ring-2 ring-secondary-300 ring-opacity-50' : ''
                } ${config.glow ? `hover:${config.glow} hover:shadow-lg` : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`relative ${config.bg} p-3.5 rounded-xl shadow-md ${
                    isLegendary ? 'bg-gradient-to-br ' + config.gradient : ''
                  } ${imageUrl ? 'overflow-hidden p-0 border border-white/50' : ''}`}>
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt={`${badge.tier} badge`}
                          className="w-16 h-16 rounded-xl object-cover"
                          loading="lazy"
                        />
                        {isLegendary && (
                          <div className="absolute inset-0 rounded-xl border border-secondary-200/60 pointer-events-none"></div>
                        )}
                      </>
                    ) : (
                      <>
                        <IconComponent
                          className={`${config.iconSize} ${config.text} ${
                            isLegendary ? 'animate-pulse' : ''
                          }`}
                          strokeWidth={isLegendary ? 2.5 : 2}
                        />
                        {isLegendary && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-400 rounded-full animate-ping"></div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`font-bold text-lg ${config.text} ${
                        isLegendary ? 'bg-gradient-to-r from-secondary-700 to-amber-700 bg-clip-text text-transparent' : ''
                      }`}>
                        {badge.tier}
                      </h3>
                      <span className={`text-xs font-medium ${
                        badge.tier === 'LEGENDARY' ? 'text-secondary-600' : 'text-slate-500'
                      }`}>
                        #{badge.serialNumber}
                      </span>
                      {isLegendary && (
                        <span className="ml-auto px-2 py-0.5 bg-secondary-200 text-secondary-800 text-xs font-bold rounded-full">
                          ⭐ TOP TIER
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-3 leading-relaxed ${
                      isLegendary ? 'text-slate-800 font-medium' : 'text-slate-700'
                    }`}>
                      {badge.metadata.description}
                    </p>
                    
                    <div className={`text-xs space-y-1.5 font-medium ${
                      isLegendary ? 'text-slate-700' : 'text-slate-600'
                    }`}>
                      <p>Owner: <span className="font-mono">{badge.recipient.substring(0, 12)}...</span></p>
                      <p>Purchases: <span className="font-bold">{badge.purchaseCount}</span></p>
                      <p>Token: <span className="font-mono text-xs">{badge.tokenId}</span></p>
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
