import { describe, expect, it } from "vitest";

import { preserveQuestionsForRegeneration } from "./preserve-regeneration-questions";

describe("preserveQuestionsForRegeneration", () => {
  it("preserves manual, edited and pinned questions while removing untouched generated questions in the target category", () => {
    const questions = [
      {
        id: "q1",
        requirement_ids: ["r1"],
        category: "technical" as const,
        prompt: "Untouched generated question",
        answer_outline: "",
        difficulty: 2 as const,
        origin: "generated" as const,
        edited: false,
        pinned: false,
      },

      {
        id: "q2",
        requirement_ids: ["r1"],
        category: "technical" as const,
        prompt: "Manually added question",
        answer_outline: "",
        difficulty: 2 as const,
        origin: "manual" as const,
        edited: false,
        pinned: false,
      },

      {
        id: "q3",
        requirement_ids: ["r1"],
        category: "technical" as const,
        prompt: "Edited question",
        answer_outline: "",
        difficulty: 2 as const,
        origin: "generated" as const,
        edited: true,
        pinned: false,
      },

      {
        id: "q4",
        requirement_ids: ["r1"],
        category: "technical" as const,
        prompt: "Pinned question",
        answer_outline: "",
        difficulty: 2 as const,
        origin: "generated" as const,
        edited: false,
        pinned: true,
      },

      {
        id: "q5",
        requirement_ids: ["r2"],
        category: "behavioural" as const,
        prompt: "Question from another category",
        answer_outline: "",
        difficulty: 1 as const,
        origin: "generated" as const,
        edited: false,
        pinned: false,
      },
    ];

    const result = preserveQuestionsForRegeneration(questions, "technical");

    expect(result.map((question) => question.id)).toEqual([
      "q2",
      "q3",
      "q4",
      "q5",
    ]);

    expect(result.some((question) => question.id === "q1")).toBe(false);
  });

  it("keeps untouched generated questions from other categories", () => {
    const questions = [
      {
        id: "q1",
        requirement_ids: ["r1"],
        category: "technical" as const,
        prompt: "Technical",
        answer_outline: "",
        difficulty: 2 as const,
        origin: "generated" as const,
        edited: false,
        pinned: false,
      },

      {
        id: "q2",
        requirement_ids: ["r2"],
        category: "company-fit" as const,
        prompt: "Company fit",
        answer_outline: "",
        difficulty: 1 as const,
        origin: "generated" as const,
        edited: false,
        pinned: false,
      },
    ];

    const result = preserveQuestionsForRegeneration(questions, "technical");

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("q2");
  });
});
