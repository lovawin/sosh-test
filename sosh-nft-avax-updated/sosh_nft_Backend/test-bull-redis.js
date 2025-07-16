const Queue = require('bull');
const Redis = require('ioredis');

// Redis configuration
const REDIS_HOST = 'sosh-redis-db';
const REDIS_PORT = 6379;
const REDIS_PASS = 'KHTSGEQSHIH8JG9Q';

// Common Redis options
const redisOptions = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASS,
    retryStrategy(times) {
        return Math.min(times * 50, 2000);
    },
    reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            return true;
        }
        return false;
    },
    enableOfflineQueue: true,
    autoResubscribe: true,
    connectTimeout: 20000,
    keepAlive: 30000,
    noDelay: true
};

// Separate options for Bull's subscriber/bclient connections
const bullRedisOptions = {
    ...redisOptions,
    // Remove problematic options for Bull
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    autoResendUnfulfilledCommands: false
};

async function testRedisConnection() {
    console.log('Test 1: Direct Redis Connection');
    const redis = new Redis(redisOptions);

    try {
        // Wait for ready event
        await new Promise((resolve, reject) => {
            redis.once('ready', resolve);
            redis.once('error', reject);
        });
        console.log('Connected to Redis');
        
        await redis.set('test', 'value');
        console.log('Successfully set test value');
        
        const value = await redis.get('test');
        console.log('Successfully got test value:', value);
        
        await redis.quit();
        console.log('Successfully closed Redis connection');
    } catch (error) {
        console.error('Redis Error:', error);
        throw error;
    }
}

async function testBullQueue() {
    console.log('\nTest 2: Bull Queue Creation');
    let queue;
    try {
        // Create Bull queue with Redis options
        queue = new Queue('test-queue', {
            redis: bullRedisOptions,
            prefix: 'bull',
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: true,
                attempts: 3
            },
            settings: {
                lockDuration: 30000,
                stalledInterval: 30000,
                maxStalledCount: 1,
                guardInterval: 5000,
                retryProcessDelay: 5000,
                drainDelay: 5
            }
        });

        console.log('Queue created');

        // Listen for connection events
        queue.on('ready', () => {
            console.log('Queue ready');
        });

        queue.on('error', error => {
            console.error('Queue error:', error);
        });

        queue.on('waiting', jobId => {
            console.log('Job waiting:', jobId);
        });

        queue.on('active', job => {
            console.log('Job active:', job.id);
        });

        queue.on('completed', job => {
            console.log('Job completed:', job.id);
        });

        queue.on('failed', (job, err) => {
            console.error('Job failed:', job.id, err);
        });

        // Wait for queue to be ready
        await queue.isReady();
        console.log('Queue is ready');

        // Add a test job
        console.log('Adding test job...');
        const job = await queue.add({ test: true });
        console.log('Added test job:', job.id);

        // Process the job
        await queue.process(async (job) => {
            console.log('Processing job:', job.id, job.data);
            return { success: true };
        });

        // Wait for job completion
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Job processing timeout'));
            }, 5000);

            queue.once('completed', () => {
                clearTimeout(timeout);
                resolve();
            });

            queue.once('failed', (job, err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });
        
        // Clean up
        console.log('Closing queue...');
        await queue.close();
        console.log('Queue closed successfully');
        
    } catch (error) {
        console.error('Bull Error:', error);
        if (queue) {
            try {
                await queue.close();
            } catch (closeError) {
                console.error('Error closing queue:', closeError);
            }
        }
        throw error;
    }
}

// Run tests
async function runTests() {
    try {
        await testRedisConnection();
        await testBullQueue();
        console.log('\nAll tests completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Test suite error:', error);
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit, let the error propagate to our error handlers
});

runTests();
