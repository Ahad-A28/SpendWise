import mongoose, { Schema, Document } from 'mongoose';
const BudgetSchema = new Schema({
    userId: { type: String, required: true },
    category: { type: String, required: true },
    allocated: { type: Number, required: true },
}, { timestamps: true });
BudgetSchema.index({ userId: 1, category: 1 }, { unique: true });
export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);
//# sourceMappingURL=Budget.js.map