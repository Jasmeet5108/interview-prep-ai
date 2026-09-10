import type { PageLink } from "./fetch-page";

export interface RankedLink {
  url: string;
  text: string;
  score: number;
}

const HIGH_VALUE_TERMS = [
  "career",
  "careers",
  "job",
  "jobs",
  "hiring",
  "hire",
  "join",
  "work with us",
  "work-with-us",
  "open positions",
  "open roles",
  "interview",
  "recruitment",
  "about",
  "company",
  "team",
  "people",
  "engineering",
  "culture",
  "values",
  "handbook",
];

const LOW_VALUE_TERMS = [
  "privacy",
  "terms",
  "cookie",
  "login",
  "sign in",
  "signin",
  "signup",
  "support",
  "legal",
];

export function rankLinks(links: PageLink[], baseUrl: string): RankedLink[] {
  const base = new URL(baseUrl);

  return links
    .filter((link) => {
      try {
        const url = new URL(link.url);

        return url.hostname === base.hostname;
      } catch {
        return false;
      }
    })
    .map((link) => {
      const url = new URL(link.url);

      const searchable = `
        ${url.pathname}
        ${url.search}
        ${link.text}
      `.toLowerCase();

      let score = 0;

      for (const term of HIGH_VALUE_TERMS) {
        if (searchable.includes(term)) {
          score += 5;
        }
      }

      for (const term of LOW_VALUE_TERMS) {
        if (searchable.includes(term)) {
          score -= 3;
        }
      }

      const depth = url.pathname.split("/").filter(Boolean).length;

      if (depth <= 2) {
        score += 1;
      }

      return {
        url: link.url,
        text: link.text,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);
}
