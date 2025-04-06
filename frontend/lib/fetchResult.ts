import { readGDriveFile } from "./gDrive";
import { parse } from "csv-parse/sync";
import Degree from "@/models/Degree";
import { connectToDatabase } from "./db";
import mongoose from "mongoose";
import Subject from "@/models/Subject";

export class Result {
    private collegeID: string;
    private degreeDocID: string;
    private semNum: number;
    private resultFileID: string;
    public result: Object[];
    public subjects: Object[];

    constructor(
        college_id: string,
        degree_doc_id: string,
        semester_num: number,
        result_file_id: string
    ) {
        this.collegeID = college_id;
        this.degreeDocID = degree_doc_id;
        this.semNum = semester_num;
        this.resultFileID = result_file_id;

        this.result = [];
        this.subjects = [];
    }

    async fetchResult() {
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

        // Filtering result
        this.result = records.filter(row => row["college_id"] === this.collegeID);
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
            if (degree.subjects.includes(subID)) {
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
}