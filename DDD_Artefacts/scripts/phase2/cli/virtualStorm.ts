#!/usr/bin/env tsx
import "dotenv/config";
import "../../logs/tracing-to-windsurf";
import path from "path";
import { Command } from "commander";
const program = new Command();
program
  .option("--agent <impl>", "Agent implementation (legacy|openai)")
  .option("--max <n>", "Maximum brainstorming turns")
  .option("--stale <n>", "Consecutive stale rounds before stop")
  .option("--context <name>", "Run only the specified bounded context");
program.parse(process.argv);
const opts = program.opts<{
  agent?: string;
  max?: string;
  stale?: string;
  context?: string;
}>();
if (opts.agent) process.env.AGENT_IMPL = opts.agent;
if (opts.max) process.env.STORM_MAX_TURNS = opts.max;
if (opts.stale) process.env.STORM_STALE_ROUNDS = opts.stale;
if (opts.context) process.env.STORM_CONTEXT_FILTER = opts.context;

const ROOT = process.cwd();
import { runVirtualStormSession } from "../core/stormSession";
import { NodeFileSystem } from "../infra/nodeFileSystem";
import { ChalkConsoleLogger } from "../infra/chalkConsoleLogger";
import { OpenAiLLM } from "../infra/openAiLLM";



runVirtualStormSession(ROOT, { fs: NodeFileSystem, logger: ChalkConsoleLogger, llm: OpenAiLLM }, process.env.STORM_CONTEXT_FILTER).catch((err) => {
  console.error(err);
  process.exit(1);
});
