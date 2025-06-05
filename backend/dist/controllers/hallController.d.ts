import { Request, Response } from 'express';
import { AuthRequest } from '@/middleware/auth';
export declare const getAllHalls: (req: Request, res: Response) => Promise<void>;
export declare const getHallById: (req: Request, res: Response) => Promise<void>;
export declare const createHall: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateHall: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteHall: (req: AuthRequest, res: Response) => Promise<void>;
export declare const searchHalls: (req: Request, res: Response) => Promise<void>;
export declare const getHallsByCapacity: (req: Request, res: Response) => Promise<void>;
export declare const getHallsByEquipment: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=hallController.d.ts.map