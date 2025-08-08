import axios from "axios";

export const QUERY_KEYS = {
    sessionYears: (uniID: string) => ["university-id", uniID],
    degrees: (batchID: string) => ["batch-id", batchID],
    colleges: (degreeID: string) => ["degree-id", degreeID],
    rankList: (rankListJson: RankListRequestJSON) => ["ranklist", rankListJson],
    student: (rollNum: string) => ["student", rollNum]
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
    degree_doc_id,
    result_file_id
}: RankListRequestJSON) => {
    if (!degree_doc_id || !result_file_id) {   // Empty college id is allowed as it means all
        return {};
    }

    const res = await axios.get(`/api/result?college_id=${college_id}&degree_doc_id=${degree_doc_id}&result_file_id=${result_file_id}`)
    return res.data
}

export const fetchStudentResult = async (rollNum: string) => {
    if (!rollNum) {
        return {};
    }
    const res = await axios.get(`/api/student-result?roll-num=${rollNum}`)
    return res.data
}