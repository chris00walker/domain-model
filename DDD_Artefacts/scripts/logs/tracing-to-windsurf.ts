import { addTraceProcessor, getGlobalTraceProvider, Trace, Span as OpenAiSpan } from "@openai/agents";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Registers an OpenAI Agents SDK trace processor that persists every trace to
 * `DDD_Artefacts/scripts/traces/<trace_id>.json` so they are easy to inspect in
 * Windsurf (and ignored by git via .gitignore).
 *
 * Usage: just import this file once at the top of any CLI entry point:
 *   import "../../logs/tracing-to-windsurf";
 *
 * Optionally, set `AGENTS_TRACE_DIR` env var to change the output folder.
 */
export function registerWindsurfTraceSink() {
  // Prevent double–registration (useful when running tests with --watch)
  if ((global as any).__WINDSURF_TRACE_SINK__) return;
  (global as any).__WINDSURF_TRACE_SINK__ = true;

  const traceDir = process.env.AGENTS_TRACE_DIR ?? path.resolve("DDD_Artefacts", "scripts", "logs");

  addTraceProcessor({
    async onTraceStart(_trace: Trace): Promise<void> { /* noop */ },
    async onTraceEnd(trace: Trace) {
      await fs.mkdir(traceDir, { recursive: true });
      const file = path.join(traceDir, `${trace.traceId}.json`);
      await fs.writeFile(file, JSON.stringify(trace, null, 2));
    },
    async onSpanStart(_span: OpenAiSpan<any>): Promise<void> { /* noop */ },
    async onSpanEnd(_span: OpenAiSpan<any>): Promise<void> { /* noop */ },
    async shutdown(): Promise<void> { /* noop */ },
    async forceFlush(): Promise<void> { /* noop */ },
  } as any);

  // Ensure all spans are flushed on process exit.
  process.on("beforeExit", async () => {
    try {
      await getGlobalTraceProvider().forceFlush();
    } catch {
      /* ignore */
    }
  });
}

// Auto-register immediately so side-effect only import works.
registerWindsurfTraceSink();
