import type { Request, Response } from 'express';
export declare const getAdminUsers: (req: Request, res: Response) => Promise<void>;
export declare const updateUserAdminSettings: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCreditLogs: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=adminController.d.ts.map