import axios from "axios";

export const QUERY_KEYS = {
    sessionYears: (uniID: string) => ["university-id", uniID],
    degrees: (batchID: string) => ["batch-id", batchID],
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