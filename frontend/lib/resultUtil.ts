export const parseMarkData = (markString: string) => {
    try {
        const scoreArray = JSON.parse(markString.replace(/'/g, '"'));
        return {
            internal_marks: scoreArray[0],
            external_marks: scoreArray[1],
            total_marks: scoreArray[0] + scoreArray[1],
            grade: scoreArray[2],
            credit: scoreArray[3],
        };
    } catch (e) {
        console.error(e);
        return {
            internal_marks: 0,
            external_marks: 0,
            total_marks: 0,
            grade: 'F',
            credit: 0
        };
    }
};

export const getGradePoint = (grade: string) => {
    switch (grade) {
        case 'O': return 10;
        case 'A+': return 9;
        case 'A': return 8;
        case 'B+': return 7;
        case 'B': return 6;
        case 'C': return 5;
        case 'P': return 4;
        case 'F': return 0;
        default: return 0;
    }
};

export const getGradeDescription = (grade: string) => {
    switch (grade) {
        case 'O': return 'Outstanding';
        case 'A+': return 'Excellent';
        case 'A': return 'Very Good';
        case 'B+': return 'Good';
        case 'B': return 'Above Average';
        case 'C': return 'Average';
        case 'P': return 'Pass';
        case 'F': return 'Fail';
        default: return 'N/A';
    }
};

export const getCGPADescription = (cgpa: string) => {
    const numCGPA = parseFloat(cgpa);
    return numCGPA >= 9.5 ? 'Outstanding'
        : numCGPA >= 8.5 ? 'Excellent'
            : numCGPA >= 7.5 ? 'Very Good'
                : numCGPA >= 6.5 ? 'Good'
                    : numCGPA >= 5.5 ? 'Above Average'
                        : numCGPA >= 4.5 ? 'Average'
                            : 'Fail';
}