import mongoose, { Schema, Document } from 'mongoose';

export interface ICreditLog extends Document {
  userId: string;
  action: string;
  amount: number;
  details: string;
  createdAt: Date;
}

const CreditLogSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  action: { type: String, required: true },
  amount: { type: Number, required: true },
  details: { type: String },
}, { timestamps: true });

export default mongoose.models.CreditLog || mongoose.model<ICreditLog>('CreditLog', CreditLogSchema);
