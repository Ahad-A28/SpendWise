import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  userId: string;
  category: string;
  allocated: number;
}

const BudgetSchema: Schema = new Schema({
  userId: { type: String, required: true },
  category: { type: String, required: true },
  allocated: { type: Number, required: true },
}, { timestamps: true });

BudgetSchema.index({ userId: 1, category: 1 }, { unique: true });

export default mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);
