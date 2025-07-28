import path from "path";
import { FileSystemPort, LoggerPort } from "./ports";

/**
 * buildVersionedContextMap
 * -----------------------
 * Generates a new versioned context-map PlantUML diagram by
 *  1. Reading the canonical template (`context_map.puml`).
 *  2. Collecting all arrow lines ("ClassA --> ClassB") produced by the
 *     virtual-storm output files (one "*-storm.puml" per bounded context).
 *  3. Comparing with arrows already present in the template so that ONLY
 *     new interactions are injected.
 *  4. When both endpoints of a new arrow live inside an existing template
 *     rectangle, the arrow is inserted inside that rectangle; otherwise it
 *     is appended just before `@enduml`.
 *  5. Writes a new versioned file `context_mapv<n>.puml` when there is any
 *     delta.
 *
 * Params:
 *   rootDir      – absolute path to the project root (used to derive paths)
 *   stormOutDir  – directory containing the per-context `*-storm.puml` files
 */
export function buildVersionedContextMap(
  rootDir: string,
  stormOutDir: string,
  fsPort: FileSystemPort,
  logger: LoggerPort,
) {
  const DIAGRAM_DIR = path.join(rootDir, "DDD_Artefacts", "docs", "diagrams");
  const TEMPLATE_FILE = path.join(DIAGRAM_DIR, "context_map.puml");
  if (!fsPort.exists(DIAGRAM_DIR) || !fsPort.exists(TEMPLATE_FILE)) return;
  const stormFiles = fsPort.list(stormOutDir).filter((f) => f.endsWith("-storm.puml"));
  if (!stormFiles.length) return;

  // ------------------------------------------------------------------
  // 1. Collect arrows from storm outputs
  // ------------------------------------------------------------------
  const arrowRegex = /(\w+)\s+[-]+[x\-*o]?\s*>\s*(\w+)/;
  const stormArrows = new Set<string>();
  for (const file of stormFiles) {
    const lines = fsPort.readUtf8(path.join(stormOutDir, file)).split(/\r?\n/);
    lines.forEach((l) => {
      if (arrowRegex.test(l)) stormArrows.add(l.trim());
    });
  }
  if (!stormArrows.size) return;

  // ------------------------------------------------------------------
  // 2. Parse the template into rectangles / aliases / existing arrows
  // ------------------------------------------------------------------
  // Determine latest existing version (if any) to use as comparison baseline
  const versionFiles = fsPort
    .list(DIAGRAM_DIR)
    .filter((f) => /^context_mapv(\d+)\.puml$/.test(f));
  const latestVerNum = versionFiles.length
    ? Math.max(...versionFiles.map((f) => parseInt(f.match(/^context_mapv(\d+)\.puml$/)![1], 10)))
    : 0;
  const latestVerFile = latestVerNum
    ? path.join(DIAGRAM_DIR, `context_mapv${latestVerNum}.puml`)
    : null;

  const baseFile = latestVerFile ?? TEMPLATE_FILE;
  const baseLines = fsPort.readUtf8(baseFile).split(/\r?\n/);

  interface RectInfo {
    start: number; // opening line idx
    end: number; // closing brace line idx
    aliases: Set<string>; // aliases defined inside
  }
  const rectangles: RectInfo[] = [];
  const aliasToRect = new Map<string, RectInfo>();
  const existingArrows = new Set<string>();

  const stack: RectInfo[] = [];
  baseLines.forEach((line, idx) => {
    const open = line.match(/^\s*rectangle\s+"[^"]+".*\{\s*$/);
    if (open) {
      const rect: RectInfo = { start: idx, end: -1, aliases: new Set() };
      rectangles.push(rect);
      stack.push(rect);
      return;
    }
    if (/^\s*}\s*$/.test(line) && stack.length) {
      stack.pop()!.end = idx;
      return;
    }
    if (arrowRegex.test(line)) existingArrows.add(line.trim());

    // alias definitions
    let m = line.match(/\[[^]]+\]\s+as\s+(\w+)/i);
    if (m) {
      const alias = m[1];
      const current = stack[stack.length - 1];
      if (current) current.aliases.add(alias);
      aliasToRect.set(alias, current!);
    }
    m = line.match(/^\s*class\s+(\w+)/);
    if (m) {
      const alias = m[1];
      const current = stack[stack.length - 1];
      if (current) current.aliases.add(alias);
      aliasToRect.set(alias, current!);
    }
  });

  // ------------------------------------------------------------------
  // 3. Determine delta
  // ------------------------------------------------------------------
  const deltaArrows = Array.from(stormArrows).filter((a) => !existingArrows.has(a));
  if (!deltaArrows.length) {
    logger.info("🗺️  No new interactions – context map unchanged");
    return;
  }

  // ------------------------------------------------------------------
  // 4. Group insertions
  // ------------------------------------------------------------------
  const rectInsert = new Map<RectInfo, string[]>();
  const globalArrows: string[] = [];

  deltaArrows.forEach((a) => {
    const m = a.match(arrowRegex);
    if (!m) return;
    const left = m[1], right = m[2];
    const leftRect = aliasToRect.get(left);
    const rightRect = aliasToRect.get(right);
    if (leftRect && rightRect && leftRect === rightRect) {
      if (!rectInsert.has(leftRect)) rectInsert.set(leftRect, []);
      rectInsert.get(leftRect)!.push(a);
    } else {
      globalArrows.push(a);
    }
  });

  // ------------------------------------------------------------------
  // 5. Build updated lines
  // ------------------------------------------------------------------
  const updated = [...baseLines];

  // Insert inside rectangles (before closing brace)
  rectangles.forEach((rect) => {
    const add = rectInsert.get(rect);
    if (add && add.length) {
      updated.splice(rect.end, 0, ...add.sort());
      const delta = add.length;
      rectangles.forEach((r) => {
        if (r.start > rect.end) {
          r.start += delta;
          r.end += delta;
        }
      });
    }
  });

  // Append cross-rectangle arrows before @enduml
  const endumlIdx = updated.findIndex((l) => l.trim().startsWith("@enduml"));
  updated.splice(endumlIdx, 0, ...globalArrows.sort());

  // ------------------------------------------------------------------
  // 6. Write versioned file
  // ------------------------------------------------------------------
  const nextVer = latestVerNum + 1 || 1;
  const outPath = path.join(DIAGRAM_DIR, `context_mapv${nextVer}.puml`);
  fsPort.writeUtf8(outPath, updated.join("\n"));
  logger.info(`🗺️  Context map updated – docs/diagrams/context_mapv${nextVer}.puml`);
}
