# Frontend Package Documentation

## Dependencies Overview

### Core Dependencies
- `react`: Core React library for building user interfaces
- `react-dom`: React rendering for web browsers
- `react-scripts`: Create React App configuration and scripts
- `typescript`: TypeScript language support
- `web-vitals`: Performance metrics tracking

### UI Framework
- `@mui/material`: Material-UI components library
- `@mui/icons-material`: Material-UI icon set
- `@emotion/react`: CSS-in-JS styling solution
- `@emotion/styled`: Styled components support

### Routing
- `react-router-dom`: Client-side routing

### Data Management
- `react-query`: Server state management and caching
- `axios`: HTTP client for API requests

### Data Visualization
- `recharts`: Charting library for analytics
- `date-fns`: Date formatting and manipulation

### Testing
- `@testing-library/react`: React component testing
- `@testing-library/jest-dom`: DOM testing utilities
- `@testing-library/user-event`: User event simulation

### Type Definitions
- `@types/react`: React TypeScript definitions
- `@types/react-dom`: React DOM TypeScript definitions
- `@types/node`: Node.js TypeScript definitions
- `@types/jest`: Jest TypeScript definitions

## Scripts

### Development
```bash
npm start
```
- Starts development server
- Enables hot reloading
- Opens browser at http://localhost:3000

### Production Build
```bash
npm run build
```
- Creates optimized production build
- Minifies and bundles code
- Generates static assets

### Testing
```bash
npm test
```
- Runs test suite
- Watches for changes
- Shows coverage report

### Configuration
```bash
npm run eject
```
- Ejects from Create React App
- Exposes build configuration
- **Warning**: One-way operation

## Environment Setup

### Development Requirements
- Node.js >= 14.0.0
- npm >= 6.14.0
- Modern browser (Chrome, Firefox, Safari, Edge)

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:3001/ws
```

### Browser Support
- Production: > 0.2% market share, not dead, no IE11
- Development: Latest versions of Chrome, Firefox, Safari

## Project Structure
```
src/
├── components/     # Reusable UI components
├── services/      # API and business logic
├── hooks/         # Custom React hooks
├── utils/         # Helper functions
├── types/         # TypeScript definitions
├── theme/         # UI theme configuration
└── tests/         # Test files
```

## Development Guidelines

### Package Management
1. Adding Dependencies
   ```bash
   npm install package-name
   ```

2. Adding Dev Dependencies
   ```bash
   npm install --save-dev package-name
   ```

3. Updating Dependencies
   ```bash
   npm update
   ```

### Version Control
- Lock files should be committed
- Keep dependencies up to date
- Review security advisories

### Performance
- Use production builds
- Enable tree shaking
- Implement code splitting
- Monitor bundle size

### Testing
- Write unit tests
- Include integration tests
- Maintain good coverage
- Test browser compatibility

## Troubleshooting

### Common Issues
1. Build Failures
   - Clear npm cache
   - Delete node_modules
   - Reinstall dependencies

2. Type Errors
   - Update @types packages
   - Check TypeScript version
   - Verify tsconfig.json

3. Development Server
   - Check port availability
   - Verify environment variables
   - Clear browser cache

### Support Resources
- Material-UI docs: https://mui.com/
- React docs: https://reactjs.org/
- TypeScript docs: https://www.typescriptlang.org/

## Security

### Best Practices
- Keep dependencies updated
- Review security advisories
- Implement CSP headers
- Sanitize user input
- Use HTTPS in production

### Known Issues
- Regular security audits
- Dependency vulnerabilities
- Browser compatibility
- API security

## Deployment

### Build Process
1. Run tests
2. Build production bundle
3. Optimize assets
4. Deploy static files

### Hosting Options
- Static hosting (S3, Netlify)
- CDN distribution
- Docker containers
- Server deployment

## Maintenance

### Regular Tasks
- Update dependencies
- Review security alerts
- Monitor performance
- Update documentation

### Monitoring
- Error tracking
- Performance metrics
- User analytics
- Server monitoring
