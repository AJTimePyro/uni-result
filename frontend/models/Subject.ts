import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
    subject_id: string;
    max_external_marks: number;
    max_internal_marks: number;
    passing_marks: number;
    subject_code: string;
    subject_credit: number;
    university_id: string;
    folder_id: string;
}

const SubjectSchema = new Schema<ISubject>({
    subject_id: { type: String, required: true },
    max_external_marks: { type: Number, required: true },
    max_internal_marks: { type: Number, required: true },
    passing_marks: { type: Number, required: true },
    subject_code: { type: String, required: true },
    subject_credit: { type: Number, required: true },
    university_id: { type: String, required: true },
    folder_id: { type: String, required: false },
});

export default mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);