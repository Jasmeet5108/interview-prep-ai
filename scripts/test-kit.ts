import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import { generateKit } from "../lib/pipeline/generate-kit";

async function main() {
  console.log("Generating interview kit...\n");

  const kit = await generateKit({
    jd: `
Full Stack Engineer

We are looking for a Full Stack Engineer.

Requirements:
- Strong React and TypeScript experience
- Experience building Node.js APIs
- Experience with SQL or NoSQL databases
- Strong communication skills

Nice to have:
- GraphQL experience
`,
    company_url: "https://posthog.com",
    days: 5,
  });

  console.log("Kit generated successfully!\n");

  console.log(JSON.stringify(kit, null, 2));
}

main().catch((error) => {
  console.error("Generation failed:");
  console.error(error);

  process.exit(1);
});
