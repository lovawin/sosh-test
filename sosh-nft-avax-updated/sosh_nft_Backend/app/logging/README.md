# Logging System Documentation

## Overview
This logging system provides comprehensive logging capabilities for the application, with separate handlers for different types of logs:
- Error logging
- API request/response logging
- Database operation logging
- Authentication/Authorization logging

## Directory Structure
```
logging/
├── config/
│   └── logConfig.js         # Logging configuration (paths, levels, rotation)
├── formatters/
│   └── logFormatter.js      # Log formatting utilities
├── handlers/
│   ├── errorLogger.js       # Error logging handler
│   ├── apiLogger.js         # API request/response logging
│   ├── dbLogger.js          # Database operation logging
│   └── authLogger.js        # Authentication logging
└── index.js                 # Main entry point
```

## Usage

### Basic Usage
```javascript
const logging = require('./logging');

// Initialize logging system
logging.initializeLogging();

// Add logging middleware to Express app
app.use(logging.loggingMiddleware());

// Add logging plugin to Mongoose
mongoose.plugin(logging.mongoosePlugin);
```

### Logging Examples

#### Error Logging
```javascript
try {
  // Some operation
} catch (error) {
  logging.errorLogger.logError(error, {
    context: 'operation_name',
    additionalInfo: 'value'
  });
}
```

#### API Logging
```javascript
logging.apiLogger.logRequest({
  method: 'GET',
  url: '/api/endpoint',
  context: {
    operation: 'operation_name',
    userId: 'user123'
  }
});
```

#### Database Logging
```javascript
logging.dbLogger.logQuery('find', 'users', query, duration);
logging.dbLogger.logError(error, 'operation', 'collection');
```

#### Auth Logging
```javascript
logging.authLogger.logAuthAttempt('login', user, success, {
  ip: req.ip,
  userAgent: req.headers['user-agent']
});
```

## Log Files
Logs are stored in the following locations:
- Development: `logs/dev/`
- Production: `logs/prod/`

Each type of log has its own file:
- error.log
- api.log
- db.log
- auth.log

## Log Rotation
Logs are automatically rotated:
- Maximum size: 10MB
- Maximum age: 14 days
- Date pattern: YYYY-MM-DD

## Security
- Sensitive data (passwords, tokens, etc.) is automatically masked
- Stack traces are only included in development environment
- Request/response bodies can be filtered to remove sensitive information

## Best Practices
1. Always include context with error logs
2. Use appropriate log levels:
   - ERROR: Application errors
   - WARN: Warnings that need attention
   - INFO: General operational events
   - DEBUG: Detailed debugging information
3. Include relevant identifiers (userId, requestId, etc.)
4. Log both successful and failed operations
5. Include timing information for performance monitoring

## Error Handling
The system includes built-in error handling middleware that:
1. Logs all uncaught errors
2. Masks sensitive information
3. Formats error responses
4. Includes stack traces in development

## Monitoring
Log files can be monitored using standard tools:
- tail -f logs/dev/error.log
- grep "ERROR" logs/dev/*.log

## Development Notes
- Add new log types in logConfig.js
- Create new formatters in logFormatter.js
- Add new handlers in handlers/ directory
- Update index.js to expose new functionality
