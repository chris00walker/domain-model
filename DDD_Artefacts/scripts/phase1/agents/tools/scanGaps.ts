import { tool } from "@openai/agents";
import { scanGapsCore } from "../lib/scanGapsCore";
import { scanGapsInputSchema } from "../schemas";

// Wrapper for existing scanGaps script, returns gap-analysis content
export async function scanGapsHandler(_input: {}, context: any) {
  const content = scanGapsCore();
  return { content };
}



const scanGapsTool = tool({
  name: "scanGaps",
  description: "Scan documented gaps and return their list.",
  parameters: scanGapsInputSchema,
  execute: scanGapsHandler,
});


export default scanGapsTool;
