import { BrainstormInput } from "../index";

/**
 * Build the objective string passed to the OpenAI agent. This describes the overall
 * goal of the brainstorming session in natural language.
 */
export function buildObjective(input: BrainstormInput): string {
  const roster = input.panelAgents
    .map((a) => `${a.name} (${a.category})`)
    .join(", ");

  return `You are facilitating a virtual Event-Storming workshop for the \"${input.contextName}\" bounded context at Elias Food Imports (EFI).

Context:
• Existing events: ${input.knownEvents.join(", ") || "none"}
• Existing commands: ${input.knownCommands.join(", ") || "none"}
• Existing integration points: ${input.knownIntegrationPoints.join(", ") || "none"}
• Expert panel: ${roster}

Goal: Collaboratively propose NEW business domain events, corresponding application commands, and potential bounded-context integrations that enrich the domain model while avoiding duplicates.

Rules:
1. Use the available tools (proposeEvent, proposeIntegration, persistStorm, log) instead of free-form JSON.
2. Continue proposing until the quota is met or persistStorm is called.
3. Rationale can be captured in the optional note field of each tool call.
4. When finished, call persistStorm to write artefacts and end the session.`;
}
