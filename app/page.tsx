"use client";

import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SavedKit = {
  _id: string;
  source?: {
    company?: string;
  };
  role?: {
    title?: string;
  };
  schedule?: {
    days_available?: number;
  };
  createdAt?: string;
};
export default function Home() {
  const [jd, setJd] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [days, setDays] = useState(5);

  const [user, setUser] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const [savedKits, setSavedKits] = useState<SavedKit[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  async function handleGenerate() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/kits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jd,
          company_url: companyUrl,
          days,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate kit");
      }

      router.push(`/kits/${data.kit._id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadDashboard() {
      const meResponse = await fetch("/api/auth/me");

      if (!meResponse.ok) {
        router.push("/login");
        return;
      }

      const meData = await meResponse.json();
      setUser(meData.user);

      const kitsResponse = await fetch("/api/kits");

      if (kitsResponse.ok) {
        const kitsData = await kitsResponse.json();
        setSavedKits(kitsData.kits);
      }
    }

    loadDashboard();
  }, [router]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Top navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-black">
              IP
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Interview Prep Kit
              </p>
              <p className="text-xs text-zinc-500">
                AI-powered interview preparation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-[11px] text-zinc-500">Signed in as</p>
              <p className="max-w-55 truncate text-sm text-zinc-300">
                {user?.email}
              </p>
            </div>

            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
        {/* Hero */}
        <section className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            AI Interview Preparation
          </div>

          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Prepare smarter for your
            <span className="text-zinc-400"> next interview.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
            Paste a job description and company website. We&apos;ll research the
            company, analyse the role, generate targeted questions, flashcards,
            and build a personalised study schedule.
          </p>
        </section>

        {/* Generator */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main form */}
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
            <div className="border-b border-zinc-800 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Create a new prep kit
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Tell us about the role you&apos;re interviewing for.
                  </p>
                </div>

                <span className="hidden rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-500 sm:block">
                  Takes ~30–60 sec
                </span>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* JD */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="job-description"
                    className="text-sm font-medium text-zinc-200"
                  >
                    Job description
                  </label>

                  <span className="text-xs text-zinc-600">
                    {jd.length.toLocaleString()} characters
                  </span>
                </div>

                <textarea
                  id="job-description"
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the complete job description here..."
                  rows={12}
                  disabled={loading}
                  className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 text-sm leading-6 text-zinc-200 outline-none transition placeholder:text-zinc-700 hover:border-zinc-700 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Company + days */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="company-url"
                    className="mb-2 block text-sm font-medium text-zinc-200"
                  >
                    Company website
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="h-4 w-4 text-zinc-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.7"
                          d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15"
                        />
                      </svg>
                    </div>

                    <input
                      id="company-url"
                      value={companyUrl}
                      onChange={(e) => setCompanyUrl(e.target.value)}
                      placeholder="https://company.com"
                      disabled={loading}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-3 pl-10 pr-4 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 hover:border-zinc-700 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="days"
                    className="mb-2 block text-sm font-medium text-zinc-200"
                  >
                    Days until interview
                  </label>

                  <input
                    id="days"
                    type="number"
                    min={1}
                    max={60}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    disabled={loading}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-200 outline-none transition hover:border-zinc-700 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  {/* Quick day selectors */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[3, 7, 14, 30].map((option) => (
                      <button
                        key={option}
                        type="button"
                        disabled={loading}
                        onClick={() => setDays(option)}
                        className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                          days === option
                            ? "border-zinc-500 bg-zinc-800 text-white"
                            : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {option} days
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex gap-3 rounded-xl border border-red-900/70 bg-red-950/30 p-4">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-800 text-xs text-red-300">
                    !
                  </div>

                  <div>
                    <p className="text-sm font-medium text-red-300">
                      Generation failed
                    </p>

                    <p className="mt-1 text-sm leading-5 text-red-400/80">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80">
                  <div className="h-1 overflow-hidden bg-zinc-900">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-white" />
                  </div>

                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-200">
                          Building your interview kit
                        </p>

                        <p className="mt-1 text-sm leading-6 text-zinc-500">
                          Researching the company, analysing requirements,
                          generating questions and creating your study plan.
                        </p>

                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wide text-zinc-600">
                              Step 1
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">
                              Analyse role
                            </p>
                          </div>

                          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wide text-zinc-600">
                              Step 2
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">
                              Research company
                            </p>
                          </div>

                          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wide text-zinc-600">
                              Step 3
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">
                              Build prep plan
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !jd.trim() || !companyUrl.trim()}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-black" />
                    Generating your kit...
                  </>
                ) : (
                  <>
                    Generate interview kit
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
                  </>
                )}
              </button>

              {!loading && (!jd.trim() || !companyUrl.trim()) && (
                <p className="-mt-2 text-center text-xs text-zinc-600">
                  Add a job description and company website to continue.
                </p>
              )}
            </div>
          </div>

          {/* Right info panel */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                What you&apos;ll get
              </p>

              <div className="mt-5 space-y-5">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-400">
                    01
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      Role analysis
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Must-have and nice-to-have requirements extracted from the
                      JD.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-400">
                    02
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      Company research
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Relevant company, culture and hiring information with
                      sources.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-400">
                    03
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      Targeted preparation
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Questions, answer outlines, flashcards and a daily
                      schedule.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-400">
                    04
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      Practice mode
                    </p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Review flashcards and track confidence as you prepare.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <p className="text-sm font-medium text-zinc-300">
                  Better inputs, better preparation
                </p>
              </div>

              <p className="mt-2 text-xs leading-5 text-zinc-500">
                Use the complete job description and the company&apos;s official
                website for the most relevant results.
              </p>
            </div>
          </aside>
        </section>

        {/* Saved kits */}
        <section className="mt-16 border-t border-zinc-900 pt-10">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
                Your workspace
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Previous interview kits
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Continue preparing where you left off.
              </p>
            </div>

            {savedKits.length > 0 && (
              <p className="text-xs text-zinc-600">
                {savedKits.length} {savedKits.length === 1 ? "kit" : "kits"}
              </p>
            )}
          </div>

          {savedKits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 px-6 py-12 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="h-5 w-5 text-zinc-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                    d="M4 5a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                    d="M14 3v6h6M8 13h8M8 17h5"
                  />
                </svg>
              </div>

              <p className="mt-4 text-sm font-medium text-zinc-300">
                No interview kits yet
              </p>

              <p className="mt-1 text-sm text-zinc-600">
                Generate your first kit using the form above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {savedKits.map((savedKit) => (
                <Link
                  key={savedKit._id}
                  href={`/kits/${savedKit._id}`}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-sm font-semibold text-zinc-400">
                      {(savedKit.source?.company || "C")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition group-hover:bg-zinc-800 group-hover:text-zinc-300">
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
                          d="M5 12h14M13 6l6 6-6 6"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-600">
                      {savedKit.source?.company || "Company"}
                    </p>

                    <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-6 text-zinc-200 transition group-hover:text-white">
                      {savedKit.role?.title || "Interview Kit"}
                    </h3>
                  </div>

                  <div className="mt-5 flex items-center gap-2 border-t border-zinc-800/80 pt-4">
                    <span className="rounded-md bg-zinc-800 px-2 py-1 text-[11px] text-zinc-400">
                      {savedKit.schedule?.days_available ?? 0} study days
                    </span>

                    <span className="text-xs text-zinc-700">•</span>

                    <span className="text-xs text-zinc-600">Open kit</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-zinc-900 py-8 text-center">
          <p className="text-xs text-zinc-700">
            Interview Prep Kit · AI-assisted preparation
          </p>
        </footer>
      </div>
    </main>
  );
}
