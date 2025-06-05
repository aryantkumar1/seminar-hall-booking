import { Request, Response, NextFunction } from 'express';
import { IUser } from '@/models/User';
export interface AuthRequest extends Request {
    user?: IUser;
}
export interface JWTPayload {
    userId: string;
    email: string;
    role: 'admin' | 'faculty';
    name: string;
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireFaculty: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const generateToken: (user: IUser) => string;
//# sourceMappingURL=auth.d.ts.map