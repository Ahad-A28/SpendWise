import mongoose, { Document } from 'mongoose';
export interface ICreditLog extends Document {
    userId: string;
    action: string;
    amount: number;
    details: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<any, {}, {}, {}, any, any, any> | mongoose.Model<ICreditLog, {}, {}, {}, Document<unknown, {}, ICreditLog, {}, mongoose.DefaultSchemaOptions> & ICreditLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICreditLog>;
export default _default;
//# sourceMappingURL=CreditLog.d.ts.map