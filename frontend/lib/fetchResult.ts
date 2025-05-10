import { readGDriveFile } from "./gDrive";
import { parse } from "csv-parse/sync";
import Degree from "@/models/Degree";
import { connectToDatabase } from "./db";
import mongoose from "mongoose";
import Subject from "@/models/Subject";
import { NextResponse } from "next/server";

export class Result {
    public result: StudentRecord[];
    public subjects: Subject[];

    constructor() {
        this.result = [];
        this.subjects = [];
    }

    async fetchResult(college_id: string, degree_doc_id: string, result_file_id: string) {
        await connectToDatabase();

        // Reading CSV
        const records = await this.fetchNReadCSV(result_file_id)
        if (records.length == 0) {
            throw new Error("No Data Found")
        }

        // Getting all subject Data
        const subIDList = this.getAllSubjectsIDFromCSVHeader(records[0])
        await this.fetchAllSubjectDataByDegree(subIDList, degree_doc_id)

        // Filtering result (If college id is empty then return result of all colleges)
        const filteredRecords = college_id ?
            records.filter((row: StudentRecord) => row["college_id"] === college_id) :
            records;
        this.result = this.assignRanks(filteredRecords);
    }

    async fetchStudentAllSemRes(studentRollNum: string) {
        await connectToDatabase();

        // Getting Student Info
        const { degreeId, batchYear } = this.fetchStudentInfo(studentRollNum)

        // Getting Degree
        const degree = await this.getDegreeByIDYear(degreeId, batchYear, 'subjects sem_results');
        if (!degree) {
            return NextResponse.json({
                error: "Degree not found"
            }, {
                status: 404
            });
        }

        const sem_results: Record<string, string> = degree.sem_results;
        if (!sem_results || Object.keys(sem_results).length === 0) {
            return NextResponse.json({
                error: "Semester results not found"
            }, {
                status: 404
            })
        }

        // Fetching All Semester Result
        const subIDList = [];
        const studentSemResults: StudentRes = {
            subjects: [],
            results: {}
        };
        for (const [sem, fileID] of Object.entries(sem_results)) {
            studentSemResults.results[sem] = {};
            try {
                const records = await this.fetchNReadCSV(fileID);
                await this.fetchStudentResult(records, studentRollNum);

                studentSemResults.results[sem].results = this.result[0]
                subIDList.push(...this.getAllSubjectsIDFromCSVHeader(records[0]));
            } catch (err: any) {
                studentSemResults.results[sem].error = `Error : ${err.message}`
            }
        }

        // Fetching All Subject Data
        await this.getAllSubjectData(subIDList, degree.subjects)
        studentSemResults.subjects = this.subjects;

        return NextResponse.json(studentSemResults);
    }

    private async fetchNReadCSV(fileID: string) {
        // Getting File Content
        const fileContent: string = await readGDriveFile(fileID);

        return parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });
    }

    private getAllSubjectsIDFromCSVHeader(firstRecord: any): string[] {
        const subIdList = Object.keys(firstRecord).filter(
            column => column.startsWith('sub_')
        ).map(
            column => column.replace('sub_', '')
        );

        return subIdList;
    }

    private async fetchAllSubjectDataByDegree(subIDList: string[], degreeDocID: string) {
        // Fetching degree to get subject doc ids
        const degree = await Degree.findOne({
            _id: new mongoose.Types.ObjectId(degreeDocID)
        }).select('subjects');

        // Fetching All Subject data
        await this.getAllSubjectData(subIDList, degree.subjects);
    }

    private async getAllSubjectData(subIDList: string[], subjects: Record<string, string>) {
        // Getting All Subject Doc IDs
        const subject_doc_id_array: string[] = [];
        subIDList.forEach(subID => {
            if (subID in subjects) {
                subject_doc_id_array.push(subjects[subID])
            }
        })
        const objectIds = subject_doc_id_array.map(id => new mongoose.Types.ObjectId(id));

        // Getting All Subject Data
        this.subjects = await Subject.find(
            { _id: { $in: objectIds } },
            { university_id: 0 }
        ).select('-_id -batch_years');
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

    private fetchStudentInfo(studentId: string) {
        const rollNo: string = studentId.slice(0, 3);
        const collegeId: string = studentId.slice(3, 6);
        const degreeId: string = studentId.slice(6, 9);
        const batchYear: string = "20" + studentId.slice(9, 11);
        return { rollNo, collegeId, degreeId, batchYear }
    }

    private async getDegreeByIDYear(degreeID: string, batchYear: string, select_str: string = '') {
        const degree = await Degree.findOne({
            degree_id: degreeID,
            batch_year: Number(batchYear)
        }).select(select_str ? select_str : 'subjects');
        if (!degree) {
            throw new Error("Degree not found")
        }

        return degree
    }

    private async fetchStudentResult(records: any, studentId: string) {
        if (records.length == 0) {
            throw new Error("No Data Found")
        }
        // Filtering result (If student id is empty then throw error)
        const filteredRecord = records.filter(
            (row: StudentRecord) => row["roll_num"] === studentId
        );
        if (filteredRecord.length === 0) {
            throw new Error("Student not found");
        }
        this.result = filteredRecord;
    }
}