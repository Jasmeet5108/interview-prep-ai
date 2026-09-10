"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        {/* Left side */}
        <section className="hidden border-r border-zinc-900 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-black">
                IP
              </div>

              <div>
                <p className="text-sm font-semibold">Interview Prep Kit</p>
                <p className="text-xs text-zinc-600">
                  AI-powered interview preparation
                </p>
              </div>
            </div>

            <div className="mt-24 max-w-lg">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Built for focused preparation
              </div>

              <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight">
                Turn a job description into a
                <span className="text-zinc-500"> complete interview plan.</span>
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-zinc-500">
                Research the company, identify role requirements, generate
                targeted questions, revise with flashcards and follow a
                structured study schedule.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  "Role and requirement analysis",
                  "Company and hiring research",
                  "Targeted interview questions",
                  "Flashcards and confidence tracking",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-500">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m5 12 4 4L19 6"
                        />
                      </svg>
                    </div>

                    <p className="text-sm text-zinc-400">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-700">
            Interview Prep Kit · AI-assisted preparation
          </p>
        </section>

        {/* Login side */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-black">
                IP
              </div>

              <div>
                <p className="text-sm font-semibold">Interview Prep Kit</p>
                <p className="text-xs text-zinc-600">AI-powered preparation</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
                Welcome back
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Log in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Continue working on your interview kits and practice sessions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Email address
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
                        d="M4 6h16v12H4V6Zm0 1 8 6 8-6"
                      />
                    </svg>
                  </div>

                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-3 pl-10 pr-4 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 hover:border-zinc-700 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-zinc-300"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="h-4 w-4 text-zinc-600"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                        strokeWidth="1.7"
                      />
                      <path
                        strokeLinecap="round"
                        strokeWidth="1.7"
                        d="M8 10V7a4 4 0 0 1 8 0v3"
                      />
                    </svg>
                  </div>

                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-3 pl-10 pr-4 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 hover:border-zinc-700 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex gap-3 rounded-xl border border-red-900/60 bg-red-950/20 p-4">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-800 text-xs text-red-300">
                    !
                  </div>

                  <div>
                    <p className="text-sm font-medium text-red-300">
                      Unable to log in
                    </p>

                    <p className="mt-1 text-sm leading-5 text-red-400/70">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group cursor-pointer flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-black" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Log in
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
            </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-900" />
              <span className="text-xs text-zinc-700">New here?</span>
              <div className="h-px flex-1 bg-zinc-900" />
            </div>

            <Link
              href="/register"
              className="mt-5 flex w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
            >
              Create an account
            </Link>

            <p className="mt-6 text-center text-xs leading-5 text-zinc-700">
              Your interview kits are tied to your account and remain available
              when you return.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
