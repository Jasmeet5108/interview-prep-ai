import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db/mongoose";
import { generateKit } from "@/lib/pipeline/generate-kit";
import { generateKitInputSchema } from "@/lib/validation/input-schema";
import Kit from "@/models/Kit";
import { getSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const input = generateKitInputSchema.parse(body);

    await connectDB();

    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    // Generate the complete interview kit
    const generatedKit = await generateKit(input);

    /*
     * Temporary owner.
     *
     * We haven't connected authentication yet, so for now
     * we're testing generation through the browser without
     * requiring a user account.
     */
    const savedKit = await Kit.create({
      userId: session.userId,

      input: {
        jd: input.jd,
        company_url: input.company_url,
        days: input.days,
      },

      status: "completed",

      progress: {
        step: "completed",
        message: "Interview kit generated successfully",
        percent: 100,
      },

      ...generatedKit,
    });

    return NextResponse.json(
      {
        success: true,
        kit: savedKit,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Kit generation failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate interview kit",
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    await connectDB();

    const kits = await Kit.find({
      userId: session.userId,
    })
      .sort({ createdAt: -1 })
      .select({
        source: 1,
        role: 1,
        schedule: 1,
        createdAt: 1,
        status: 1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      kits,
    });
  } catch (error) {
    console.error("Failed to load kits:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load kits",
      },
      { status: 500 },
    );
  }
}
