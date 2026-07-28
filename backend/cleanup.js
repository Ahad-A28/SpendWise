import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("No MongoDB URI");
  process.exit(1);
}

async function cleanDb() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB");

    const collections = [
      'appsettings',
      'budgets',
      'creditlogs',
      'expenses',
      'goals'
    ];

    for (const colName of collections) {
      const col = mongoose.connection.collection(colName);
      
      // Delete documents where userId starts with 'user_' (Clerk IDs)
      const res = await col.deleteMany({ userId: { $regex: '^user_' } });
      console.log(`Deleted ${res.deletedCount} from ${colName} (Clerk IDs)`);
      
      // Also, we can check for orphaned ObjectIDs
      // Let's get all valid user IDs
      const User = mongoose.connection.collection('users');
      const validUsers = await User.find({}).toArray();
      const validIds = validUsers.map(u => u._id.toString());
      
      // Now delete documents where userId is NOT in validIds AND does not start with user_ (just to be safe)
      // Actually let's just delete any document whose userId is not in validIds and is not a global config
      const resOrphan = await col.deleteMany({ 
        userId: { $nin: validIds },
        key: { $ne: 'aiCreditConfig' } // Keep global configs that might not have a userId
      });
      console.log(`Deleted ${resOrphan.deletedCount} orphaned documents from ${colName}`);
      
      // But for aiCreditConfig, we might have ones bound to invalid userIds. 
      if (colName === 'appsettings') {
         const resSetting = await col.deleteMany({
           key: 'aiCreditConfig',
           userId: { $nin: [...validIds, null, undefined, ""] }
         });
         console.log(`Deleted ${resSetting.deletedCount} orphaned aiCreditConfig settings`);
      }
    }

    console.log("Done cleaning up.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

cleanDb();
