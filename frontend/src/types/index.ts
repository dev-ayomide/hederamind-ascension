export interface AgentProof {
  agentId: string
  agentKey: string
  contractId: string
  metadataURI: string
  registeredAt: number
  active: boolean
}

export interface Claim {
  id: string
  claim: string
  verdict: 'TRUE' | 'FALSE' | 'UNCERTAIN'
  confidence: number
  reasoning: string
  verifier: string
  submittedBy?: string
  timestamp: string
}

export interface Sale {
  id: string
  claim: string
  verdict: string
  confidence: number
  reasoning: string
  buyer: string
  seller: string
  price: number
  transactionId: string
  timestamp: string
  agent?: {
    id: string
    proof?: AgentProof | null
  }
}

export interface Badge {
  id: string
  recipient: string
  tier: 'BRONZE' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  purchaseCount: number
  tokenId: string
  serialNumber: string
  metadata: {
    name: string
    description: string
    image?: string
  }
  mintedAt: string
}

export interface User {
  id: string
  accountId: string
  purchaseCount: number
  badgesEarned: number
  createdAt: string
  updatedAt?: string
}

export interface Stats {
  totalClaims: number
  trueClaims: number
  falseClaims: number
  totalUsers: number
  totalSales: number
  totalBadges: number
  totalRevenue: string
  avgConfidence: string
  timestamp: string
}

export interface LeaderboardEntry {
  accountId: string
  purchaseCount: number
  badgesEarned: number
  createdAt: string
}

export interface Activity {
  type: 'claim_verified' | 'claim_purchased' | 'badge_minted'
  data: Claim | Sale | Badge
  timestamp: string
}
