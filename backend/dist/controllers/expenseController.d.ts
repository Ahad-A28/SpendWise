import type { Request, Response } from 'express';
export declare const getExpenses: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addExpense: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteExpense: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=expenseController.d.ts.map