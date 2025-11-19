# 🧠 Hedera Mind: Ascension - The AI That Never Lies

**Hedera Mind: Ascension** is an autonomous AI agent marketplace where truth is bought, sold, and rewarded. Built on **Hedera** with **Grok AI**, it creates a decentralized economy where verified facts have real value and truth seekers earn NFT badges.

🏆 **Evolution of 2024 Winning Project** - Now with Agent-to-Agent (A2A) marketplace!

> *"From AI Journaling to Truth Marketplace - 10x Bigger"*

## 🚀 Key Features

### Core System
- **🤖 Grok AI Integration**: Intelligent claim verification using Llama 3.3 70B
- **⛓️ Hedera Consensus Service**: Immutable, tamper-proof truth logging
- **💾 Smart Storage**: Local + blockchain hybrid architecture

### 🆕 Agent Marketplace (NEW!)
- **🤖 TruthAgent**: Autonomous agent that sells verified claims for 0.01 HBAR
- **🏆 BadgeAgent**: Mints NFT badges after every 5 purchases
- **🔗 A2A Communication**: Agents coordinate autonomously via events
- **💰 Micro-payments**: Real value exchange for verified facts
- **🎨 Tiered NFTs**: Bronze → Uncommon → Rare → Epic → Legendary
- **📊 Live Dashboard**: Real-time marketplace statistics and badge gallery

## 🎯 How It Works - The Full Picture

### Traditional Mode (Original)
```
User → Submit Claim → Grok AI Verification → Hedera HCS → Done
```

### 🆕 Ascension Mode (Agent Marketplace)
```
User Submits Claim
     ↓
🤖 TruthAgent: Verifies with Grok AI
     ↓
✅ If TRUE → Sells for 0.01 HBAR
     ↓
📡 Event: "claimSold"
     ↓
🏆 BadgeAgent: Records Purchase
     ↓
📊 Count Reaches 5?
     ↓
🎨 Mint NFT Badge (HTS)
     ↓
🎉 User Gets Badge!
```

### The Magic: Agent-to-Agent Communication
- **TruthAgent** and **BadgeAgent** work together autonomously
- No manual intervention needed
- Events trigger automatic badge minting
- Users earn rewards just by buying verified claims!

## 📁 Project Structure

```
hederamind/
├── .env                          # 🔐 Environment variables
├── package.json                  # 📦 Dependencies and scripts
├── claims_log.json              # 📊 Local claim storage
├── README-HACKATHON.md          # 🏆 Hackathon submission guide
├── public/
│   └── index.html               # 🎨 Web dashboard UI
├── scripts/
│   └── createTopic.js           # 🏗️ Create Hedera topics
└── src/
    ├── main.js                  # 🎛️ Main orchestrator
    ├── agent.js                 # 🤖 Grok AI integration
    ├── verifyClaim.js           # ✅ Verification engine
    ├── storage.js               # 💾 Storage utilities
    ├── marketplace.js           # 🆕 Agent marketplace demo
    ├── helpers.js               # 🔧 Helper functions
    └── agents/                  # 🆕 Autonomous agents
        ├── TruthAgent.js        #    Sells verified claims
        ├── BadgeAgent.js        #    Mints NFT badges
        └── AgentCoordinator.js  #    A2A communication
```

## 🛠️ Setup & Installation

### Prerequisites
- **Node.js** v16+ 
- **Hedera Testnet Account** (free at [portal.hedera.com](https://portal.hedera.com))
- **Grok API Key** (from xAI/Twitter)

### Step 1: Install Dependencies
```bash
cd hederamind
npm install
```

### Step 2: Configure Environment
Create your `.env` file with these variables:
```env
# Hedera Testnet Credentials
OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
OPERATOR_KEY=your_private_key_here
TOPIC_ID=0.0.YOUR_TOPIC_ID

# Grok AI API Key (from x.ai or your AI provider)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Optional: Badge Token ID (created automatically if not set)
BADGE_TOKEN_ID=0.0.YOUR_BADGE_TOKEN
```

### Step 3: Create Hedera Topic (if needed)
```bash
npm run create-topic
```
Copy the generated Topic ID to your `.env` file.

### Step 4: Test the System
```bash
npm start stats
```

## 🎮 Usage Guide

### 🚀 Quick Start Demos

**1. Original Demo (Basic Verification):**
```bash
npm run submit
```

**2. 🆕 Agent Marketplace Demo (Recommended!):**
```bash
npm run marketplace
```
This will:
- Initialize TruthAgent and BadgeAgent
- Process 5 test claims through the marketplace
- Show agent-to-agent communication
- Demonstrate automatic badge minting
- Display comprehensive statistics

**3. Web Dashboard:**
```bash
# Open in your browser
start public/index.html  # Windows
open public/index.html   # Mac/Linux
```

### 🎯 Single Claim Processing

**Process one claim through the full pipeline:**
```bash
npm start process "The Earth revolves around the Sun"
```

**Example output:**
```
🚀 Processing claim: "The Earth revolves around the Sun"
==================================================

📋 Step 1: Verifying claim...
🤖 Using Grok AI verification
✅ Verification complete:
   Status: TRUE
   Confidence: 98%
   Verifier: Grok AI

💾 Step 2: Saving to local storage...
✅ Added claim with ID: claim_1691234567890_abc123

🌐 Step 3: Submitting to Hedera...
✅ Submitted to Hedera topic 0.0.6523053
📄 Transaction ID: 0.0.6398676@1691234567.890123456
📊 Status: SUCCESS

🎉 Processing complete!
```

### 📊 System Analytics

**View comprehensive dashboard:**
```bash
npm start stats
```

**Example dashboard:**
```
🎛️  HederaMind Dashboard
========================================
📊 Total Claims: 15
✅ Verified (TRUE): 12
❌ False Claims: 2
⏳ Pending: 1
🎯 Accuracy: 80.00%
🔗 Hedera Topic: 0.0.6523053
⏰ System Time: 2025-08-08T12:00:00.000Z

📋 Latest Claims:
  1. [TRUE] The Earth is approximately 4.5 billion years old
  2. [FALSE] The Earth is flat
  3. [TRUE] Water boils at 100°C at sea level
```

### 🔍 Verification Only (No Blockchain)

**Test claims without submitting to Hedera:**
```bash
npm run verify "Artificial intelligence will replace all jobs"
```

### 📦 Batch Processing

**Process multiple claims automatically:**
```bash
npm start batch
```
Processes 4 pre-defined sample claims with 2-second delays between submissions.

### 🎯 Advanced Usage

**Custom verification options:**
```bash
# Process with specific options
node src/main.js process "Your claim" --mock-mode
node src/main.js process "Your claim" --no-hedera
```

## 🧪 Demo Scenarios

### Scenario 1: Scientific Facts
```bash
npm start process "Water freezes at 0°C"
npm start process "The speed of light is approximately 300,000 km/s"
npm start process "DNA contains genetic information"
```

### Scenario 2: Controversial Claims  
```bash
npm start process "Climate change is caused by human activity"
npm start process "Vaccines are safe and effective"
npm start process "The Earth is flat"
```

### Scenario 3: Technology Predictions
```bash
npm start process "AI will surpass human intelligence by 2030"
npm start process "Quantum computers will break current encryption"
npm start process "Self-driving cars will be mainstream by 2025"
```

## 📋 Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `npm run submit` | Run complete demo with 4 sample claims | Full pipeline demo |
| `npm start process "claim"` | Process single claim through full pipeline | `npm start process "Sky is blue"` |
| `npm start stats` | Show system dashboard and analytics | View performance metrics |
| `npm start batch` | Process 4 pre-defined claims automatically | Batch processing demo |
| `npm run verify "claim"` | Verify claim without Hedera submission | `npm run verify "Water is wet"` |
| `npm run create-topic` | Create new Hedera topic | Generate new topic ID |

## 🔧 Configuration Options

### Verification Modes

1. **🤖 Grok AI Mode** (default): Uses Grok API for intelligent verification
2. **🎭 Mock Mode**: Uses keyword-based verification for testing
3. **📏 Rule-based Mode**: Uses heuristic rules for verification

### Processing Options

```javascript
const options = {
  saveLocally: true,        // Save to claims_log.json
  submitToHedera: true,     // Submit to Hedera Consensus Service
  verificationOptions: {
    useAI: true,           // Use Grok AI verification
    mockMode: false,       // Use mock verification (for testing)
    confidence: 85         // Minimum confidence threshold
  }
};
```

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `OPERATOR_ID` | ✅ | Your Hedera account ID | `0.0.1234567` |
| `OPERATOR_KEY` | ✅ | Your Hedera private key | `302e020100300506...` |
| `TOPIC_ID` | ✅ | Hedera topic for submissions | `0.0.7654321` |
| `GROK_API_KEY` | ⚠️ | Grok API key (falls back to mock if missing) | `gsk_...` |

## 📊 System Output

Each processed claim generates a comprehensive record:

```json
{
  "id": "claim_1691234567890_abc123",
  "claim": "The sky is blue during the day",
  "status": "TRUE",
  "confidence": 95,
  "reasoning": "The sky appears blue due to Rayleigh scattering...",
  "verifier": "Grok AI",
  "timestamp": "2025-08-08T12:00:00.000Z",
  "rawResponse": "TRUE - The sky appears blue during...",
  "hedera": {
    "transactionId": "0.0.6398676@1691234567.890123456",
    "topicId": "0.0.6523053",
    "status": "SUCCESS"
  }
}
```

### 📈 Data Fields Explained

| Field | Description | Example Values |
|-------|-------------|----------------|
| `id` | Unique timestamp-based identifier | `claim_1691234567890_abc123` |
| `claim` | Original text being verified | `"The Earth is round"` |
| `status` | Verification result | `TRUE`, `FALSE`, `UNCERTAIN` |
| `confidence` | Confidence percentage (0-100%) | `95` |
| `reasoning` | Explanation from verifier | AI-generated explanation |
| `verifier` | System that performed verification | `Grok AI`, `Mock System`, etc. |
| `timestamp` | When verification was performed | ISO 8601 format |
| `hedera` | Blockchain submission details | Transaction ID, status |

## � Programmatic Usage

```javascript
import { HederaMind } from './src/main.js';

const hederaMind = new HederaMind();

// Process a single claim
const result = await hederaMind.processClaim("The Earth is round", {
  saveLocally: true,
  submitToHedera: true,
  verificationOptions: {
    useAI: true,
    mockMode: false
  }
});

// Process multiple claims
const claims = ["Claim 1", "Claim 2", "Claim 3"];
const results = await hederaMind.processClaimsBatch(claims);

// Get system stats
const stats = await hederaMind.getSystemStats();

// Show dashboard
await hederaMind.showDashboard();
```

## 🧪 Testing & Development

### 🔄 Testing Modes

**Test without API calls (Mock Mode):**
```bash
# This will use keyword-based verification instead of Grok API
node -e "
import('./src/verifyClaim.js').then(async (m) => {
  const result = await m.ClaimVerifier.createVerifiedClaim('Test claim', { mockMode: true });
  console.log('Mock result:', result);
})"
```

**Test Grok API Connection:**
```bash
# This will attempt to use Grok API or fall back to mock
node -e "
import('./src/verifyClaim.js').then(async (m) => {
  const result = await m.ClaimVerifier.createVerifiedClaim('The sky is blue');
  console.log('Verification method:', result.verifier);
})"
```

### 🎯 Sample Claims for Testing

**High-confidence TRUE claims:**
- "Water boils at 100°C at sea level"
- "The Earth revolves around the Sun"
- "Gravity causes objects to fall"

**High-confidence FALSE claims:**
- "The Earth is flat"
- "Water boils at 50°C at sea level" 
- "The Sun revolves around the Earth"

**Uncertain/Debatable claims:**
- "AI will surpass human intelligence by 2030"
- "Bitcoin will reach $1 million by 2025"
- "Aliens have visited Earth"

## 🔐 Security & Privacy

- **🔑 Private Keys**: Never logged or exposed, stored only in `.env`
- **🛡️ API Keys**: Securely loaded from environment variables
- **📱 Local Data**: Claims stored locally in JSON format
- **⛓️ Blockchain**: Immutable record on Hedera Consensus Service
- **🚫 No PII**: System only processes claims, no personal information

## 🚨 Error Handling

The system includes comprehensive error handling:

- **🌐 Network Issues**: Graceful fallback to mock verification
- **🔑 Missing Keys**: Clear error messages and setup instructions  
- **📊 Invalid Data**: Input validation and sanitization
- **⛓️ Hedera Errors**: Detailed transaction failure reporting
- **🤖 AI Failures**: Automatic fallback to alternative verification methods

## 📈 Monitoring & Analytics

### Local Analytics
- View `claims_log.json` for complete history
- Use `npm start stats` for real-time dashboard
- Track accuracy, confidence trends, and verification methods

### Hedera Analytics  
- Monitor transactions on [HashScan](https://hashscan.io/testnet)
- Search your Topic ID to see all submissions
- Verify immutable claim records on blockchain

## � Future Enhancements

### Planned Features
- **🌐 Web Interface**: Browser-based claim submission and dashboard
- **🗄️ Database Integration**: MongoDB support for scalable storage
- **🤖 Multi-AI Support**: Integration with GPT-4, Claude, Gemini, etc.
- **📊 Advanced Analytics**: Trend analysis and prediction models
- **⚖️ Dispute System**: Claim challenge and appeal mechanisms
- **🔗 API Endpoints**: RESTful API for external integrations
- **📱 Mobile App**: iOS/Android app for claim submission
- **🏢 Enterprise Features**: Multi-tenant support and user management

### Contributing
Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 🆘 Troubleshooting

### Common Issues

**❌ "Missing GROK_API_KEY"**
- Solution: Add your Grok API key to `.env` file
- Fallback: System will use mock verification automatically

**❌ "Hedera connection failed"**
- Check `OPERATOR_ID` and `OPERATOR_KEY` in `.env`
- Ensure you have testnet HBAR balance
- Verify topic ID exists

**❌ "Command not found"**
- Run `npm install` to install dependencies
- Use `node src/main.js` instead of `npm start` if needed

**❌ "Module import errors"**
- Ensure `"type": "module"` is in `package.json`
- Use Node.js v16+ for ES modules support

### Getting Help
- 📧 Open an issue on GitHub
- 📖 Check Hedera documentation: [docs.hedera.com](https://docs.hedera.com)
- 🤖 Grok API documentation: [xai.ai](https://xai.ai)

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Hedera Hashgraph** for the consensus service
- **xAI** for the Grok API
- **Node.js** community for excellent tooling
- **Open source contributors** who make projects like this possible

---

**Made with ❤️ for the decentralized future of truth verification**

*HederaMind v1.0 - Bringing AI and blockchain together for trustworthy information*
