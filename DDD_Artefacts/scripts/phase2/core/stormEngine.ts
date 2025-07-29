import { LoggerPort, LLMPort } from "./ports";
import { brainstormAgents } from "../agents/index.js";

export interface BrainstormInput {
  contextName: string;
  knownEvents: string[];
  knownCommands: string[];
  knownIntegrationPoints: string[];
  panelAgents: { name: string; category: string; expertise?: string[] }[];
  rounds: number;
}

export interface BrainstormOutput {
  events: string[];
  commands: string[];
  integrationPoints: string[];
  notes: string[];
}

/**
 * stormEngine.brainstormContext
 * ----------------------------------
 * Pure core function. Delegates to the SDK-driven brainstormAgents.
 */
export async function brainstormContext(
  input: BrainstormInput,
  ports: { logger: LoggerPort; llm: LLMPort }
): Promise<BrainstormOutput> {
  const { logger, llm } = ports;


  logger.debug(
    `stormEngine (SDK) input for '${input.contextName}': ${JSON.stringify(
      input,
      null,
      2
    )}`
  );
  const result = await brainstormAgents(input, ports, {
    maxTurns: input.rounds * input.panelAgents.length,
  });
  logger.debug(
    `stormEngine (SDK) output for '${input.contextName}': ${JSON.stringify(
      result,
      null,
      2
    )}`
  );
  return result;
}

