import { describe, expect, it } from "vitest";

import { checkCoverage } from "./check-coverage";

describe("checkCoverage", () => {
  it("returns uncovered must-have requirements", () => {
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
      {
        id: "r3",
        text: "GraphQL",
        kind: "technical" as const,
        priority: "nice" as const,
      },
    ];

    const questions = [
      {
        id: "q1",
        requirement_ids: ["r1"],
        category: "technical" as const,
        prompt: "Explain React reconciliation.",
        answer_outline: "",
        difficulty: 2 as const,
      },
    ];

    const result = checkCoverage(requirements, questions);

    expect(result.uncoveredRequirementIds).toEqual(["r2"]);
    expect(result.isComplete).toBe(false);
  });

  it("returns complete when every must-have requirement is covered", () => {
    const requirements = [
      {
        id: "r1",
        text: "React",
        kind: "technical" as const,
        priority: "must" as const,
      },
    ];

    const questions = [
      {
        id: "q1",
        requirement_ids: ["r1"],
        category: "technical" as const,
        prompt: "Explain React reconciliation.",
        answer_outline: "",
        difficulty: 2 as const,
      },
    ];

    const result = checkCoverage(requirements, questions);

    expect(result.uncoveredRequirementIds).toEqual([]);
    expect(result.isComplete).toBe(true);
  });
});
