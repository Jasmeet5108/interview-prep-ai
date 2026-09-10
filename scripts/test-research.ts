import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import { researchCompany } from "../lib/research/research-company";

async function main() {
  const result = await researchCompany("https://posthog.com");

  console.log(
    JSON.stringify(
      {
        company: result.company,
        company_brief: result.company_brief,

        pages: result.pages.map((page) => ({
          url: page.url,
          title: page.title,
        })),

        warnings: result.warnings,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
