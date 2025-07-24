import fs from "fs";
import path from "path";
import chalk from "chalk";
import yaml from "js-yaml";
import { extractFunctionalRoles, resolveAgentsForRoles } from "./agentMatcher";

interface RawAgent {
  name: string;
  category: string;
  expertise: string[];
  contexts: string[];
}

interface DomainAgent {
  name: string;
  category: string;
  expertise: string[];
  contexts: string[];
}

// Load full agent roster once
const rosterPath = "DDD_Artefacts/automation/roster.yaml";
let allAgents: RawAgent[] = [];
if (fs.existsSync(rosterPath)) {
  try {
    const rosterDoc = yaml.load(fs.readFileSync(rosterPath, "utf8")) as any;
    allAgents = rosterDoc?.agents || [];
  } catch (err) {
    console.error(chalk.red("⚠️ Failed to load roster.yaml for prepareSession"), err);
  }
}

function getAgentsForContext(contextName: string, desired = 3): DomainAgent[] {

  let selected = allAgents.filter(a => (a.contexts || []).includes(contextName));
  if (selected.length < desired) {
    const expMatch = allAgents.filter(a => (a.expertise || []).some(e => contextName.includes(e)));
    selected = [...new Set([...selected, ...expMatch])];
  }
  if (selected.length < desired) selected = allAgents;
  return selected.slice(0, desired).map(a => ({
    name: a.name,
    category: a.category,
    expertise: a.expertise,
    contexts: a.contexts
  }));
}

interface SessionContext {
  businessContext: string[];
  name: string;
  prdPath: string;
  existingEvents: string[];
  existingCommands: string[];
  integrationPoints: string[];
  businessQuestions: string[];
  assignedAgents: DomainAgent[];
}

// Map context names to actual PRD filenames
function getContextToPrdMapping(): Record<string, { filename: string; category: string }> {
  return {
    'batch_tracking': { filename: 'batch_tracking.md', category: 'core' },
    'cold_chain': { filename: 'cold_chain.md', category: 'core' },
    'inventory_management': { filename: 'inventory.md', category: 'core' },
    'quality_control': { filename: 'quality_control.md', category: 'core' },
    'returns': { filename: 'returns.md', category: 'supporting' },
    'shopping_cart': { filename: 'shopping_cart.md', category: 'supporting' },
    'marketing': { filename: 'marketing.md', category: 'strategic' },
    'supplier_traceability': { filename: 'supplier_traceability.md', category: 'core' },
    'notifications_alerts': { filename: 'notifications_alerts.md', category: 'supporting' },
    'analytics_reporting': { filename: 'analytics_reporting.md', category: 'supporting' },
    'reviews_ratings': { filename: 'reviews_ratings.md', category: 'supporting' },
    'sales_quoting': { filename: 'sales_quoting.md', category: 'strategic' }
  };
}

function extractEventsFromPRD(prdContent: string): string[] {
  const events: string[] = [];
  
  // Look for domain events in various formats
  const eventPatterns = [
    /\*\*([A-Z][a-zA-Z]*(?:Created|Updated|Deleted|Changed|Processed|Completed|Failed|Started|Finished|Expired|Activated|Deactivated))\*\*/g,
    /- ([A-Z][a-zA-Z]*(?:Created|Updated|Deleted|Changed|Processed|Completed|Failed|Started|Finished|Expired|Activated|Deactivated))/g,
    /Domain Events?:?\s*\n((?:[-*]\s+[^\n]+\n?)*)/gi
  ];
  
  eventPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(prdContent)) !== null) {
      if (match[1] && !events.includes(match[1])) {
        events.push(match[1]);
      }
    }
  });
  
  return events.slice(0, 8); // Limit to most relevant
}

function extractBusinessContext(markdown: string): string[] {
  const match = markdown.match(/##\s+1\.\s+Business Context([\s\S]*?)(##\s+2\.|$)/i);
  if (!match) return [];
  const section = match[1] || '';
  return section
    .split(/\r?\n/)
    .filter(l => l.trim().startsWith('-'))
    .map(l => l.trim())
    .slice(0, 6); // cap lines
}

function extractCommandsFromPRD(prdContent: string): string[] {
  const commands: string[] = [];
  
  // Look for commands/use cases
  const commandPatterns = [
    /\*\*(Create|Update|Delete|Process|Complete|Start|Finish|Activate|Deactivate|Cancel|Approve|Reject|Submit|Validate)[A-Z][a-zA-Z]*\*\*/g,
    /- (Create|Update|Delete|Process|Complete|Start|Finish|Activate|Deactivate|Cancel|Approve|Reject|Submit|Validate)[A-Z][a-zA-Z]*/g,
    /Use Cases?:?\s*\n((?:[-*]\s+[^\n]+\n?)*)/gi
  ];
  
  commandPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(prdContent)) !== null) {
      if (match[1] && !commands.includes(match[1])) {
        commands.push(match[1]);
      }
    }
  });
  
  return commands.slice(0, 8); // Limit to most relevant
}

function generateBusinessQuestions(contextName: string, prdContent: string): string[] {
  const questions: string[] = [];
  
  // Context-specific business questions
  const contextQuestions: Record<string, string[]> = {
    'batch_tracking': [
      'What triggers a new batch to be created?',
      'How do we handle batch splitting during processing?',
      'What information must be tracked for regulatory compliance?',
      'When does a batch expire or become invalid?'
    ],
    'cold_chain': [
      'What temperature thresholds trigger alerts?',
      'How do we handle temperature excursions?',
      'What documentation is required for cold chain compliance?',
      'How do we integrate with shipping carrier temperature monitoring?'
    ],
    'inventory_management': [
      'How do we implement FEFO (First Expired, First Out) logic?',
      'What triggers automatic reorder points?',
      'How do we handle inventory reservations across channels?',
      'What happens when inventory expires?'
    ],
    'quality_control': [
      'What triggers a quality inspection?',
      'How do we handle failed quality checks?',
      'What documentation is required for quality compliance?',
      'How do we track quality metrics over time?'
    ]
  };
  
  // Add context-specific questions
  if (contextQuestions[contextName]) {
    questions.push(...contextQuestions[contextName]);
  }
  
  // Add generic questions based on PRD content
  if (prdContent.toLowerCase().includes('compliance')) {
    questions.push('What compliance requirements must be met?');
  }
  if (prdContent.toLowerCase().includes('integration')) {
    questions.push('What external systems need integration?');
  }
  if (prdContent.toLowerCase().includes('notification')) {
    questions.push('Who needs to be notified and when?');
  }
  
  return questions.slice(0, 6);
}

export async function prepareSession(contextFilter?: string) {
  console.log(chalk.blue("🎯 Preparing Event Storming session materials..."));
  
  // Read gaps from memory
  const gapsFile = ".windsurf/memories/gap-analysis.md";
  const gaps: string[] = [];
  if (fs.existsSync(gapsFile)) {
    const gapContent = fs.readFileSync(gapsFile, "utf8");
    gaps.push(...gapContent.match(/- \[ \] (.+)/g)?.map(m => m.replace("- [ ] ", "")) || []);
  }
  
  const prdMapping = getContextToPrdMapping();
  const sessionContexts: SessionContext[] = [];
  
  // Analyze each context for session preparation
  for (const contextName of gaps) {
    if (contextFilter && !contextName.toLowerCase().includes(contextFilter.toLowerCase())) continue;
    
    const prdInfo = prdMapping[contextName];
    if (!prdInfo) continue;
    
    const prdPath = `DDD_Artefacts/docs/prd/${prdInfo.category}/${prdInfo.filename}`;
    if (!fs.existsSync(prdPath)) continue;
    
    const prdContent = fs.readFileSync(prdPath, "utf8");
    
    // Extract context map relationships
    const contextMap = fs.readFileSync("DDD_Artefacts/docs/diagrams/context_map.puml", "utf8");
    const integrationPoints: string[] = [];
    
    // Find integration patterns
    const integrationPatterns = [
      new RegExp(`\\w+\\s*-->\\s*\\w+.*${contextName}`, 'gi'),
      new RegExp(`${contextName}.*-->\\s*\\w+`, 'gi')
    ];
    
    integrationPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(contextMap)) !== null) {
        integrationPoints.push(match[0].trim());
      }
    });
    
    sessionContexts.push({
      name: contextName,
      prdPath,
      existingEvents: extractEventsFromPRD(prdContent),
      existingCommands: extractCommandsFromPRD(prdContent),
      integrationPoints: integrationPoints.slice(0, 5),
      // Merge agents matched by context and functional roles in PRD
      assignedAgents: (() => {
        const roles = extractFunctionalRoles(prdContent);
        const roleAgentMap = resolveAgentsForRoles(roles, allAgents as any);
        const roleAgents = Object.values(roleAgentMap).flat();
        return [...new Map([
          ...getAgentsForContext(contextName),
          ...roleAgents
        ].map(a => [a.name, a])).values()];
      })(),
      businessContext: extractBusinessContext(prdContent),
      businessQuestions: generateBusinessQuestions(contextName, prdContent)
    });
  }
  
  // Generate session preparation document
  let md = "# Event Storming Session Preparation\n\n";
// Reference strategy artefacts
const strategyDir = path.join(__dirname, "..", "docs", "strategy");
if (fs.existsSync(strategyDir)) {
  const mdFiles = fs.readdirSync(strategyDir).filter(f => f.endsWith(".md"));
  md += "## Reference Strategy Artefacts\n";
  if (mdFiles.length === 0) {
    md += "_No strategy documents found_\n\n";
  } else {
    mdFiles.slice(0, 12).forEach(f => {
      const title = f.replace(/[-_]/g, " ").replace(/\.md$/i, "");
      md += `- [${title}](docs/strategy/${f})\n`;
    });
    md += "\n";
  }
}
  md += "> **Purpose**: Prepare domain experts for collaborative Event Storming sessions\n\n";
  md += `**Session Date**: _[TO BE SCHEDULED]_\n`;
  md += `**Facilitator**: _[TO BE ASSIGNED]_\n`;
  md += `**Duration**: 2-3 hours per context\n\n`;
  
  md += "## Pre-Session Checklist\n\n";
  md += "- [ ] Book conference room with wall space for sticky notes\n";
  md += "- [ ] Prepare sticky notes (orange=events, blue=commands, yellow=aggregates, pink=external systems)\n";
  md += "- [ ] Print context maps and PRDs for reference\n";
  md += "- [ ] Invite domain experts and stakeholders\n";
  md += "- [ ] Set up digital collaboration tool (Miro/Mural) as backup\n\n";
  
  md += "## Session Agenda Template\n\n";
  md += "1. **Context Introduction** (15 min) - Review PRD and business context\n";
  md += "2. **Event Storming** (90 min) - Collaborative domain modeling\n";
  md += "3. **Integration Points** (30 min) - Map context boundaries\n";
  md += "4. **Validation** (15 min) - Review and validate model\n";
  md += "5. **Next Steps** (10 min) - Assign follow-up actions\n\n";
  
  for (const context of sessionContexts) {
    md += `## ${context.name.replace(/_/g, ' ').toUpperCase()} - Session Brief\n\n`;
    
    md += `### 📋 ${context.name} - Pre-Session Reading\n`;
    md += `- **PRD**: [${context.name} Requirements](${context.prdPath})\n`;
    md += `- **Context Map**: Review integration points with other contexts\n`;
    md += `- **Glossary**: [Domain Terms](DDD_Artefacts/docs/ubiquitous-language/${context.name.replace(/_/g, '-')}-glossary.md)\n\n`;
    
    if (context.existingEvents.length > 0) {
      md += `### 🟠 ${context.name} - Known Domain Events (Starting Points)\n`;
      context.existingEvents.forEach(event => {
        md += `- **${event}** - _What business condition triggers this?_\n`;
      });
      md += "\n";
    }
    
    if (context.existingCommands.length > 0) {
      md += `### 🔵 ${context.name} - Known Commands (Actions)\n`;
      context.existingCommands.forEach(command => {
        md += `- **${command}** - _Who initiates this and why?_\n`;
      });
      md += "\n";
    }
    
    if (context.integrationPoints.length > 0) {
      md += `### 🔗 ${context.name} - Integration Points to Explore\n`;
      context.integrationPoints.forEach(point => {
        md += `- ${point}\n`;
      });
      md += "\n";
    }
    
    // Business context summary
    if (context.businessContext.length) {
      md += `### 📄 ${context.name} - Business Context\n`;
      context.businessContext.forEach(line => md += `${line}\n`);
      md += "\n";
    }

    // List assigned agents
    md += `### 👥 ${context.name} - Assigned Agents\n`;
    context.assignedAgents.forEach(agent => {
      md += `- ${agent.name} (${agent.category})\n`;
    });
    md += "\n";

    md += `### 📝 ${context.name} - Agent Action Items\n`;
    md += "- Review PRD and prepare domain assumptions\n";
    md += "- Bring relevant data or metrics to discuss\n";
    md += "- Identify potential risks or constraints\n\n";

    md += `### ❓ ${context.name} - Key Business Questions for Session\n`;
    context.businessQuestions.forEach((question, index) => {
      md += `${index + 1}. ${question}\n`;
    });
    md += "\n";
    
    md += `### 🎯 ${context.name} - Session Success Criteria\n`;
    md += `- [ ] Complete event timeline for ${context.name} business processes\n`;
    md += `- [ ] Identify all domain events and their triggers\n`;
    md += `- [ ] Map commands to aggregates and business rules\n`;
    md += `- [ ] Define integration events with other contexts\n`;
    md += `- [ ] Validate model with domain experts\n`;
    md += `- [ ] Document hotspots and areas needing further analysis\n\n`;
    
    md += "---\n\n";
  }
  
  md += "## Post-Session Actions\n\n";
  md += "1. **Digitize Results** - Transfer sticky note model to digital format\n";
  md += "2. **Update PRDs** - Enhance requirements with session insights\n";
  md += "3. **Create ADRs** - Document architectural decisions made\n";
  md += "4. **Update Context Map** - Refine integration patterns\n";
  md += "5. **Plan Implementation** - Create concrete development tasks\n";
  md += "6. **Schedule Follow-ups** - Plan validation sessions with stakeholders\n\n";
  
  // Write session preparation file
  fs.writeFileSync("DDD_Artefacts/event-storming-session-prep.md", md);
  
  console.log(chalk.green(`✔ Event Storming session prep generated for ${sessionContexts.length} contexts`));
  console.log(chalk.blue(`📅 Ready for collaborative domain modeling sessions`));
  console.log(chalk.yellow(`📋 Review DDD_Artefacts/event-storming-session-prep.md before scheduling`));
}
