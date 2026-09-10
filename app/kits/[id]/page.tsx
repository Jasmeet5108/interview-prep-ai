"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

type Requirement = {
  id: string;
  text: string;
  kind: string;
  priority: string;
};

type Question = {
  id: string;
  requirement_ids: string[];
  category: string;
  prompt: string;
  answer_outline: string;
  difficulty: number;

  origin?: "generated" | "manual";
  edited?: boolean;
  pinned?: boolean;
};

type Flashcard = {
  id: string;
  front: string;
  back: string;
  requirement_ids: string[];
};

type ScheduleDay = {
  day: number;
  focus: string;
  question_ids: string[];
  estimated_minutes: number;
};

type Kit = {
  _id: string;

  source: {
    company: string;
    company_url: string;
    role: string;
    location: string;
  };

  company_brief: {
    summary: string;
    what_they_do: string;
    sources: string[];
  };

  role: {
    title: string;
    seniority: string;
    responsibilities: string[];
    requirements: Requirement[];
  };

  questions: Question[];
  flashcards: Flashcard[];

  schedule: {
    days_available: number;
    days: ScheduleDay[];
  };

  coverage: {
    uncovered_requirement_ids: string[];
    passes: number;
  };
};

export default function KitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [kit, setKit] = useState<Kit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);

  const [regeneratingCategory, setRegeneratingCategory] = useState<
    string | null
  >(null);

  async function saveQuestions(questions: Question[]) {
    if (!kit) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/kits/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save questions");
      }

      setKit(data.kit);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to save questions",
      );
    } finally {
      setSaving(false);
    }
  }

  async function addQuestion() {
    if (!kit) return;

    const nextNumber =
      Math.max(
        0,
        ...kit.questions.map((question) => {
          const number = Number(question.id.replace("q", ""));

          return Number.isFinite(number) ? number : 0;
        }),
      ) + 1;

    const question: Question = {
      id: `q${nextNumber}`,

      requirement_ids: [],

      category: "technical",

      prompt: "New interview question",

      answer_outline: "",

      difficulty: 2,

      origin: "manual",
      edited: true,
      pinned: false,
    };

    await saveQuestions([...kit.questions, question]);
  }

  async function deleteQuestion(questionId: string) {
    if (!kit) return;

    const questions = kit.questions.filter(
      (question) => question.id !== questionId,
    );

    await saveQuestions(questions);
  }

  async function togglePin(questionId: string) {
    if (!kit) return;

    const questions = kit.questions.map((question) =>
      question.id === questionId
        ? {
            ...question,
            pinned: !question.pinned,
          }
        : question,
    );

    await saveQuestions(questions);
  }

  async function updateQuestion(
    questionId: string,
    updates: Partial<Question>,
  ) {
    if (!kit) return;

    const questions = kit.questions.map((question) =>
      question.id === questionId
        ? {
            ...question,
            ...updates,
            edited: true,
          }
        : question,
    );

    await saveQuestions(questions);
  }

  async function moveQuestion(questionId: string, direction: "up" | "down") {
    if (!kit) return;

    const currentIndex = kit.questions.findIndex(
      (question) => question.id === questionId,
    );

    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= kit.questions.length) {
      return;
    }

    const questions = [...kit.questions];

    [questions[currentIndex], questions[newIndex]] = [
      questions[newIndex],
      questions[currentIndex],
    ];

    await saveQuestions(questions);
  }

  async function regenerateCategory(category: string) {
    if (!kit) return;

    setRegeneratingCategory(category);

    try {
      const response = await fetch(`/api/kits/${id}/regenerate`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate questions");
      }

      setKit(data.kit);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to regenerate questions",
      );
    } finally {
      setRegeneratingCategory(null);
    }
  }

  useEffect(() => {
    async function loadKit() {
      try {
        const response = await fetch(`/api/kits/${id}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load kit");
        }

        setKit(data.kit);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setLoading(false);
      }
    }

    loadKit();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 p-10 text-white">
        Loading interview kit...
      </main>
    );
  }

  if (error || !kit) {
    return (
      <main className="min-h-screen bg-zinc-950 p-10 text-red-400">
        {error || "Kit not found"}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Top navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3 text-sm text-zinc-400 transition hover:text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 transition group-hover:border-zinc-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 18l-6-6 6-6"
                />
              </svg>
            </div>

            <div className="hidden sm:block">
              <p className="text-xs text-zinc-600">Workspace</p>
              <p className="font-medium text-zinc-300">Interview Prep Kit</p>
            </div>
          </Link>

          <Link
            href={`/kits/${id}/practice`}
            className="group flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.98]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 5v14l11-7L8 5Z"
              />
            </svg>
            Practice
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        {/* Hero */}
        <section className="mb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-400">
                  {kit.source.company}
                </span>

                {kit.role.seniority && (
                  <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-500">
                    {kit.role.seniority}
                  </span>
                )}

                {kit.source.location && (
                  <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-500">
                    {kit.source.location}
                  </span>
                )}
              </div>

              <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {kit.role.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
                Your personalised interview preparation workspace based on the
                job description and company research.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="h-4 w-4 text-zinc-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                    d="M8 2v3M16 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z"
                  />
                </svg>
              </div>

              <div>
                <p className="text-xs text-zinc-600">Preparation window</p>
                <p className="text-sm font-medium text-zinc-200">
                  {kit.schedule.days_available}{" "}
                  {kit.schedule.days_available === 1 ? "day" : "days"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">Requirements</p>

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-xs text-zinc-500">
                R
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-tight">
              {kit.role.requirements.length}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              extracted from the role
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">Questions</p>

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-xs text-zinc-500">
                Q
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-tight">
              {kit.questions.length}
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              targeted interview prompts
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">Flashcards</p>

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-xs text-zinc-500">
                F
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-tight">
              {kit.flashcards.length}
            </p>

            <p className="mt-1 text-xs text-zinc-600">for focused revision</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">Coverage</p>

              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs ${
                  kit.coverage.uncovered_requirement_ids.length === 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {kit.coverage.uncovered_requirement_ids.length === 0
                  ? "✓"
                  : "!"}
              </span>
            </div>

            <p className="mt-5 text-3xl font-semibold tracking-tight">
              {kit.coverage.uncovered_requirement_ids.length === 0
                ? "100%"
                : `${Math.max(
                    0,
                    Math.round(
                      ((kit.role.requirements.filter(
                        (requirement) => requirement.priority === "must",
                      ).length -
                        kit.coverage.uncovered_requirement_ids.length) /
                        Math.max(
                          1,
                          kit.role.requirements.filter(
                            (requirement) => requirement.priority === "must",
                          ).length,
                        )) *
                        100,
                    ),
                  )}%`}
            </p>

            <p className="mt-1 text-xs text-zinc-600">must-have requirements</p>
          </div>
        </section>

        {/* Company */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <div className="border-b border-zinc-800 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-sm font-semibold text-zinc-400">
                {kit.source.company.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="text-xs text-zinc-600">Company research</p>
                <h2 className="text-lg font-semibold text-white">
                  About {kit.source.company}
                </h2>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
                Overview
              </p>

              <p className="text-sm leading-7 text-zinc-400">
                {kit.company_brief.summary}
              </p>
            </div>

            <div className="border-zinc-800 lg:border-l lg:pl-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
                What they do
              </p>

              <p className="text-sm leading-7 text-zinc-400">
                {kit.company_brief.what_they_do}
              </p>
            </div>
          </div>

          {kit.company_brief.sources?.length > 0 && (
            <div className="border-t border-zinc-800 px-6 py-4">
              <p className="mb-3 text-xs text-zinc-600">Research sources</p>

              <div className="flex flex-wrap gap-2">
                {kit.company_brief.sources.slice(0, 6).map((source) => (
                  <a
                    key={source}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="max-w-full truncate rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300"
                  >
                    {(() => {
                      try {
                        return new URL(source).pathname === "/"
                          ? new URL(source).hostname
                          : new URL(source).pathname;
                      } catch {
                        return source;
                      }
                    })()}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Requirements */}
        <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex flex-col gap-3 border-b border-zinc-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-zinc-600">Role analysis</p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                Requirements
              </h2>
            </div>

            <div className="flex gap-2 text-xs">
              <span className="rounded-lg border border-zinc-700 bg-white px-2.5 py-1 text-black">
                {
                  kit.role.requirements.filter(
                    (requirement) => requirement.priority === "must",
                  ).length
                }{" "}
                must-have
              </span>

              <span className="rounded-lg border border-zinc-800 px-2.5 py-1 text-zinc-500">
                {
                  kit.role.requirements.filter(
                    (requirement) => requirement.priority === "nice",
                  ).length
                }{" "}
                nice-to-have
              </span>
            </div>
          </div>

          <div className="grid gap-3 p-6 lg:grid-cols-2">
            {kit.role.requirements.map((requirement) => (
              <div
                key={requirement.id}
                className="group flex items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 transition hover:border-zinc-700"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-[11px] font-medium text-zinc-500">
                  {requirement.id.toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-6 text-zinc-200">
                    {requirement.text}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-zinc-900 px-2 py-1 text-[11px] capitalize text-zinc-500">
                      {requirement.kind}
                    </span>

                    <span
                      className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                        requirement.priority === "must"
                          ? "bg-white text-black"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {requirement.priority === "must"
                        ? "Must-have"
                        : "Nice-to-have"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Questions */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <div className="border-b border-zinc-800 px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs text-zinc-600">Question bank</p>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Interview Questions
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {kit.questions.length} targeted questions. Edit, pin, reorder
                  or regenerate them.
                </p>
              </div>

              <button
                onClick={addQuestion}
                disabled={saving || regeneratingCategory !== null}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="text-lg leading-none">+</span>
                Add question
              </button>
            </div>

            {/* Category summary */}
            <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  id: "technical",
                  label: "Technical",
                },
                {
                  id: "behavioural",
                  label: "Behavioural",
                },
                {
                  id: "system-design",
                  label: "System Design",
                },
                {
                  id: "company-fit",
                  label: "Company Fit",
                },
              ].map((category) => {
                const count = kit.questions.filter(
                  (question) => question.category === category.id,
                ).length;

                const isRegenerating = regeneratingCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => regenerateCategory(category.id)}
                    disabled={saving || regeneratingCategory !== null}
                    className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-3 text-left transition hover:border-zinc-700 hover:bg-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div>
                      <p className="text-xs font-medium text-zinc-300">
                        {category.label}
                      </p>

                      <p className="mt-1 text-[11px] text-zinc-600">
                        {count} {count === 1 ? "question" : "questions"}
                      </p>
                    </div>

                    {isRegenerating ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="h-4 w-4 text-zinc-600 transition group-hover:rotate-45 group-hover:text-zinc-300"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.7"
                          d="M20 7v5h-5M4 17v-5h5M6.1 9A7 7 0 0 1 18 6l2 2M18 15a7 7 0 0 1-12 3l-2-2"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save/regenerate status */}
          {(saving || regeneratingCategory !== null) && (
            <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-950/60 px-6 py-3">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />

              <p className="text-xs text-zinc-500">
                {regeneratingCategory
                  ? `Regenerating ${regeneratingCategory.replace("-", " ")} questions...`
                  : "Saving your changes..."}
              </p>
            </div>
          )}

          <div className="space-y-4 p-6">
            {kit.questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                saving={saving}
                onUpdate={updateQuestion}
                onDelete={deleteQuestion}
                onTogglePin={togglePin}
                onMove={moveQuestion}
              />
            ))}
          </div>
        </section>

        {/* Flashcards + schedule layout */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          {/* Flashcards */}
          <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <div>
                <p className="text-xs text-zinc-600">Quick revision</p>

                <h2 className="mt-1 text-lg font-semibold">Flashcards</h2>
              </div>

              <span className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-500">
                {kit.flashcards.length} cards
              </span>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {kit.flashcards.map((card) => (
                <div
                  key={card.id}
                  className="group rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 transition hover:border-zinc-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                      {card.id}
                    </span>

                    <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-700">
                      Flashcard
                    </span>
                  </div>

                  <h3 className="mt-4 text-sm font-medium leading-6 text-zinc-200">
                    {card.front}
                  </h3>

                  <div className="my-4 h-px bg-zinc-800" />

                  <p className="text-sm leading-6 text-zinc-500">{card.back}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Schedule */}
          <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <div className="border-b border-zinc-800 px-6 py-5">
              <p className="text-xs text-zinc-600">Preparation plan</p>

              <h2 className="mt-1 text-lg font-semibold">Study Schedule</h2>

              <p className="mt-1 text-xs text-zinc-500">
                Harder and higher-priority topics are scheduled earlier.
              </p>
            </div>

            <div className="p-6">
              <div className="relative space-y-0">
                {kit.schedule.days.map((day, index) => (
                  <div
                    key={day.day}
                    className="relative flex gap-4 pb-7 last:pb-0"
                  >
                    {/* Timeline line */}
                    {index !== kit.schedule.days.length - 1 && (
                      <div className="absolute left-4.25 top-9 h-[calc(100%-20px)] w-px bg-zinc-800" />
                    )}

                    {/* Day marker */}
                    <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 text-xs font-semibold text-zinc-400">
                      {day.day}
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-600">
                            Day {day.day}
                          </p>

                          <h3 className="mt-1 text-sm font-medium leading-5 text-zinc-200">
                            {day.focus}
                          </h3>
                        </div>

                        <span className="shrink-0 rounded-md bg-zinc-900 px-2 py-1 text-[11px] text-zinc-500">
                          {"minutes" in day
                            ? `${day.minutes} min`
                            : `${day.estimated_minutes} min`}
                        </span>
                      </div>

                      {day.question_ids.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {day.question_ids.map((questionId) => (
                            <span
                              key={questionId}
                              className="rounded-md border border-zinc-800 px-2 py-1 text-[10px] text-zinc-600"
                            >
                              {questionId}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Coverage */}
        <section
          className={`mt-6 rounded-2xl border p-6 ${
            kit.coverage.uncovered_requirement_ids.length === 0
              ? "border-emerald-900/50 bg-emerald-950/10"
              : "border-amber-900/50 bg-amber-950/10"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  kit.coverage.uncovered_requirement_ids.length === 0
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {kit.coverage.uncovered_requirement_ids.length === 0 ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m5 12 4 4L19 6"
                    />
                  </svg>
                ) : (
                  "!"
                )}
              </div>

              <div>
                <h2 className="text-sm font-semibold text-zinc-200">
                  {kit.coverage.uncovered_requirement_ids.length === 0
                    ? "Must-have coverage complete"
                    : "Coverage gaps detected"}
                </h2>

                {kit.coverage.uncovered_requirement_ids.length === 0 ? (
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    Every must-have requirement is represented in your question
                    bank.
                  </p>
                ) : (
                  <p className="mt-1 text-sm leading-6 text-amber-400/80">
                    Still uncovered:{" "}
                    {kit.coverage.uncovered_requirement_ids.join(", ")}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-xs text-zinc-500">
              {kit.coverage.passes} coverage{" "}
              {kit.coverage.passes === 1 ? "pass" : "passes"}
            </div>
          </div>
        </section>

        {/* Bottom Practice CTA */}
        <section className="mt-10 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
                Ready to practice?
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Put your preparation to the test.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                Work through your flashcards one at a time, reveal answers and
                track your confidence.
              </p>
            </div>

            <Link
              href={`/kits/${id}/practice`}
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.98]"
            >
              Start Practice Mode
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12h14M13 6l6 6-6 6"
                />
              </svg>
            </Link>
          </div>
        </section>

        <footer className="mt-12 border-t border-zinc-900 py-8">
          <div className="flex flex-col gap-2 text-xs text-zinc-700 sm:flex-row sm:items-center sm:justify-between">
            <p>Interview Prep Kit</p>

            <p>
              {kit.source.company} · {kit.role.title}
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}

function QuestionCard({
  question,
  saving,
  onUpdate,
  onDelete,
  onTogglePin,
  onMove,
}: {
  question: Question;
  saving: boolean;

  onUpdate: (id: string, updates: Partial<Question>) => Promise<void>;

  onDelete: (id: string) => Promise<void>;

  onTogglePin: (id: string) => Promise<void>;

  onMove: (id: string, direction: "up" | "down") => Promise<void>;
}) {
  const [showAnswer, setShowAnswer] = useState(false);

  const [editing, setEditing] = useState(false);

  const [prompt, setPrompt] = useState(question.prompt);

  const [answer, setAnswer] = useState(question.answer_outline);

  async function saveEdit() {
    await onUpdate(question.id, {
      prompt,
      answer_outline: answer,
    });

    setEditing(false);
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
          <span>{question.id}</span>
          <span>•</span>
          <span>{question.category}</span>
          <span>•</span>

          <span>Difficulty {question.difficulty}</span>

          {question.origin === "manual" && (
            <>
              <span>•</span>
              <span>Manual</span>
            </>
          )}

          {question.edited && (
            <>
              <span>•</span>
              <span>Edited</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onMove(question.id, "up")}
            disabled={saving}
            title="Move up"
            className="text-sm text-zinc-400 hover:text-white disabled:opacity-50"
          >
            ↑
          </button>

          <button
            onClick={() => onMove(question.id, "down")}
            disabled={saving}
            title="Move down"
            className="text-sm text-zinc-400 hover:text-white disabled:opacity-50"
          >
            ↓
          </button>

          <button
            onClick={() => onTogglePin(question.id)}
            disabled={saving}
            className="text-sm text-zinc-400 hover:text-white disabled:opacity-50"
          >
            {question.pinned ? "★ Pinned" : "☆ Pin"}
          </button>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-xs text-zinc-500">Question</label>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs text-zinc-500">
              Answer outline
            </label>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-sm outline-none focus:border-zinc-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              disabled={saving}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
            >
              Save
            </button>

            <button
              onClick={() => setEditing(false)}
              disabled={saving}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-3 font-medium leading-7">{question.prompt}</p>

          <div className="mt-4 flex flex-wrap gap-4">
            <button
              onClick={() => setShowAnswer((current) => !current)}
              className="text-sm text-zinc-400 hover:text-white"
            >
              {showAnswer ? "Hide answer" : "Show answer"}
            </button>

            <button
              onClick={() => setEditing(true)}
              className="text-sm text-zinc-400 hover:text-white"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete(question.id)}
              disabled={saving}
              className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              Delete
            </button>
          </div>

          {showAnswer && (
            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-sm leading-6 text-zinc-400">
                {question.answer_outline}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
