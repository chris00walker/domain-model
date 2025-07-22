import fs from "fs";
export async function buildMatrix() {
  const md = fs.readFileSync("DDD_Artefacts/event-storming-brief.md", "utf8");
  const rxAgent = /^### (.+)$/gm;
  const agents: string[] = [];
  const eventsBy: Record<string, string[]> = {};
  let m: RegExpExecArray | null;
  while ((m = rxAgent.exec(md))) {
    const agent = m[1];
    const slice = md.slice(m.index).split("\n").slice(0, 20).join("\n");
    const evts = [...slice.matchAll(/\*\*(.+?)\*\*/g)].map((e) => e[1]);
    agents.push(agent);
    eventsBy[agent] = evts;
  }
  const allEv = [...new Set(Object.values(eventsBy).flat())];
  let tbl = `## Dependency Matrix\n\n| Agent \\ Event | ${allEv.join(" | ")} |\n| --- | ${allEv.map(() => "---").join(" | ")} |\n`;
  agents.forEach((ag) => {
    tbl += `| ${ag} | ${allEv.map((e) => (eventsBy[ag].includes(e) ? "✅" : " ")).join(" | ")} |\n`;
  });
  fs.writeFileSync("DDD_Artefacts/event-dependency-matrix.md", tbl);
  console.log("✔ matrix built");
}