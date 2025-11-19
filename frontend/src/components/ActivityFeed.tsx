import { useQuery } from '@tanstack/react-query'
import { Activity as ActivityIcon, CheckCircle, ShoppingCart, Award } from 'lucide-react'
import { getActivity } from '../services/api'
import type { Activity } from '../types'

export default function ActivityFeed() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activityFeed'],
    queryFn: () => getActivity(30),
    refetchInterval: 10000,
  })

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
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'claim_purchased':
        return <ShoppingCart className="w-5 h-5 text-blue-500" />
      case 'badge_minted':
        return <Award className="w-5 h-5 text-yellow-500" />
      default:
        return <ActivityIcon className="w-5 h-5 text-gray-500" />
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
        <ActivityIcon className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold">Recent Activity</h2>
      </div>

      {activities?.length === 0 ? (
        <div className="text-center py-12">
          <ActivityIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {activities?.map((activity: Activity, index: number) => (
            <div
              key={`${activity.type}-${activity.timestamp}-${index}`}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-all"
            >
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 mb-1">
                  {getActivityText(activity)}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
