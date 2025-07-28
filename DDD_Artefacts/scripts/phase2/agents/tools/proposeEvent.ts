import { z } from "zod";
import { tool } from "@openai/agents";

const proposeEvent = tool({
  name: "proposeEvent",
  description:
    "Add one event, command and optional note to brainstorming context.",
  parameters: z
    .object({
    event: z.string().describe("Domain event in PascalCase"),
    command: z.string().describe("Triggering command in PascalCase"),
    note: z.string().nullable().describe("Rationale or comment"),
  })
    .strict(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: async (
    { event, command, note }: { event: string; command: string; note?: string | null },
    context: any,
  ) => {
    // Initialize and normalize events to objects
    if (!context.events) context.events = [];
    const evArr: Array<{ name: string; description: string | null }> =
      Array.isArray(context.events) && context.events.every((e: any) => e && typeof e === 'object' && 'name' in e)
        ? context.events
        : Array.from(context.events as any[]).map((e: string) => ({ name: e, description: null }));
    // Initialize and normalize commands to objects
    if (!context.commands) context.commands = [];
    const cmdArr: Array<{ name: string; description: string | null }> =
      Array.isArray(context.commands) && context.commands.every((c: any) => c && typeof c === 'object' && 'name' in c)
        ? context.commands
        : Array.from(context.commands as any[]).map((c: string) => ({ name: c, description: null }));
    // Add new event if missing
    if (!evArr.some((o) => o.name === event)) evArr.push({ name: event, description: note ?? null });
    // Add new command if missing
    if (!cmdArr.some((o) => o.name === command)) cmdArr.push({ name: command, description: note ?? null });
    context.events = evArr;
    context.commands = cmdArr;
    return { success: true };
  },

});

export default proposeEvent;
