import { tool } from "@openai/agents";
import { planImplementationCore } from "../lib/planImplementationCore";
import { planImplementationInputSchema } from "../schemas";

// Wrapper for existing planImplementation script, returns implementation plan Markdown
export async function planImplementationHandler(
  _input: {},
  context: any
) {
  const content = await planImplementationCore();
  return { content };
}

const planImplementationTool = tool({
  name: "planImplementation",
  description: "Generates the Phase 1 implementation plan and returns its Markdown.",
  parameters: planImplementationInputSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: planImplementationHandler,
});

export default planImplementationTool;
