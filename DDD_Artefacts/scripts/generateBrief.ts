import fs from "fs";
import yaml from "js-yaml";
import slugify from "slugify";
export async function generateBrief(filter?: string) {
  const roster = yaml.load(fs.readFileSync("automation/roster.yaml", "utf8")) as any;
  const tmpl = fs.readFileSync(roster.meta.brief_template, "utf8");
  const set = filter?.split(",").map((s) => s.trim()) ?? null;
  let md = "# Comprehensive Event‑Storming Brief – EFI\n\n";
  for (const [cat, list] of Object.entries<string[]>(roster.roster)) {
    md += `## ${cat} Context\n\n`;
    if (set && !set.includes(slugify(cat, { lower: true }))) continue;
    for (const ag of list) md += tmpl.replace(/{{agent}}/g, ag) + "\n";
  }
  fs.writeFileSync("DDD_Artefacts/event-storming-brief.md", md);
  console.log("✔ brief generated");
}