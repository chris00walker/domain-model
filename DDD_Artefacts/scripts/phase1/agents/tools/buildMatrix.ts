import { tool } from "@openai/agents";
import { buildMatrixCore } from "../lib/buildMatrixCore";
import { buildMatrixInputSchema } from "../schemas";

// Wrapper for existing buildMatrix script, returns dependency matrix content
export async function buildMatrixHandler(_input: {}, context: any) {
  const content = await buildMatrixCore();
  return { content };
}

const buildMatrixTool = tool({
  name: "buildMatrix",
  description: "Builds the context dependency matrix for Phase 1 and returns its Markdown.",
  parameters: buildMatrixInputSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: buildMatrixHandler,
});

export default buildMatrixTool;
