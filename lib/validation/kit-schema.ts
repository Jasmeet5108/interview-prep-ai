import { z } from "zod";

export const requirementSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  kind: z.enum(["technical", "behavioural", "domain"]),
  priority: z.enum(["must", "nice"]),
});

export const questionSchema = z.object({
  id: z.string().min(1),
  requirement_ids: z.array(z.string()),
  category: z.enum([
    "technical",
    "behavioural",
    "system-design",
    "company-fit",
  ]),
  prompt: z.string().min(1),
  answer_outline: z.string(),
  difficulty: z.number().int().min(1).max(3),
});

export const flashcardSchema = z.object({
  id: z.string().min(1),
  front: z.string().min(1),
  back: z.string(),
  requirement_ids: z.array(z.string()),
});

export const scheduleDaySchema = z.object({
  day: z.number().int().positive(),
  focus: z.string(),
  question_ids: z.array(z.string()),
  minutes: z.number().int().nonnegative(),
});

export const interviewKitSchema = z
  .object({
    source: z.object({
      company: z.string(),
      company_url: z.string(),
      role: z.string(),
      location: z.string(),
      jd_chars: z.number().int().nonnegative(),
      researched_at: z.string(),
      pages_used: z.array(z.string()),
    }),

    company_brief: z.object({
      summary: z.string(),
      what_they_do: z.string(),
      sources: z.array(z.string()),
    }),

    role: z.object({
      title: z.string(),
      seniority: z.string(),
      responsibilities: z.array(z.string()),
      requirements: z.array(requirementSchema),
    }),

    questions: z.array(questionSchema),

    flashcards: z.array(flashcardSchema),

    schedule: z.object({
      days_available: z.number().int().min(1).max(60),
      days: z.array(scheduleDaySchema),
    }),

    coverage: z.object({
      uncovered_requirement_ids: z.array(z.string()),
      passes: z.number().int().nonnegative(),
    }),
  })
  .superRefine((kit, ctx) => {
    const requirementIds = new Set(
      kit.role.requirements.map((requirement) => requirement.id),
    );

    const questionIds = new Set(kit.questions.map((question) => question.id));

    for (const question of kit.questions) {
      for (const requirementId of question.requirement_ids) {
        if (!requirementIds.has(requirementId)) {
          ctx.addIssue({
            code: "custom",
            message: `Question ${question.id} references unknown requirement ${requirementId}`,
            path: ["questions"],
          });
        }
      }
    }

    for (const flashcard of kit.flashcards) {
      for (const requirementId of flashcard.requirement_ids) {
        if (!requirementIds.has(requirementId)) {
          ctx.addIssue({
            code: "custom",
            message: `Flashcard ${flashcard.id} references unknown requirement ${requirementId}`,
            path: ["flashcards"],
          });
        }
      }
    }

    for (const day of kit.schedule.days) {
      for (const questionId of day.question_ids) {
        if (!questionIds.has(questionId)) {
          ctx.addIssue({
            code: "custom",
            message: `Schedule day ${day.day} references unknown question ${questionId}`,
            path: ["schedule", "days"],
          });
        }
      }
    }

    if (kit.schedule.days.length !== kit.schedule.days_available) {
      ctx.addIssue({
        code: "custom",
        message: "Schedule day count must equal days_available",
        path: ["schedule", "days"],
      });
    }
  });

export type InterviewKitSchema = z.infer<typeof interviewKitSchema>;
