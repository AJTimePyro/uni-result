import { NextRequest, NextResponse } from "next/server";
import { Result } from "@/lib/fetchResult";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  if (!searchParams) {
    return NextResponse.json({
      error: "body should be provided"
    }, {
      status: 400
    });
  }

  const student_id = searchParams.get('roll-num');
  if (!student_id) {
    return NextResponse.json({
      "Error": "student_id should not provided"
    }, {
      status: 400
    });
  }

  const resultClient = new Result();
  return await resultClient.fetchStudentAllSemRes(student_id);
}