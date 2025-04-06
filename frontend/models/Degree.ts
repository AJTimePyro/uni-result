import mongoose, { Schema, Document } from 'mongoose';

interface CollegeData {
    college_name: string;
    available_semester: number[];
    shifts: {
        M?: string;
        E?: string;
    }
}

export interface IDegree extends Document {
    degree_id: string;
    degree_name: string;
    branch_name: string;
    colleges: CollegeData[];
    subjects: Record<string, string>;
    sem_results: Record<string, string>;
    batch_year: number;
    batch_id: string;
    folder_id: string;
}

const CollegeDataSchema = new Schema<CollegeData>({
    college_name: { type: String, required: true },
    available_semester: { type: [Number], required: true },
    shifts: {
        M: { type: String, required: false },
        E: { type: String, required: false },
    }
});

const DegreeSchema = new Schema<IDegree>({
    degree_id: { type: String, required: true },
    degree_name: { type: String, required: true },
    branch_name: { type: String, required: false },
    colleges: { type: [CollegeDataSchema], required: false },
    subjects: { type: Object, required: false },
    sem_results: { type: Object, required: false },
    batch_year: { type: Number, required: true },
    batch_id: { type: String, required: true },
    folder_id: { type: String, required: false },
});

export default mongoose.models.Degree || mongoose.model<IDegree>('Degree', DegreeSchema);
