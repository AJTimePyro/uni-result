// import { connectToDatabase } from "@/lib/db";
import { Result } from "@/lib/fetchResult";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { college_id, semester_num, degree_doc_id, result_file_id } = await req.json();
    if (!college_id || !semester_num || !degree_doc_id || !result_file_id) {
        return NextResponse.json({
            error: "Some data is missing"
        }, {
            status: 400
        })
    }

    // await connectToDatabase()

    const resultClient = new Result(
        college_id,
        degree_doc_id,
        semester_num,
        result_file_id
    )
    await resultClient.fetchResult()

    return NextResponse.json({
        result : resultClient.result,
        subjects: resultClient.subjects
    })
}