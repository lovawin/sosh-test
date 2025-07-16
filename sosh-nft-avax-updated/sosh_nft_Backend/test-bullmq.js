const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const { REDIS_HOST, REDIS_PORT, REDIS_PASS } = require('./config/appconfig');

const connection = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASS
};

async function testBullMQ() {
    console.log('Test: BullMQ Queue Creation');
    let queue;
    let worker;

    try {
        // Create queue
        queue = new Queue('test-queue', {
            connection,
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: true,
                attempts: 3
            }
        });

        console.log('Queue created');

        // Create worker
        worker = new Worker('test-queue', async (job) => {
            console.log('Processing job:', job.id, job.data);
            return { success: true };
        }, { connection });

        console.log('Worker created');

        // Add a test job
        console.log('Adding test job...');
        const job = await queue.add('test', { test: true });
        console.log('Added test job:', job.id);

        // Wait for job completion
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Job processing timeout'));
            }, 5000);

            worker.on('completed', (job) => {
                console.log('Job completed:', job.id);
                clearTimeout(timeout);
                resolve();
            });

            worker.on('failed', (job, err) => {
                console.error('Job failed:', job.id, err);
                clearTimeout(timeout);
                reject(err);
            });
        });

        console.log('Test completed successfully');
    } catch (error) {
        console.error('BullMQ Error:', error);
        throw error;
    } finally {
        // Clean up
        if (queue) {
            await queue.close();
            console.log('Queue closed');
        }
        if (worker) {
            await worker.close();
            console.log('Worker closed');
        }
    }
}

// Run test
testBullMQ()
    .then(() => {
        console.log('All tests passed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Test failed:', error);
        process.exit(1);
    });

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
