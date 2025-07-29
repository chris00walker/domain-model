import fs from "node:fs";

/**
 * Extracts documented but not yet implemented items from README and returns
 * a markdown list of gaps.
 */
export function scanGapsCore(readmePath = "DDD_Artefacts/README.md"): string {
  const txt = fs.readFileSync(readmePath, "utf8");
  const lines = txt.split(/\r?\n/);
  const start = lines.findIndex(l =>
    l.toLowerCase().includes("documented but not yet implemented")
  );
  const out: string[] = [];

  if (start !== -1) {
    for (let i = start + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith("#")) break;
      if (line === "") continue;
      const m = /^- \*\*(.+?)\*\*/.exec(line);
      if (m) out.push(`- [ ] ${m[1].trim()}`);
    }
  }

  return out.join("\n") + "\n";
}
