import yaml from "js-yaml";

export interface FunctionalRole {
  role: string;
  match?: string;
}

export interface Agent {
  name: string;
  category: string;
  expertise: string[];
  contexts: string[];
}

/**
 * Extract a YAML block listing functional roles from a PRD markdown file.
 * The convention is to wrap it in an HTML comment starting with `agents:`.
 * Example:
 * <!--- agents:
 *   - role: Supply Chain Manager
 *     match: inventory_management
 *   - role: Quality Assurance Team
 * -->
 */
export function extractFunctionalRoles(markdown: string): FunctionalRole[] {
  const regex = /<!---(.*?)-->/s;
  const match = markdown.match(regex);
  if (!match) return [];
  try {
    const doc = yaml.load(match[1]) as any;
    if (doc && Array.isArray(doc.agents)) {
      return doc.agents as FunctionalRole[];
    }
  } catch (e) {
    // YAML parse failed – ignore silently for now
  }
  return [];
}

/**
 * Match functional roles to concrete agents from the roster.
 * 1. If role has explicit `match` keyword, pick agents whose expertise includes it.
 * 2. Otherwise do a fuzzy contains on role words against agent expertise.
 */
export function resolveAgentsForRoles(
  roles: FunctionalRole[],
  roster: Agent[],
  desiredPerRole = 1
): Record<string, Agent[]> {
  const resolved: Record<string, Agent[]> = {};
  roles.forEach((r) => {
    let candidates: Agent[] = [];
    if (r.match) {
      candidates = roster.filter((a) => a.expertise.includes(r.match as string));
    }
    if (candidates.length === 0) {
      const roleTerms = r.role.toLowerCase().split(/\s+/);
      candidates = roster.filter((a) =>
        a.expertise.some((e) => roleTerms.some((term) => e.toLowerCase().includes(term)))
      );
    }
    if (candidates.length === 0) {
      // fallback: any agent of same category type as role keyword if present
      candidates = roster;
    }
    resolved[r.role] = candidates.slice(0, desiredPerRole);
  });
  return resolved;
}
