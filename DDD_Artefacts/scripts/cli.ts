#!/usr/bin/env tsx
import { Command } from "commander";
import { scanGaps } from "./scanGaps.js";
import { generateBrief } from "./generateBrief.js";
import { buildMatrix } from "./buildMatrix.js";
import { enrichPrds } from "./enrichPrds.js";
import { plantumlStickies } from "./plantumlStickies.js";

const program = new Command("efi-ddd");
program.command("gaps").action(scanGaps);
program
  .command("brief")
  .option("--contexts <list>")
  .action((o) => generateBrief(o.contexts));
program.command("matrix").action(buildMatrix);
program.command("plantuml").action(plantumlStickies);
program.command("enrich").argument("<file>").action(enrichPrds);

program
  .command("all")
  .description("Run gaps → brief → plantuml → matrix in one sweep")
  .option("--contexts <list>", "comma-sep list for brief/plantuml")
  .action(async (opts) => {
    await scanGaps();
    await generateBrief(opts.contexts);
    await plantumlStickies();
    await buildMatrix();
    console.log("🏁 Full automation finished");
  });
program.parse();