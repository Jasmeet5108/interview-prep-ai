import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import { searchInterviewDiscussions } from "../lib/research/search-interview-discussions";

async function main() {
  const results = await searchInterviewDiscussions("PostHog");

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
