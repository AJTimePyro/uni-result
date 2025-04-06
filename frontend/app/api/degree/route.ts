import { connectToDatabase } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
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

    const degree = await Degree.findOne({
        _id: new mongoose.Types.ObjectId(id)
    }).select('-subjects -batch_id -batch_year -folder_id');
    if (!degree) {
        return NextResponse.json({
            error: "Degree not found"
        }, {
            status: 404
        })
    }

    return NextResponse.json(
        degree
    )
}