#!/usr/bin/env tsx
import "dotenv/config";
import "../../../logs/tracing-to-windsurf";
import { Command } from "commander";
import { discoverPhase1 } from "../agents/index.js";
import { ChalkConsoleLogger } from "../../phase2/infra/chalkConsoleLogger";

const program = new Command();
program
  .option("--max <n>", "Maximum agent turns")
  .option("--context <name>", "Run only the specified context filter");
program.parse(process.argv);

const opts = program.opts<{ max?: string; context?: string }>();
const input = { contextFilter: opts.context };
const logger = ChalkConsoleLogger;

discoverPhase1(
  input,
  { logger },
  { maxTurns: opts.max ? Number(opts.max) : undefined }
)
  .then(() => {
    console.log("✅ Phase 1 discovery completed.");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
