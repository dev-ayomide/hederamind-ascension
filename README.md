# 🧠 Hedera Mind: Ascension

**Autonomous Truth Verification Marketplace on Hedera Blockchain**

[![Hedera](https://img.shields.io/badge/Hedera-Testnet-00A86B?style=flat&logo=hedera)](https://hedera.com)
[![GROQ AI](https://img.shields.io/badge/GROQ-Llama%203.3%2070B-FF6B6B?style=flat)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **A decentralized marketplace where AI agents verify claims, verified facts have real value (0.01 HBAR), and truth seekers earn NFT badges. Built on Hedera with GROQ AI.**

---

## 🎯 What It Does

Hedera Mind: Ascension creates a **trustless truth verification economy** where:

- ✅ **AI agents autonomously verify claims** using GROQ AI (Llama 3.3 70B)
- 💎 **Verified facts are sold** for 0.01 HBAR on the marketplace
- 🏆 **Truth seekers earn NFT badges** as rewards (every 5 purchases)
- 🔐 **On-chain agent proofs** guarantee authenticity (ERC-8004-style)
- 💰 **Revenue sharing** incentivizes creators (70% creator, 20% agent, 10% platform)

---

## 🚀 Key Features

### 🤖 Autonomous AI Agents
- **TruthAgent**: Verifies claims with AI and lists them for sale
- **BadgeAgent**: Automatically mints NFT badges after purchases
- **A2A Communication**: Agents coordinate via event-driven architecture

### 🔐 On-Chain Agent Identity
- **ERC-8004-style registry** deployed on Hedera
- **Smart Contract**: [`0.0.7286827`](https://hashscan.io/testnet/contract/0.0.7286827)
- **Verifiable proofs** for every transaction

### 💎 Real Blockchain Integration
- **Real HBAR payments** on Hedera Testnet
- **Real NFT badges** on Hedera Token Service
- **Badge Token**: [`0.0.7288739`](https://hashscan.io/testnet/token/0.0.7288739)
- **All transactions** verifiable on HashScan

### 💰 Economic Model
- **Revenue Sharing**: 70% to claim submitter, 20% to TruthAgent, 10% to platform
- **Micro-payments**: 0.01 HBAR per verified claim
- **NFT Rewards**: Tiered badge system (BRONZE → LEGENDARY)

---

## 🎬 How It Works

```
1. User submits claim
   ↓
2. GROQ AI (Llama 3.3 70B) verifies claim
   ↓
3. TruthAgent lists verified TRUE claim for sale (0.01 HBAR)
   ↓
4. Buyer purchases claim
   ↓
5. Revenue automatically shared:
   • 70% → Claim submitter
   • 20% → TruthAgent (treasury)
   • 10% → Platform (treasury)
   ↓
6. BadgeAgent tracks purchases
   ↓
7. After 5 purchases → NFT badge minted automatically
   ↓
8. All transactions logged on Hedera Consensus Service
```

**Fully autonomous, fully on-chain, fully verifiable.**

---

## 🛠️ Quick Start

### Prerequisites
- **Node.js** 18+ 
- **Hedera Testnet Account** ([Get one free](https://portal.hedera.com))
- **GROQ API Key** ([Get one here](https://console.groq.com))

### Backend Setup

```bash
# Clone repository
git clone <your-repo-url>
cd hederamind/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure `.env`:**
```env
# Hedera Testnet
OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
OPERATOR_KEY=your_private_key_here
NETWORK=testnet

# GROQ AI
GROQ_API_KEY=gsk_your_groq_api_key_here

# Optional: Deploy agent registry
AGENT_REGISTRY_CONTRACT=0.0.7286827

# Optional: Create badge token
BADGE_TOKEN_ID=0.0.7288739

# Badge IPFS URLs (if you have them)
BADGE_BRONZE_IPFS_URL=https://gateway.pinata.cloud/ipfs/...
BADGE_UNCOMMON_IPFS_URL=https://gateway.pinata.cloud/ipfs/...
BADGE_RARE_IPFS_URL=https://gateway.pinata.cloud/ipfs/...
BADGE_EPIC_IPFS_URL=https://gateway.pinata.cloud/ipfs/...
BADGE_LEGENDARY_IPFS_URL=https://gateway.pinata.cloud/ipfs/...
```

**Start backend:**
```bash
npm start
# Server runs on http://localhost:3002
```

### Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3002" > .env
echo "VITE_TREASURY_ACCOUNT_ID=0.0.6398676" >> .env
echo "VITE_PURCHASE_AMOUNT_HBAR=0.01" >> .env

# Start development server
npm run dev
# App runs on http://localhost:5173
```

### Deploy Agent Registry (Optional)

```bash
cd backend
npm run deploy:registry
# Copy the contract ID to .env as AGENT_REGISTRY_CONTRACT
```

### Create Badge Token (Optional)

```bash
cd backend
npm run create:badge-token
# Copy the token ID to .env as BADGE_TOKEN_ID
```

---

## 📖 Usage

### Web Interface

1. **Open the app**: `http://localhost:5173`
2. **Connect wallet**: Enter your Hedera Testnet Account ID and Private Key
3. **Submit a claim**: Go to "Verify Claims" tab, enter a claim, verify it
4. **Buy a claim**: Go to "Marketplace" tab, purchase verified claims (0.01 HBAR)
5. **Earn badges**: Buy 5 claims to earn your first NFT badge
6. **View badges**: Check "Badges" tab to see your NFT collection

### API Endpoints

```bash
# Verify a claim
POST /api/claims/verify
Body: { "claim": "Your claim here", "accountId": "0.0.xxxxx" }

# Get all verified claims
GET /api/claims?verdict=TRUE&limit=20

# Buy a claim
POST /api/marketplace/buy
Body: { "claim": "claim text", "buyerAccountId": "0.0.xxxxx", "transactionId": "0.0.xxxxx@..." }

# Get user badges
GET /api/badges?accountId=0.0.xxxxx

# Get system stats
GET /api/stats
```

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + TailwindCSS
│   (Port 5173)   │
└────────┬────────┘
         │ HTTP
┌────────▼────────┐
│   Backend API   │  Node.js + Express
│   (Port 3002)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│ GROQ  │ │Hedera │
│  AI   │ │Blockchain│
└───────┘ └───────┘
```

### Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite
- TailwindCSS
- TanStack Query
- Lucide React Icons

**Backend:**
- Node.js + Express
- GROQ AI SDK (Llama 3.3 70B)
- Hedera SDK
- Solidity (Smart Contracts)

**Blockchain:**
- Hedera Consensus Service (HCS)
- Hedera Token Service (HTS)
- Smart Contracts (Agent Registry)

**Storage:**
- IPFS (Pinata) - Badge images
- File-based JSON - Local data

---

## 🔗 Blockchain Verification

### Smart Contracts

- **Agent Registry**: [`0.0.7286827`](https://hashscan.io/testnet/contract/0.0.7286827)
  - ERC-8004-style on-chain agent identity
  - Verifies TruthAgent and BadgeAgent

- **Badge Token**: [`0.0.7288739`](https://hashscan.io/testnet/token/0.0.7288739)
  - NFT collection for truth seeker badges
  - Tiers: BRONZE, UNCOMMON, RARE, EPIC, LEGENDARY

### Sample Transactions

All transactions are real and verifiable on [HashScan Testnet](https://hashscan.io/testnet).

---

## 💡 Key Differentiators

1. **On-Chain Agent Proofs**: Only platform with verifiable agent identities via smart contract
2. **Revenue Sharing**: Sustainable economic model (70/20/10 split)
3. **Real Blockchain**: Actual Hedera transactions, not simulated
4. **Autonomous Agents**: Agents work independently and coordinate automatically
5. **Production Ready**: Fully functional, not a prototype

---

## 📊 Current Metrics

- ✅ **3 verified claims** (real GROQ AI verified)
- ✅ **5 marketplace sales** (real HBAR transfers)
- ✅ **2 NFT badges minted** (real NFTs on Hedera)
- ✅ **3 active users**
- ✅ **100% on-chain** transactions

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP (Current)
- AI verification ✅
- Agent marketplace ✅
- NFT badges ✅
- Revenue sharing ✅

### 🚀 Phase 2: Community (Q1 2025)
- User-submitted claims
- Community voting
- Reputation system

### 📈 Phase 3: Staking (Q2 2025)
- Staking for verifiers
- Dispute resolution
- Penalty/reward system

### 🌐 Phase 4: Enterprise (Q3 2025)
- Enterprise API
- Data monetization
- Analytics dashboard

### 🏛️ Phase 5: DAO (Q4 2025)
- DAO governance
- Agent ecosystem
- Token-based voting

---

## 🔐 Security

- **Private Keys**: Stored locally in browser (never sent to server)
- **API Keys**: Securely loaded from environment variables
- **Blockchain**: All transactions immutable on Hedera
- **No PII**: System only processes claims, no personal information

---

## 🐛 Troubleshooting

**Backend won't start:**
- Check `.env` file exists and has all required variables
- Ensure Node.js 18+ is installed
- Run `npm install` to install dependencies

**Frontend can't connect:**
- Verify `VITE_API_URL` points to running backend
- Check backend is running on port 3002
- Check browser console for errors

**Wallet connection fails:**
- Ensure Account ID format is correct (`0.0.xxxxx`)
- Verify Private Key is valid Hedera format
- Check you're using Testnet credentials

**Badge minting shows "demo":**
- Ensure `BADGE_TOKEN_ID` is set in backend `.env`
- Run `npm run create:badge-token` to create token
- Restart backend after setting token ID

---

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Demo Script](DEMO_SCRIPT.md)
- [Pitch Deck](PITCH_DECK.md)
- [Submission Checklist](SUBMISSION_CHECKLIST.md)

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- **Hedera Hashgraph** for the consensus service and token service
- **GROQ** for fast AI inference
- **Open source community** for excellent tooling

---

**Made with ❤️ for the decentralized future of truth verification**

*Hedera Mind: Ascension - Bringing AI and blockchain together for trustworthy information*

---

## 🔗 Links

- 🌐 **Live Demo**: [Your deployed URL]
- 📱 **GitHub**: [Your repo]
- 🔗 **HashScan**: 
  - [Agent Registry](https://hashscan.io/testnet/contract/0.0.7286827)
  - [Badge Token](https://hashscan.io/testnet/token/0.0.7288739)
