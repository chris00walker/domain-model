import { z } from "zod";
import { writeFile as fsWriteFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { tool } from "@openai/agents";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function writeFileHandler(
  { filePath, content }: { filePath: string; content: string },
  context: any
) {
  try {
    const dir = path.dirname(filePath);
    await mkdir(dir, { recursive: true });
    await fsWriteFile(filePath, content, "utf-8");
    context.logger?.info?.(`File written to ${filePath}`);
    return { savedAs: filePath };
  } catch (err) {
    context.logger?.error?.(err);
    throw err;
  }
}

const writeFileTool = tool({
  name: "writeFile",
  description: "Write content to a UTF-8 file, creating parent directories if needed.",
  parameters: z
    .object({
      filePath: z.string().describe("Path to file to write"),
      content: z.string().describe("Content to write to file"),
    })
    .strict(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: writeFileHandler,
});

export default writeFileTool;
