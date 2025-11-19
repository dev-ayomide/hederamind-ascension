import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { verifyClaim } from '../services/api'
import { useWallet } from '../contexts/WalletContext'
import type { Claim } from '../types'

export default function ClaimVerifier() {
  const [claimText, setClaimText] = useState('')
  const [result, setResult] = useState<Claim | null>(null)
  const queryClient = useQueryClient()
  const { accountId } = useWallet()

  const verifyMutation = useMutation({
    mutationFn: (claim: string) => verifyClaim(claim, accountId || undefined),
    onSuccess: (data) => {
      setResult(data)
      // Invalidate all queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['systemStats'] })
      queryClient.invalidateQueries({ queryKey: ['recentClaims'] })
      queryClient.invalidateQueries({ queryKey: ['marketplaceClaims'] })
      queryClient.invalidateQueries({ queryKey: ['activityFeed'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (claimText.trim()) {
      verifyMutation.mutate(claimText.trim())
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'TRUE':
        return <CheckCircle className="w-12 h-12 text-green-500" />
      case 'FALSE':
        return <XCircle className="w-12 h-12 text-red-500" />
      default:
        return <AlertCircle className="w-12 h-12 text-yellow-500" />
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'TRUE':
        return 'bg-green-50 border-green-200'
      case 'FALSE':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-yellow-50 border-yellow-200'
    }
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Verify a Claim</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="claim" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your claim to verify
          </label>
          <textarea
            id="claim"
            value={claimText}
            onChange={(e) => setClaimText(e.target.value)}
            placeholder="e.g., The Earth is round"
            className="input min-h-32 resize-none"
            disabled={verifyMutation.isPending}
          />
        </div>

        <button
          type="submit"
          disabled={!claimText.trim() || verifyMutation.isPending}
          className="btn-primary w-full"
        >
          {verifyMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
              Verifying with AI...
            </>
          ) : (
            <>
              🔍 Verify Claim
            </>
          )}
        </button>
      </form>

      {verifyMutation.isError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Verification failed</p>
          <p className="text-red-600 text-sm mt-1">
            {(verifyMutation.error as Error).message || 'Please try again later'}
          </p>
        </div>
      )}

      {result && (
        <div className={`mt-6 p-6 rounded-xl border-2 ${getVerdictColor(result.verdict)}`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {getVerdictIcon(result.verdict)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">
                Verdict: <span className={
                  result.verdict === 'TRUE' ? 'text-green-700' :
                  result.verdict === 'FALSE' ? 'text-red-700' :
                  'text-yellow-700'
                }>{result.verdict}</span>
              </h3>
              
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-600 mb-1">Confidence</p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      result.verdict === 'TRUE' ? 'bg-green-500' :
                      result.verdict === 'FALSE' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{result.confidence}% confident</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">AI Reasoning</p>
                <p className="text-sm text-gray-700">{result.reasoning}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-xs text-gray-500">
                  Verified by: {result.verifier} | 
                  Claim ID: {result.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
