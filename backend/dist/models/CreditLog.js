import mongoose, { Schema, Document } from 'mongoose';
const CreditLogSchema = new Schema({
    userId: { type: String, required: true, index: true },
    action: { type: String, required: true },
    amount: { type: Number, required: true },
    details: { type: String },
}, { timestamps: true });
export default mongoose.models.CreditLog || mongoose.model('CreditLog', CreditLogSchema);
//# sourceMappingURL=CreditLog.js.map