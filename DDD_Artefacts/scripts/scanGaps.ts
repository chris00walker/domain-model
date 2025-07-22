import fs from "fs";
import chalk from "chalk";
export async function scanGaps() {
  const txt = fs.readFileSync("DDD_Artefacts/README.md", "utf8");
  const rx = /^- (.+?)\s+–\s+📋 Documented But Not Yet Implemented/mgiu;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = rx.exec(txt))) {
    const ctx = m[1];
    out.push(`- [ ] ${ctx}`);
  }
  if (!fs.existsSync(".windsurf/memories")) fs.mkdirSync(".windsurf/memories", { recursive: true });
  fs.writeFileSync(".windsurf/memories/gap-analysis.md", out.join("\n") + "\n");
  console.log(chalk.green(`✔ gap-analysis (${out.length})`));
}