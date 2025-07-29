import { tool } from "@openai/agents";
import { orchestrateDomainCore } from "../lib/orchestrateDomainCore";
import { orchestrateDomainInputSchema } from "../schemas";

// Wrapper for full Phase 1 discovery flow
export async function orchestrateDomainHandler(input: { contextFilter?: string }, context: any) {
  const orchestrationPlan = await orchestrateDomainCore();
  return { orchestrationPlan };
}

const orchestrateDomainTool = tool({
  name: "orchestrateDomain",
  description: "Runs full Phase 1 discovery and returns the orchestration plan Markdown.",
  parameters: orchestrateDomainInputSchema,

  execute: orchestrateDomainHandler,
});

export default orchestrateDomainTool;
