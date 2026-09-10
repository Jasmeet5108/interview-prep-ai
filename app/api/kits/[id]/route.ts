import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db/mongoose";
import Kit from "@/models/Kit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid kit ID",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const kit = await Kit.findById(id).lean();

    if (!kit) {
      return NextResponse.json(
        {
          success: false,
          error: "Kit not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      kit,
    });
  } catch (error) {
    console.error("Failed to fetch kit:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch kit",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid kit ID",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    await connectDB();

    const kit = await Kit.findById(id);

    if (!kit) {
      return NextResponse.json(
        {
          success: false,
          error: "Kit not found",
        },
        { status: 404 },
      );
    }

    if (body.questions) {
      kit.questions = body.questions;
    }

    await kit.save();

    return NextResponse.json({
      success: true,
      kit,
    });
  } catch (error) {
    console.error("Failed to update kit:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update kit",
      },
      { status: 500 },
    );
  }
}
