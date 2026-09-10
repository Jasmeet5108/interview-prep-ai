import type { RetrievedPage } from "@/lib/retrieval/fetch-page";

import type { InterviewDiscussion } from "./search-interview-discussions";

export function buildHiringContext(
  pages: RetrievedPage[],
  discussions: InterviewDiscussion[],
) {
  const hiringPages = pages.filter((page) => {
    const haystack = `${page.url} ${page.title}`.toLowerCase();

    return (
      haystack.includes("hire") ||
      haystack.includes("hiring") ||
      haystack.includes("interview") ||
      haystack.includes("career") ||
      haystack.includes("job")
    );
  });

  const firstParty = hiringPages
    .map((page) => `${page.title}\n${page.text.slice(0, 3000)}`)
    .join("\n\n");

  const publicDiscussion = discussions
    .map((item) => `${item.title}\n${item.snippet}\n${item.url}`)
    .join("\n\n");

  return `
FIRST-PARTY HIRING INFORMATION:
${firstParty || "No reliable first-party hiring information found."}

PUBLIC INTERVIEW DISCUSSION:
${publicDiscussion || "No reliable public discussion found."}
  `.trim();
}
