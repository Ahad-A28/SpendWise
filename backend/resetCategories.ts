import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import AppSetting from './src/models/AppSetting';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const USER_ID = 'user_3H70FnFn2Rzj3xXzPojgiiFZ75E';

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  console.log('Connected to MongoDB');
  try {
    await AppSetting.deleteMany({ key: 'categories', userId: USER_ID });
    console.log(`Deleted custom categories for user ${USER_ID}`);
  } catch (err: any) {
    console.error('Error resetting categories:', err.message);
  }
  process.exit(0);
});
