"use client";

import { use, useEffect, useMemo, useState } from "react";

import Link from "next/link";

type Flashcard = {
  id: string;
  front: string;
  back: string;
  requirement_ids: string[];
  confidence?: number;
  lastReviewedAt?: string | null;
};

type Kit = {
  _id: string;

  source: {
    company: string;
  };

  role: {
    title: string;
  };

  flashcards: Flashcard[];
};

export default function PracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [kit, setKit] = useState<Kit | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);

  const [revealed, setRevealed] = useState(false);

  const [saving, setSaving] = useState(false);

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

  /*
   * Lowest confidence first.
   *
   * Unreviewed cards have confidence 0,
   * so they naturally come first.
   */
  const cards = useMemo(() => {
    if (!kit) return [];

    return [...kit.flashcards].sort(
      (a, b) => (a.confidence ?? 0) - (b.confidence ?? 0),
    );
  }, [kit]);

  const currentCard = cards[currentIndex];

  const practiceStats = useMemo(() => {
    const flashcards = kit?.flashcards ?? [];

    const reviewed = flashcards.filter(
      (card) => (card.confidence ?? 0) > 0,
    ).length;

    const low = flashcards.filter((card) => card.confidence === 1).length;

    const medium = flashcards.filter((card) => card.confidence === 2).length;

    const high = flashcards.filter((card) => card.confidence === 3).length;

    return {
      reviewed,
      remaining: flashcards.length - reviewed,
      low,
      medium,
      high,
    };
  }, [kit]);

  async function rateConfidence(confidence: 1 | 2 | 3) {
    if (!currentCard || !kit) return;

    setSaving(true);

    try {
      const response = await fetch(`/api/kits/${id}/practice`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          flashcardId: currentCard.id,

          confidence,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save confidence");
      }

      /*
       * Update local state.
       */
      setKit((current) => {
        if (!current) return current;

        return {
          ...current,

          flashcards: current.flashcards.map((card) =>
            card.id === currentCard.id
              ? {
                  ...card,
                  confidence,
                  lastReviewedAt: new Date().toISOString(),
                }
              : card,
          ),
        };
      });

      setRevealed(false);

      if (currentIndex < cards.length - 1) {
        setCurrentIndex((current) => current + 1);
      }
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to save confidence",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 p-10 text-white">
        Loading practice mode...
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

  if (cards.length === 0) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <p>No flashcards available.</p>

          <Link
            href={`/kits/${id}`}
            className="mt-4 inline-block text-zinc-400 underline"
          >
            Back to kit
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Top bar */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href={`/kits/${id}`}
            className="group inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 transition group-hover:border-zinc-700">
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
            </span>
            Back to kit
          </Link>

          <div className="hidden text-right sm:block">
            <p className="text-xs text-zinc-600">Practice session</p>
            <p className="text-sm font-medium text-zinc-300">
              {kit.source.company}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10 lg:py-12">
        {/* Header */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1 text-xs text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Flashcard practice
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Practice Mode
              </h1>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {kit.role.title}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <p className="text-xs text-zinc-600">Current progress</p>
              <p className="mt-1 text-sm font-medium text-zinc-200">
                {currentIndex + 1} / {cards.length} cards
              </p>
            </div>
          </div>
        </section>

        {/* Progress */}
        <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-300">
                Session progress
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Keep going — confidence is saved after each response.
              </p>
            </div>

            <span className="text-sm font-semibold text-zinc-300">
              {Math.round(((currentIndex + 1) / cards.length) * 100)}%
            </span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{
                width: `${((currentIndex + 1) / cards.length) * 100}%`,
              }}
            />
          </div>
        </section>

        {/* Stats */}
        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-600">Reviewed</p>
            <p className="mt-2 text-2xl font-semibold">
              {practiceStats.reviewed}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-600">Remaining</p>
            <p className="mt-2 text-2xl font-semibold">
              {practiceStats.remaining}
            </p>
          </div>

          <div className="rounded-xl border border-red-900/30 bg-red-950/10 p-4">
            <p className="text-xs text-red-400/60">Low</p>
            <p className="mt-2 text-2xl font-semibold text-red-300">
              {practiceStats.low}
            </p>
          </div>

          <div className="rounded-xl border border-amber-900/30 bg-amber-950/10 p-4">
            <p className="text-xs text-amber-400/60">Medium</p>
            <p className="mt-2 text-2xl font-semibold text-amber-300">
              {practiceStats.medium}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-4">
            <p className="text-xs text-emerald-400/60">High</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-300">
              {practiceStats.high}
            </p>
          </div>
        </section>

        {/* Flashcard */}
        <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50">
          {/* Card header */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-zinc-800 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                {currentCard.id}
              </span>

              <span className="text-xs text-zinc-700">Flashcard</span>
            </div>

            <span className="text-xs text-zinc-600">
              Card {currentIndex + 1}
            </span>
          </div>

          {/* Question */}
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
              Question
            </p>

            <h2 className="mt-4 max-w-3xl text-2xl font-medium leading-9 text-zinc-100 sm:text-3xl sm:leading-10">
              {currentCard.front}
            </h2>

            {!revealed ? (
              <div className="mt-10">
                <button
                  onClick={() => setRevealed(true)}
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.98]"
                >
                  Reveal answer
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
                </button>

                <p className="mt-3 text-xs text-zinc-600">
                  Think through your answer before revealing it.
                </p>
              </div>
            ) : (
              <>
                {/* Answer */}
                <div className="mt-10 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80">
                  <div className="border-b border-zinc-800 px-5 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
                      Answer
                    </p>
                  </div>

                  <div className="p-5 sm:p-6">
                    <p className="whitespace-pre-line text-sm leading-7 text-zinc-300">
                      {currentCard.back}
                    </p>
                  </div>
                </div>

                {/* Confidence */}
                <div className="mt-8">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-zinc-300">
                      How confident are you with this?
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Your response is saved and helps prioritise future
                      practice.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => rateConfidence(1)}
                      className="group rounded-2xl border border-red-900/40 bg-red-950/10 p-4 text-left transition hover:border-red-800/60 hover:bg-red-950/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-red-300">
                            Low
                          </p>

                          <p className="mt-1 text-xs leading-5 text-red-400/60">
                            Need more practice
                          </p>
                        </div>

                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-sm text-red-300">
                          1
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => rateConfidence(2)}
                      className="group rounded-2xl border border-amber-900/40 bg-amber-950/10 p-4 text-left transition hover:border-amber-800/60 hover:bg-amber-950/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-amber-300">
                            Medium
                          </p>

                          <p className="mt-1 text-xs leading-5 text-amber-400/60">
                            Getting there
                          </p>
                        </div>

                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-sm text-amber-300">
                          2
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => rateConfidence(3)}
                      className="group rounded-2xl border border-emerald-900/40 bg-emerald-950/10 p-4 text-left transition hover:border-emerald-800/60 hover:bg-emerald-950/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-emerald-300">
                            High
                          </p>

                          <p className="mt-1 text-xs leading-5 text-emerald-400/60">
                            I know this
                          </p>
                        </div>

                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm text-emerald-300">
                          3
                        </span>
                      </div>
                    </button>
                  </div>

                  {saving && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
                      Saving confidence...
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Requirement coverage */}
        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
                Requirement coverage
              </p>

              <p className="mt-2 text-sm text-zinc-300">
                {currentCard.requirement_ids.length
                  ? "This card supports the following requirements:"
                  : "This is a general preparation card."}
              </p>
            </div>

            {currentCard.requirement_ids.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentCard.requirement_ids.map((requirementId) => (
                  <span
                    key={requirementId}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs font-medium text-zinc-500"
                  >
                    {requirementId}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Tip */}
        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-5">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-zinc-500">
              i
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-300">Practice tip</p>

              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Try answering out loud before revealing the answer.
                Low-confidence cards will be prioritised when you start another
                practice session.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ConfidenceButton({
  label,
  description,
  disabled,
  onClick,
}: {
  label: string;
  description: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl border border-zinc-700 p-4 text-left transition hover:border-zinc-500 hover:bg-zinc-800 disabled:opacity-50"
    >
      <p className="font-medium">{label}</p>

      <p className="mt-1 text-xs text-zinc-500">{description}</p>
    </button>
  );
}

function PracticeStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 p-3">
      <p className="text-lg font-semibold">{value}</p>

      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}
