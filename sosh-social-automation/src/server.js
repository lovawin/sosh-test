const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/config');

// Initialize express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors(config.cors)); // Enable CORS with config
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  if (err.name === 'MongoServerSelectionError') {
    console.error('Could not connect to MongoDB. Please check:');
    console.error('1. MongoDB Atlas connection string');
    console.error('2. Network connectivity');
    console.error('3. IP whitelist settings');
    console.error('4. Database user credentials');
  }
});

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: 'Too many requests from this IP, please try again later'
});

// Auth middleware
const auth = require('./middleware/auth');

// Public routes (no rate limiting for auth during development)
app.use('/api/auth', require('./api/routes/auth'));

// Protected routes (with rate limiting)
app.use('/api/platforms', apiLimiter, auth, require('./api/routes/platform-auth'));
app.use('/api/child-accounts', apiLimiter, auth, require('./api/routes/child-account-profiles'));

// API documentation route
app.get('/api/docs', (req, res) => {
    res.json({
        version: '1.0.0',
        description: 'Social Media Automation API with Mother-Child Strategy',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                refreshToken: 'POST /api/auth/refresh-token',
                me: 'GET /api/auth/me'
            },
            platforms: {
                list: 'GET /api/platforms',
                getOne: 'GET /api/platforms/:platform',
                stats: 'GET /api/platforms/:platform/stats',
                connect: 'POST /api/platforms/:platform/connect',
                callback: 'GET /api/platforms/callback/:platform',
                sync: 'POST /api/platforms/:platform/sync',
                refresh: 'POST /api/platforms/:platform/refresh'
            },
            childAccounts: {
                setProfile: 'POST /api/child-accounts/:platform/profile',
                getProfile: 'GET /api/child-accounts/:platform/profile',
                getMotherProfiles: 'GET /api/child-accounts/:platform/mother/:motherAccountId/profiles',
                deleteProfile: 'DELETE /api/child-accounts/:platform/profile'
            }
        },
        security: {
            authentication: 'JWT Bearer token required in Authorization header',
            rateLimiting: `${apiLimiter.max} requests per ${apiLimiter.windowMs / 1000} seconds`
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

module.exports = app;
