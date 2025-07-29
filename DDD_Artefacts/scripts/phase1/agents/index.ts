import { Agent, run } from "@openai/agents";
import { z } from "zod";
import tools from "./tools/index.js";
import { LoggerPort } from "../../phase2/core/ports";

// Schema: final orchestration plan markdown
const outputSchema = z.object({
  orchestrationPlan: z.string(),
}).strict();

export interface Phase1DiscoverInput {
  contextFilter?: string;
}

export interface Phase1DiscoverOutput {
  orchestrationPlan: string;
}

export async function discoverPhase1(
  input: Phase1DiscoverInput,
  // Ports can include logger
  ports: { logger?: LoggerPort } = {},
  // Additional options for future use
  opts: { maxTurns?: number } = {}
): Promise<Phase1DiscoverOutput> {
  const agent = new Agent({
    name: "Phase1DiscoveryAgent",
    instructions: `
You are the Phase 1 discovery agent.\n
Use the following tools in order:\n
1. scanGaps – identify documented gaps\n
2. buildMatrix – build context dependency matrix\n
3. planImplementation – generate implementation plan\n
4. prepareSession – prepare event storming session materials\n
5. generateBrief – generate event storming brief\n
6. orchestrateDomain – perform full discovery and produce the orchestration plan\n
Return a JSON object matching the output schema with key 'orchestrationPlan' containing the final markdown content.
    `.trim(),
    outputType: outputSchema,
    tools: tools as any[],
    model: "gpt-4o-mini",
  });

  // Run the agent without a natural-language prompt
  const runResult = await run(agent, [], {
    context: { logger: ports.logger, ...input },
    maxTurns: opts.maxTurns,
  });

  return { orchestrationPlan: runResult.finalOutput!.orchestrationPlan };
}
