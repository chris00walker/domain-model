import { z } from "zod";
import { readFile as fsReadFile } from "node:fs/promises";
import { tool } from "@openai/agents";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readFileHandler(
  { filePath }: { filePath: string },
  context: any
) {
  try {
    const content = await fsReadFile(filePath, "utf-8");
    return { content };
  } catch (err) {
    context.logger?.error?.(err);
    throw err;
  }
}

const readFileTool = tool({
  name: "readFile",
  description: "Read a UTF-8 file and return its content as string.",
  parameters: z
    .object({
      filePath: z.string().describe("Path to the file to read"),
    })
    .strict(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: readFileHandler,
});

export default readFileTool;
