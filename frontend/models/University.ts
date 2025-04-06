import mongoose, { Schema, Document } from 'mongoose';

export interface IUniversity extends Document {
    name: string;
    short_name: string;
    batches: Record<string, string>;
    folder_id: string;
}

const UniversitySchema = new Schema<IUniversity>({
    name: { type: String, required: true },
    short_name: { type: String, required: true },
    batches: { type: Object, required: false },
    folder_id: { type: String, required: false },
});

export default mongoose.models.University || mongoose.model<IUniversity>('University', UniversitySchema);