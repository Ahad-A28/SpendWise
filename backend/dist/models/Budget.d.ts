import mongoose, { Document } from 'mongoose';
export interface IBudget extends Document {
    userId: string;
    category: string;
    allocated: number;
}
declare const _default: mongoose.Model<any, {}, {}, {}, any, any, any> | mongoose.Model<IBudget, {}, {}, {}, Document<unknown, {}, IBudget, {}, mongoose.DefaultSchemaOptions> & IBudget & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IBudget>;
export default _default;
//# sourceMappingURL=Budget.d.ts.map