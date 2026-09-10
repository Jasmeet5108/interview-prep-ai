import { generateKitInputSchema } from "@/lib/validation/input-schema";
import { interviewKitSchema } from "@/lib/validation/kit-schema";

import { extractRequirements } from "@/lib/ai/extract-requirements";
import { normalizeRequirements } from "./normalize-requirements";

import { researchCompany } from "@/lib/research/research-company";

import { generateQuestionBank } from "./generate-question-bank";
import { closeCoverageGaps } from "./close-coverage-gaps";

import { generateFlashcards } from "@/lib/ai/generate-flashcards";
import { buildSchedule } from "@/lib/schedule/build-schedule";

import { buildHiringContext } from "@/lib/research/build-hiring-context";

export interface GenerateKitInput {
  jd: string;
  company_url: string;
  days: number;
}

export async function generateKit(input: GenerateKitInput) {
  // 1. Validate user input
  const validatedInput = generateKitInputSchema.parse(input);

  const { jd, company_url, days } = validatedInput;

  // 2. Extract structured role information from JD
  const extractedRole = await extractRequirements(jd);

  const requirements = normalizeRequirements(extractedRole);

  // 3. Research company
  const research = await researchCompany(company_url);

  const hiringContext = buildHiringContext(
    research.pages,
    research.interviewDiscussions,
  );
  const companyBriefForAI = {
    company: research.company,
    summary: research.company_brief.summary,
    what_they_do: research.company_brief.what_they_do,
  };

  // 4. Generate initial question bank
  const initialQuestions = await generateQuestionBank(
    requirements,
    companyBriefForAI,
    hiringContext,
  );

  // 5. Deterministically check coverage and
  // generate missing questions if necessary
  const coverageResult = await closeCoverageGaps(
    requirements,
    initialQuestions,
    companyBriefForAI,
    hiringContext,
  );

  // 6. Generate flashcards
  const flashcards = await generateFlashcards(requirements);

  // 7. Build deterministic study schedule
  const scheduleDays = buildSchedule(
    requirements,
    coverageResult.questions,
    days,
  );

  // 8. Construct EXACT evaluator-facing kit
  const kit = {
    source: {
      company: research.company,
      company_url,
      role: extractedRole.title,
      location: extractedRole.location,
      jd_chars: jd.length,
      researched_at: new Date().toISOString(),
      pages_used: research.company_brief.sources,
    },

    company_brief: {
      summary: research.company_brief.summary,

      what_they_do: research.company_brief.what_they_do,

      sources: research.company_brief.sources,
    },

    role: {
      title: extractedRole.title,
      seniority: extractedRole.seniority,

      responsibilities: extractedRole.responsibilities,

      requirements,
    },

    questions: coverageResult.questions,

    flashcards,

    schedule: {
      days_available: days,
      days: scheduleDays,
    },

    coverage: {
      uncovered_requirement_ids: coverageResult.uncoveredRequirementIds,

      passes: coverageResult.passes,
    },
  };

  // 9. Final runtime validation
  return interviewKitSchema.parse(kit);
}
