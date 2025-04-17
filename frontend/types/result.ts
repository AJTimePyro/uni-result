export interface Student {
    name: string;
    rank: number;
    roll_num: string;
    cgpa: number;
    max_marks_possible: number;
    total_marks_scored: number;
    [key: string]: number | string;
}

export interface Subject {
    subject_id: string;
    max_external_marks: number;
    max_internal_marks: number;
    passing_marks: number;
    subject_code: string;
    subject_credit: number;
    subject_name: string;
}