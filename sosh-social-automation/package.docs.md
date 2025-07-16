# Package Documentation

## Scripts

### Production Scripts
- `start`: Launch the server in production mode
- `build`: Compile and prepare for production (future use)

### Development Scripts
- `dev`: Run server with hot-reload using nodemon
- `test`: Run all Jest test suites
- `test:twitter`: Run Twitter API integration tests

### Code Quality Scripts
- `lint`: Check code style and potential errors
- `lint:fix`: Automatically fix linting issues
- `format`: Format code using Prettier

### Git Hooks
- `prepare`: Set up Husky git hooks

## Dependencies

### Core Dependencies
- `express`: Web framework for API endpoints
- `mongoose`: MongoDB ODM for database operations
- `dotenv`: Environment variable management

### Security
- `bcrypt`: Password hashing
- `jsonwebtoken`: JWT authentication
- `helmet`: HTTP security headers
- `cors`: Cross-origin resource sharing
- `express-rate-limit`: API rate limiting

### Social Media APIs
- `twitter-api-v2`: Twitter API v2 client
- `instagram-private-api`: Instagram API client
- `tiktok-api`: TikTok API client
- `googleapis`: YouTube/Google APIs

### Utilities
- `axios`: HTTP client for API requests
- `winston`: Logging framework
- `moment`: Date/time manipulation
- `validator`: Input validation
- `morgan`: HTTP request logging

## Development Dependencies

### Testing
- `jest`: Testing framework
- `supertest`: HTTP testing (future use)

### Development Tools
- `nodemon`: Auto-reload during development
- `eslint`: Code linting
- `prettier`: Code formatting

### Git Hooks
- `husky`: Git hooks management

## Configuration

### Engine Configuration
Specifies Node.js version >=14.0.0 for the project

### Jest Configuration
- `testEnvironment`: Node.js testing environment
- `coveragePathIgnorePatterns`: Paths to ignore in coverage reports

### Husky Configuration
Git hooks configuration for maintaining code quality:
- `pre-commit`: Run linting before commits
