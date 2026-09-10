import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connectDB } from "@/lib/db/mongoose";
import Kit from "@/models/Kit";

const practiceSchema = z.object({
  flashcardId: z.string().min(1),
  confidence: z.number().int().min(1).max(3),
});

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

    const body = practiceSchema.parse(await request.json());

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

    const flashcard = kit.flashcards.find(
      (card: any) => card.id === body.flashcardId,
    );

    if (!flashcard) {
      return NextResponse.json(
        {
          success: false,
          error: "Flashcard not found",
        },
        { status: 404 },
      );
    }

    flashcard.confidence = body.confidence;

    flashcard.lastReviewedAt = new Date();

    await kit.save();

    return NextResponse.json({
      success: true,
      flashcard,
    });
  } catch (error) {
    console.error("Failed to update practice progress:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid practice data",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to save progress",
      },
      { status: 500 },
    );
  }
}
