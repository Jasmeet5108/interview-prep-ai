import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import { extractRequirements } from "../lib/ai/extract-requirements";

import { normalizeRequirements } from "../lib/pipeline/normalize-requirements";

async function main() {
  const jd = `
Senior Full Stack Developer

We are looking for an experienced developer to join our team.

Requirements:
- Strong experience with React and TypeScript
- Experience building REST APIs with Node.js
- MongoDB experience
- Strong communication skills

Nice to have:
- GraphQL experience
- Experience mentoring junior engineers

Location: Bengaluru
`;

  const result = await extractRequirements(jd);

  const requirements = normalizeRequirements(result);

  console.log(
    JSON.stringify(
      {
        ...result,
        requirements,
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
