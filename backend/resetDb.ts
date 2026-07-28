import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createClerkClient } from '@clerk/express';
import dns from 'dns';

// Force Node.js to use Google DNS to resolve MongoDB SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function resetAll() {
  console.log('Starting full reset...');

  try {
    // 1. Delete all Clerk Users
    console.log('Fetching Clerk users...');
    const users = await clerkClient.users.getUserList({ limit: 100 });
    console.log(`Found ${users.data.length} users in Clerk. Deleting...`);
    
    for (const user of users.data) {
      await clerkClient.users.deleteUser(user.id);
      console.log(`Deleted Clerk user: ${user.id}`);
    }
    console.log('Clerk users deleted successfully.');

    // 2. Clear MongoDB Database
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
