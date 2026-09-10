import type { KitQuestion, QuestionCategory } from "@/types/kit";

export function preserveQuestionsForRegeneration(
  questions: KitQuestion[],
  category: QuestionCategory,
) {
  return questions.filter((question: any) => {
    if (question.category !== category) {
      return true;
    }

    return (
      question.origin === "manual" ||
      question.edited === true ||
      question.pinned === true
    );
  });
}
