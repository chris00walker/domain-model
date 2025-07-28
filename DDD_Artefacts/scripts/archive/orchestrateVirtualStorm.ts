import "dotenv/config";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import OpenAI from "openai";
import yaml from "js-yaml";
import { extractFunctionalRoles, resolveAgentsForRoles } from "./agentMatcher";
import { buildVersionedContextMap } from "./core/contextMapBuilder";
import { NodeFileSystem } from "./infra/nodeFileSystem";
import { runVirtualStormSession } from "./core/stormSession";
import { OpenAiLLM } from "./infra/openAiLLM";
import { ChalkConsoleLogger } from "./infra/chalkConsoleLogger";

/*
  orchestrateVirtualStorm.ts
  -------------------------
  Drives a virtual Event-Storming session for each bounded context using OpenAI agent personas listed in `automation/roster.yaml`.
  Requires an `OPENAI_API_KEY`; if absent the script falls back to lightweight stubbed responses for offline testability.
  Focuses on orchestration, persistent artefact generation, and usage-cache management while delegating domain reasoning to the LLM agents.
*/

/** TYPES *************************************************************/

interface RawAgent {
  name: string;
  category: string;
  expertise?: string[];
  contexts?: string[];
}

function panelNames(out: StormOutput): string {
  return (out as any).panel?.join(", ") || "";
}

interface StormOutput {
  panel?: string[];
  context: string;
  events: string[];
  commands: string[];
  notes: string[];
  integrationPoints: string[];
  nextSteps: string[];
}

/** CONSTANTS *********************************************************/

const ROOT = path.resolve(__dirname, "../..");
// Persistent usage counter cache
const CACHE_PATH = path.join(ROOT, ".storm-cache.json");
const ROSTER_PATH = path.join(ROOT, "DDD_Artefacts", "automation", "roster.yaml");
let usageCount: Record<string, number> = (() => {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
})();
const PREP_PATH = path.join(ROOT, "DDD_Artefacts", "event-storming-session-prep.md");
const OUT_DIR = path.join(ROOT, "DDD_Artefacts", "virtual-storm");
const DEP_MATRIX_PATH = path.join(ROOT, "DDD_Artefacts", "event-dependency-matrix.md");
const PLAN_PATH = path.join(ROOT, "DDD_Artefacts", "domain-orchestration-plan.md");
const IMPL_PLAN_PATH = path.join(ROOT, "DDD_Artefacts", "implementation-plan.md");
const BRIEF_PATH = path.join(ROOT, "DDD_Artefacts", "event-storming-brief.md");

/** UTILITIES *********************************************************/

// shared normalisation helpers
function slugContext(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normKey(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function pascalCase(name: string): string {
  // Split on underscores, spaces, and lowerUpper boundaries then capitalise
  const tokens: string[] = name
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → camel Case
    .split(/[^a-zA-Z0-9]+/) // underscores, spaces etc.
    .filter(Boolean);
  return tokens.map(t => t[0].toUpperCase() + t.slice(1).toLowerCase()).join("");

}

function loadRoster(): RawAgent[] {
  if (!fs.existsSync(ROSTER_PATH)) throw new Error("roster.yaml not found");
  const doc = yaml.load(fs.readFileSync(ROSTER_PATH, "utf8")) as any;
  return doc?.agents || [];
}

function parsePrepFile(): Record<string, { events: string[]; commands: string[]; integration: string[]; assignedAgents: string[] }> {
  if (!fs.existsSync(PREP_PATH)) throw new Error("event-storming-session-prep.md not found. Run `npm run session` first.");
  const md = fs.readFileSync(PREP_PATH, "utf8");
  const contextBlocks = md.split(/##\s+/).slice(1); // skip header before first context
  const map: Record<string, any> = {};

  contextBlocks.forEach(block => {
    const lines = block.split(/\r?\n/);
    const header = lines[0];
    const ctxMatch = header.match(/([^\s]+)\s+-\s+Session Brief/i);
    if (!ctxMatch) return;
    const contextName = slugContext(ctxMatch[1]);

    const events: string[] = [];
    const commands: string[] = [];
    const integration: string[] = [];
    const assignedAgents: string[] = [];

    let section: "none" | "events" | "commands" | "integration" | "agents" = "none";

    lines.forEach(l => {
      if (l.includes("Known Domain Events")) section = "events";
      else if (l.includes("Known Commands")) section = "commands";
      else if (l.includes("Integration Points")) section = "integration";
      else if (l.includes("Assigned Agents")) section = "agents";
      else if (l.startsWith("###")) section = "none";
      else if (l.startsWith("- ")) {
        if (l.trim() === "- -" || l.trim() === "-" ) return; // skip placeholder
        const text = l.replace(/^- \*\*?/, "").replace(/\*\*?$/, "").trim();
        switch (section) {
          case "events":
            events.push(text.split(" ")[0]);
            break;
          case "commands":
            commands.push(text.split(" ")[0]);
            break;
          case "integration":
            if (text && text !== "-") integration.push(text);
            break;
          case "agents":
            assignedAgents.push(text.split(" (")[0]);
            break;
        }
      }
    });

    map[contextName] = { events, commands, integration, assignedAgents };
  });

  return map;
}

/** Parses event-dependency-matrix.md for upstream/downstream relations */
function parseDependencyMatrix(): Record<string, { upstream: string[]; downstream: string[] }> {
  if (!fs.existsSync(DEP_MATRIX_PATH)) return {};
  const md = fs.readFileSync(DEP_MATRIX_PATH, "utf8");
  const lines = md.split(/\r?\n/).filter(l => l.trim().startsWith("|"));
  const map: Record<string, { upstream: string[]; downstream: string[] }> = {};
  lines.forEach(l => {
    const cols = l.split("|").map(c => c.trim());
    if (cols.length < 6 || cols[1].toLowerCase() === "context" || cols[1] === "---") return;
    const ctx = slugContext(cols[1].replace(/\*\*|`/g, ""));
    const upstream = cols[3] ? cols[3].split(/,\s*/).filter(Boolean).map(s => s.toLowerCase()) : [];
    const downstream = cols[4] ? cols[4].split(/,\s*/).filter(Boolean).map(s => s.toLowerCase()) : [];
    map[ctx] = { upstream, downstream };
  });
  return map;
}

/** Parses domain-orchestration-plan.md for agents and duration per context */
function parseOrchestrationPlan(): Record<string, { agents: string[]; durationHours: number }> {
  if (!fs.existsSync(PLAN_PATH)) return {};
  const md = fs.readFileSync(PLAN_PATH, "utf8");
  const lines = md.split(/\r?\n/);
  const map: Record<string, { agents: string[]; durationHours: number }> = {};
  let current: string | null = null;
  let agents: string[] = [];
  let duration = 1;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const ctxMatch = l.match(/^###\s+([A-Z][A-Z _-]+)/);
    if (ctxMatch) {
      if (current) {
        map[current] = { agents, durationHours: duration };
      }
      current = slugContext(ctxMatch[1]);
      agents = [];
      duration = 1;
      continue;
    }
    if (!current) continue;
    const durMatch = l.match(/\*\*Duration\*\*:\s*(\d+)\s*hours?/i);
    if (durMatch) {
      duration = parseInt(durMatch[1], 10);
      continue;
    }
    if (l.startsWith("- ") && lines[i - 1]?.includes("Assigned Domain Experts")) {
      const name = l.replace(/^\-\s+/, "").trim();
      if (name) agents.push(name);
    }
  }
  if (current) {
    map[current] = { agents, durationHours: duration };
  }
  return map;
}

/** Parses implementation-plan.md to extract effort, priority, risks per context */
function parseImplementationPlan(): Record<string, { effortWeeks: number; priority: string; risks: string[] }> {
  if (!fs.existsSync(IMPL_PLAN_PATH)) return {};
  const md = fs.readFileSync(IMPL_PLAN_PATH, "utf8");
  const lines = md.split(/\r?\n/);
  const map: Record<string, { effortWeeks: number; priority: string; risks: string[] }> = {};
  let current: string | null = null;
  let effort = 0;
  let priority = "";
  let risks: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const ctxMatch = l.match(/^####\s+([A-Z][A-Z _-]+)/);
    if (ctxMatch) {
      if (current) map[current] = { effortWeeks: effort, priority, risks };
      current = slugContext(ctxMatch[1]);
      effort = 0;
      priority = "";
      risks = [];
      continue;
    }
    if (!current) continue;
    const effortMatch = l.match(/\*\*Effort\*\*:\s*(\d+)\s*weeks.*\*\*Priority\*\*:\s*(\w+)/i);
    if (effortMatch) {
      effort = parseInt(effortMatch[1], 10);
      priority = effortMatch[2];
      continue;
    }
    if (l.startsWith("- ⚠️")) {
      risks.push(l.replace(/^- ⚠️\s*/, "").trim());
    }
  }
  if (current) map[current] = { effortWeeks: effort, priority, risks };
  return map;
}

/** Parses event-storming-brief.md for TODO lines (missing events/commands) per context */
function parseBriefTodos(): Record<string, { events: string[]; commands: string[]; notes: string[] }> {
  if (!fs.existsSync(BRIEF_PATH)) return {};
  const md = fs.readFileSync(BRIEF_PATH, "utf8");
  const lines = md.split(/\r?\n/);
  const map: Record<string, { events: string[]; commands: string[]; notes: string[] }> = {};
  let current: string | null = null;
  let events: string[] = [];
  let commands: string[] = [];
  let notes: string[] = [];
  const push = () => {
    if (current) map[current] = { events, commands, notes };
  };
  for (const l of lines) {
    const ctxMatch = l.match(/^##\s+([a-zA-Z0-9_]+)\s+-/);
    if (ctxMatch) {
      push();
      current = slugContext(ctxMatch[1]);
      events = [];
      commands = [];
      notes = [];
      continue;
    }
    if (!current) continue;
    if (/^\-\s+/.test(l)) {
      const line = l.replace(/^\-\s+/, "").trim();
      const lower = line.toLowerCase();
      if (lower.includes("missing event") || lower.startsWith("event:")) {
        const m = line.match(/event[s]?:?\s*(.*)/i);
        if (m) m[1].split(/[, ]+/).forEach(e => { if (e) events.push(e.trim()); });
      } else if (lower.includes("missing command") || lower.startsWith("command:")) {
        const m = line.match(/command[s]?:?\s*(.*)/i);
        if (m) m[1].split(/[, ]+/).forEach(c => { if (c) commands.push(c.trim()); });
      } else {
        notes.push(line);
      }
    }
  }
  push();
  return map;
}



function sortByUsage(arr: RawAgent[]): RawAgent[] {
  return arr.sort((a, b) => (usageCount[a.name] || 0) - (usageCount[b.name] || 0));
}

function shuffle<T>(arr: T[]): T[] {
  return arr.sort(() => Math.random() - 0.5);
}

function getPanelAgents(roster: RawAgent[], context: string, deps: { upstream: string[]; downstream: string[] }, desired: number): RawAgent[] {
  const belongs = (agent: RawAgent, ctx: string) => (agent.contexts || []).includes(ctx);
  // 1. Primary experts for the context
  let primary = sortByUsage(shuffle(roster.filter(a => belongs(a, context))));

  // 2. Integration experts for upstream/downstream contexts
  const integrationCts = [...deps.upstream, ...deps.downstream];
  let integration = sortByUsage(shuffle(roster.filter(a => integrationCts.some(c => belongs(a, c)) && !primary.includes(a))));

  // 3. Strategic / Supporting who still have any overlap
  let strategic = sortByUsage(shuffle(roster.filter(a => (a.category === "Strategic") && !primary.includes(a) && !integration.includes(a) && (a.contexts || []).some(c => c === context || integrationCts.includes(c)))));
  let supporting = sortByUsage(shuffle(roster.filter(a => (a.category === "Supporting") && !primary.includes(a) && !integration.includes(a) && !strategic.includes(a))));

  // Helper to take up to n from list
  const take = (arr: RawAgent[], n: number) => {
    const out: RawAgent[] = arr.slice(0, n);
    arr.splice(0, n);
    return out;
  };

  const panel: RawAgent[] = [];
  panel.push(...take(primary, desired));
  if (panel.length < desired) panel.push(...take(integration, desired - panel.length));
  if (panel.length < desired) panel.push(...take(strategic, desired - panel.length));
  if (panel.length < desired) panel.push(...take(supporting, desired - panel.length));

  // Trim if we somehow exceeded
  const final = panel.slice(0, desired);
  // Update usage count
  final.forEach(a => { usageCount[a.name] = (usageCount[a.name] || 0) + 1; });
  return final;
}


// Initialize OpenAI client (expects OPENAI_API_KEY in env)
const openai = new OpenAI();

async function simulateAgentContribution(
  agent: RawAgent,
  contextName: string,
  knownEvents: string[],
  knownCmds: string[]
): Promise<{ event: string; command: string; note: string }> {
  const systemPrompt = `You are ${agent.name}, a ${agent.category} domain expert participating in an Event-Storming workshop for the \"${contextName}\" bounded context at Elias Food Imports. Your expertise keywords: ${(agent.expertise || []).join(", ")}. Respond **only** with valid JSON.`;

  const userPrompt = `KnownEvents: ${knownEvents.join(", ") || "none"}\nKnownCommands: ${knownCmds.join(", ") || "none"}\n\nTASK: Propose ONE new business domain event (PascalCase, no spaces) and ONE corresponding application command (PascalCase, no spaces) that might trigger it. Also add a short rationale.\n\nReturn JSON with keys event, command, note. Example: {\"event\": \"OrderPlaced\", \"command\": \"PlaceOrder\", \"note\": \"Rationale...\"}`;

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini", // lightweight for quick calls; adjust as needed
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });
    const content = chat.choices[0].message.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      event: parsed.event || "UnlabelledEvent",
      command: parsed.command || "UnlabelledCommand",
      note: parsed.note || "No rationale"
    };
  } catch (err) {
    console.error(chalk.yellow(`⚠️ OpenAI call failed for ${agent.name}: ${err.message}`));
    // Fallback to stub
    const base = agent.name.split(" ")[0];
    return {
      event: `${base}FallbackEvent`,
      command: `${base}FallbackCommand`,
      note: "Fallback due to API error"
    };
  }
}

/** Ask agent for an integration point */
async function simulateIntegrationContribution(
  agent: RawAgent,
  contextName: string,
  knownIntegrationPoints: string[]
): Promise<{ point: string; note: string }> {
  const systemPrompt = `You are ${agent.name}, a ${agent.category} domain expert focused on system integration. Respond ONLY with JSON.`;
  const userPrompt = `KnownIntegrationPoints: ${knownIntegrationPoints.join(", ") || "none"}\n\nTASK: Propose ONE bounded context that should integrate with ${contextName}. Use PascalCase with no spaces. Provide a short rationale. Return JSON with keys point, note.`;
  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });
    const content = chat.choices[0].message.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const parsed = JSON.parse(jsonMatch[0]);
    return { point: parsed.point || "UnknownContext", note: parsed.note || "" };
  } catch (err) {
    console.error(chalk.yellow(`⚠️ OpenAI call failed (integration) for ${agent.name}: ${err.message}`));
    const base = agent.name.split(" ")[0];
    return { point: `${base}Integration`, note: "Fallback due to API error" };
  }
}

/** MAIN ****************************************************************/

async function runVirtualStormForContext(
  context: string,
  prepData: ReturnType<typeof parsePrepFile>[string],
  deps: { upstream: string[]; downstream: string[] },
  brief: { events: string[]; commands: string[]; notes: string[] } | undefined,
  plan: { agents: string[]; durationHours: number } | undefined,
  impl: { effortWeeks: number; priority: string; risks: string[] } | undefined,
  roster: RawAgent[]
): Promise<StormOutput> {
  console.log(chalk.cyan(`\n🔄 Virtual storming ${context}...`));
  const desiredSize = Math.max(plan?.agents.length || 4, 3);
  const panel = getPanelAgents(roster, context, deps, desiredSize);
  console.log(chalk.gray(`→ Panel (${panel.length}): ${panel.map(p => p.name).join(", ")}`));

  const events = new Set([...prepData.events, ...(brief?.events || [])]);
  const commands = new Set([...prepData.commands, ...(brief?.commands || [])]);
  const notes: string[] = [...(brief?.notes || [])];
  let rawPoints = [...prepData.integration, ...deps.upstream, ...deps.downstream];
  // deduplicate + pascalize
  const intMap = new Map<string,string>();
  rawPoints.forEach(p => {
    const key = normKey(p);
    if (!key || key === '-') return;
    if (!intMap.has(key)) intMap.set(key, pascalCase(p));
  });
  let integrationPoints = new Set<string>(intMap.values());

  const nextSteps: string[] = [];
  if (impl) {
    if (impl.effortWeeks) nextSteps.push(`Implementation effort: ${impl.effortWeeks} weeks (Priority: ${impl.priority})`);
    impl.risks.forEach(r => nextSteps.push(`Risk: ${r}`));
  }

  // Multiple discussion rounds to enrich board
  const ROUNDS = plan?.durationHours ? Math.min(4, Math.max(2, Math.round(plan.durationHours / 1.5))) : 2;
  for (let r = 0; r < ROUNDS; r++) {
    for (const agent of panel) {
      const { event, command, note } = await simulateAgentContribution(agent, context, Array.from(events), Array.from(commands));
      events.add(event);
      commands.add(command);
      notes.push(note);
    }
  }

  // Integration brainstorming phase (single pass)
  for (const agent of panel) {
    const { point, note } = await simulateIntegrationContribution(agent, context, Array.from(integrationPoints));
    integrationPoints.add(point);
    notes.push(note);
  }

  return {
    context,
    events: Array.from(events),
    commands: Array.from(commands),
    notes,
    integrationPoints: Array.from(integrationPoints),
    nextSteps,
    panel: panel.map(p => p.name)
  };
}

async function runVirtualStorm_Legacy(rootDir: string = ROOT) {
  const roster = loadRoster();
  const prepData = parsePrepFile();
  const depMap = parseDependencyMatrix();
  const planMap = parseOrchestrationPlan();
  const briefMap = parseBriefTodos();
  const implMap = parseImplementationPlan();

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

  const summary: { ctx: string; events: number; commands: number; effort?: number; priority?: string }[] = [];

  for (const ctx of Object.keys(prepData)) {
    const ctxTitle = pascalCase(ctx);
                    const deps = depMap[ctx] || { upstream: [], downstream: [] };
        const sessionPlan = planMap[ctx];
    const brief = briefMap[ctx];
    const impl = implMap[ctx];
    const out = await runVirtualStormForContext(ctx, prepData[ctx], deps, brief, sessionPlan, impl, roster);
    const outfile = path.join(OUT_DIR, `${ctx}-storm.json`);
    fs.writeFileSync(outfile, JSON.stringify(out, null, 2), "utf8");

    // Generate rudimentary PlantUML
    const puml = generatePuml(out);
    fs.writeFileSync(path.join(OUT_DIR, `${ctx}-storm.puml`), puml, "utf8");

    // Markdown summary
    const md = generateMarkdown(out);
    fs.writeFileSync(path.join(OUT_DIR, `${ctx}-storm.md`), md, "utf8");

    // Create/update integration-session artefact
    const INT_DIR = path.join(ROOT, "DDD_Artefacts", "integration-sessions");
    if (!fs.existsSync(INT_DIR)) fs.mkdirSync(INT_DIR);
    const intMdPath = path.join(INT_DIR, `${ctx}-integration-session.md`);
    let intMd = `# ${ctxTitle} Integration Session\n\n## Integration Points\n`;
    out.integrationPoints.forEach(ip => intMd += `- ${ip}\n`);
    if (sessionPlan && sessionPlan.durationHours && sessionPlan.agents?.length) {
      const hrs = sessionPlan.durationHours;
      const attendees = sessionPlan.agents.join(", ");
      intMd += `\n_Schedule: ${hrs}h panel • Attendees: ${attendees}_\n`;
    } else {
      intMd += "\n_Schedule: TBD – auto-generated\n";
    }
    fs.writeFileSync(intMdPath, intMd, "utf8");

    // Update PRD
    updatePrd(ctx, out);
    updateImplementationPlan(ctx, out);
    generateAdr(ctx, out);

    summary.push({ ctx, events: out.events.length, commands: out.commands.length, effort: impl?.effortWeeks, priority: impl?.priority });

    console.log(chalk.green(`✔ Saved outputs for ${ctx}`));
  }

  // Emit summary CSV
  const csvLines = ["Context,NewEvents,NewCommands,EffortWeeks,Priority"].concat(
    summary.map(r => `${r.ctx},${r.events},${r.commands},${r.effort ?? ""},${r.priority ?? ""}`)
  );
  fs.writeFileSync(path.join(OUT_DIR, "storm-summary.csv"), csvLines.join("\n"), "utf8");
  // Prune cache if necessary then persist
  pruneUsageCache();
  buildVersionedContextMap(ROOT, OUT_DIR, NodeFileSystem, ChalkConsoleLogger);
  fs.writeFileSync(CACHE_PATH, JSON.stringify(usageCount, null, 2), "utf8");

  console.log(chalk.bold.cyan("\n✅ Virtual event-storming (legacy) run completed."));
}

/**
 * Thin compatibility wrapper around the new hexagonal-core implementation.
 * Delegates to runVirtualStormSession with concrete adapters.
 */
export async function runVirtualStorm(rootDir: string = path.resolve(__dirname, "../..")) {
  console.warn(chalk.yellow("[DEPRECATION] orchestrateVirtualStorm.ts is legacy; please migrate to stormSession."));
  await runVirtualStormSession(rootDir, {
    fs: NodeFileSystem,
    logger: ChalkConsoleLogger,
    llm: OpenAiLLM,
  });
}



function pruneUsageCache() {
  const MAX_COUNT = 200;
  const maxVal = Math.max(...Object.values(usageCount), 0);
  if (maxVal <= MAX_COUNT) return;
  for (const k in usageCount) {
    usageCount[k] = Math.floor(usageCount[k] * 0.5);
  }
}

// Legacy in-file implementation kept for reference only (no longer used)
function buildVersionedContextMap_Legacy() {
  /*
   * Versioned map generator – v2
   * Implements improvements:
   *  A. Only new/changed arrows are injected (delta from template)
   *  B. Arrows are grouped under existing rectangles where possible
   *  C. Cross-rectangle arrows are placed after rectangles to avoid clutter
   */
  const DIAGRAM_DIR = path.join(ROOT, "DDD_Artefacts", "docs", "diagrams");
  const TEMPLATE_FILE = path.join(DIAGRAM_DIR, "context_map.puml");
  if (!fs.existsSync(DIAGRAM_DIR) || !fs.existsSync(TEMPLATE_FILE)) return;
  const stormFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith("-storm.puml"));
  if (!stormFiles.length) return;

  // ---------------- Collect arrows from storm diagrams ----------------
  const arrowRegex = /(\w+)\s+[-]+[x\-*o]?\s*>\s*(\w+)/;
  const stormArrows = new Set<string>();
  for (const file of stormFiles) {
    const lines = fs.readFileSync(path.join(OUT_DIR, file), "utf8").split(/\r?\n/);
    lines.forEach(l => {
      if (arrowRegex.test(l)) stormArrows.add(l.trim());
    });
  }
  if (!stormArrows.size) return;

  // ---------------- Parse template ----------------
  const tplLines = fs.readFileSync(TEMPLATE_FILE, "utf8").split(/\r?\n/);

  interface RectInfo { start: number; end: number; aliases: Set<string>; }
  const rectangles: RectInfo[] = [];
  const aliasToRect = new Map<string, RectInfo>();
  const existingArrows = new Set<string>();

  // First pass: find rectangle ranges & aliases; record existing arrows.
  const stack: RectInfo[] = [];
  tplLines.forEach((line, idx) => {
    const openMatch = line.match(/^\s*rectangle\s+"[^"]+".*\{\s*$/);
    if (openMatch) {
      const rect: RectInfo = { start: idx, end: -1, aliases: new Set() };
      stack.push(rect);
      rectangles.push(rect);
      return;
    }
    if (/^\s*}\s*$/.test(line) && stack.length) {
      const r = stack.pop()!;
      r.end = idx;
      return;
    }
    if (arrowRegex.test(line)) existingArrows.add(line.trim());

    // alias definitions inside rectangles or globally
    let m = line.match(/\[[^]]+\]\s+as\s+(\w+)/i);
    if (m) {
      const alias = m[1];
      const currentRect = stack[stack.length - 1];
      if (currentRect) currentRect.aliases.add(alias);
      aliasToRect.set(alias, currentRect!);
    }
    m = line.match(/^\s*class\s+(\w+)/);
    if (m) {
      const alias = m[1];
      const currentRect = stack[stack.length - 1];
      if (currentRect) currentRect.aliases.add(alias);
      aliasToRect.set(alias, currentRect!);
    }
  });

  // ---------------- Determine delta arrows ----------------
  const deltaArrows = Array.from(stormArrows).filter(a => !existingArrows.has(a));
  if (!deltaArrows.length) {
    console.log(chalk.gray("🗺️  No new interactions – latest context map unchanged"));
    return;
  }

  // ---------------- Prepare insertions per rectangle ----------------
  const rectInsertMap = new Map<RectInfo, string[]>();
  const globalArrows: string[] = [];

  deltaArrows.forEach(a => {
    const m = a.match(arrowRegex);
    if (!m) return;
    const left = m[1], right = m[2];
    const leftRect = aliasToRect.get(left);
    const rightRect = aliasToRect.get(right);
    if (leftRect && rightRect && leftRect === rightRect) {
      // Same rectangle – queue inside that rectangle
      if (!rectInsertMap.has(leftRect)) rectInsertMap.set(leftRect, []);
      rectInsertMap.get(leftRect)!.push(a);
    } else {
      globalArrows.push(a);
    }
  });

  // ---------------- Build new diagram lines ----------------
  const updated = [...tplLines];

  // Insert inside rectangles (before their closing brace)
  rectangles.forEach(rect => {
    const additions = rectInsertMap.get(rect);
    if (additions && additions.length) {
      updated.splice(rect.end, 0, ...additions.sort());
      // shift end positions for subsequent rectangles
      const delta = additions.length;
      rectangles.forEach(r => { if (r.start > rect.end) { r.start += delta; r.end += delta; } });
    }
  });

  // Insert global arrows before @enduml
  const endumlIdx = updated.findIndex(l => l.trim().startsWith("@enduml"));
  updated.splice(endumlIdx, 0, ...globalArrows.sort());

  // ---------------- Write new version ----------------
  const versionFiles = fs.readdirSync(DIAGRAM_DIR).filter(f => /^context_mapv(\d+)\.puml$/.test(f));
  const versions = versionFiles.map(f => parseInt(f.match(/^context_mapv(\d+)\.puml$/)![1], 10));
  const nextVer = (versions.length ? Math.max(...versions) : 1) + 1;
  const outPath = path.join(DIAGRAM_DIR, `context_mapv${nextVer}.puml`);
  fs.writeFileSync(outPath, updated.join("\n"), "utf8");
  console.log(chalk.gray(`🗺️  Context map updated – docs/diagrams/context_mapv${nextVer}.puml`));
}


  /* legacy duplicate block start */
/*
  // [LEGACY] Gather unique class and arrow definitions without brace blocks
  const classes = new Set<string>();
  const arrows = new Set<string>();
  for (const file of stormFiles) {
    const lines = fs.readFileSync(path.join(OUT_DIR, file), "utf8").split(/\r?\n/);
    for (const raw of lines) {
      const t = raw.trim();
      if (t.startsWith("class ")) {
        // Strip any trailing opening brace so UML stays valid
        const cleaned = t.replace(/\s*\{\s*$/, "").trim();
        classes.add(t);
      } else if (t.includes("-->") || t.includes("<--")) {
        arrows.add(t);
      }
    }
  }

  // If nothing collected (shouldn't happen) bail
  if (!classes.size && !arrows.size) return;

  // Helper to build diagram string given a version number
  const buildDiagram = (version: number, date: string): string => {
    return [
      "@startuml",
      `title Bounded Context Map v${version} – ${date}`,
      "skinparam class {",
      "  BackgroundColor #dbeafe",
      "  BorderColor #4b5563",
      "}",
      ...Array.from(classes),
      ...Array.from(arrows),
      "@enduml"
    ].join("\n");
  };

  // Determine latest version (if any) and compare for changes
  const versionFiles = fs.readdirSync(VR_DIR).filter(f => /^context_mapv(\d+)\.puml$/.test(f));
  const versions = versionFiles.map(f => parseInt(f.match(/^context_mapv(\d+)\.puml$/)![1], 10));
  const latestVersion = versions.length ? Math.max(...versions) : 0;
  const today = new Date().toISOString().split("T")[0];

  const candidateDiagram = buildDiagram(latestVersion + 1, today);

  if (latestVersion > 0) {
    const latestContent = fs.readFileSync(path.join(VR_DIR, `context_mapv${latestVersion}.puml`), "utf8");
    const normalize = (txt: string) => new Set(txt.split(/\r?\n/).map(l => l.trim()).filter(l => l.startsWith("class ") || l.includes("-->") || l.includes("<--")));
    if (normalize(latestContent).size === classes.size + arrows.size) {
      const latestSet = normalize(latestContent);
      let identical = true;
      for (const c of classes) if (!latestSet.has(c)) { identical = false; break; }
      if (identical) {
        for (const a of arrows) if (!latestSet.has(a)) { identical = false; break; }
      }
      if (identical) {
        console.log(chalk.gray("🗺️  No changes detected in context map – latest version kept"));
        return; // Skip writing new version
      }
    }
  }

  // Write new version file
  const newVersion = latestVersion + 1;
  const outPath = path.join(VR_DIR, `context_mapv${newVersion}.puml`);
  fs.writeFileSync(outPath, candidateDiagram, "utf8");
  console.log(chalk.gray(`🗺️  Master context map written to docs/diagrams/context_mapv${newVersion}.puml`));
*/
/* legacy brace closed */

/** Doc Generators *****************************************/
function generatePuml(out: StormOutput): string {
  const lines: string[] = ["@startuml", `title Virtual Storm – ${out.context}`];
  lines.push("skinparam class {\n    BackgroundColor #dbeafe\n    BorderColor #4b5563\n  }");
  // Main context class
  lines.push(`class ${pascalCase(out.context)} <<Context>> {`);
  lines.push("  .. Events ..");
  out.events.forEach(e => lines.push(`  + ${e}`));
  lines.push("  .. Commands ..");
  out.commands.forEach(c => lines.push(`  + ${c}()`));
  lines.push("}");

  // Integration points as external boxes
  out.integrationPoints.forEach(ip => {
    const comp = pascalCase(ip);
    lines.push(`class ${comp} <<External>>`);
    lines.push(`${pascalCase(out.context)} --> ${comp}`);
  });

  lines.push("legend left");
  lines.push("<color:#dbeafe>Context</color> Current bounded context");
  lines.push("<color:#ffffff>External</color> Integration point");
  lines.push("endlegend");
  lines.push("@enduml");
  return lines.join("\n");

}

/** Updates PRD file with new events & commands if file exists */
function updateImplementationPlan(context: string, out: StormOutput) {
  const planPath = IMPL_PLAN_PATH;
  if (!fs.existsSync(planPath)) return;
  const md = fs.readFileSync(planPath, "utf8").split(/\r?\n/);
  const ctxHeader = `#### ${context.toUpperCase()}`;
  const idx = md.findIndex(l => l.trim().toUpperCase() === ctxHeader.toUpperCase());
  if (idx === -1) return; // context not found
  // find insertion point (before next --- or header)
  let insertAt = md.length - 1;
  for (let i = idx + 1; i < md.length; i++) {
    if (/^---+/.test(md[i]) || /^####\s+/.test(md[i])) { insertAt = i; break; }
  }
  const today = new Date().toISOString().split("T")[0];
  const blockHeader = `##### Phase E Updates – ${today}`;
  // check if block already exists
  const existingBlockIdx = md.findIndex((l, i) => i > idx && l.startsWith(blockHeader));
  if (existingBlockIdx !== -1) return; // already updated today
  const lines: string[] = [];
  lines.push("");
  lines.push(blockHeader);
  lines.push("");
  // effort & priority note
  const effortLine = out.nextSteps.find(s => s.startsWith("Implementation effort:"));
  if (effortLine) lines.push(`- ${effortLine}`);
  // risks
  out.nextSteps.filter(s => s.startsWith("Risk:")).forEach(r => lines.push(`- ${r}`));
  // implement tasks for events/commands
  lines.push("- [ ] Implement newly identified events & commands:");
  out.events.forEach((e, idxEv) => {
    const cmd = out.commands[idxEv] || "";
    lines.push(`  - [ ] ${cmd ? cmd + " → " : ""}${e}`);
  });
  md.splice(insertAt, 0, ...lines);
  fs.writeFileSync(planPath, md.join("\n"), "utf8");
}

function generateAdr(context: string, out: StormOutput) {
    const ADR_DIR = path.join(ROOT, "DDD_Artefacts", "docs", "adr");
  if (!fs.existsSync(ADR_DIR)) fs.mkdirSync(ADR_DIR, { recursive: true });
  const slug = context.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Look for existing ADR draft for this context
  const existing = fs.readdirSync(ADR_DIR).find(f => f.endsWith(`${slug}-events-commands.md`));
  if (existing) {
    const adrPath = path.join(ADR_DIR, existing);
    const content = fs.readFileSync(adrPath, "utf8");
    if (/status:\s*proposed/i.test(content)) {
      // update event & command lists
      const updated = updateAdrLists(content, out);
      fs.writeFileSync(adrPath, updated, "utf8");
    }
    return; // either updated or accepted so we stop
  }

  // Determine next ADR number for a fresh draft
  const nums = fs.readdirSync(ADR_DIR)
    .map(f => (f.match(/^(\d{3})/) || [])[1])
    .filter(Boolean)
    .map(n => parseInt(n, 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  const numStr = String(next).padStart(3, "0");
  const filename = `${numStr}-${slug}-events-commands.md`;
  const adrPath = path.join(ADR_DIR, filename);
  const today = new Date().toISOString().split("T")[0];
  const ctxTitle = pascalCase(context);
  const title = `${ctxTitle}: Events & Commands Augmentation`;
  const content = `---
title: ${title}
status: proposed
date: ${today}
deciders: Event-Storming Panel (${panelNames(out)})
---

## ADR-${numStr}: ${title}

### Status
Proposed

### Context
A collaborative Event Storming session for **${context}** surfaced behavioural gaps between the existing domain model and real-world processes.  Specifically, the following domain events and commands were missing or ambiguous and are now required for an accurate Ubiquitous Language and clear integration contracts.

### Decision
Adopt the following additions to the ${context} bounded context.

#### New Domain Events
${out.events.map(e => `- ${e}`).join("\n")}

#### New Application Commands
${out.commands.map(c => `- ${c}`).join("\n")}

### Rationale
1. **Expressive Domain Behaviour** – Each event captures a significant state change, enabling ubiquitous language alignment (Evans) and explicit bounded-context contracts (Vernon).
2. **Decoupled Integrations** – Downstream contexts subscribe to these events rather than private state, supporting Hexagonal architecture and Event-Driven communication (see ADR-008).
3. **Traceability** – Commands map 1-to-1 with intent; linking the task list in implementation-plan Phase E keeps execution transparent.

### Alternatives Considered
- _Ignore gaps_ – would perpetuate implicit behaviour and hinder future refactors.
- _Collapse into existing events_ – rejected; would overload semantics and violate Single Responsibility.

### Risks / Open Questions
${out.nextSteps.filter(l => l.startsWith("Risk:")).map(r => `- ${r.replace(/^Risk:\s*/i, "")}`).join("\n") || "_None identified_"}

### Consequences
+ Clearer context boundaries and integration contracts.
+ Enables granular audit/observability of ${context} workflows.
− Additional implementation effort (estimated in implementation-plan.md).

### References
- **PRD**: docs/prd/${context.toLowerCase()}.md
- **Integration Session**: DDD_Artefacts/integration-sessions/${context}-integration-session.md
- **Implementation Plan Update**: implementation-plan.md (Phase E)
`;
  fs.writeFileSync(adrPath, content, "utf8");
}

function updateAdrLists(markdown: string, out: StormOutput): string {
  const lines = markdown.split(/\r?\n/);
  const replaceSection = (headingPattern: RegExp, newItems: string[]) => {
    const startIdx = lines.findIndex(l => headingPattern.test(l.trim()));
    if (startIdx === -1) return;
    let endIdx = startIdx + 1;
    while (endIdx < lines.length && !/^###/.test(lines[endIdx])) endIdx++;
    // remove old section lines
    lines.splice(startIdx + 1, endIdx - startIdx - 1, ...newItems);
  };
  replaceSection(/^####\s+New Domain Events/i, out.events.map(e => `- ${e}`));
  replaceSection(/^####\s+New Application Commands/i, out.commands.map(c => `- ${c}`));
  return lines.join("\n");
}

function updatePrd(contextSlug: string, out: StormOutput) {
  const PRD_ROOT = path.join(ROOT, "DDD_Artefacts", "docs", "prd");
  const walk = (dir: string): string[] => fs.readdirSync(dir).flatMap(f => {
    const p = path.join(dir, f);
    return fs.statSync(p).isDirectory() ? walk(p) : [p];
  });
  const files = walk(PRD_ROOT).filter(f => f.endsWith(".md") && f.toLowerCase().includes(contextSlug));
  if (!files.length) return;
  const prdPath = files[0];
  let md = fs.readFileSync(prdPath, "utf8");
  const marker = "## Event Storm Updates";
  const matchesCtx = (s: string) => s.toLowerCase().includes(contextSlug.toLowerCase());
  const filteredEvents = out.events.filter(matchesCtx);
  const filteredCmds = out.commands.filter(matchesCtx);
  if (!filteredEvents.length && !filteredCmds.length) return; // nothing relevant
  let section = `\n${marker}\n`;
  section += `\n### ${new Date().toISOString().split('T')[0]}\n`;
  section += `\n**New Events**\n`;
  filteredEvents.forEach(e => section += `- ${e}\n`);
  section += `\n**New Commands**\n`;
  filteredCmds.forEach(c => section += `- ${c}\n`);
  if (md.includes(marker)) {
    md = md.replace(marker, section + "\n" + marker);
  } else {
    md += section;
  }
  fs.writeFileSync(prdPath, md, "utf8");
}

function generateMarkdown(out: StormOutput): string {
  let md = `# ${out.context.toUpperCase()} Virtual Storm Summary\n\n`;
  md += "## Domain Events\n";
  out.events.forEach(e => md += `- ${e}\n`);
  md += "\n## Commands\n";
  out.commands.forEach(c => md += `- ${c}\n`);
  md += "\n## Notes\n";
  out.notes.forEach(n => md += `- ${n}\n`);
  md += "\n## Integration Points\n";
  out.integrationPoints.forEach(ip => md += `- ${ip}\n`);
  // Deduplicate next steps before rendering
  const uniqSteps = Array.from(new Set(out.nextSteps));
  if (out.nextSteps.length) {
    md += "\n## Next Steps (Phase E)\n";
    uniqSteps.forEach(ns => md += `- ${ns}\n`);
  }
  return md;
}
