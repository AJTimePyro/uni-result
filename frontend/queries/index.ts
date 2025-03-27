import axios from "axios";

export const QUERY_KEYS = {
    sessionYears: (uniID: string) => ["session-years", uniID],
}

// All data fetch functions
export const fetchAllUniversities = async () => {
    const res = await axios.get("/fastapi/university/all");
    return res.data;
}

export const fetchSessionYears = async (uniID: string) => {
    const res = await axios.get(`/fastapi/university?id=${uniID}`);
    return res.data.batches;
}