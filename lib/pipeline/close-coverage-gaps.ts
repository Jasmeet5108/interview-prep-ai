import type { KitQuestion, KitRequirement } from "@/types/kit";

import type { GeneratedCompanyBrief } from "@/lib/ai/generate-company-brief";

import { checkCoverage } from "@/lib/coverage/check-coverage";

import { generateQuestions } from "@/lib/ai/generate-questions";

interface CloseCoverageResult {
  questions: KitQuestion[];
  uncoveredRequirementIds: string[];
  passes: number;
}

export async function closeCoverageGaps(
  requirements: KitRequirement[],
  initialQuestions: KitQuestion[],
  companyBrief: GeneratedCompanyBrief,
  hiringContext = "",
  maxPasses = 2,
): Promise<CloseCoverageResult> {
  let questions = [...initialQuestions];
  let passes = 1;

  let coverage = checkCoverage(requirements, questions);

  while (!coverage.isComplete && passes < maxPasses) {
    const missingRequirements = requirements.filter((requirement) =>
      coverage.uncoveredRequirementIds.includes(requirement.id),
    );

    if (missingRequirements.length === 0) {
      break;
    }

    const technical = missingRequirements.filter(
      (requirement) => requirement.kind === "technical",
    );

    const behavioural = missingRequirements.filter(
      (requirement) => requirement.kind === "behavioural",
    );

    const domain = missingRequirements.filter(
      (requirement) => requirement.kind === "domain",
    );

    if (technical.length > 0) {
      const generated = await generateQuestions({
        requirements: technical,
        category: "technical",
        companyBrief,
        hiringContext,
        startIndex: questions.length + 1,
      });

      questions.push(...generated);
    }

    if (behavioural.length > 0) {
      const generated = await generateQuestions({
        requirements: behavioural,
        category: "behavioural",
        companyBrief,
        hiringContext,
        startIndex: questions.length + 1,
      });

      questions.push(...generated);
    }

    if (domain.length > 0) {
      const generated = await generateQuestions({
        requirements: domain,
        category: "company-fit",
        companyBrief,
        hiringContext,
        startIndex: questions.length + 1,
      });

      questions.push(...generated);
    }

    passes++;

    coverage = checkCoverage(requirements, questions);
  }

  return {
    questions,
    uncoveredRequirementIds: coverage.uncoveredRequirementIds,
    passes,
  };
}
