# Logging System Deployment Guide

## Pre-Deployment Checklist

1. Verify Dependencies
- [x] winston
- [x] winston-daily-rotate-file
- [x] Required directory permissions

2. Configuration Check
- [ ] Verify LOG_PATHS for production environment
- [ ] Check ROTATION_CONFIG settings
- [ ] Ensure proper log levels for production

3. Directory Structure
```bash
logs/
├── prod/              # Production logs
│   ├── error.log     # Error logs
│   ├── api.log       # API request/response logs
│   ├── db.log        # Database operation logs
│   └── auth.log      # Authentication logs
└── dev/              # Development logs (same structure)
```

## Deployment Steps

1. Create Production Log Directories
```bash
mkdir -p logs/prod
chmod 755 logs/prod  # Ensure proper permissions
```

2. Update Environment Variables
```bash
# In production environment
NODE_ENV=production
```

3. Configure Log Rotation
- Logs are rotated daily
- Maximum file size: 10MB
- Retention period: 14 days

4. Security Considerations
- Ensure log directories are not web-accessible
- Set appropriate file permissions
- Configure log backup strategy

## Production Configuration

1. Update appconfig.js:
```javascript
const config = {
  production: {
    logLevel: 'error',  // Only log errors in production
    console: false,     // Disable console logging
    dailyRotate: true,  // Enable log rotation
  }
};
```

2. Monitoring Setup
- Set up log monitoring
- Configure error alerts
- Implement log aggregation if needed

## Rollback Plan

1. Keep backup of previous logging configuration
2. Maintain copy of last 7 days of logs
3. Document rollback procedure:
   ```bash
   # Restore previous configuration
   cp logging.backup.js logging/index.js
   
   # Restart application
   pm2 restart app
   ```

## Testing Production Setup

1. Test Log Generation
```javascript
logging.errorLogger.logError(new Error('Test error'));
logging.apiLogger.logRequest(testRequest);
logging.dbLogger.logQuery('test', 'collection', {});
```

2. Verify Log Rotation
- Check log files are created correctly
- Verify rotation schedule works
- Ensure old logs are properly archived

3. Performance Impact
- Monitor application performance
- Check disk space usage
- Verify logging doesn't impact response times

## Maintenance

1. Regular Tasks
- Monitor log file sizes
- Archive old logs
- Check disk space usage

2. Backup Strategy
- Daily backup of logs
- Secure offsite storage
- Retention policy enforcement

## Troubleshooting

1. Common Issues
- Permission errors
- Disk space issues
- Log rotation failures

2. Debug Commands
```bash
# Check log directory permissions
ls -la logs/prod/

# Monitor log files in real-time
Get-Content -Path logs/prod/error.log -Wait

# Check disk space
df -h
```

## Health Checks

1. Implement monitoring for:
- Log file sizes
- Write permissions
- Disk space
- Log rotation success

2. Alert Conditions
- Log file size > 80% of max
- Failed log writes
- Rotation failures
- Disk space < 20%

## Documentation Updates

1. Update relevant documentation:
- API documentation
- System architecture docs
- Monitoring guides
- Emergency procedures

2. Notify team members:
- Deployment schedule
- New logging features
- Monitoring responsibilities
- Emergency contacts

## Contact Information

For issues or questions:
- System Administrator: [Contact Info]
- DevOps Team: [Contact Info]
- Emergency Support: [Contact Info]
