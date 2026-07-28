import mongoose from 'mongoose';
const goalSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    targetAmount: {
        type: Number,
        required: true,
    },
    currentAmount: {
        type: Number,
        required: true,
        default: 0,
    },
    deadline: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    autoSaveAmount: {
        type: Number,
        default: 0,
    },
    lastAutoSaveDate: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
export default mongoose.models.Goal || mongoose.model('Goal', goalSchema);
//# sourceMappingURL=Goal.js.map