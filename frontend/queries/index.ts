import axios from "axios";

export const QUERY_KEYS = {
    sessionYears: (uniID: string) => ["university-id", uniID],
    degrees: (batchID: string) => ["batch-id", batchID],
    colleges: (degreeID: string) => ["degree-id", degreeID],
    rankList: (rankListJson: RankListRequestJSON) => ["ranklist", rankListJson],
    studentResult: (rollNumber: string) => ["student-result", rollNumber],
    contactForm: () => ["contact-form"]
}

// All data fetch functions
export const fetchAllUniversities = async () => {
    const res = await axios.get("/api/university/all");
    return res.data;
}

export const fetchSessionYears = async (uniName: string) : Promise<Batches> => {
    const res = await axios.get(`/api/university?name=${uniName}`);
    return res.data.batches;
}

export const fetchDegrees = async (batchID: string) : Promise<Degree[]> => {
    const res = await axios.get(`/api/batch?id=${batchID}`);
    return res.data;
}

export const fetchColleges = async (degreeID: string) : Promise<[College[], Record<string, string>]> => {
    const res = await axios.get(`/api/degree?id=${degreeID}`);
    return [res.data.colleges, res.data.sem_results];
}

export const fetchRanklistResult = async ({
    college_id,
    semester_num,
    degree_doc_id,
    result_file_id
}: RankListRequestJSON) => {
    if (!semester_num || !degree_doc_id || !result_file_id) {   // Empty college id is allowed as it means all
        return {};
    }

    const res = await axios.get(`/api/result?college_id=${college_id}&semester_num=${semester_num}&degree_doc_id=${degree_doc_id}&result_file_id=${result_file_id}`)
    return res.data
}

// Function to fetch individual student results
export const fetchStudentResult = async (rollNumber: string) => {
    if (!rollNumber || !rollNumber.trim()) {
        throw new Error("Roll number is required");
    }
    
    const res = await axios.get(`/api/student-result?roll_number=${rollNumber}`);
    return res.data;
}

// Function to submit contact form
export const submitContactForm = async (formData: {
    name: string;
    email: string;
    subject?: string;
    message: string;
}) => {
    if (!formData.name || !formData.email || !formData.message) {
        throw new Error("Name, email, and message are required");
    }
    
    const res = await axios.post('/api/contact', formData);
    return res.data;
}