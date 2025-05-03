import { Result } from "@/lib/fetchResult";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const college_id = searchParams.get("college_id") || "";
    const degree_doc_id = searchParams.get("degree_doc_id");
    const result_file_id = searchParams.get("result_file_id");
    
    if (!degree_doc_id || !result_file_id) {   // Empty college id is allowed as it means all
        return NextResponse.json({
            error: "Some data is missing"
        }, {
            status: 400
        })
    }

    const resultClient = new Result()
    await resultClient.fetchResult(college_id,
        degree_doc_id,
        result_file_id
    )

    return NextResponse.json({
        result : resultClient.result,
        subjects: resultClient.subjects
    })
}