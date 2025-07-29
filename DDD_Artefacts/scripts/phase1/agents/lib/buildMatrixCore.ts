import { buildMatrix as runBuildMatrix } from "../../buildMatrix";
import { readFile } from "node:fs/promises";

const OUTPUT_PATH = "DDD_Artefacts/docs/analysis/phase1/event-dependency-matrix.md";

/**
 * Runs the legacy buildMatrix script and returns the generated matrix markdown.
 */
export async function buildMatrixCore(): Promise<string> {
  await runBuildMatrix();
  return await readFile(OUTPUT_PATH, "utf-8");
}
