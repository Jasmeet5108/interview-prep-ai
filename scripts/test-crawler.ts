import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import { crawlSite } from "../lib/retrieval/crawl-site";

async function main() {
  const result = await crawlSite("https://posthog.com");

  console.log(
    JSON.stringify(
      {
        pages: result.pages.map((page) => ({
          url: page.url,
          title: page.title,
          textLength: page.text.length,
          linksFound: page.links.length,
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
