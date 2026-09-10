import { crawlSite } from "@/lib/retrieval/crawl-site";

import { generateCompanyBrief } from "@/lib/ai/generate-company-brief";
import { searchInterviewDiscussions } from "./search-interview-discussions";

export async function researchCompany(companyUrl: string) {
  const crawlResult = await crawlSite(companyUrl);

  const companyBrief = await generateCompanyBrief(crawlResult.pages);

  const interviewDiscussions = await searchInterviewDiscussions(
    companyBrief.company,
  );

  return {
    company: companyBrief.company,

    company_brief: {
      summary: companyBrief.summary,
      what_they_do: companyBrief.what_they_do,
      sources: crawlResult.pages.map((page) => page.url),
    },

    pages: crawlResult.pages,

    interviewDiscussions,

    warnings: crawlResult.warnings,
  };
}
