import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import AppSetting from './src/models/AppSetting';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  console.log('Connected to MongoDB');
  try {
    const settings = await AppSetting.find({ key: 'categories' });
    console.log('Categories in DB:');
    settings.forEach(s => {
      console.log(`User: ${s.userId}`);
      console.log(JSON.stringify(s.value, null, 2));
    });
  } catch (err: any) {
    console.error('Error fetching settings:', err.message);
  }
  process.exit(0);
});
