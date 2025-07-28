import { z } from "zod";
import { tool } from "@openai/agents";

const logTool = tool({
  name: "log",
  description:
    "Write a message to the injected logger (if available) for debugging or trace purposes.",
  parameters: z
    .object({
      level: z
        .enum(["debug", "info", "warn", "error"]).default("info")
        .describe("Log level"),
      message: z.string().describe("Message to log"),
    })
    .strict(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: async (
    { level, message }: { level: "debug" | "info" | "warn" | "error"; message: string },
    context: any,
  ) => {
    const logger = context.logger ?? console;
    logger[level]?.(message);
    return { logged: true };
  },
});

export default logTool;
