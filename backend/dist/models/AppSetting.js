import mongoose, { Schema, Document } from 'mongoose';
const AppSettingsSchema = new Schema({
    userId: { type: String, required: true },
    key: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });
AppSettingsSchema.index({ userId: 1, key: 1 }, { unique: true });
const AppSetting = mongoose.models.AppSetting || mongoose.model('AppSetting', AppSettingsSchema);
export default AppSetting;
//# sourceMappingURL=AppSetting.js.map