import { Agent, run } from "@openai/agents";
import tools from "./tools/index.js";
import { buildObjective } from "./prompts/objective.js";

// Temporary lightweight typings – we re-use Phase-2 types but keep them loose here
export interface BrainstormInput {
  contextName: string;
  knownEvents: string[];
  knownCommands: string[];
  knownIntegrationPoints: string[];
  panelAgents: { name: string; category: string; expertise?: string[] }[];
  rounds?: number;
}

export interface BrainstormOutput {
  events: string[];
  commands: string[];
  integrationPoints: string[];
  notes: string[];
}

export interface BrainstormAgentOptions {
  maxTurns?: number; // hard ceiling across all iterations (default 25)
  untilStaleRounds?: number; // number of consecutive stale iterations to stop (default 2)
}

export async function brainstormAgents(
  input: BrainstormInput,
  // Ports are forwarded for future use (logger, fs, etc.)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ports: any,
  opts: BrainstormAgentOptions = {},
): Promise<BrainstormOutput> {
  const agent = new Agent({
    name: "EventStormer",
    instructions: "You are an expert domain facilitator conducting an Event Storming session. Use the available tools to propose domain events, commands, integrations and notes until the brainstorming context quotas are satisfied, then call persistStorm to save results.",
    model: "gpt-4o-mini",
    tools: tools as unknown as any[] /* SDK expects Tool[] */,
  });

  // build initial brainstorming context object that will be mutated by tools
  const brainstormCtx = {
    // mutable sets updated in-place by tools
    events: new Set(input.knownEvents),
    commands: new Set(input.knownCommands),
    integrations: new Set(input.knownIntegrationPoints),
    notes: [] as string[],
    domainRoles: input.panelAgents.map((p) => p.name),
    quota: { events: 1, commands: 1, integrations: 1 },
    logger: ports?.logger,
  };

  const maxTurns = opts.maxTurns ?? Number(process.env.STORM_MAX_TURNS ?? 25);
  const untilStale = opts.untilStaleRounds ?? Number(process.env.STORM_STALE_ROUNDS ?? 2);

  let turns = 0;
  let staleRounds = 0;
  let anyAdded = false;
  let lastCounts = {
    e: brainstormCtx.events.size,
    c: brainstormCtx.commands.size,
    i: brainstormCtx.integrations.size,
  };

  while (turns < maxTurns && staleRounds < untilStale) {
    try {
      await run(agent, buildObjective(input), {
        context: brainstormCtx,
        maxTurns: 5, // limit internal agent turns per outer loop to keep latency bounded
      });
    } catch (err) {
      // If the inner agent hits its max turns, continue outer loop; rethrow unknown errors
      if (!(err instanceof Error && err.message.includes("Max turns"))) {
        throw err;
      }
    }

    turns++;
    const newCounts = {
      e: brainstormCtx.events.size,
      c: brainstormCtx.commands.size,
      i: brainstormCtx.integrations.size,
    };

    const addedSomething = newCounts.e > lastCounts.e || newCounts.c > lastCounts.c || newCounts.i > lastCounts.i;

    if (addedSomething) {
      anyAdded = true;
      staleRounds = 0; // reset because we made progress
    } else if (anyAdded) {
      // only count stale rounds after at least one addition has occurred
      staleRounds++;
    }
    lastCounts = newCounts;
  }

  // Ensure artefacts are persisted and summary written, even if no new additions occurred
  const { persistStormHandler } = await import("./tools/persistStorm");
  const { summarizeStormHandler } = await import("./tools/summarizeStorm");
  await persistStormHandler({ filename: `${input.contextName}-storm.json` }, { ...brainstormCtx, contextName: input.contextName });
  await summarizeStormHandler({ filename: `${input.contextName}-storm-report.md`, contextName: input.contextName }, { ...brainstormCtx, contextName: input.contextName });

  // signal finish explicitly
  (agent as any).finish?.();

  return {
    events: [...brainstormCtx.events],
    commands: [...brainstormCtx.commands],
    integrationPoints: [...brainstormCtx.integrations],
    notes: brainstormCtx.notes,
  };

}
