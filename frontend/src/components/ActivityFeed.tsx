import { useQuery } from '@tanstack/react-query'
import { Activity as ActivityIcon, CheckCircle, ShoppingCart, Award, ShieldCheck, ExternalLink, ImageOff } from 'lucide-react'
import { getActivity } from '../services/api'
import type { Activity, AgentProof, Sale, Badge } from '../types'

export default function ActivityFeed() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activityFeed'],
    queryFn: () => getActivity(30),
    refetchInterval: 10000,
  })

  const hashscanBase = 'https://hashscan.io/testnet'

  const truncateKey = (value: string, size = 10) => {
    if (!value) return ''
    if (value.length <= size * 2) return value
    return `${value.slice(0, size)}…${value.slice(-size / 2)}`
  }

  if (isLoading) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-shimmer h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'claim_verified':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case 'claim_purchased':
        return <ShoppingCart className="w-5 h-5 text-primary-600" />
      case 'badge_minted':
        return <Award className="w-5 h-5 text-secondary-600" />
      default:
        return <ActivityIcon className="w-5 h-5 text-slate-500" />
    }
  }

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'claim_verified':
        return `New claim verified: "${(activity.data as any).claim?.substring(0, 50)}..."`
      case 'claim_purchased':
        return `Claim purchased by ${(activity.data as any).buyer}`
      case 'badge_minted':
        return `${(activity.data as any).tier} badge earned!`
      default:
        return 'Unknown activity'
    }
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <ActivityIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Recent Activity</h2>
      </div>

      {activities?.length === 0 ? (
        <div className="text-center py-12">
          <ActivityIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {activities?.map((activity: Activity, index: number) => {
            const proof: AgentProof | undefined | null =
              activity.type === 'claim_purchased'
                ? ((activity.data as Sale)?.agent?.proof ?? null)
                : null
            const badgeActivity: Badge | null =
              activity.type === 'badge_minted'
                ? ((activity.data as Badge) ?? null)
                : null
            const badgeTierColors: Record<string, string> = {
              BRONZE: 'bg-amber-50 border-amber-200',
              UNCOMMON: 'bg-slate-50 border-slate-200',
              RARE: 'bg-emerald-50 border-emerald-200',
              EPIC: 'bg-amber-50 border-amber-200',
              LEGENDARY: 'bg-gradient-to-r from-amber-50 via-secondary-50 to-white border-secondary-200'
            }

            return (
              <div key={`${activity.type}-${activity.timestamp}-${index}`}>
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 mb-1 font-medium">
                      {getActivityText(activity)}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                {proof && (
                  <div className="w-full mt-2 text-xs border-2 border-primary-200 bg-emerald-50/30 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-1 text-primary-700 font-bold uppercase tracking-wide mb-2">
                      <ShieldCheck className="w-3 h-3" />
                      On-Chain Proof
                    </div>
                    <p className="text-slate-700 mt-1 font-medium">
                      Agent <span className="font-mono text-slate-900">{proof.agentId}</span> · Contract{' '}
                      <a
                        href={`${hashscanBase}/contract/${proof.contractId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary-600 font-semibold hover:text-primary-700"
                      >
                        {proof.contractId}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                    <p className="text-slate-600 mt-1 font-medium">
                      Key: <span className="font-mono text-slate-900">{truncateKey(proof.agentKey)}</span>
                    </p>
                  </div>
                )}
                {badgeActivity && (
                  <div
                    className={`w-full mt-2 text-xs border-2 rounded-xl p-3 shadow-sm ${
                      badgeTierColors[badgeActivity.tier] || 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3 text-slate-800">
                      <Award className="w-4 h-4 text-secondary-600" />
                      <p className="text-xs font-bold uppercase tracking-wide">
                        {badgeActivity.tier} Badge Minted
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      {badgeActivity.metadata?.image ? (
                        <div className="relative">
                          <img
                            src={badgeActivity.metadata.image}
                            alt={`${badgeActivity.tier} badge`}
                            className="w-16 h-16 rounded-xl object-cover border border-white shadow-md"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-white/80 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                          <ImageOff className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 text-slate-700 space-y-1.5">
                        <p>
                          Owner:{' '}
                          <span className="font-mono text-slate-900">
                            {badgeActivity.recipient.substring(0, 12)}...
                          </span>
                        </p>
                        <p>
                          Purchases:{' '}
                          <span className="font-semibold text-slate-900">
                            {badgeActivity.purchaseCount}
                          </span>
                        </p>
                        <p>
                          Token:{' '}
                          <a
                            href={`${hashscanBase}/token/${badgeActivity.tokenId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-primary-600 font-semibold hover:text-primary-700"
                          >
                            {badgeActivity.tokenId}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </p>
                        <p className="text-slate-500">
                          Serial #{badgeActivity.serialNumber} ·{' '}
                          {new Date(badgeActivity.mintedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
