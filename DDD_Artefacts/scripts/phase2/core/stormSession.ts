import path from "path";
import { FileSystemPort, LoggerPort } from "./ports";
import yaml from "js-yaml";
import { brainstormContext } from "./stormEngine";
import { buildVersionedContextMap } from "./contextMapBuilder";

interface RawAgent {
  name: string;
  category: string;
  expertise?: string[];
  contexts?: string[];
}

const usageCount: Record<string, number> = {};

function shuffle<T>(arr: T[]): T[] {
  return arr.sort(() => Math.random() - 0.5);
}

function sortByUsage(arr: RawAgent[]): RawAgent[] {
  return arr.sort((a, b) => (usageCount[a.name] || 0) - (usageCount[b.name] || 0));
}

function getPanelAgents(roster: RawAgent[], context: string, desired: number): RawAgent[] {
  const belongs = (agent: RawAgent) => (agent.contexts || []).includes(context);
  let primary = sortByUsage(shuffle(roster.filter(belongs)));
  let integration = sortByUsage(shuffle(roster.filter(a => a.category === "Integration" && !primary.includes(a))));
  let strategic = sortByUsage(shuffle(roster.filter(a => a.category === "Strategic" && !primary.includes(a) && !integration.includes(a))));
  let supporting = sortByUsage(shuffle(roster.filter(a => a.category === "Supporting" && !primary.includes(a) && !integration.includes(a) && !strategic.includes(a))));

  const panel: RawAgent[] = [];
  const take = (src: RawAgent[], n: number) => { const out = src.slice(0, n); src.splice(0, n); return out; };
  panel.push(...take(primary, desired));
  if (panel.length < desired) panel.push(...take(integration, desired - panel.length));
  if (panel.length < desired) panel.push(...take(strategic, desired - panel.length));
  if (panel.length < desired) panel.push(...take(supporting, desired - panel.length));

  const final = panel.slice(0, desired);
  final.forEach(a => { usageCount[a.name] = (usageCount[a.name] || 0) + 1; });
  return final;
}

export interface SessionPorts {
  fs: FileSystemPort;
  logger: LoggerPort;
}

export async function runVirtualStormSession(rootDir: string, ports: SessionPorts, contextFilter?: string) {
  const { fs: fsPort, logger } = ports;

  const ROOT = rootDir;
  const PREP_PATH = path.join(ROOT, "DDD_Artefacts", "docs", "analysis", "phase1", "event-storming-session-prep.md");
  const OUT_DIR = path.join(ROOT, "DDD_Artefacts", "docs", "analysis", "virtual-storm");
  const ROSTER_PATH = path.join(ROOT, "DDD_Artefacts", "automation", "roster.yaml");

  if (!fsPort.exists(PREP_PATH)) {
    throw new Error("Missing event-storming-session-prep.md – cannot proceed");
  }
  if (!fsPort.exists(ROSTER_PATH)) {
    throw new Error("Missing roster.yaml – cannot proceed");
  }

  if (!fsPort.exists(OUT_DIR)) {
    fsPort.writeUtf8(path.join(OUT_DIR, ".init"), "init"); // create dir
  }

    // Load roster with full metadata so we can pick relevant experts
  const rosterYaml = fsPort.readUtf8(ROSTER_PATH);
  const roster = (yaml.load(rosterYaml) as { agents: RawAgent[] }).agents;

  // Parse prep markdown for contexts & seed known events and commands
const prepContents = fsPort.readUtf8(PREP_PATH);
const contextBlocks = prepContents.split(/^##\s+/m).slice(1);
interface Prep { events: string[]; commands: string[]; integration: string[] }
const prepMap: Record<string, Prep> = {};
const slug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]/g, "");
let slugFilter: string | undefined = contextFilter ? slug(contextFilter) : undefined;
logger.debug(`stormSession contextFilter: ${contextFilter}, slugFilter: ${slugFilter}`);

contextBlocks.forEach((block) => {
  const lines = block.split(/\r?\n/);
  const header = lines[0];
  const m = header.match(/^([A-Za-z0-9_ ]+)\s*-\s*/);
  if (!m) return;
  const ctxNameRaw = m[1];
  const ctx = slug(ctxNameRaw);
  const events: string[] = [];
  const commands: string[] = [];
  const integration: string[] = [];
  let section: 'events' | 'commands' | null = null;
  for (const rawLine of lines) {
    const l = rawLine.trim();
    if (/^###.*Known Domain Events/i.test(l)) { section = 'events'; continue; }
    if (/^###.*Known Commands/i.test(l)) { section = 'commands'; continue; }
    if (/^###/.test(l)) { section = null; continue; }
    if (section === 'events' && l.startsWith("- ")) {
      const name = l.replace(/^[-*\s]*/g, "").split(/\s|:/)[0].replace(/\*\*/g, "");
      events.push(name);
    } else if (section === 'commands' && l.startsWith("- ")) {
      const name = l.replace(/^[-*\s]*/g, "").split(/\s|:/)[0].replace(/\*\*/g, "");
      commands.push(name);
    }
  }
  prepMap[ctx] = { events, commands, integration };
});

if (slugFilter && !Object.keys(prepMap).includes(slugFilter)) {
  logger.warn(`No matching context for filter '${contextFilter}'. Available contexts: ${Object.keys(prepMap).join(", ")}`);
  slugFilter = undefined;
}

// Prepare summary array for reporting
logger.debug(`stormSession contexts to run: ${slugFilter ? slugFilter : Object.keys(prepMap).join(", ")}`);
const summary: string[] = [];
  for (const ctx of Object.keys(prepMap)) {
    if (slugFilter && ctx !== slugFilter) continue;
    const panel = getPanelAgents(roster, ctx, 4);
    logger.info(`Panel for ${ctx}: ${panel.map(a => a.name).join(", ")}`);

    const input = {
      contextName: ctx,
      knownEvents: prepMap[ctx].events,
      knownCommands: prepMap[ctx].commands,
      knownIntegrationPoints: prepMap[ctx].integration,
      panelAgents: panel,
      rounds: 2,
    };
    logger.debug(`stormSession prepMap for '${ctx}': ${JSON.stringify(prepMap[ctx], null, 2)}`);
logger.debug(`stormSession input for '${ctx}': ${JSON.stringify(input, null, 2)}`);
const out = await brainstormContext(input, { logger });
logger.debug(`stormSession output for '${ctx}': ${JSON.stringify(out, null, 2)}`);
    // Persist artefacts ------------------------------------------------------
    fsPort.writeUtf8(path.join(OUT_DIR, `${ctx}-storm.json`), JSON.stringify(out, null, 2));

    // Minimal PlantUML: arrows for integration points so context-map builder
    // can detect new interactions without duplicating previous heavy logic.
    const ctxAlias = ctx.charAt(0).toUpperCase() + ctx.slice(1);
    const arrowLines = out.integrationPoints.map((ip) => `${ctxAlias} --> ${ip}`);
    fsPort.writeUtf8(path.join(OUT_DIR, `${ctx}-storm.puml`), arrowLines.join("\n"));
    summary.push(`${ctx},${out.events.length},${out.commands.length}`);
    logger.info(`Saved outputs for ${ctx}`);
  }

  fsPort.writeUtf8(path.join(OUT_DIR, "storm-summary.csv"), ["Context,Events,Commands", ...summary].join("\n"));
  buildVersionedContextMap(ROOT, OUT_DIR, fsPort, logger);
  logger.info("Virtual storm session complete.");
}
