import mongoose, { Schema, Document } from 'mongoose';

export interface IBatch extends Document {
    batch: number;
    degrees: Record<string, string>;
    university_id: string;
    folder_id: string;
}

const BatchSchema = new Schema<IBatch>({
    batch: { type: Number, required: true },
    degrees: { type: Object, required: false },
    university_id: { type: String, required: true },
    folder_id: { type: String, required: false },
});

export default mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);