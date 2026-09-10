import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connectDB } from "@/lib/db/mongoose";
import Kit from "@/models/Kit";

import { generateQuestions } from "@/lib/ai/generate-questions";
import { getRequirementsForCategory } from "@/lib/pipeline/question-categories";
import { closeCoverageGaps } from "@/lib/pipeline/close-coverage-gaps";
import { buildSchedule } from "@/lib/schedule/build-schedule";

import type {
  KitQuestion,
  KitRequirement,
  QuestionCategory,
} from "@/types/kit";
import { getSession } from "@/lib/auth/session";
import { preserveQuestionsForRegeneration } from "@/lib/pipeline/preserve-regeneration-questions";

const regenerateSchema = z.object({
  category: z.enum([
    "technical",
    "behavioural",
    "system-design",
    "company-fit",
  ]),
});

export async function POST(
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

    const body = regenerateSchema.parse(await request.json());

    await connectDB();

    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const kit = await Kit.findOne({
      _id: id,
      userId: session.userId,
    });

    if (!kit) {
      return NextResponse.json(
        {
          success: false,
          error: "Kit not found",
        },
        { status: 404 },
      );
    }

    const category = body.category as QuestionCategory;

    const requirements = kit.role.requirements.map((requirement: any) => ({
      id: requirement.id,
      text: requirement.text,
      kind: requirement.kind,
      priority: requirement.priority,
    })) as KitRequirement[];

    const existingQuestions = kit.questions.map((question: any) =>
      question.toObject ? question.toObject() : question,
    ) as KitQuestion[];

    /*
     * Preserve:
     * - questions from other categories
     * - manually created questions
     * - edited questions
     * - pinned questions
     */
    const preservedQuestions = preserveQuestionsForRegeneration(
      existingQuestions,
      category,
    );

    const categoryRequirements = getRequirementsForCategory(
      requirements,
      category,
    );

    /*
     * Generate IDs after the highest existing q-number.
     */
    const highestQuestionNumber = existingQuestions.reduce(
      (highest, question) => {
        const number = Number(question.id.replace("q", ""));

        return Number.isFinite(number) ? Math.max(highest, number) : highest;
      },
      0,
    );

    const companyBrief = {
      company: kit.source.company,
      summary: kit.company_brief.summary,
      what_they_do: kit.company_brief.what_they_do,
    };

    let regeneratedQuestions: KitQuestion[] = [];

    if (categoryRequirements.length > 0) {
      regeneratedQuestions = await generateQuestions({
        requirements: categoryRequirements,

        category,

        companyBrief,

        startIndex: highestQuestionNumber + 1,
      });
    }

    /*
     * Mark these explicitly as generated.
     */
    regeneratedQuestions = regeneratedQuestions.map((question: any) => ({
      ...question,
      origin: "generated",
      edited: false,
      pinned: false,
    }));

    let mergedQuestions = [...preservedQuestions, ...regeneratedQuestions];

    /*
     * Regeneration may have removed the only question
     * covering a must-have requirement.
     *
     * Re-run deterministic coverage + gap generation.
     */
    const coverageResult = await closeCoverageGaps(
      requirements,
      mergedQuestions,
      companyBrief,
    );

    mergedQuestions = coverageResult.questions;

    /*
     * Because question IDs/content may have changed,
     * rebuild the schedule as well.
     */
    const scheduleDays = buildSchedule(
      requirements,
      mergedQuestions,
      kit.schedule.days_available,
    );

    kit.questions = mergedQuestions as any;

    kit.coverage = {
      uncovered_requirement_ids: coverageResult.uncoveredRequirementIds,

      passes: coverageResult.passes,
    } as any;

    kit.schedule = {
      days_available: kit.schedule.days_available,

      days: scheduleDays,
    } as any;

    await kit.save();

    return NextResponse.json({
      success: true,
      kit,
    });
  } catch (error) {
    console.error("Question regeneration failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid regeneration request",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to regenerate questions",
      },
      { status: 500 },
    );
  }
}
