import Degree from "@/models/Degree";
import { NextRequest, NextResponse } from "next/server"
import { Result } from "@/lib/fetchResult";
import { StudentRecord } from "@/lib/fetchResult";
import { connectToDatabase } from "@/lib/db";

export async function GET(req: NextRequest) {
    await connectToDatabase();
    const searchParams = req.nextUrl.searchParams;
    if (!searchParams) {
        return NextResponse.json({
            error: "body should be provided"
        }
            , {
                status: 400
            })
    }
    const student_id = searchParams.get('student_id');
    if (!student_id) {
        return NextResponse.json({
            "Error": "student_id should not provided"
        }, {
            status: 400
        })
    }
    const resultClient = new Result();
    const studentInfo = await resultClient.fetchStudentInfo(student_id);
    const { rollNo , collegeId , degreeId , batchYear  } = studentInfo

    console.log("studentInfo", studentInfo);
 
    const degree: any = await Degree.findOne({
            batch_year: Number(batchYear),
            degree_id: degreeId
    }).select('sem_results');
    
    console.log("degree", degree);
    if (!degree) {
        return NextResponse.json({
            error: "Degree not found"
        }, {
            status: 404
        })
    }

    const sem_results : Record<string , string> = degree.sem_results;
    console.log("sem_results", sem_results);
    if (!sem_results || Object.keys(sem_results).length === 0) {
        return NextResponse.json({
            "Error": "Semester results not found"
        }, {
            status: 404
        })
    }
    const studentSemResults: Record<string , StudentRecord | string> = {};
    for(const [sem , fileID]  of Object.entries(sem_results)){
        try{
          const res = await resultClient['fetchStudentResult'](fileID , student_id);
          studentSemResults[sem] = res[0];
        }catch(err : any){
          studentSemResults[sem] = `Error : ${err.message}`;
        }
    }
    return NextResponse.json({
        student_id,
        results: studentSemResults
    });
    
}