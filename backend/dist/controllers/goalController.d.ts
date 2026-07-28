import type { Request, Response } from 'express';
export declare const getGoals: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addGoal: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateGoal: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteGoal: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const contributeToGoal: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=goalController.d.ts.map