import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingCart, Loader2, CheckCircle, ShieldCheck, Copy, ExternalLink, Coins } from 'lucide-react'
import { getAllClaims, buyClaim } from '../services/api'
import { useWallet } from '../contexts/WalletContext'
import type { Claim, AgentProof } from '../types'

const TREASURY_ACCOUNT_ID = import.meta.env.VITE_TREASURY_ACCOUNT_ID || '0.0.6398676'
const PURCHASE_AMOUNT_HBAR = Number(import.meta.env.VITE_PURCHASE_AMOUNT_HBAR ?? '0.01')

export default function Marketplace() {
  const queryClient = useQueryClient()
  const { accountId, isConnected, sendHbarTransfer, provider } = useWallet()
  const [buyingClaimId, setBuyingClaimId] = useState<string | null>(null)
  
  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['marketplaceClaims'],
    queryFn: () => getAllClaims({ verdict: 'TRUE', limit: 20 }),
  })

  const [latestProof, setLatestProof] = useState<AgentProof | null>(null)
  const [latestRevenue, setLatestRevenue] = useState<any>(null)

  const buyMutation = useMutation({
    mutationFn: ({ claim, accountId, transactionId }: { claim: string; accountId: string; transactionId: string }) =>
      buyClaim(claim, accountId, transactionId),
    onSuccess: (response) => {
      console.log('Purchase response:', response)
      const { sale, revenue } = response
      
      queryClient.invalidateQueries({ queryKey: ['systemStats'] })
      queryClient.invalidateQueries({ queryKey: ['userDashboard'] })
      queryClient.invalidateQueries({ queryKey: ['activityFeed'] })
      
      if (sale?.agent?.proof) {
        setLatestProof(sale.agent.proof)
      }
      
      if (revenue) {
        console.log('Revenue data received:', revenue)
        setLatestRevenue(revenue)
      } else {
        console.warn('No revenue data in response')
      }
      
      setBuyingClaimId(null)
    },
    onError: (error) => {
      console.error('Purchase error:', error)
      setBuyingClaimId(null)
    }
  })

  const hashscanBase = 'https://hashscan.io/testnet'

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleBuy = async (claim: Claim) => {
    if (!isConnected || !accountId) {
      alert('Please connect your wallet first!')
      return
    }
    if (!isConnected) {
      alert(
        'Wallet connection required for payments.\n\n' +
        'Please click "Connect Wallet" and enter your:\n' +
        '1. Hedera Testnet Account ID (0.0.xxxxx)\n' +
        '2. Private Key\n\n' +
        'Get testnet credentials from portal.hedera.com'
      )
      return
    }
    setBuyingClaimId(claim.id)
    try {
      const { transactionId } = await sendHbarTransfer({
        toAccountId: TREASURY_ACCOUNT_ID,
        amountHbar: PURCHASE_AMOUNT_HBAR,
        memo: `HederaMind:${claim.id.slice(-6)}`
      })
      buyMutation.mutate({ claim: claim.claim, accountId, transactionId })
    } catch (error: any) {
      console.error('Payment failed:', error)
      alert(error?.message || 'Payment failed. Please try again.')
      setBuyingClaimId(null)
    }
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
                      <span>Verified by: {claim.verifier}</span>
                      {claim.submittedBy && claim.submittedBy !== 'anonymous' && (
                        <>
                          <span>•</span>
                          <span>Submitted by: <span className="font-mono text-slate-700">{claim.submittedBy.substring(0, 12)}...</span></span>
                        </>
                      )}
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

          {/* Agent Proof Card */}
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

          {/* Revenue Sharing Card - Shows independently */}
          {latestRevenue && (
            <div className={`mt-6 border-2 border-secondary-200 bg-secondary-50/30 rounded-xl p-5 shadow-sm`}>
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-secondary-600" />
                <p className="text-sm font-bold text-secondary-700 uppercase tracking-wide">
                  Revenue Distribution
                </p>
              </div>

              <div className="space-y-3 text-sm">
                {latestRevenue.submitter && (
                  <div className="bg-white/60 rounded-lg p-3 border border-secondary-200">
                    <p className="text-xs text-slate-600 uppercase tracking-wide mb-1 font-semibold">
                      Claim Submitter (70%)
                    </p>
                    <p className="font-mono text-slate-900 font-medium text-xs mb-1">
                      {latestRevenue.submitter.accountId.substring(0, 20)}...
                    </p>
                    <p className="text-secondary-700 font-bold">
                      +{latestRevenue.submitter.amount} HBAR
                    </p>
                    {latestRevenue.submitter.transactionId && (
                      <a
                        href={`${hashscanBase}/transaction/${latestRevenue.submitter.transactionId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-secondary-600 hover:text-secondary-700 mt-1"
                      >
                        View on HashScan
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {latestRevenue.truthAgent && (
                  <div className="bg-white/60 rounded-lg p-3 border border-secondary-200">
                    <p className="text-xs text-slate-600 uppercase tracking-wide mb-1 font-semibold">
                      TruthAgent (20%)
                    </p>
                    <p className="font-mono text-slate-900 font-medium text-xs mb-1">
                      {latestRevenue.truthAgent.accountId}
                    </p>
                    <p className="text-secondary-700 font-bold">
                      {latestRevenue.truthAgent.amount} HBAR
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      💼 Retained in treasury account
                    </p>
                    <a
                      href={`${hashscanBase}/account/${latestRevenue.truthAgent.accountId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-secondary-600 hover:text-secondary-700 mt-1"
                    >
                      View Treasury on HashScan
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {latestRevenue.truthAgent.note && (
                      <p className="text-xs text-slate-400 mt-1 italic">{latestRevenue.truthAgent.note}</p>
                    )}
                  </div>
                )}

                {latestRevenue.platform && (
                  <div className="bg-white/60 rounded-lg p-3 border border-secondary-200">
                    <p className="text-xs text-slate-600 uppercase tracking-wide mb-1 font-semibold">
                      Platform Treasury (10%)
                    </p>
                    <p className="text-secondary-700 font-bold">
                      {latestRevenue.platform.amount} HBAR
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      💼 Retained in treasury account
                    </p>
                    {latestRevenue.truthAgent && (
                      <a
                        href={`${hashscanBase}/account/${latestRevenue.truthAgent.accountId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-secondary-600 hover:text-secondary-700 mt-1"
                      >
                        View Treasury on HashScan
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {latestRevenue.platform.note && (
                      <p className="text-xs text-slate-400 mt-1 italic">{latestRevenue.platform.note}</p>
                    )}
                  </div>
                )}

                  <div className="pt-2 border-t border-secondary-200">
                    <p className="text-xs text-slate-600 font-semibold mb-1">
                      Total: <span className="text-slate-900 font-bold">{latestRevenue.total} HBAR</span>
                    </p>
                    <p className="text-xs text-slate-500 italic">
                      💡 {latestRevenue.submitter 
                        ? '70% transferred to submitter, 30% retained in treasury' 
                        : '100% retained in treasury (TruthAgent-generated claim)'}
                    </p>
                  </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
