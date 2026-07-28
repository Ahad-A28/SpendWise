import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Force Node.js to use Google DNS to resolve MongoDB SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

async function resetAll() {
  console.log('Starting full reset...');

  try {
    // Clear MongoDB Database
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB. Dropping entire database...');
    
    await mongoose.connection.db?.dropDatabase();
    console.log('MongoDB database dropped successfully.');

    console.log('Reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during reset:', error);
    process.exit(1);
  }
}

resetAll();
