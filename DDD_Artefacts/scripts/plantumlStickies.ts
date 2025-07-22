import fs from "fs";
import chalk from "chalk";
export async function plantumlStickies() {
  const brief = fs.readFileSync("DDD_Artefacts/event-storming-brief.md", "utf8");
  const agents = [...brief.matchAll(/^### (.+)$/gm)].map((m) => m[1]);
  let puml = "@startuml\nskinparam handwritten true\nleft to right direction\n'; generated stickies\n";
  agents.forEach((a, i) => {
    const y = i * 150;
    puml += `rectangle \"${a}\" as A${i} << (S,orchid) Sticky >> { }\n`;
    puml += `A${i} -[hidden]-> A${i}\n`; // keep layout tidy
  });
  puml += "@enduml\n";
  fs.writeFileSync("DDD_Artefacts/event-storming-sticky.puml", puml);
  console.log(chalk.green("✔ plantuml stickies generated"));
}