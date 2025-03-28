type DropdownKey = 'Session Year' | 'Degree' | 'Branch' | 'College' | 'Shift' | 'Semester';

type Batches = Record<string, string>;  // key: session year, value: batch id

type SessionYear = {
    year: string;
    id: string;
}

type BranchRecord = Record<string, string>;   // key: branch name, value: branch id

type Degree = {
    degree_name: string;
    branches: BranchRecord[];
}

type Branch = {
    branch_name: string;
    id: string;
}

type College = {
    college_name: string;
    available_semester: number[];
    shifts: {
        M?: string[];    // two elements - [college id, college doc id]
        E?: string[];    // two elements - [college id, college doc id]
    }
}