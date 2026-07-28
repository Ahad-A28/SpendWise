import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  userId: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  notes?: string;
  isRecurring: boolean;
  createdAt: Date;
}

const ExpenseSchema: Schema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  notes: { type: String },
  isRecurring: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
