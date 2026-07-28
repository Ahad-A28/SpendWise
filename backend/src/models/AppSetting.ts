import mongoose, { Schema, Document } from 'mongoose';

export interface IAppSettings extends Document {
  userId: string;
  key: string;
  value: any;
}

const AppSettingsSchema: Schema = new Schema({
  userId: { type: String, required: true },
  key: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

AppSettingsSchema.index({ userId: 1, key: 1 }, { unique: true });

const AppSetting = (mongoose.models.AppSetting as mongoose.Model<IAppSettings>) || mongoose.model<IAppSettings>('AppSetting', AppSettingsSchema);

export default AppSetting;
