import { planImplementation as runPlanImplementation } from "../../planImplementation";
import { readFile } from "node:fs/promises";

const OUTPUT_PATH = "DDD_Artefacts/docs/analysis/phase1/implementation-plan.md";

/**
 * Runs the legacy planImplementation script and returns the implementation plan markdown.
 */
export async function planImplementationCore(): Promise<string> {
  await runPlanImplementation();
  return await readFile(OUTPUT_PATH, "utf-8");
}
