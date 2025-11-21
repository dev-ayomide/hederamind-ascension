# 🧠 Hedera Mind: Ascension 
**Autonomous Truth Verification Marketplace on Hedera Blockchain**

[![Hedera](https://img.shields.io/badge/Hedera-Testnet-00A86B?style=flat&logo=hedera)](https://hedera.com)
[![GROQ AI](https://img.shields.io/badge/GROQ-Llama%203.3%2070B-FF6B6B?style=flat)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **A decentralized marketplace where AI agents verify claims, verified facts have real value (0.01 HBAR), and truth seekers earn NFT badges.**

---

## 🎯 What It Does

- ✅ **AI agents verify claims** using GROQ AI (Llama 3.3 70B)
- 💎 **Verified facts sold** for 0.01 HBAR on marketplace
- 🏆 **Truth seekers earn NFT badges** (every 5 purchases)
- 🔐 **On-chain agent proofs** guarantee authenticity (ERC-8004)
- 💰 **Revenue sharing**: 70% creator, 20% agent, 10% platform

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Hedera Testnet Account ([Get one free](https://portal.hedera.com))
- GROQ API Key ([Get one here](https://console.groq.com))

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

**Required `.env` variables:**
```env
OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
OPERATOR_KEY=your_private_key_here
NETWORK=testnet
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### Frontend Setup

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:3002" > .env
echo "VITE_TREASURY_ACCOUNT_ID=0.0.6398676" >> .env
echo "VITE_PURCHASE_AMOUNT_HBAR=0.01" >> .env
npm run dev
```

Open `http://localhost:5173`

---

## 🎬 Demo Video

**Watch the full demo**: [https://www.loom.com/share/8d6cd958e9b7403e9924fcd3f61f2284](https://www.loom.com/share/8d6cd958e9b7403e9924fcd3f61f2284)

---

## 🔗 Blockchain Verification

- **Agent Registry**: [`0.0.7286827`](https://hashscan.io/testnet/contract/0.0.7286827)
- **Badge Token**: [`0.0.7288739`](https://hashscan.io/testnet/token/0.0.7288739)
- **All transactions** verifiable on [HashScan Testnet](https://hashscan.io/testnet)

---

## 🛠️ Tech Stack

**Frontend**: React + TypeScript + TailwindCSS  
**Backend**: Node.js + Express + GROQ AI  
**Blockchain**: Hedera (HCS + HTS + Smart Contracts)  
**Storage**: IPFS (Pinata) for badge images

---

## 📊 Features

- 🤖 **Autonomous AI Agents** (TruthAgent, BadgeAgent)
- 🔐 **On-Chain Agent Registry** (ERC-8004-style)
- 💎 **Real HBAR Payments** & NFT Badges
- 💰 **Revenue Sharing Model** (70/20/10)
- 📊 **Live Dashboard** & Activity Feed

---

## 🗺️ Roadmap

- ✅ **Phase 1: MVP** (Current) - AI verification, marketplace, badges, revenue sharing
- 🚀 **Phase 2: Community** (Q1 2025) - User submissions, voting, reputation
- 📈 **Phase 3: Staking** (Q2 2025) - Staking, dispute resolution
- 🌐 **Phase 4: Enterprise** (Q3 2025) - API, data monetization
- 🏛️ **Phase 5: DAO** (Q4 2025) - Governance, agent ecosystem

---

## 📚 Documentation

- [Quick Deployment Guide](QUICK_DEPLOY.md)
- [Free Deployment Options](FREE_DEPLOYMENT_OPTIONS.md)

---

## 📄 License

MIT License

---

**Made with ❤️ for the decentralized future of truth verification**

*Hedera Mind: Ascension - Bringing AI and blockchain together for trustworthy information*
