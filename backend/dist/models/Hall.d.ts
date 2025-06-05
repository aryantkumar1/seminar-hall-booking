import mongoose, { Document } from 'mongoose';
export interface IHall extends Document {
    name: string;
    capacity: number;
    equipment: string[];
    imageUrl: string;
    imageHint?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IHall, {}, {}, {}, mongoose.Document<unknown, {}, IHall, {}> & IHall & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Hall.d.ts.map