import type { KitRequirement } from "@/types/kit";

import type { ExtractedRole } from "@/lib/ai/extract-requirements";

export function normalizeRequirements(
  extracted: ExtractedRole,
): KitRequirement[] {
  return extracted.requirements.map((requirement, index) => ({
    id: `r${index + 1}`,
    text: requirement.text.trim(),
    kind: requirement.kind,
    priority: requirement.priority,
  }));
}
