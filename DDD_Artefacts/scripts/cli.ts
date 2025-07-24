#!/usr/bin/env tsx
import { Command } from "commander";
import { scanGaps } from './scanGaps';
import { generateBrief } from './generateBrief';
import { buildMatrix } from './buildMatrix';
import { prepareSession } from './prepareSession';
import { planImplementation } from './planImplementation';
import { orchestrateDomain } from './orchestrateDomain';

const program = new Command("efi-ddd");

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
    console.log("📋 Review DDD_Artefacts/domain-orchestration-plan.md for comprehensive session planning");
  });

program.parse();