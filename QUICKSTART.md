# ⚡ Quick Start Guide - Hedera Mind: Ascension

## 🚀 In 3 Minutes

### Prerequisites Check
```bash
node --version  # Should be 18+
npm --version   # Should be 8+
```

### Start in 3 Commands

**Terminal 1 - Backend:**
```bash
cd backend
node api/server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Test:**
```bash
curl http://localhost:3001/health
```

### Access
- 🌐 **Frontend:** http://localhost:3000
- 🔌 **Backend API:** http://localhost:3001
- 📚 **API Docs:** `backend/API.md`

---

## 📝 Try It Out

### 1. Verify a Claim (via UI)
1. Go to http://localhost:3000
2. Enter: "The Earth is round"
3. Click "🔍 Verify Claim"
4. See AI verdict, confidence, and reasoning

### 2. Verify a Claim (via API)
```bash
curl -X POST http://localhost:3001/api/claims/verify \
  -H "Content-Type: application/json" \
  -d '{"claim": "Water freezes at 0°C"}'
```

### 3. Check System Stats
```bash
curl http://localhost:3001/api/stats | jq '.'
```

### 4. View Leaderboard
```bash
curl http://localhost:3001/api/stats/leaderboard | jq '.'
```

### 5. Get Recent Claims
```bash
curl http://localhost:3001/api/claims/recent?limit=5 | jq '.'
```

---

## 🎯 Quick Feature Tour

### Main Dashboard (http://localhost:3000)
- **Live Stats Cards** - Total claims, users, sales, badges
- **Tab Navigation** - Verify, Marketplace, Badges, Stats
- **Leaderboard Sidebar** - Top users ranked by activity
- **Real-time Updates** - Auto-refresh every 10-15 seconds

### Verify Claims Tab
- Submit any factual claim
- AI analyzes with Llama 3.3 70B
- Returns verdict + confidence + reasoning
- Claim stored on Hedera HCS

### Marketplace Tab
- Browse verified TRUE claims
- See AI reasoning for each
- Purchase for 0.01 HBAR
- Earn badges after milestones

### Badges Tab
- View all earned NFT badges
- Tiers: Bronze → Uncommon → Rare → Epic → Legendary
- Minted via Hedera Token Service
- Track purchase count per badge

### Stats Tab
- Activity feed of recent events
- Claim verifications
- Marketplace purchases
- Badge minting events

---

## 🔧 Troubleshooting

### Backend won't start?
```bash
# Check if port 3001 is in use
netstat -ano | grep 3001

# Or use different port
PORT=3002 node api/server.js
```

### Frontend won't start?
```bash
# Check if port 3000 is in use
netstat -ano | grep 3000

# Or reinstall dependencies
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### API returns errors?
```bash
# Check backend logs
cd backend
node api/server.js

# Verify .env exists
cat backend/.env
```

### Hedera errors?
- Ensure `OPERATOR_ID` is in format `0.0.XXXXXX`
- Ensure `OPERATOR_KEY` is valid private key
- Check Hedera testnet status

### GROQ AI errors?
- Verify `GROQ_API_KEY` in `backend/.env`
- Check API key is valid
- Fallback to mock verification if needed

---

## 📚 File Structure

```
hederamind/
├── backend/
│   ├── api/
│   │   ├── server.js         ← START HERE
│   │   ├── routes/
│   │   └── controllers/
│   ├── services/
│   ├── agents/
│   ├── data/                 ← JSON storage
│   └── .env                  ← Config
├── frontend/
│   ├── src/
│   │   ├── main.tsx          ← Entry point
│   │   ├── App.tsx           ← Main app
│   │   ├── components/       ← UI components
│   │   └── services/         ← API client
│   └── vite.config.ts
└── README_ASCENSION.md       ← Full docs
```

---

## 🎬 Demo Script

```bash
# 1. Start backend
cd backend && node api/server.js &

# 2. Start frontend
cd frontend && npm run dev &

# 3. Open browser
open http://localhost:3000

# 4. Test API
curl -X POST http://localhost:3001/api/claims/verify \
  -H "Content-Type: application/json" \
  -d '{"claim": "The speed of light is constant"}'

# 5. Check stats
curl http://localhost:3001/api/stats | jq '.'
```

---

## 🏆 Hackathon Submission Checklist

- ✅ Code complete and tested
- ✅ Both servers running
- ✅ Documentation created (README, API docs)
- ✅ Demo script ready
- ✅ Environment variables configured
- ✅ Hedera integration working
- ✅ AI integration working
- ✅ Autonomous agents implemented
- ✅ Modern UI/UX completed
- ✅ TypeScript types defined

---

## 💡 Pro Tips

1. **Backend First** - Always start backend before frontend
2. **Check Logs** - Watch terminal output for errors
3. **Use jq** - Format JSON responses: `| jq '.'`
4. **Test Endpoints** - Use curl or Postman
5. **Browser DevTools** - Check Network tab for API calls
6. **React DevTools** - Inspect component state
7. **Hot Reload** - Vite auto-updates on file changes
8. **Mock Data** - AI service has fallback if GROQ unavailable

---

## 🆘 Need Help?

- 📖 **Full Docs:** `README_ASCENSION.md`
- 📚 **API Docs:** `backend/API.md`
- 📊 **Summary:** `PROJECT_SUMMARY.md`
- 🎬 **Demo:** `demo.sh`

---

## 🚀 What's Next?

1. **Add Wallet Integration** - HashConnect for real transactions
2. **Deploy** - Railway (backend) + Vercel (frontend)
3. **Enhance UI** - Add charts, animations, themes
4. **Real-time Updates** - WebSocket for live data
5. **Mirror Node** - Query Hedera transactions
6. **More Agents** - Create additional autonomous agents
7. **Mobile App** - React Native version

---

**You're all set! Start building the AI that never lies! 🧠✨**
