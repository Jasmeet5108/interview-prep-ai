import { describe, expect, it } from "vitest";

import { buildSchedule } from "./build-schedule";

describe("buildSchedule", () => {
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
    {
      id: "q2",
      requirement_ids: ["r2"],
      category: "system-design" as const,
      prompt: "Design a scalable Node.js API.",
      answer_outline: "",
      difficulty: 3 as const,
    },
    {
      id: "q3",
      requirement_ids: ["r3"],
      category: "technical" as const,
      prompt: "What is GraphQL?",
      answer_outline: "",
      difficulty: 1 as const,
    },
  ];

  it("creates exactly the requested number of days", () => {
    const schedule = buildSchedule(requirements, questions, 5);

    expect(schedule).toHaveLength(5);
  });

  it("places every must-have requirement somewhere in the schedule", () => {
    const schedule = buildSchedule(requirements, questions, 3);

    const scheduledQuestionIds = new Set(
      schedule.flatMap((day) => day.question_ids),
    );

    const mustRequirementIds = requirements
      .filter((requirement) => requirement.priority === "must")
      .map((requirement) => requirement.id);

    for (const requirementId of mustRequirementIds) {
      const covered = questions.some(
        (question) =>
          scheduledQuestionIds.has(question.id) &&
          question.requirement_ids.includes(requirementId),
      );

      expect(covered).toBe(true);
    }
  });

  it("puts harder must-have material before low priority material", () => {
    const schedule = buildSchedule(requirements, questions, 3);

    expect(schedule[0].question_ids).toContain("q2");
  });

  it("uses integer minute durations", () => {
    const schedule = buildSchedule(requirements, questions, 3);

    for (const day of schedule) {
      expect(Number.isInteger(day.minutes)).toBe(true);
    }
  });

  it("handles a 1-day schedule", () => {
    const schedule = buildSchedule(requirements, questions, 1);

    expect(schedule).toHaveLength(1);

    expect(schedule[0].question_ids).toEqual(
      expect.arrayContaining(["q1", "q2", "q3"]),
    );
  });

  it("handles a 60-day schedule", () => {
    const schedule = buildSchedule(requirements, questions, 60);

    expect(schedule).toHaveLength(60);

    for (const day of schedule) {
      expect(Number.isInteger(day.minutes)).toBe(true);
    }
  });
});
