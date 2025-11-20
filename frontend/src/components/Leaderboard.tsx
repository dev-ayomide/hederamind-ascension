import { useQuery } from '@tanstack/react-query'
import { Trophy } from 'lucide-react'
import { getLeaderboard } from '../services/api'
import type { LeaderboardEntry } from '../types'

export default function Leaderboard() {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboard(10),
    refetchInterval: 15000,
  })

  if (isLoading) {
    return (
      <div className="card">
        <h3 className="text-xl font-bold mb-4">🏆 Leaderboard</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-shimmer h-16 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-600" />
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">Leaderboard</h3>
      </div>

      {leaderboard?.length === 0 ? (
        <p className="text-slate-600 text-sm text-center py-8 font-medium">
          No users yet. Be the first!
        </p>
      ) : (
        <div className="space-y-3">
          {leaderboard?.map((entry: LeaderboardEntry, index: number) => (
            <div
              key={entry.accountId}
              className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${
                index === 0
                  ? 'bg-gradient-to-r from-secondary-50 to-secondary-100 border-2 border-secondary-300 shadow-sm'
                  : index === 1
                  ? 'bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-300'
                  : index === 2
                  ? 'bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-300'
                  : 'bg-slate-50 border border-slate-200'
              }`}
            >
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {index === 0 ? (
                  <span className="text-2xl">🥇</span>
                ) : index === 1 ? (
                  <span className="text-2xl">🥈</span>
                ) : index === 2 ? (
                  <span className="text-2xl">🥉</span>
                ) : (
                  <span className="text-sm font-bold text-slate-500">#{index + 1}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {entry.accountId}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mt-0.5">
                  <span>🛒 {entry.purchaseCount} purchases</span>
                  <span>•</span>
                  <span>🏆 {entry.badgesEarned} badges</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
