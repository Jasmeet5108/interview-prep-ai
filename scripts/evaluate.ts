import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import fs from "node:fs/promises";
import path from "node:path";

import { generateKit } from "../lib/pipeline/generate-kit";

interface EvaluationInput {
  id: string;
  jd: string;
  company_url: string;
  days: number;
}

function getArgument(name: string) {
  const index = process.argv.indexOf(name);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

async function main() {
  const inputPath = getArgument("--input") ?? process.argv[2];

  const outputDirectory = getArgument("--output") ?? process.argv[3];

  if (!inputPath || !outputDirectory) {
    throw new Error(
      "Usage: npm run evaluate -- --input <file> --output <directory>",
    );
  }

  const rawInput = await fs.readFile(path.resolve(inputPath), "utf8");

  const inputs = JSON.parse(rawInput) as EvaluationInput[];

  if (!Array.isArray(inputs)) {
    throw new Error("Evaluation input must be a JSON array");
  }

  await fs.mkdir(path.resolve(outputDirectory), {
    recursive: true,
  });

  console.log(`Evaluating ${inputs.length} input(s)...`);

  for (let index = 0; index < inputs.length; index++) {
    const input = inputs[index];

    console.log(`[${index + 1}/${inputs.length}] ${input.id}`);

    try {
      const kit = await generateKit({
        jd: input.jd,
        company_url: input.company_url,
        days: input.days,
      });

      const outputPath = path.join(
        path.resolve(outputDirectory),
        `${input.id}.json`,
      );

      await fs.writeFile(outputPath, JSON.stringify(kit, null, 2), "utf8");

      console.log(`✓ ${input.id}`);
    } catch (error) {
      console.error(`✗ ${input.id}`);

      console.error(error);

      /*
       * Continue processing other inputs instead
       * of killing the entire batch.
       */
    }
  }

  console.log("\nEvaluation complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
