interface Student {
    name: string;
    rank: number;
    roll_num: string;
    cgpa: number;
    max_marks_possible: number;
    total_marks_scored: number;
    [key: string]: number | string;
}