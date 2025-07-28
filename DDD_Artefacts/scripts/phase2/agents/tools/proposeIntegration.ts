import { z } from "zod";
import { tool } from "@openai/agents";

const proposeIntegration = tool({
  name: "proposeIntegration",
  description: "Register a suggested bounded-context integration and optional note.",
  parameters: z
  .object({
    point: z.string().describe("Bounded context that should integrate (PascalCase)"),
    note: z.string().nullable().describe("Rationale or comment"),
  })
  .strict(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: async ({ point, note }: { point: string; note?: string | null }, context: any) => {
    // Initialize and normalize integration points into objects
    if (!context.integrations) context.integrations = [];
    const intArr: Array<{ name: string; description: string | null }> =
      Array.isArray(context.integrations) && context.integrations.every((i: any) => i && typeof i === 'object' && 'name' in i)
        ? context.integrations
        : Array.from(context.integrations as any[]).map((i: string) => ({ name: i, description: null }));
    // Add new integration point if missing
    if (!intArr.some((o) => o.name === point)) intArr.push({ name: point, description: note ?? null });
    context.integrations = intArr;
    return { success: true };
  },
});

export default proposeIntegration;
