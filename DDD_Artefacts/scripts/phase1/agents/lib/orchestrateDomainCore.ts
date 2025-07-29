import { orchestrateDomain as runOrchestrateDomain } from "../../orchestrateDomain";
import { readFile } from "node:fs/promises";

const OUTPUT_PATH = "DDD_Artefacts/docs/analysis/phase1/domain-orchestration-plan.md";

/**
 * Runs the legacy orchestrateDomain script and returns the full orchestration plan markdown.
 */
export async function orchestrateDomainCore(): Promise<string> {
  await runOrchestrateDomain();
  return await readFile(OUTPUT_PATH, "utf-8");
}
