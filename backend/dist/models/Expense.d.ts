import mongoose, { Document } from 'mongoose';
export interface IExpense extends Document {
    userId: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    paymentMethod: string;
    notes?: string;
    isRecurring: boolean;
    createdAt: Date;
}
declare const _default: mongoose.Model<any, {}, {}, {}, any, any, any> | mongoose.Model<IExpense, {}, {}, {}, Document<unknown, {}, IExpense, {}, mongoose.DefaultSchemaOptions> & IExpense & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IExpense>;
export default _default;
//# sourceMappingURL=Expense.d.ts.map