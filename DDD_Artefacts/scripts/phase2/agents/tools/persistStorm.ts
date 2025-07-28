import { z } from "zod";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function persistStormHandler(
  { filename }: { filename: string | null | undefined },
  context: any,
) {
  try {
    // Normalize events into objects
    const eventsArr: Array<{ name: string; description: string | null }> =
      Array.isArray(context.events) && context.events.every((e: any) => e && typeof e === 'object' && 'name' in e)
        ? context.events
        : (Array.from(context.events ?? []) as string[]).map((e: string) => ({ name: e, description: null }));
    // Normalize commands into objects
    const commandsArr: Array<{ name: string; description: string | null }> =
      Array.isArray(context.commands) && context.commands.every((c: any) => c && typeof c === 'object' && 'name' in c)
        ? context.commands
        : (Array.from(context.commands ?? []) as string[]).map((c: string) => ({ name: c, description: null }));
    // Normalize integration points into objects
    const integrationPointsArr: Array<{ name: string; description: string | null }> =
      Array.isArray(context.integrations) && context.integrations.every((i: any) => i && typeof i === 'object' && 'name' in i)
        ? context.integrations
        : (Array.from(context.integrations ?? []) as string[]).map((i: string) => ({ name: i, description: null }));
    const data = {
      events: eventsArr,
      commands: commandsArr,
      integrationPoints: integrationPointsArr,
      generatedAt: new Date().toISOString(),
    };

    const fileName = (filename ?? undefined) || `storm-${Date.now()}.json`;
    const legacyDir = path.resolve(process.cwd(), "DDD_Artefacts", "docs", "analysis", "virtual-storm");
    await mkdir(legacyDir, { recursive: true });
    const filePath = path.resolve(legacyDir, fileName);
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    context.logger?.info?.(`Storm artefact saved to ${filePath}`);

    if (typeof context.agent?.finish === "function") {
      context.agent.finish();
    }

    return { savedAs: filePath };
  } catch (err) {
    context.logger?.error?.(err);
    throw err;
  }
}

import { tool } from "@openai/agents";

const persistStorm = tool({
  name: "persistStorm",
  description:
    "Persist brainstorming context (events, commands, integrations, notes) to JSON on disk and mark the session as finished.",
  parameters: z
    .object({
      /** Optional file name for the output artifact. Defaults to `storm-<timestamp>.json` in the current working directory */
      filename: z
        .string()
        .nullable()
        .describe(
          "Optional file name for the output artifact relative to process.cwd()"
        ),
    })
    .strict(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: persistStormHandler,
});

export default persistStorm;
