import fs from "fs";
import chalk from "chalk";
export async function scanGaps() {
  const txt = fs.readFileSync("DDD_Artefacts/README.md", "utf8");
    const out: string[] = [];
  // Locate the section header
  const lines = txt.split(/\r?\n/);
  const start = lines.findIndex((l) => l.toLowerCase().includes("documented but not yet implemented"));
  if (start !== -1) {
    for (let i = start + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("#")) break; // end of section
      if (line === "") continue;
      const m = /^- \*\*(.+?)\*\*/.exec(line);
      if (m) out.push(`- [ ] ${m[1].trim()}`);
    }
  }
  if (out.length === 0) {
    console.log(chalk.yellow("⚠ No documented gaps found. Ensure README section exists."));
  }
  if (!fs.existsSync(".windsurf/memories")) fs.mkdirSync(".windsurf/memories", { recursive: true });
  fs.writeFileSync(".windsurf/memories/gap-analysis.md", out.join("\n") + "\n");
  console.log(chalk.green(`✔ gap-analysis (${out.length})`));
}