# Social Media Automation Service

A microservice for managing social media automation using the mother-child strategy pattern. This service integrates with multiple social media platforms and provides automated engagement capabilities while maintaining natural interaction patterns.

## Mother-Child Strategy Implementation

The mother-child strategy is a sophisticated social media growth approach that uses coordinated account interactions to maximize organic reach and engagement:

### Mother Account
- Primary content creator and brand voice
- Sets engagement patterns and hashtag strategy
- Targets high-value audience members
- Maintains authentic engagement metrics

### Child Accounts
- Amplify mother account content strategically
- Create natural engagement patterns
- Build social proof through interactions
- Support content distribution

### Automation Features
- Smart scheduling based on optimal posting times
- Natural engagement patterns to avoid detection
- Rate limiting and cooldown periods
- Performance analytics and optimization
- AI-powered content generation and automation:
  - Personality-based content creation
  - Platform-specific formatting
  - Engagement style customization
  - Cross-platform coordination
  - Content approval workflows

## Quick Start

1. **Prerequisites**
   ```bash
   # Required software
   - Node.js >= 14.0.0
   - MongoDB
   - Twitter Developer Account with API v2 access
   ```

2. **Installation**
   ```bash
   # Clone the repository
   git clone [repository-url]
   cd sosh-social-automation

   # Install dependencies
   npm install
   ```

3. **Setup**
   ```bash
   # Run the setup script
   npm run setup

   # The setup script will:
   # - Create necessary directories
   # - Set up environment variables
   # - Validate API credentials
   # - Initialize the database
   ```

4. **Development**
   ```bash
   # Start development server
   npm run dev

   # Run tests
   npm test

   # Test Twitter API integration
   npm run test:twitter
   ```

## API Documentation

### Authentication Endpoints
```bash
POST /api/auth/register
POST /api/auth/login
```

### Social Media Operations
```bash
# Twitter Operations
POST /api/social/twitter/analyze
GET /api/social/twitter/search
GET /api/social/twitter/user/:username
GET /api/social/twitter/followers/:userId

# Automation Control
POST /api/automation/start
GET /api/automation/:automationId/status
PUT /api/automation/:automationId/pause
PUT /api/automation/:automationId/resume
DELETE /api/automation/:automationId
```

## Configuration

### Environment Variables
```bash
# Server Configuration
PORT=3001
MONGODB_URI=mongodb://localhost:27017/sosh-social-automation
JWT_SECRET=your-secret-key

# Twitter API Configuration
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_key_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# AI Configuration
OPENAI_API_KEY=your_openai_api_key
AI_MODEL=gpt-4  # or gpt-3.5-turbo
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
```

### Rate Limits

The service implements rate limiting to comply with platform guidelines:

```javascript
Twitter:
- Likes: 50/hour
- Retweets: 25/hour
- Follows: 20/hour
- Tweets: 15/hour
```

## Development

### Project Structure
```
src/
├── api/              # API routes and controllers
├── config/           # Configuration files
├── middleware/       # Custom middleware
├── models/          # Database models
├── services/        # Business logic
├── tests/           # Test suites
└── workers/         # Background tasks
```

### Development Mode

The application supports a development mode with mock data for easier testing and development:

```bash
# Enable mock data mode
REACT_APP_USE_MOCK=true
REACT_APP_USE_MOCK_AUTH=true

# Development server
npm run dev
```

Mock data includes:
- Pre-configured child accounts
- Sample automation profiles
- Test user credentials
- Platform-specific mock responses

This allows developers to:
- Test automation features without real social media accounts
- Develop UI components with consistent test data
- Debug platform integrations safely
- Validate automation logic offline

### Adding New Features

1. Create service in `src/services/`
2. Add routes in `src/api/routes/`
3. Update models if needed
4. Add configuration in `config.js`
5. Write tests in `tests/`
6. Document in README.md

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Security Considerations

- JWT authentication required for all endpoints
- Rate limiting prevents abuse
- API credentials encrypted at rest
- Platform-specific rate limits enforced
- Action patterns randomized
- Secure credential storage
- Request validation
- Error handling

## Monitoring and Analytics

The service provides detailed metrics for:
- Engagement rates
- Action success rates
- Rate limit status
- Error tracking
- Performance metrics

## Troubleshooting

### Common Issues

1. **API Rate Limits**
   - Check current rate limit status
   - Adjust automation settings
   - Implement exponential backoff

2. **Authentication Issues**
   - Verify API credentials
   - Check token expiration
   - Validate request format

3. **Database Connection**
   - Verify MongoDB connection
   - Check credentials
   - Ensure proper indexes

### Debug Mode

```bash
# Enable debug logging
DEBUG=sosh:* npm run dev
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

ISC

## Support

For support:
1. Check documentation
2. Search issues
3. Open new issue
4. Contact maintainers

## Features

- **Mother-Child Strategy Implementation**
  - Mother account content strategy
  - Child account amplification
  - Coordinated engagement patterns
  - Performance analytics

- **Multi-Platform Support**
  - Twitter (implemented)
  - Instagram (planned)
  - YouTube (planned)
  - TikTok (planned)

- **Automated Actions**
  - Content posting
  - Engagement (likes, comments, shares)
  - Follower management
  - Hashtag targeting

- **Security Features**
  - JWT authentication
  - Rate limiting
  - Request validation
  - Secure credential storage

## Prerequisites

- Node.js (v14 or higher)
- MongoDB

No API credentials needed! Our service handles all social media platform integrations using our platform's credentials.

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd sosh-social-automation
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the service:
   ```bash
   npm run dev
   ```

The service comes pre-configured with our platform's social media API credentials, so you can start using it right away!

## Usage

1. Register for access:
   ```bash
   POST /api/auth/register
   {
     "username": "your_username",
     "password": "your_password",
     "email": "your@email.com"
   }
   ```

2. Login to get access token:
   ```bash
   POST /api/auth/login
   {
     "username": "your_username",
     "password": "your_password"
   }
   ```

3. Start using the automation features:
   ```bash
   # Example: Start mother-child strategy
   POST /api/automation/start
   {
     "motherAccount": "your_main_account",
     "childAccounts": ["child1", "child2"],
     "targetHashtags": ["#nft", "#crypto", "#web3"]
   }
   ```

All social media operations are handled using our platform's verified credentials - no need to set up your own API keys!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Social Media Operations
- `POST /api/social/twitter/analyze` - Analyze Twitter account
- `GET /api/social/twitter/search` - Search tweets
- `GET /api/social/twitter/user/:username` - Get user analysis
- `GET /api/social/twitter/followers/:userId` - Get user followers

### Automation Control
- `POST /api/automation/start` - Start automation strategy
- `GET /api/automation/:automationId/status` - Get automation status
- `PUT /api/automation/:automationId/pause` - Pause automation
- `PUT /api/automation/:automationId/resume` - Resume automation
- `DELETE /api/automation/:automationId` - Stop automation

### AI Automation
- `POST /api/ai/profiles` - Create AI personality profile
  ```json
  {
    "personality": {
      "tone": "friendly and professional",
      "style": "informative with a personal touch",
      "interests": ["tech news", "industry updates"],
      "constraints": ["no politics", "family-friendly"]
    },
    "engagementRules": {
      "likeFrequency": 50,
      "commentFrequency": 30,
      "shareFrequency": 20
    }
  }
  ```
- `GET /api/ai/profiles/:profileId` - Get AI profile details
- `PUT /api/ai/profiles/:profileId` - Update AI profile
- `POST /api/ai/content/generate` - Generate content based on profile
  ```json
  {
    "profileId": "profile_id",
    "platform": "twitter",
    "contentType": "post",
    "topics": ["company updates", "tech news"]
  }
  ```
- `POST /api/ai/content/approve` - Approve generated content
- `GET /api/ai/content/pending` - List pending content

## Mother-Child Strategy

The mother-child strategy is a social media growth approach where:

1. **Mother Account**
   - Sets content strategy
   - Establishes brand voice
   - Engages with high-value targets
   - Maintains primary presence

2. **Child Accounts**
   - Amplify mother account content
   - Provide social proof
   - Expand network reach
   - Create engagement pods

3. **Automation Rules**
   - Natural timing patterns
   - Varied engagement types
   - Platform-specific limits
   - Anti-detection measures

## Security Considerations

- All API endpoints require JWT authentication
- Rate limiting prevents abuse
- Sensitive data is encrypted
- Platform-specific rate limits enforced
- Action patterns randomized to prevent detection

## Development

### Project Structure
```
src/
├── api/
│   └── routes/          # API endpoints
├── config/             # Configuration files
├── middleware/         # Custom middleware
├── models/            # Database models
└── services/          # Business logic
```

### Adding New Features

1. Create new service in `src/services/`
2. Add routes in `src/api/routes/`
3. Update models if needed
4. Add configuration in `config.js`
5. Document in README.md

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

ISC

## Support

For support, please open an issue in the repository.
