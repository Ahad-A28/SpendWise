import mongoose, { Document } from 'mongoose';
export interface IAppSettings extends Document {
    userId: string;
    key: string;
    value: any;
}
declare const AppSetting: mongoose.Model<IAppSettings, {}, {}, {}, Document<unknown, {}, IAppSettings, {}, mongoose.DefaultSchemaOptions> & IAppSettings & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAppSettings>;
export default AppSetting;
//# sourceMappingURL=AppSetting.d.ts.map