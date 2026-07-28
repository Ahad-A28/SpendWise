import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  console.log('Connected to MongoDB');
  try {
    await mongoose.connection.collection('appsettings').dropIndex('key_1');
    console.log('Successfully dropped key_1 index.');
  } catch (err: any) {
    console.error('Error dropping index (might not exist):', err.message);
  }
  
  try {
    const indexes = await mongoose.connection.collection('appsettings').indexes();
    console.log('Current indexes:', indexes);
  } catch (err: any) {
    console.error('Error getting indexes:', err.message);
  }
  
  process.exit(0);
});
