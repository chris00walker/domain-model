import { LLMPort, LoggerPort, ChatMessage } from "./ports";
// When using the OpenAI Agents SDK for Phase-2 refactor, delegate to the new runner
import { brainstormAgents as brainstormWithSdk } from "../agents/index.js";

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

interface Ports {
  llm: LLMPort;
  logger: LoggerPort;
}

/**
 * stormEngine.brainstormContext
 * ----------------------------------
 * Pure core function.  Given the current board state for a bounded‐context and
 * a list of expert agents, calls the injected LLM port to obtain incremental
 * contributions and returns the enriched artefacts.
 */
export async function brainstormContext(
  input: BrainstormInput,
  ports: Ports,
): Promise<BrainstormOutput> {
  const { llm, logger } = ports;
  // Toggle to new agent implementation if env flag is set
  if (process.env.AGENT_IMPL?.toLowerCase?.() === "openai") {
    // SDK runner does not require the LLM port, only logger for tracing
    logger.debug(`stormEngine (SDK) input for '${input.contextName}': ${JSON.stringify(input, null, 2)}`);
    const sdkOut = await brainstormWithSdk(input, { logger });
    logger.debug(`stormEngine (SDK) output for '${input.contextName}': ${JSON.stringify(sdkOut, null, 2)}`);
    return sdkOut;
  }
  const events = new Set(input.knownEvents);
  const commands = new Set(input.knownCommands);
  const integration = new Set(input.knownIntegrationPoints);
  const notes: string[] = [];

  // Legacy implementation retained below
  // Helper to call the LLM port and parse JSON response
  async function chat(model: string, messages: ChatMessage[]): Promise<any> {
    const content = await llm.chatCompletion(model, messages, 0.7);
    if (process.env.LLM_DEBUG === "1") {
      logger.debug(`RAW LLM → ${content.slice(0, 200)}`);
    }
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return {};
    try {
      return JSON.parse(match[0]);
    } catch (e) {
      return {};
    }
  }

  // Discussion rounds for events & commands ---------------------------------
  for (let r = 0; r < input.rounds; r++) {
    for (const agent of input.panelAgents) {
      const msgs: ChatMessage[] = [
        {
          role: "system",
          content: `You are ${agent.name}, a ${agent.category} domain expert participating in an Event-Storming workshop for the \"${input.contextName}\" bounded context at Elias Food Imports. Your expertise keywords: ${(agent.expertise || []).join(", ")}. Respond **only** with valid JSON.`,
        },
        {
          role: "user",
          content: `KnownEvents: ${Array.from(events).join(", ") || "none"}\nKnownCommands: ${Array.from(commands).join(", ") || "none"}\n\nTASK: Propose ONE new business domain event (PascalCase, no spaces) and ONE corresponding application command (PascalCase, no spaces) that might trigger it. Also add a short rationale.\n\nReturn JSON with keys event, command, note.`,
        },
      ];
      const resp = await chat("gpt-4o-mini", msgs);
      if (resp.event) events.add(resp.event);
      if (resp.command) commands.add(resp.command);
      if (resp.note) notes.push(resp.note);
    }
  }

  // Integration brainstorming ------------------------------------------------
  for (const agent of input.panelAgents) {
    const msgs: ChatMessage[] = [
      { role: "system", content: `You are ${agent.name}, a ${agent.category} domain expert focused on system integration. Respond ONLY with JSON.` },
      { role: "user", content: `KnownIntegrationPoints: ${Array.from(integration).join(", ") || "none"}\n\nTASK: Propose ONE bounded context that should integrate with ${input.contextName}. Use PascalCase with no spaces. Provide a short rationale. Return JSON with keys point, note.` },
    ];
    const resp = await chat("gpt-4o-mini", msgs);
    if (resp.point) integration.add(resp.point);
    if (resp.note) notes.push(resp.note);
  }

  logger.debug(`Brainstorm complete for ${input.contextName}: +${events.size - input.knownEvents.length} events, +${commands.size - input.knownCommands.length} commands, +${integration.size - input.knownIntegrationPoints.length} integrations.`);

  return {
    events: Array.from(events),
    commands: Array.from(commands),
    integrationPoints: Array.from(integration),
    notes,
  };
}
