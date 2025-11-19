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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-shimmer h-24"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      <div className="card hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Total Claims</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalClaims || 0}</p>
            <p className="text-xs text-green-600 mt-1">
              {stats?.trueClaims || 0} verified true
            </p>
          </div>
          <div className="bg-primary-100 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-primary-600" />
          </div>
        </div>
      </div>

      <div className="card hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Active Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Verified accounts</p>
          </div>
          <div className="bg-secondary-100 p-3 rounded-lg">
            <Users className="w-6 h-6 text-secondary-600" />
          </div>
        </div>
      </div>

      <div className="card hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Total Sales</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalSales || 0}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.totalRevenue || '0'} HBAR
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="card hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Badges Earned</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalBadges || 0}</p>
            <p className="text-xs text-gray-500 mt-1">NFT achievements</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg">
            <Award className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
