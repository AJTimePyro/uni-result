export const parseMarkData = (markString: string) => {
    try {
        // Remove brackets and split by comma
        const parts = markString.replace(/[\[\]']/g, '').split(', ');
        return {
            internal: parseInt(parts[0]),
            external: parseInt(parts[1]),
            grade: parts[2].replace(/'/g, ''),
            credit: parseInt(parts[3])
        };
    } catch (e) {
        console.error(e);
        return { internal: 0, external: 0, grade: 'N/A', credit: 0 };
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