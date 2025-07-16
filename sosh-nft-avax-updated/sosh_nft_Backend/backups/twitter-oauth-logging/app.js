const express = require('express');
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');
const expresssession = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const appconfig = require('../config/appconfig');
const logging = require('./logging');

const {
  LOOKSRARE_ADDRESS, TreasuryAddress, tokenAddress, OPENSEA_SEAPORT_ADDRESS,
} = appconfig;

const apiroutes = require('./routes/index');
const { JWT_SECRET } = require('../config/appconfig');
const { contractScheduler } = require('./job_queue/add_task');
const { setABIForContract, setConfig } = require('./utils/contract_helper');
const Users = require('./models/User');

const app = express();

// Initialize function to be called after database is ready
const initializeApp = async () => {
  // Initialize logging system
  await logging.initializeLogging();

  // Initialize contracts
  await setABIForContract(OPENSEA_SEAPORT_ADDRESS);
  await setABIForContract(LOOKSRARE_ADDRESS);
  await setABIForContract(TreasuryAddress);
  await setABIForContract(tokenAddress);
  await setABIForContract("sale.abi");
  await setConfig();
};

// Add logging middleware early in the chain
app.use(logging.loggingMiddleware());

// Configure CORS with specific options
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      process.env.FRONTEND_URL,
      'https://soshnft.io',
      'https://www.soshnft.io',
      undefined // Allow requests with no origin (like mobile apps or curl)
    ].filter(Boolean); // Remove undefined values
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Access-Control-Allow-Origin',
    'Origin',
    'Accept'
  ],
  exposedHeaders: ['Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));

// Log all requests
app.use((req, res, next) => {
  logging.apiLogger.logRequest(req);
  next();
});

// Add health check endpoint
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState;
  const mongoStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  const mongoDetails = {
    status: mongoStates[mongoStatus],
    connected: mongoStatus === 1,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    models: mongoose.modelNames(),
    connectionId: mongoose.connection.id,
    readPreference: mongoose.connection.readPreference?.mode,
    maxPoolSize: mongoose.connection.config?.maxPoolSize,
    minPoolSize: mongoose.connection.config?.minPoolSize
  };

  const redisService = require('./utils/redis_service');
  const redisDetails = {
    status: redisService.connected ? 'connected' : 'disconnected',
    host: redisService.client?.options?.host,
    port: redisService.client?.options?.port,
    retryAttempts: redisService.client?.options?.retryAttempts,
    connectTimeout: redisService.client?.options?.connectTimeout
  };
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mongo: mongoDetails,
    redis: redisDetails,
    environment: process.env.NODE_ENV
  });
});

// Basic endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date()
  });
});

app.use(jwt({ secret: JWT_SECRET, algorithms: ['HS256'] })
  .unless({
    path: [
      '/api/health',
      '/api',
      '/api/V1/auth/message',
      '/api/V1/auth/login',
      '/api/V1/social/twitter/login',
      '/api/V1/social/twitter/callback',
      '/api/V1/social/twitter/request_token',
      '/api/V1/user/checkusername',
      /^\/api\/V1\/user\/getUserByWalletAddress\/?.*(?<!\/notallowpath\/?)$/,
      /^\/api\/V1\/user\/getuserdetails\/?.*(?<!\/notallowpath\/?)$/,
      /^\/api\/V1\/social\/twitter\/?.*(?<!\/notallowpath\/?)$/,
      /^\/api\/V1\/social\/tiktok\/?.*(?<!\/notallowpath\/?)$/,
      /^\/api\/V1\/social\/instagram\/?.*(?<!\/notallowpath\/?)$/,
      /^\/api\/V1\/social\/youtube\/?.*(?<!\/notallowpath\/?)$/,
      '/api/V1/log/error',
      '/api/V1/log/warning',
      {
        url: /^\/api\/V1\/assets\/?.*(?<!\/notallowpath\/?)$/,
        methods: ['GET'],
      },
    ],
  }));

// Load and log the requester user
app.use(async (req, res, next) => {
  try {
    if (req.auth && req.auth.id) {
      req.user = await Users.findById(req.auth.id);
      logging.authLogger.logAuthAttempt('user_load', req.user, true, {
        ip: req.ip,
        path: req.path
      });
    }
    next();
  } catch (error) {
    logging.errorLogger.logError(error, {
      context: 'user_load',
      userId: req.auth?.id,
      path: req.path
    });
    next(error);
  }
});

app.use(
  expresssession({
    store: new MongoStore({
  mongoUrl: appconfig.MONGODB_CONNECTION_STRING,
  autoRemove: 'native',
  ttl: 4 * 24 * 60 * 60,
  mongoOptions: {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 1,
    keepAlive: true,
    keepAliveInitialDelay: 300000
  }
    }),
    secret: appconfig.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 5000000000,
      path: '/api/V1/social',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    },
  }),
);

app.use('/api/V1', apiroutes);

// Error handling middleware
app.use((err, req, res, next) => {
  // Log the error with detailed context
  logging.errorLogger.logError(err, {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip,
    headers: req.headers,
    query: req.query,
    body: req.body
  });
  
  // Send error response
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === 'development' ? { 
        stack: err.stack,
        code: err.code,
        name: err.name
      } : {})
    }
  });
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logging.errorLogger.logFatalError(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logging.errorLogger.logFatalError(new Error('Unhandled Promise rejection'), {
    reason,
    promise
  });
});

module.exports = { app, initializeApp };
