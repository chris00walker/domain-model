import { z } from "zod";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { tool } from "@openai/agents";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function summarizeStormHandler(
  args: { filename: string | null; contextName: string | null },
  context: any,
) {
  const { filename, contextName } = args ?? {
    filename: null,
    contextName: null,
  };
  const ctxName = contextName ?? context?.contextName ?? "storm";

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
  const integrationsArr: Array<{ name: string; description: string | null }> =
    Array.isArray(context.integrations) && context.integrations.every((i: any) => i && typeof i === 'object' && 'name' in i)
      ? context.integrations
      : (Array.from(context.integrations ?? []) as string[]).map((i: string) => ({ name: i, description: null }));

  const markdown = `# ${ctxName} Storm Summary\n\n` +
    `## Events\n` + (eventsArr.length ? eventsArr.map((o) => `- ${o.name}${o.description ? `: ${o.description}` : ''}`).join("\n") : "_None_") + "\n\n" +
    `## Commands\n` + (commandsArr.length ? commandsArr.map((o) => `- ${o.name}${o.description ? `: ${o.description}` : ''}`).join("\n") : "_None_") + "\n\n" +
    `## Integrations\n` + (integrationsArr.length ? integrationsArr.map((o) => `- ${o.name}${o.description ? `: ${o.description}` : ''}`).join("\n") : "_None_") + "\n";

  const legacyDir = path.resolve(
    process.cwd(),
    "DDD_Artefacts",
    "docs",
    "analysis",
    "virtual-storm",
  );
  await mkdir(legacyDir, { recursive: true });
  const filePath = path.join(
    legacyDir,
    filename ?? `${ctxName}-storm-report.md`,
  );
  await writeFile(filePath, markdown, "utf-8");
  context.logger?.info?.(`Summary report saved to ${filePath}`);

  return { savedAs: filePath };
}

const summarizeStorm = tool({
  name: "summarizeStorm",
  description:
    "Generate a markdown summary for the current event storm session and write it to disk.",
  parameters: z
    .object({
      filename: z.string().nullable(),
      contextName: z.string().nullable(),
    })
    .strict(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: summarizeStormHandler,
});

export default summarizeStorm;
