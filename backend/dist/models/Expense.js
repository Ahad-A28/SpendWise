import mongoose, { Schema, Document } from 'mongoose';
const ExpenseSchema = new Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    notes: { type: String },
    isRecurring: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
//# sourceMappingURL=Expense.js.map