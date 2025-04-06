import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Batch from "@/models/Batch";
import Degree from "@/models/Degree";

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id")
    if (!id) {
        return NextResponse.json({
            error: "id should be provided"
        }, {
            status: 400
        })
    }

    await connectToDatabase()
    const batch = await Batch.findOne({
        _id: new mongoose.Types.ObjectId(id)
    }).select('-folder_id -university_id');

    if (!batch) {
        return NextResponse.json({
            error: "Batch not found"
        }, {
            status: 404
        })
    }

    const degree_id_array = Object.values(batch.degrees)
    const degreeBranchData = await Degree.aggregate([
        {
            $match: {
                _id: { $in: degree_id_array.map(id => new mongoose.Types.ObjectId(id as string)) }
            }
        },
        {
            $group: {
                _id: "$degree_name",
                branches: {
                    $push: {
                        $arrayToObject: [[
                            { k: "$branch_name", v: ["$degree_id", "$_id"] }
                        ]]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                degree_name: "$_id",
                branches: 1
            }
        }
    ]);

    return NextResponse.json(
        degreeBranchData
    )
}