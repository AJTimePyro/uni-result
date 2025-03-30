import axios from "axios";

export const QUERY_KEYS = {
    sessionYears: (uniID: string) => ["university-id", uniID],
    degrees: (batchID: string) => ["batch-id", batchID],
    colleges: (degreeID: string) => ["degree-id", degreeID],
    rankList: (rankListJson: RankListRequestJSON) => ["ranklist", rankListJson]
}

// All data fetch functions
export const fetchAllUniversities = async () => {
    const res = await axios.get("/fastapi/university/all");
    return res.data;
}

export const fetchSessionYears = async (uniName: string) : Promise<Batches> => {
    const res = await axios.get(`/fastapi/university?name=${uniName}`);
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

export const fetchRanklistResult = async ({
    uniName,
    batchYear,
    degreeID,
    collegeID,
    semNum,
    degreeDocID
}: RankListRequestJSON) => {
    if (!uniName || !batchYear || !degreeID || !collegeID || !semNum || !degreeDocID) {
        return {};
    }

    const res = await axios.post("/fastapi/result", {
        university_name: uniName,
        batch_year: batchYear,
        degree_id: degreeID,
        college_id: collegeID,
        semester_num: semNum,
        degree_doc_id: degreeDocID
    })
    return res.data
}