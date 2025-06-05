import mongoose, { Document } from 'mongoose';
export interface IBooking extends Document {
    hallId: mongoose.Types.ObjectId;
    hallName: string;
    facultyId: mongoose.Types.ObjectId;
    facultyName: string;
    date: Date;
    startTime: string;
    endTime: string;
    purpose: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IBooking, {}, {}, {}, mongoose.Document<unknown, {}, IBooking, {}> & IBooking & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Booking.d.ts.map