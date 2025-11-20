import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingCart, Loader2, CheckCircle, ShieldCheck, Copy, ExternalLink } from 'lucide-react'
import { getAllClaims, buyClaim } from '../services/api'
import { useWallet } from '../contexts/WalletContext'
import type { Claim, AgentProof } from '../types'

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
    onSuccess: ({ sale }) => {
      queryClient.invalidateQueries({ queryKey: ['systemStats'] })
      queryClient.invalidateQueries({ queryKey: ['userDashboard'] })
      queryClient.invalidateQueries({ queryKey: ['activityFeed'] })
      if (sale?.agent?.proof) {
        setLatestProof(sale.agent.proof)
      }
      setBuyingClaimId(null)
    },
    onError: () => {
      setBuyingClaimId(null)
    }
  })
  const [latestProof, setLatestProof] = useState<AgentProof | null>(null)

  const hashscanBase = 'https://hashscan.io/testnet'

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Truth Marketplace</h2>
        <span className="badge badge-info text-xs sm:text-sm whitespace-nowrap">{claims?.length || 0} verified claims</span>
      </div>

      {claims?.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">No verified claims available yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {claims?.map((claim: Claim) => (
              <div
                key={claim.id}
                className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 flex-shrink-0" />
                      <span className="badge badge-success text-xs">VERIFIED TRUE</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {claim.confidence}% confident
                      </span>
                    </div>
                    
                    <p className="text-slate-900 font-semibold mb-2 text-base sm:text-lg break-words">{claim.claim}</p>
                    
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed break-words">{claim.reasoning}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="truncate">ID: {claim.id}</span>
                      <span>•</span>
                      <span>By: {claim.verifier}</span>
                      <span>•</span>
                      <span>{new Date(claim.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="text-left sm:text-right">
                      <p className="text-xl sm:text-2xl font-bold text-primary-600">0.01</p>
                      <p className="text-xs text-slate-500 font-medium">HBAR</p>
                    </div>
                    
                    <button
                      onClick={() => handleBuy(claim)}
                      disabled={buyingClaimId === claim.id}
                      className="btn-primary text-xs sm:text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2"
                    >
                      {buyingClaimId === claim.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin inline mr-1" />
                          Buying...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1" />
                          Buy Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {latestProof && (
            <div className="mt-6 border-2 border-primary-200 bg-emerald-50/30 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-primary-600" />
                <p className="text-sm font-bold text-primary-700 uppercase tracking-wide">
                  On-Chain Proof (Hedera Agent Registry)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide mb-1.5 font-semibold">Agent ID</p>
                  <p className="font-mono text-slate-900 font-medium">{latestProof.agentId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide mb-1.5 font-semibold">Contract</p>
                  <a
                    href={`${hashscanBase}/contract/${latestProof.contractId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary-600 font-semibold hover:text-primary-700"
                  >
                    {latestProof.contractId}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-slate-600 uppercase tracking-wide mb-1.5 font-semibold">Agent Key</p>
                      <p className="font-mono text-xs text-slate-900 truncate">
                        {latestProof.agentKey}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(latestProof.agentKey)}
                      className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide mb-1.5 font-semibold">Metadata</p>
                  <a
                    href={latestProof.metadataURI}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary-600 font-semibold hover:text-primary-700 break-all"
                  >
                    {latestProof.metadataURI}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide mb-1.5 font-semibold">Status</p>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    {latestProof.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-4 font-medium">
                Registered at: {new Date(latestProof.registeredAt * 1000).toLocaleString()}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
