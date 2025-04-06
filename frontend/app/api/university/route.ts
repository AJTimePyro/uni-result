import { connectToDatabase } from "@/lib/db";
import University from "@/models/University";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id")
    const name = req.nextUrl.searchParams.get("name")

    if (!!id === !!name) {
        return NextResponse.json({
            error: "either id or name should be provided, only one, not both"
        }, {
            status: 400
        })
    }

    await connectToDatabase()

    const query = id ? { _id: new mongoose.Types.ObjectId(id) } : { name };
    const Uni = await University.findOne(query).select('-folder_id');

    if (!Uni) {
        return NextResponse.json({
            error: "University not found"
        }, {
            status: 404
        })
    }

    return NextResponse.json(
        Uni
    )
}