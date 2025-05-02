import { readGDriveFile } from "./gDrive";
import { parse } from "csv-parse/sync";
import Degree from "@/models/Degree";
import { connectToDatabase } from "./db";
import mongoose from "mongoose";
import Subject from "@/models/Subject";

export type StudentRecord = {
    roll_num: string;
    name: string;
    college_id: string;
    total_marks_scored: string;
    max_marks_possible: string;
    rank?: number;
    cgpa: string | number;
    [key: string]: string | number | undefined;
};

export class Result {
    private collegeID: string;
    private degreeDocID: string;
    private semNum: number;
    private resultFileID: string;
    public result: StudentRecord[];
    public subjects: object[];

    constructor() {
        this.collegeID = "";
        this.degreeDocID = "";
        this.semNum = 0;
        this.resultFileID = "";
        this.result = [];
        this.subjects = [];
    }

    async fetchResult({ college_id, degree_doc_id, semester_num, result_file_id }: {
        college_id: string,
        degree_doc_id: string,
        semester_num: number,
        result_file_id: string
    }) {
        this.collegeID = college_id;
        this.degreeDocID = degree_doc_id;
        this.semNum = semester_num;
        this.resultFileID = result_file_id;
        await connectToDatabase();

        // Getting File Content
        const fileContent: string = await readGDriveFile(this.resultFileID)

        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        })
        if (records.length == 0) {
            throw new Error("No Data Found")
        }

        // Getting all subject Data
        const subIDList = this.getAllSubjects(records[0])
        await this.getAllSubjectData(subIDList)

        // Filtering result (If college id is empty then return result of all colleges)
        const filteredRecords = this.collegeID ?
            records.filter((row: StudentRecord) => row["college_id"] === this.collegeID) :
            records;
        this.result = this.assignRanks(filteredRecords);
    }

    private getAllSubjects(firstRecord: any): string[] {
        const subIdList = Object.keys(firstRecord).filter(
            column => column.startsWith('sub_')
        ).map(
            column => column.replace('sub_', '')
        );

        return subIdList;
    }

    private async getAllSubjectData(subIDList: string[]) {
        // Fetching degree
        const degree = await Degree.findOne({
            _id: new mongoose.Types.ObjectId(this.degreeDocID)
        }).select('subjects');

        // Getting All Subject Doc IDs
        const subject_doc_id_array: string[] = [];
        subIDList.forEach(subID => {
            if (subID in degree.subjects) {
                subject_doc_id_array.push(degree.subjects[subID])
            }
        })
        const objectIds = subject_doc_id_array.map(id => new mongoose.Types.ObjectId(id));

        // Getting All Subject Data
        this.subjects = await Subject.find(
            { _id: { $in: objectIds } },
            { university_id: 0 }
        );
    }

    private assignRanks(resultData: StudentRecord[]) {
        const students = resultData.map(student => ({
            ...student,
            cgpa: parseFloat(student.cgpa as string)
        }));

        // Sort in descending order of cgpa
        students.sort((a: any, b: any) => b.cgpa - a.cgpa);

        // Assigning Ranks
        let rank = 1;
        for (let i = 0; i < students.length; i++) {
            if (i > 0 && students[i].cgpa === students[i - 1].cgpa) {
                students[i].rank = students[i - 1].rank;
            } else {
                students[i].rank = rank;
            }
            rank++;
        }

        return students;
    }

    public async fetchStudentInfo(studentId : string) {
        const rollNo :string  = studentId.slice(0,3);
        const collegeId : string = studentId.slice(3,6);
        const degreeId : string = studentId.slice(6,9);
        const batchYear : string = "20"+studentId.slice(9,11);
        return {rollNo , collegeId , degreeId , batchYear}
    }

    private async fetchStudentResult(fileID : string , studentId: string){
        await connectToDatabase();

        // Getting File Content
        const fileContent: string = await readGDriveFile(fileID)

        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        })
        if (records.length == 0) {
            throw new Error("No Data Found")
        }
        // Filtering result (If student id is empty then return null)
        const filteredRecords = records.filter(
            (row : StudentRecord)=>row["roll_num"]===studentId
        );
        if(filteredRecords.length === 0){
            throw new Error("Student not found");
        }
        return filteredRecords;
    }
}