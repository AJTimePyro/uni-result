type DropdownKey = 'Session Year' | 'Degree' | 'Branch' | 'College' | 'Shift' | 'Semester';

type Batches = Record<string, string>;  // key: session year, value: batch id

type SessionYear = {
    year: string;
    id: string;
}

type Branch = Record<string, string>;   // key: branch name, value: branch id

type Degree = {
    degree_name: string;
    branches: Branch[];
}