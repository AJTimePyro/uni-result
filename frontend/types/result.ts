interface Student {
    name: string;
    roll_num: string;
    cgpa: string;
    max_marks_possible: string;
    total_marks_scored: string;
    [key: string]: number | string | undefined;
}

interface StudentWithRank extends Student {
    rank: number;
}

interface Subject {
    subject_id: string;
    max_marks: number;
    subject_code: string;
    subject_name: string;
}

type StudentRecord = {
    roll_num: string;
    name: string;
    college_id: string;
    total_marks_scored: string;
    max_marks_possible: string;
    rank?: number;
    cgpa: string | number;
    [key: string]: string | number | undefined;
};

type StudentSemResErr = {
    error?: string,
    results?: StudentRecord
}

interface StudentRes {
    subjects: Subject[],
    results: Record<string, StudentSemResErr>
}
