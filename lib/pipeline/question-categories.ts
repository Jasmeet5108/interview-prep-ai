import type { KitRequirement, QuestionCategory } from "@/types/kit";

export function getRequirementsForCategory(
  requirements: KitRequirement[],
  category: QuestionCategory,
): KitRequirement[] {
  switch (category) {
    case "technical":
      return requirements.filter(
        (requirement) => requirement.kind === "technical",
      );

    case "behavioural":
      return requirements.filter(
        (requirement) => requirement.kind === "behavioural",
      );

    case "system-design":
      return requirements.filter(
        (requirement) =>
          requirement.kind === "technical" && requirement.priority === "must",
      );

    case "company-fit":
      return requirements;

    default:
      return [];
  }
}
