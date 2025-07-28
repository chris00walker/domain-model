#!/usr/bin/env tsx
import { Command } from "commander";
import { scanGaps } from './phase1/scanGaps';
import { generateBrief } from './phase1/generateBrief';
import { buildMatrix } from './phase1/buildMatrix';
import { prepareSession } from './phase1/prepareSession';
import { planImplementation } from './phase1/planImplementation';
import { orchestrateDomain } from './phase1/orchestrateDomain';

const program = new Command("efi-ddd");

// Global option to switch agent implementation (legacy or openai)
program
  .option("--agent <impl>", "Agent implementation to use (legacy|openai)", "legacy")
  .option("--max <n>", "Maximum brainstorming turns", (v) => parseInt(v, 10))
  .option("--stale <n>", "Consecutive stale rounds before stop", (v) => parseInt(v, 10));

// Core analysis commands
program.command("gaps").description("Scan for documented but unimplemented contexts").action(scanGaps);
program
  .command("brief")
  .description("Generate AI agent validation briefs")
  .option("--contexts <list>", "Filter contexts (comma-separated)")
  .action((o) => generateBrief(o.contexts));
program.command("matrix").description("Build context dependency matrix").action(buildMatrix);

// Event Storming and Implementation Planning
program
  .command("session")
  .description("Prepare Event Storming session materials")
  .option("--context <name>", "Focus on specific context")
  .action((o) => prepareSession(o.context));
program.command("plan").description("Generate implementation plan with effort estimates").action(planImplementation);

// Complete Domain Orchestration
program
  .command("orchestrate")
  .description("Generate complete Eric Evans-style domain modeling workflow for all contexts")
  .action(orchestrateDomain);

// Complete workflow
program
  .command("all")
  .description("Run complete Eric Evans-style domain workflow: gaps → brief → matrix → orchestration")
  .option("--contexts <list>", "Filter contexts for brief generation")
  .action(async (opts) => {
    await scanGaps();
    await generateBrief(opts.contexts);
    await buildMatrix();
    await orchestrateDomain();
    console.log("🏁 Complete domain modeling workflow ready");
    console.log("📋 Review DDD_Artefacts/docs/analysis/phase1/domain-orchestration-plan.md for comprehensive session planning");
  });

// Apply global options before executing commands
interface ProgramOpts {
  agent?: string;
  max?: number;
  stale?: number;
}

const opts = program.opts<ProgramOpts>();
if (opts.agent) {
  process.env.AGENT_IMPL = opts.agent;
}
if (typeof opts.max === "number") {
  process.env.STORM_MAX_TURNS = String(opts.max);
}
if (typeof opts.stale === "number") {
  process.env.STORM_STALE_ROUNDS = String(opts.stale);
}

program.parse();