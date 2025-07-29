import { tool } from "@openai/agents";
import { prepareSessionCore } from "../lib/prepareSessionCore";
import { prepareSessionInputSchema } from "../schemas";

// Wrapper for existing prepareSession script, returns session prep Markdown
export async function prepareSessionHandler(input: { contextFilter?: string }, context: any) {
  const content = await prepareSessionCore(input.contextFilter);
  return { content };
}

const prepareSessionTool = tool({
  name: "prepareSession",
  description: "Prepares Event Storming session materials and returns its Markdown.",
  parameters: prepareSessionInputSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: prepareSessionHandler,
});

export default prepareSessionTool;
