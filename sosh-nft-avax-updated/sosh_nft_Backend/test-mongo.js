const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect('mongodb://sosh_mongo_db:27017/soshnew1', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('Successfully connected to MongoDB');
    const result = await mongoose.connection.db.admin().ping();
    console.log('Ping result:', result);
  } catch (error) {
    console.error('Failed to connect:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

testConnection();
