import type {
  KitQuestion,
  KitRequirement,
  QuestionCategory,
} from "@/types/kit";

import type { GeneratedCompanyBrief } from "@/lib/ai/generate-company-brief";

import { generateQuestions } from "@/lib/ai/generate-questions";

import { getRequirementsForCategory } from "./question-categories";

const CATEGORIES: QuestionCategory[] = [
  "technical",
  "behavioural",
  "system-design",
  "company-fit",
];

export async function generateQuestionBank(
  requirements: KitRequirement[],
  companyBrief: GeneratedCompanyBrief,
  hiringContext = "",
): Promise<KitQuestion[]> {
  const questions: KitQuestion[] = [];

  for (const category of CATEGORIES) {
    const categoryRequirements = getRequirementsForCategory(
      requirements,
      category,
    );

    if (categoryRequirements.length === 0) {
      continue;
    }

    const generated = await generateQuestions({
      requirements: categoryRequirements,
      category,
      companyBrief,
      hiringContext,
      startIndex: questions.length + 1,
    });

    questions.push(...generated);
  }

  return questions;
}
