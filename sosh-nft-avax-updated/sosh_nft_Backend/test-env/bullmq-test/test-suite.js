const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');

// Redis configuration from environment variables
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = parseInt(process.env.REDIS_PORT);
const REDIS_PASS = process.env.REDIS_PASS;

// Test stages
async function testRedisConnection() {
    console.log('\n=== Test 1: Direct Redis Connection ===');
    const redis = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASS,
        lazyConnect: true
    });

    try {
        await redis.connect();
        console.log('✓ Connected to Redis');
        
        await redis.set('test', 'value');
        console.log('✓ Successfully set test value');
        
        const value = await redis.get('test');
        console.log('✓ Successfully got test value:', value);

        // Test client name setting
        await redis.client('setname', 'test-client');
        const name = await redis.client('getname');
        console.log('✓ Successfully set and got client name:', name);
        
        await redis.quit();
        console.log('✓ Successfully closed Redis connection');
        return true;
    } catch (error) {
        console.error('✗ Redis Error:', error);
        throw error;
    }
}

async function testBullMQQueue() {
    console.log('\n=== Test 2: BullMQ Queue Creation ===');
    let queue;
    let worker;

    try {
        // Create queue
        queue = new Queue('test-queue', {
            connection: {
                host: REDIS_HOST,
                port: REDIS_PORT,
                password: REDIS_PASS
            }
        });
        console.log('✓ Queue created');

        // Create worker
        worker = new Worker('test-queue', async (job) => {
            console.log('✓ Processing job:', job.id, job.data);
            return { success: true };
        }, {
            connection: {
                host: REDIS_HOST,
                port: REDIS_PORT,
                password: REDIS_PASS
            }
        });
        console.log('✓ Worker created');

        // Add test jobs
        console.log('Adding test jobs...');
        const jobs = await Promise.all([
            queue.add('test1', { test: 1 }),
            queue.add('test2', { test: 2 }),
            queue.add('test3', { test: 3 })
        ]);
        console.log('✓ Added test jobs:', jobs.map(j => j.id));

        // Wait for job completion
        await new Promise((resolve, reject) => {
            let completed = 0;
            const timeout = setTimeout(() => {
                reject(new Error('Job processing timeout'));
            }, 5000);

            worker.on('completed', (job) => {
                console.log('✓ Job completed:', job.id);
                completed++;
                if (completed === 3) {
                    clearTimeout(timeout);
                    resolve();
                }
            });

            worker.on('failed', (job, err) => {
                console.error('✗ Job failed:', job.id, err);
                clearTimeout(timeout);
                reject(err);
            });
        });

        console.log('✓ All jobs completed successfully');
        return true;
    } catch (error) {
        console.error('✗ BullMQ Error:', error);
        throw error;
    } finally {
        // Clean up
        if (queue) {
            await queue.close();
            console.log('✓ Queue closed');
        }
        if (worker) {
            await worker.close();
            console.log('✓ Worker closed');
        }
    }
}

async function testReconnection() {
    console.log('\n=== Test 3: Reconnection Handling ===');
    let queue;
    let worker;

    try {
        // Create queue with reconnection settings
        queue = new Queue('reconnect-test', {
            connection: {
                host: REDIS_HOST,
                port: REDIS_PORT,
                password: REDIS_PASS,
                maxRetriesPerRequest: 3,
                retryStrategy(times) {
                    return Math.min(times * 50, 2000);
                }
            }
        });
        console.log('✓ Queue created with reconnection settings');

        worker = new Worker('reconnect-test', async (job) => {
            console.log('✓ Processing job:', job.id);
            return { success: true };
        }, {
            connection: {
                host: REDIS_HOST,
                port: REDIS_PORT,
                password: REDIS_PASS,
                maxRetriesPerRequest: 3,
                retryStrategy(times) {
                    return Math.min(times * 50, 2000);
                }
            }
        });
        console.log('✓ Worker created with reconnection settings');

        // Add a test job
        const job = await queue.add('reconnect-test', { test: true });
        console.log('✓ Added test job:', job.id);

        // Wait for job completion
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Job processing timeout'));
            }, 5000);

            worker.on('completed', (job) => {
                console.log('✓ Job completed:', job.id);
                clearTimeout(timeout);
                resolve();
            });

            worker.on('failed', (job, err) => {
                console.error('✗ Job failed:', job.id, err);
                clearTimeout(timeout);
                reject(err);
            });
        });

        console.log('✓ Reconnection test passed');
        return true;
    } catch (error) {
        console.error('✗ Reconnection Error:', error);
        throw error;
    } finally {
        if (queue) await queue.close();
        if (worker) await worker.close();
    }
}

// Run all tests
async function runTests() {
    try {
        // Run tests sequentially
        await testRedisConnection();
        await testBullMQQueue();
        await testReconnection();

        console.log('\n=== All Tests Passed Successfully ===');
        process.exit(0);
    } catch (error) {
        console.error('\n=== Test Suite Failed ===');
        console.error('Error:', error);
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start tests
console.log('Starting test suite...');
console.log('Redis configuration:', {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: '********'
});

runTests();
