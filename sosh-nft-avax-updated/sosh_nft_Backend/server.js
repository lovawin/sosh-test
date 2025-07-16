/**
 * Module dependencies.
 */
const http = require('http');
const { PORT } = require('./config/appconfig');
const initDatabase = require('./app/services/database');
const redis = require('./app/utils/redis_service');

// Import app after database initialization
let app;
let logger;

// Error handler for HTTP server
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string'
    ? `Pipe ${PORT}`
    : `Port ${PORT}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      if (logger) logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      if (logger) logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      if (logger) logger.error('Server error:', error);
      console.error('Server error:', error);
      throw error;
  }
}

// Event listener for HTTP server "listening" event
function onListening(server) {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  if (logger) logger.info(`Server started listening on ${bind}`);
  console.log(`Server started listening on ${bind}`);
}

/**
 * Initialize all services and start server
 */
async function startServer() {
  try {
    console.log('Starting server initialization...');

    // Initialize database first
    console.log('Initializing database connection...');
    await initDatabase();
    console.log('Database connection established');

    // Import and initialize app after database is ready
    const { app: expressApp, initializeApp } = require('./app/app');
    app = expressApp;
    app.set('port', PORT);

    // Now we can import logger since database is ready
    logger = require('./app/services/logger');
    
    // Initialize app (which includes logging and contracts)
    await initializeApp();
    logger.info('App initialization complete');

    // Initialize Redis with authentication
    logger.info('Initializing Redis connection...');
    await redis.getClient();
    logger.info('Redis initialized and authenticated');

    // Initialize Bull queues after Redis is ready
    logger.info('Initializing Bull queues...');
    const { initializeQueues, serverAdapter } = require('./app/job_queue');
    await initializeQueues();
    logger.info('Bull queues initialized');

    // Setup Bull board after queues are initialized
    serverAdapter.setBasePath('/api/admin/queues');
    app.use('/api/admin/queues', serverAdapter.getRouter());
    logger.info('Bull board initialized');

    // Initialize job queue workers
    const { startWorkers } = require('./app/job_queue/process_workers');
    logger.info('Initializing job queue workers...');
    await startWorkers();
    logger.info('Job queue workers initialized');

    // Initialize contract scheduler
    const { contractScheduler } = require('./app/job_queue/add_task');
    logger.info('Initializing contract scheduler...');
    await contractScheduler();
    logger.info('Contract scheduler initialized');

    // Create and start HTTP server
    const server = http.createServer(app);
    server.on('error', onError);
    server.on('listening', () => onListening(server));
    server.listen(PORT);
    logger.info('Server initialization complete');

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (logger) logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  if (logger) logger.error('Unhandled Promise Rejection:', reason);
  process.exit(1);
});

// Start the server
startServer();
