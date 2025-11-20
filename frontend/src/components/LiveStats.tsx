import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Users, ShoppingCart, Award } from 'lucide-react'
import { getSystemStats } from '../services/api'

export default function LiveStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['systemStats'],
    queryFn: getSystemStats,
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-shimmer h-20 sm:h-24"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
      <div className="card hover:shadow-xl transition-all">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-slate-500 text-xs sm:text-sm mb-1 font-medium truncate">Total Claims</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-0.5 sm:mb-1">{stats?.totalClaims || 0}</p>
            <p className="text-xs text-emerald-600 mt-0.5 sm:mt-1 font-semibold truncate">
              {stats?.trueClaims || 0} verified true
            </p>
          </div>
          <div className="bg-primary-100 p-2 sm:p-3.5 rounded-xl flex-shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          </div>
        </div>
      </div>

      <div className="card hover:shadow-xl transition-all">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-slate-500 text-xs sm:text-sm mb-1 font-medium truncate">Active Users</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-0.5 sm:mb-1">{stats?.totalUsers || 0}</p>
            <p className="text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">Verified accounts</p>
          </div>
          <div className="bg-slate-100 p-2 sm:p-3.5 rounded-xl flex-shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
          </div>
        </div>
      </div>

      <div className="card hover:shadow-xl transition-all">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-slate-500 text-xs sm:text-sm mb-1 font-medium truncate">Total Sales</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-0.5 sm:mb-1">{stats?.totalSales || 0}</p>
            <p className="text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">
              {stats?.totalRevenue || '0'} HBAR
            </p>
          </div>
          <div className="bg-primary-100 p-2 sm:p-3.5 rounded-xl flex-shrink-0">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
          </div>
        </div>
      </div>

      <div className="card hover:shadow-xl transition-all">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-slate-500 text-xs sm:text-sm mb-1 font-medium truncate">Badges Earned</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-0.5 sm:mb-1">{stats?.totalBadges || 0}</p>
            <p className="text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">NFT achievements</p>
          </div>
          <div className="bg-secondary-100 p-2 sm:p-3.5 rounded-xl flex-shrink-0">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
