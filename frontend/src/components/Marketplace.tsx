import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingCart, Loader2, CheckCircle, XCircle, Wallet as WalletIcon } from 'lucide-react'
import { getAllClaims, buyClaim } from '../services/api'
import { useWallet } from '../contexts/WalletContext'
import type { Claim } from '../types'

export default function Marketplace() {
  const queryClient = useQueryClient()
  const { accountId, isConnected } = useWallet()
  const [buyingClaimId, setBuyingClaimId] = useState<string | null>(null)
  
  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['marketplaceClaims'],
    queryFn: () => getAllClaims({ verdict: 'TRUE', limit: 20 }),
  })

  const buyMutation = useMutation({
    mutationFn: ({ claim, accountId }: { claim: string; accountId: string }) =>
      buyClaim(claim, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemStats'] })
      queryClient.invalidateQueries({ queryKey: ['userDashboard'] })
      queryClient.invalidateQueries({ queryKey: ['activityFeed'] })
      setBuyingClaimId(null)
    },
    onError: () => {
      setBuyingClaimId(null)
    }
  })

  const handleBuy = (claim: Claim) => {
    if (!isConnected || !accountId) {
      alert('Please connect your wallet first!')
      return
    }
    setBuyingClaimId(claim.id)
    buyMutation.mutate({ claim: claim.claim, accountId })
  }

  if (isLoading) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Truth Marketplace</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-shimmer h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Truth Marketplace</h2>
        <span className="badge badge-info">{claims?.length || 0} verified claims</span>
      </div>

      {claims?.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No verified claims available yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims?.map((claim: Claim) => (
            <div
              key={claim.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="badge badge-success">VERIFIED TRUE</span>
                    <span className="text-xs text-gray-500">
                      {claim.confidence}% confident
                    </span>
                  </div>
                  
                  <p className="text-gray-900 font-medium mb-2">{claim.claim}</p>
                  
                  <p className="text-sm text-gray-600 mb-3">{claim.reasoning}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>ID: {claim.id}</span>
                    <span>•</span>
                    <span>By: {claim.verifier}</span>
                    <span>•</span>
                    <span>{new Date(claim.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right mb-2">
                    <p className="text-2xl font-bold text-primary-600">0.01</p>
                    <p className="text-xs text-gray-500">HBAR</p>
                  </div>
                  
                  <button
                    onClick={() => handleBuy(claim)}
                    disabled={buyingClaimId === claim.id}
                    className="btn-primary text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {buyingClaimId === claim.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                        Buying...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 inline mr-1" />
                        Buy Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
