import axios from "axios";

export const QUERY_KEYS = {
    sessionYears: (uniID: string) => ["university-id", uniID],
    degrees: (batchID: string) => ["batch-id", batchID],
    colleges: (degreeID: string) => ["degree-id", degreeID]
}

// All data fetch functions
export const fetchAllUniversities = async () => {
    const res = await axios.get("/fastapi/university/all");
    return res.data;
}

export const fetchSessionYears = async (uniID: string) : Promise<Batches> => {
    const res = await axios.get(`/fastapi/university?id=${uniID}`);
    return res.data.batches;
}

export const fetchDegrees = async (batchID: string) : Promise<Degree[]> => {
    const res = await axios.get(`/fastapi/batch?id=${batchID}`);
    return res.data.degrees;
}

export const fetchColleges = async (degreeID: string) : Promise<College[]> => {
    const res = await axios.get(`/fastapi/degree?id=${degreeID}`);
    return res.data.colleges;
}

export const fetchResult = async (uniName: string, batchYear: number, degreeID: string, collegeID: string, semNum: number, degreeDocID: string) => {
    const res = await axios.post("/fastapi/result", {
        university_name: uniName,
        batch_year: batchYear,
        degree_id: degreeID,
        college_id: collegeID,
        semester_num: semNum,
        degree_doc_id: degreeDocID
    })
    console.log(res.data)
    return res.data
}