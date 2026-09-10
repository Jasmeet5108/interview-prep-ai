import type { KitQuestion, KitRequirement, ScheduleDay } from "@/types/kit";

function getQuestionPriorityScore(
  question: KitQuestion,
  requirements: KitRequirement[],
) {
  const relatedRequirements = requirements.filter((requirement) =>
    question.requirement_ids.includes(requirement.id),
  );

  const hasMustRequirement = relatedRequirements.some(
    (requirement) => requirement.priority === "must",
  );

  let score = question.difficulty;

  if (hasMustRequirement) {
    score += 3;
  }

  if (question.category === "system-design") {
    score += 1;
  }

  return score;
}

function getQuestionMinutes(question: KitQuestion) {
  switch (question.difficulty) {
    case 3:
      return 30;

    case 2:
      return 20;

    default:
      return 15;
  }
}

function getFocus(questions: KitQuestion[]) {
  if (questions.length === 0) {
    return "Review and reinforce previous material";
  }

  const categories = [
    ...new Set(questions.map((question) => question.category)),
  ];

  return categories
    .map((category) =>
      category
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    )
    .join(" & ");
}

export function buildSchedule(
  requirements: KitRequirement[],
  questions: KitQuestion[],
  daysAvailable: number,
): ScheduleDay[] {
  if (
    !Number.isInteger(daysAvailable) ||
    daysAvailable < 1 ||
    daysAvailable > 60
  ) {
    throw new Error("daysAvailable must be an integer between 1 and 60");
  }

  const sortedQuestions = [...questions].sort((a, b) => {
    return (
      getQuestionPriorityScore(b, requirements) -
      getQuestionPriorityScore(a, requirements)
    );
  });

  const schedule: ScheduleDay[] = Array.from(
    { length: daysAvailable },
    (_, index) => ({
      day: index + 1,
      focus: "",
      question_ids: [],
      minutes: 0,
    }),
  );

  if (sortedQuestions.length === 0) {
    return schedule.map((day) => ({
      ...day,
      focus: "Review available role and company information",
      minutes: 15,
    }));
  }

  /*
   * Allocate questions in order across the schedule.
   *
   * Because questions are already sorted by importance and difficulty,
   * earlier days naturally receive higher-priority material.
   */
  sortedQuestions.forEach((question, index) => {
    const dayIndex = Math.min(
      Math.floor((index * daysAvailable) / sortedQuestions.length),
      daysAvailable - 1,
    );

    schedule[dayIndex].question_ids.push(question.id);
    schedule[dayIndex].minutes += getQuestionMinutes(question);
  });

  /*
   * If there are more days than unique questions, some days will be empty.
   * Use those later days as review sessions instead of inventing new material.
   */
  for (let index = 0; index < schedule.length; index++) {
    const day = schedule[index];

    const dayQuestions = day.question_ids
      .map((id) => questions.find((question) => question.id === id))
      .filter((question): question is KitQuestion => Boolean(question));

    if (dayQuestions.length > 0) {
      day.focus = getFocus(dayQuestions);
      continue;
    }

    const previousQuestions = schedule
      .slice(0, index)
      .flatMap((previousDay) => previousDay.question_ids);

    const reviewQuestionIds = previousQuestions.slice(-2);

    day.question_ids = reviewQuestionIds;

    day.focus = "Review and reinforce weaker topics";

    day.minutes = reviewQuestionIds.length > 0 ? 20 : 15;
  }

  return schedule;
}
