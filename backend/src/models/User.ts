import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string; // Optional for Google OAuth users
  firstName?: string;
  lastName?: string;
  googleId?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String }, // Hashed password
    firstName: { type: String },
    lastName: { type: String },
    googleId: { type: String, index: true },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
