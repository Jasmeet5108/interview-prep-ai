import { describe, expect, it } from "vitest";
import { interviewKitSchema } from "./kit-schema";

const validKit = {
  source: {
    company: "Acme",
    company_url: "https://acme.com",
    role: "Full Stack Engineer",
    location: "Remote",
    jd_chars: 500,
    researched_at: new Date().toISOString(),
    pages_used: ["https://acme.com"],
  },

  company_brief: {
    summary: "Acme builds developer tools.",
    what_they_do: "They provide software products.",
    sources: ["https://acme.com"],
  },

  role: {
    title: "Full Stack Engineer",
    seniority: "Mid-level",
    responsibilities: ["Build full-stack applications"],
    requirements: [
      {
        id: "r1",
        text: "React experience",
        kind: "technical" as const,
        priority: "must" as const,
      },
    ],
  },

  questions: [
    {
      id: "q1",
      requirement_ids: ["r1"],
      category: "technical" as const,
      prompt: "Explain React reconciliation.",
      answer_outline: "Discuss virtual DOM and Fiber.",
      difficulty: 2,
    },
  ],

  flashcards: [
    {
      id: "f1",
      front: "What is React reconciliation?",
      back: "React compares trees and updates changed nodes.",
      requirement_ids: ["r1"],
    },
  ],

  schedule: {
    days_available: 1,
    days: [
      {
        day: 1,
        focus: "React",
        question_ids: ["q1"],
        minutes: 30,
      },
    ],
  },

  coverage: {
    uncovered_requirement_ids: [],
    passes: 1,
  },
};

describe("interviewKitSchema", () => {
  it("accepts a valid interview kit", () => {
    const result = interviewKitSchema.safeParse(validKit);

    expect(result.success).toBe(true);
  });

  it("rejects questions referencing unknown requirements", () => {
    const invalidKit = structuredClone(validKit);

    invalidKit.questions[0].requirement_ids = ["r999"];

    const result = interviewKitSchema.safeParse(invalidKit);

    expect(result.success).toBe(false);
  });

  it("rejects schedule references to unknown questions", () => {
    const invalidKit = structuredClone(validKit);

    invalidKit.schedule.days[0].question_ids = ["q999"];

    const result = interviewKitSchema.safeParse(invalidKit);

    expect(result.success).toBe(false);
  });

  it("rejects when schedule day count does not match days_available", () => {
    const invalidKit = structuredClone(validKit);

    invalidKit.schedule.days_available = 2;

    const result = interviewKitSchema.safeParse(invalidKit);

    expect(result.success).toBe(false);
  });

  it("rejects invalid difficulty", () => {
    const invalidKit = structuredClone(validKit);

    invalidKit.questions[0].difficulty = 4;

    const result = interviewKitSchema.safeParse(invalidKit);

    expect(result.success).toBe(false);
  });

  it("rejects non-integer schedule minutes", () => {
    const invalidKit = structuredClone(validKit);

    invalidKit.schedule.days[0].minutes = 30.5;

    const result = interviewKitSchema.safeParse(invalidKit);

    expect(result.success).toBe(false);
  });
});
