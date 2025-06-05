import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth';
export declare const getAllBookings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getBookingById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createBooking: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateBooking: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateBookingStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteBooking: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=bookingController.d.ts.map