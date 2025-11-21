import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import claimsRouter from './routes/claims.js';
import marketplaceRouter from './routes/marketplace.js';
import badgesRouter from './routes/badges.js';
import usersRouter from './routes/users.js';
import statsRouter from './routes/stats.js';

// Import services
import { hederaService } from '../services/hedera.service.js';
import { storageService } from '../services/storage.service.js';
import { agentRegistryService } from '../services/agentRegistry.service.js';
import { badgeService } from '../services/badge.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware - CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://hederamind-ascension.vercel.app'
    ];
    
    // Check if origin is in allowed list or is a Vercel preview deployment
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for demo (remove in production)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Hedera Mind: Ascension API',
    version: '2.0.0'
  });
});

// API Routes
app.use('/api/claims', claimsRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/badges', badgesRouter);
app.use('/api/users', usersRouter);
app.use('/api/stats', statsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🧠 Hedera Mind: Ascension API',
    version: '2.0.0',
    endpoints: {
      claims: '/api/claims',
      marketplace: '/api/marketplace',
      badges: '/api/badges',
      users: '/api/users',
      stats: '/api/stats',
      health: '/health'
    },
    docs: '/api/docs'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      '/api/claims',
      '/api/marketplace',
      '/api/badges',
      '/api/users',
      '/api/stats'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Initialize services and start server
async function startServer() {
  try {
    console.log('\n🚀 Starting Hedera Mind: Ascension API...\n');

    // Initialize services
    console.log('📦 Initializing services...');
    await storageService.initialize();
    await hederaService.initialize();
    await badgeService.initialize();

    // Register default agents on-chain when contract configured
    const registryResults = await agentRegistryService.bootstrapDefaultAgents();
    if (registryResults.length > 0) {
      console.log('\n🔐 Agent registry status:');
      registryResults.forEach((result) => {
        if (result.error) {
          console.log(`   ⚠️  ${result.agentId}: ${result.error}`);
        } else if (result.newlyRegistered) {
          console.log(`   ✅ ${result.agentId} registered on-chain (key: ${result.agentKey})`);
        } else {
          console.log(`   🔁 ${result.agentId} already registered (key: ${result.agentKey})`);
        }
      });
      console.log('');
    }

    // Start server
    app.listen(PORT, () => {
      console.log('\n✅ Server started successfully!');
      console.log(`📡 API running on http://localhost:${PORT}`);
      console.log(`🔗 Hedera Network: testnet`);
      console.log(`💾 Storage: File-based (data/ directory)`);
      console.log('\n📋 Available endpoints:');
      console.log(`   GET    /health`);
      console.log(`   POST   /api/claims/verify`);
      console.log(`   GET    /api/claims`);
      console.log(`   POST   /api/marketplace/buy`);
      console.log(`   GET    /api/marketplace/sales`);
      console.log(`   GET    /api/badges/:accountId`);
      console.log(`   GET    /api/users/:accountId`);
      console.log(`   GET    /api/stats`);
      console.log(`   GET    /api/stats/leaderboard`);
      console.log('\n💡 Press Ctrl+C to stop the server\n');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n⏹️  SIGTERM received, shutting down gracefully...');
  await hederaService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n⏹️  SIGINT received, shutting down gracefully...');
  await hederaService.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;
