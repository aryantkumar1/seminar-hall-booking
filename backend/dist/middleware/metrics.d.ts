import { Request, Response, NextFunction } from 'express';
import promClient from 'prom-client';
declare const register: promClient.Registry<"text/plain; version=0.0.4; charset=utf-8">;
export declare const metricsMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const recordBookingMetric: (status: "success" | "failed" | "pending", hallId: string) => void;
export declare const updateHallUtilization: (hallId: string, hallName: string, utilizationPercentage: number) => void;
export declare const recordDatabaseMetric: (operation: string, collection: string, duration: number) => void;
export declare const getMetrics: (req: Request, res: Response) => Promise<void>;
export { register };
//# sourceMappingURL=metrics.d.ts.map