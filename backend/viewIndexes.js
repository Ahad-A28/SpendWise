import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../.env.local') });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    try {
        const indexes = await mongoose.connection.collection('appsettings').indexes();
        console.log('Appsettings indexes:', indexes);
    }
    catch (err) {
        console.error('Error getting indexes:', err.message);
    }
    process.exit(0);
});
//# sourceMappingURL=viewIndexes.js.map