import mongoose, { Document, Schema } from 'mongoose';
const UserSchema = new Schema({
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String }, // Hashed password
    firstName: { type: String },
    lastName: { type: String },
    googleId: { type: String, index: true },
    avatarUrl: { type: String },
}, { timestamps: true });
export default mongoose.model('User', UserSchema);
//# sourceMappingURL=User.js.map