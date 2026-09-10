import type { KitQuestion, KitRequirement } from "@/types/kit";

export function checkCoverage(
  requirements: KitRequirement[],
  questions: KitQuestion[],
) {
  const coveredRequirementIds = new Set<string>();

  for (const question of questions) {
    for (const requirementId of question.requirement_ids) {
      coveredRequirementIds.add(requirementId);
    }
  }

  const uncoveredRequirementIds = requirements
    .filter(
      (requirement) =>
        requirement.priority === "must" &&
        !coveredRequirementIds.has(requirement.id),
    )
    .map((requirement) => requirement.id);

  return {
    uncoveredRequirementIds,
    isComplete: uncoveredRequirementIds.length === 0,
  };
}
