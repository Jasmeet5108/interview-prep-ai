import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ai/generate-questions", () => ({
  generateQuestions: vi.fn(),
}));

import { generateQuestions } from "@/lib/ai/generate-questions";
import { closeCoverageGaps } from "@/lib/pipeline/close-coverage-gaps";

const mockedGenerateQuestions = vi.mocked(generateQuestions);

describe("closeCoverageGaps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates questions for uncovered must-have requirements", async () => {
    const requirements = [
      {
        id: "r1",
        text: "React",
        kind: "technical" as const,
        priority: "must" as const,
      },
      {
        id: "r2",
        text: "Node.js",
        kind: "technical" as const,
        priority: "must" as const,
      },
    ];

    const initialQuestions = [
      {
        id: "q1",
        requirement_ids: ["r1"],
        category: "technical" as const,
        prompt: "Explain React reconciliation.",
        answer_outline: "",
        difficulty: 2 as const,
      },
    ];

    mockedGenerateQuestions.mockResolvedValueOnce([
      {
        id: "q2",
        requirement_ids: ["r2"],
        category: "technical",
        prompt: "How would you design a Node.js REST API?",
        answer_outline: "Discuss routing, validation, errors and scalability.",
        difficulty: 2,
      },
    ]);

    const companyBrief = {
      company: "Acme",
      summary: "Acme builds developer tools.",
      what_they_do: "Developer tooling.",
    };

    const result = await closeCoverageGaps(
      requirements,
      initialQuestions,
      companyBrief,
      "",
      2,
    );

    expect(mockedGenerateQuestions).toHaveBeenCalledTimes(1);

    expect(mockedGenerateQuestions).toHaveBeenCalledWith(
      expect.objectContaining({
        requirements: [
          expect.objectContaining({
            id: "r2",
          }),
        ],
        category: "technical",
      }),
    );

    expect(result.questions).toHaveLength(2);
    expect(result.uncoveredRequirementIds).toEqual([]);
    expect(result.passes).toBe(2);
  });

  it("does not call AI when coverage is already complete", async () => {
    const requirements = [
      {
        id: "r1",
        text: "React",
        kind: "technical" as const,
        priority: "must" as const,
      },
    ];

    const initialQuestions = [
      {
        id: "q1",
        requirement_ids: ["r1"],
        category: "technical" as const,
        prompt: "Explain React reconciliation.",
        answer_outline: "",
        difficulty: 2 as const,
      },
    ];

    const companyBrief = {
      company: "Acme",
      summary: "Acme builds developer tools.",
      what_they_do: "Developer tooling.",
    };

    const result = await closeCoverageGaps(
      requirements,
      initialQuestions,
      companyBrief,
    );

    expect(mockedGenerateQuestions).not.toHaveBeenCalled();
    expect(result.uncoveredRequirementIds).toEqual([]);
    expect(result.passes).toBe(1);
    expect(result.questions).toEqual(initialQuestions);
  });

  it("leaves requirement uncovered if second pass still fails to cover it", async () => {
    const requirements = [
      {
        id: "r1",
        text: "MongoDB",
        kind: "technical" as const,
        priority: "must" as const,
      },
    ];

    mockedGenerateQuestions.mockResolvedValueOnce([
      {
        id: "q1",
        requirement_ids: [],
        category: "technical",
        prompt: "Explain database indexing.",
        answer_outline: "",
        difficulty: 2,
      },
    ]);

    const companyBrief = {
      company: "Acme",
      summary: "",
      what_they_do: "",
    };

    const result = await closeCoverageGaps(
      requirements,
      [],
      companyBrief,
      "",
      2,
    );

    expect(result.passes).toBe(2);
    expect(result.uncoveredRequirementIds).toEqual(["r1"]);
  });
});
