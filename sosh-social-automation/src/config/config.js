require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3002,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sosh-social',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h'
  },

  // Social platform configurations
  twitter: {
    apiKey: process.env.TWITTER_API_KEY,
    apiSecret: process.env.TWITTER_API_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK_URL || 'http://localhost:3000/api/platforms/callback/twitter'
  },

  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    callbackURL: process.env.INSTAGRAM_CALLBACK_URL || 'http://localhost:3000/api/platforms/callback/instagram'
  },

  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    callbackURL: process.env.YOUTUBE_CALLBACK_URL || 'http://localhost:3000/api/platforms/callback/youtube'
  },

  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    callbackURL: process.env.TIKTOK_CALLBACK_URL || 'http://localhost:3000/api/platforms/callback/tiktok'
  },

  // File upload configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    storageDir: process.env.UPLOAD_DIR || 'uploads/'
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true
  },

  // Mother-Child Strategy Configuration
  motherChild: {
    maxChildAccounts: parseInt(process.env.MAX_CHILDREN_ACCOUNTS) || 100,
    interactionDelay: parseInt(process.env.INTERACTION_DELAY) || 300, // seconds
    maxInteractionsPerDay: parseInt(process.env.MAX_INTERACTIONS_PER_DAY) || 100,
    engagementTypes: ['like', 'retweet', 'reply'],
    replyTemplates: [
      'Great point! 👏',
      'Interesting perspective 🤔',
      'Thanks for sharing! 🙌',
      'Totally agree! 💯',
      'This is awesome! 🔥'
    ],
    // Engagement rules to avoid detection
    rules: {
      minDelayBetweenInteractions: 60, // seconds
      maxConsecutiveInteractions: 3,
      cooldownPeriod: 3600, // 1 hour in seconds
      randomizeActions: true,
      distributedEngagement: true // spread interactions across child accounts
    }
  }
};

// Validate required environment variables in production
if (config.env === 'production') {
  const required = [
    'JWT_SECRET',
    'MONGODB_URI',
    'TWITTER_API_KEY',
    'TWITTER_API_SECRET',
    'INSTAGRAM_CLIENT_ID',
    'INSTAGRAM_CLIENT_SECRET',
    'YOUTUBE_CLIENT_ID',
    'YOUTUBE_CLIENT_SECRET',
    'TIKTOK_CLIENT_KEY',
    'TIKTOK_CLIENT_SECRET'
  ];

  for (const key of required) {
    if (!process.env[key]) {
      console.error(`Error: Environment variable ${key} is required in production`);
      process.exit(1);
    }
  }
}

module.exports = config;
