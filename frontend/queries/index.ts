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