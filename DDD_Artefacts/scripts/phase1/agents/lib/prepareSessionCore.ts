import { prepareSession as runPrepareSession } from "../../prepareSession";
import { readFile } from "node:fs/promises";

const OUTPUT_PATH = "DDD_Artefacts/docs/analysis/phase1/event-storming-session-prep.md";

/**
 * Runs the legacy prepareSession script and returns the session prep markdown.
 */
export async function prepareSessionCore(contextFilter?: string): Promise<string> {
  await runPrepareSession(contextFilter);
  return await readFile(OUTPUT_PATH, "utf-8");
}
