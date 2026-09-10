import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import { extractRequirements } from "../lib/ai/extract-requirements";

import { normalizeRequirements } from "../lib/pipeline/normalize-requirements";

import { researchCompany } from "../lib/research/research-company";

import { generateQuestionBank } from "../lib/pipeline/generate-question-bank";

import { closeCoverageGaps } from "../lib/pipeline/close-coverage-gaps";

import { generateFlashcards } from "../lib/ai/generate-flashcards";

import { buildSchedule } from "../lib/schedule/build-schedule";

async function main() {
  const jd = `
Full Stack Engineer

We are looking for a Full Stack Engineer.

Requirements:
- Strong React and TypeScript experience
- Experience building Node.js APIs
- Experience with SQL or NoSQL databases
- Strong communication skills

Nice to have:
- GraphQL experience
`;

  console.log("1. Extracting requirements...");

  const extracted = await extractRequirements(jd);

  const requirements = normalizeRequirements(extracted);

  console.log(`   Found ${requirements.length} requirements`);

  console.log("2. Researching company...");

  const research = await researchCompany("https://posthog.com");

  console.log(`   Crawled ${research.pages.length} pages`);

  console.log("3. Generating question bank...");

  const initialQuestions = await generateQuestionBank(requirements, {
    company: research.company,
    summary: research.company_brief.summary,
    what_they_do: research.company_brief.what_they_do,
  });

  console.log(`   Generated ${initialQuestions.length} questions`);

  console.log("4. Checking coverage...");

  const coverage = await closeCoverageGaps(requirements, initialQuestions, {
    company: research.company,
    summary: research.company_brief.summary,
    what_they_do: research.company_brief.what_they_do,
  });

  console.log(`   Coverage passes: ${coverage.passes}`);

  console.log(
    `   Uncovered: ${
      coverage.uncoveredRequirementIds.length
        ? coverage.uncoveredRequirementIds.join(", ")
        : "none"
    }`,
  );

  console.log("5. Generating flashcards...");

  const flashcards = await generateFlashcards(requirements);

  console.log(`   Generated ${flashcards.length} flashcards`);

  console.log("6. Building schedule...");

  const schedule = buildSchedule(requirements, coverage.questions, 5);

  console.log("\n--- RESULT ---");

  console.log(
    JSON.stringify(
      {
        role: {
          ...extracted,
          requirements,
        },

        company_brief: research.company_brief,

        questions: coverage.questions,

        flashcards,

        schedule: {
          days_available: 5,
          days: schedule,
        },

        coverage: {
          uncovered_requirement_ids: coverage.uncoveredRequirementIds,

          passes: coverage.passes,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
