import { fetchPage, type RetrievedPage } from "./fetch-page";

import { rankLinks } from "./rank-links";

export interface CrawlResult {
  pages: RetrievedPage[];
  warnings: string[];
}

const MAX_PAGES = 7;

const CRAWL_DELAY_MS = 250;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function crawlSite(companyUrl: string): Promise<CrawlResult> {
  const pages: RetrievedPage[] = [];
  const warnings: string[] = [];

  const visited = new Set<string>();
  const queued = new Set<string>();

  const queue: {
    url: string;
    priority: number;
  }[] = [
    {
      url: companyUrl,
      priority: 100,
    },
  ];

  queued.add(companyUrl);

  while (queue.length > 0 && pages.length < MAX_PAGES) {
    queue.sort((a, b) => b.priority - a.priority);

    const next = queue.shift();

    if (!next) {
      break;
    }

    if (visited.has(next.url)) {
      continue;
    }

    visited.add(next.url);

    try {
      const page = await fetchPage(next.url);

      pages.push(page);

      const rankedLinks = rankLinks(page.links, companyUrl);

      for (const link of rankedLinks) {
        if (visited.has(link.url) || queued.has(link.url)) {
          continue;
        }

        // Ignore obviously irrelevant links.
        if (link.score <= 0) {
          continue;
        }

        queue.push({
          url: link.url,
          priority: link.score,
        });

        queued.add(link.url);
      }

      await sleep(CRAWL_DELAY_MS);
    } catch (error) {
      warnings.push(
        error instanceof Error
          ? error.message
          : `Failed to retrieve ${next.url}`,
      );
    }
  }

  return {
    pages,
    warnings,
  };
}
