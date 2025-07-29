import { tool } from "@openai/agents";
import { generateBriefCore } from "../lib/generateBriefCore";
import { generateBriefInputSchema } from "../schemas";

// Wrapper for existing generateBrief script, returns AI validation brief content
export async function generateBriefHandler(_input: {}, context: any) {
  const content = await generateBriefCore();
  return { content };
}

const generateBriefTool = tool({
  name: "generateBrief",
  description: "Generates an AI validation brief for Phase 1 and returns its Markdown.",
  parameters: generateBriefInputSchema,
  execute: generateBriefHandler,
});

export default generateBriefTool;
