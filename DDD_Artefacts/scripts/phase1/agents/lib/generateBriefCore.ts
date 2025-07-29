import { generateBrief as runGenerateBrief } from "../../generateBrief";
import { readFile } from "node:fs/promises";

const OUTPUT_PATH = "DDD_Artefacts/docs/analysis/phase1/event-storming-brief.md";

/**
 * Runs the legacy generateBrief script and returns the generated brief markdown.
 */
export async function generateBriefCore(): Promise<string> {
  await runGenerateBrief();
  return await readFile(OUTPUT_PATH, "utf-8");
}
