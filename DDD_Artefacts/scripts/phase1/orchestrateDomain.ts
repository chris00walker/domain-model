import fs from "fs";
import yaml from "js-yaml";
import chalk from "chalk";

interface RawAgent {
  name: string;
  category: string;
  expertise: string[];
  contexts: string[];
}

// Load full agent roster
const rosterPath = "DDD_Artefacts/automation/roster.yaml";
let allAgents: RawAgent[] = [];
if (fs.existsSync(rosterPath)) {
  try {
    const rosterDoc = yaml.load(fs.readFileSync(rosterPath, "utf8")) as any;
    allAgents = rosterDoc?.agents || [];
  } catch (e) {
    console.error(chalk.red("⚠️ Failed to load roster.yaml"), e);
  }
}

function getAgentsForContext(contextName: string, desired = 3): DomainAgent[] {
  // Direct context match
  let selected = allAgents.filter(a => (a.contexts || []).includes(contextName));
  // Expertise match fallback
  if (selected.length < desired) {
    const expertiseMatch = allAgents.filter(a => (a.expertise || []).some(exp => contextName.includes(exp)));
    selected = [...new Set([...selected, ...expertiseMatch])];
  }
  // Generic fallback
  if (selected.length < desired) selected = allAgents;
  return selected.slice(0, desired).map(a => ({
    name: a.name,
    category: a.category as any,
    expertise: a.expertise,
    contexts: a.contexts
  }));
}

function getContextToAgentMapping(): Record<string, DomainAgent[]> {
  const mapping: Record<string, DomainAgent[]> = {};
  allAgents.forEach(a => {
    (a.contexts || []).forEach(ctx => {
      if (!mapping[ctx]) mapping[ctx] = [];
      mapping[ctx].push({
        name: a.name,
        category: a.category as any,
        expertise: a.expertise,
        contexts: a.contexts
      });
    });
  });
  return mapping;
}

interface DomainAgent {
  name: string;
  category: 'Core' | 'Supporting' | 'Strategic' | 'Integration';
  expertise: string[];
  contexts: string[];
}

interface ContextSession {
  contextName: string;
  status: 'existing' | 'missing';
  category: 'core' | 'supporting' | 'strategic';
  sessionType: 'validation' | 'creation';
  assignedAgents: DomainAgent[];
  dependencies: string[];
  priority: number;
  sessionDuration: string;
  deliverables: string[];
  elevenPointChecklist: ElevenPointFramework;
}

interface IntegrationSession {
  sessionName: string;
  contextPair: [string, string];
  integrationType: 'upstream-downstream' | 'peer-to-peer' | 'shared-kernel';
  assignedAgents: DomainAgent[];
  sessionDuration: string;
  integrationPatterns: string[];
  deliverables: string[];
  validationPoints: string[];
}

interface ElevenPointFramework {
  domainScopeKPIs: string[];
  ubiquitousLanguage: string[];
  coreEvents: string[];
  commandsActors: string[];
  aggregatesInvariants: string[];
  policiesSagas: string[];
  externalInterfaces: string[];
  complianceRisk: string[];
  crossContextTouchpoints: string[];
  edgeCasesFailures: string[];
  openQuestions: string[];
}

// Enhanced context mapping with agent expertise
// Deprecated static mapping removed. Dynamic roster-based assignment is now used.

function getElevenPointFramework(contextName: string, sessionType: 'validation' | 'creation'): ElevenPointFramework {
  const baseFramework = {
    domainScopeKPIs: [
      'Define clear business boundaries and success metrics',
      'Identify key performance indicators for this context',
      'Map business capabilities and value streams'
    ],
    ubiquitousLanguage: [
      'Review and validate domain terminology',
      'Ensure consistency with existing glossaries',
      'Identify new terms and concepts'
    ],
    coreEvents: [
      'Map critical business events and their triggers',
      'Define event schemas and data requirements',
      'Identify event sourcing opportunities'
    ],
    commandsActors: [
      'Define user actions and system commands',
      'Map actors to their responsibilities',
      'Validate authorization and access patterns'
    ],
    aggregatesInvariants: [
      'Identify business entities and their boundaries',
      'Define business rules and invariants',
      'Validate consistency requirements'
    ],
    policiesSagas: [
      'Map business processes and workflows',
      'Define compensation and rollback strategies',
      'Identify long-running processes'
    ],
    externalInterfaces: [
      'Map integration points with other contexts',
      'Define API contracts and data formats',
      'Identify external system dependencies'
    ],
    complianceRisk: [
      'Review regulatory requirements',
      'Identify compliance checkpoints',
      'Assess business and technical risks'
    ],
    crossContextTouchpoints: [
      'Map relationships with other bounded contexts',
      'Define integration patterns and anti-corruption layers',
      'Validate context boundaries'
    ],
    edgeCasesFailures: [
      'Identify exceptional scenarios and error conditions',
      'Define failure modes and recovery strategies',
      'Plan for system degradation scenarios'
    ],
    openQuestions: [
      'Document unresolved business questions',
      'Identify areas needing further research',
      'Plan follow-up sessions and validations'
    ]
  };

  // Context-specific enhancements
  const contextEnhancements: Record<string, Partial<ElevenPointFramework>> = {
    'batch_tracking': {
      complianceRisk: [...baseFramework.complianceRisk, 'FDA traceability requirements', 'Lot genealogy compliance'],
      coreEvents: [...baseFramework.coreEvents, 'BatchCreated', 'BatchSplit', 'BatchMerged', 'BatchExpired']
    },
    'cold_chain': {
      complianceRisk: [...baseFramework.complianceRisk, 'Temperature monitoring compliance', 'Cold chain documentation'],
      coreEvents: [...baseFramework.coreEvents, 'TemperatureExcursion', 'ColdChainBreach', 'TemperatureRecorded']
    },
    'inventory_management': {
      aggregatesInvariants: [...baseFramework.aggregatesInvariants, 'FEFO inventory rules', 'Stock reservation logic'],
      coreEvents: [...baseFramework.coreEvents, 'InventoryReserved', 'StockExpired', 'ReorderTriggered']
    },
    'quality_control': {
      complianceRisk: [...baseFramework.complianceRisk, 'Quality standards compliance', 'Inspection documentation'],
      policiesSagas: [...baseFramework.policiesSagas, 'Quality inspection workflow', 'Failed quality handling']
    }
  };

  const enhanced = { ...baseFramework };
  if (contextEnhancements[contextName]) {
    Object.keys(contextEnhancements[contextName]).forEach(key => {
      enhanced[key as keyof ElevenPointFramework] = contextEnhancements[contextName][key as keyof ElevenPointFramework] || enhanced[key as keyof ElevenPointFramework];
    });
  }

  return enhanced;
}

function generateIntegrationSessions(contextSessions: ContextSession[], dependencyData: Record<string, string[]>): IntegrationSession[] {
  const integrationSessions: IntegrationSession[] = [];
  const processedPairs = new Set<string>();

  // Generate integration sessions based on dependency relationships
  for (const [contextName, dependencies] of Object.entries(dependencyData)) {
    for (const dependency of dependencies) {
      const pairKey = [contextName, dependency].sort().join('-');
      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);

      // Determine integration type
      let integrationType: 'upstream-downstream' | 'peer-to-peer' | 'shared-kernel' = 'upstream-downstream';
      if (dependencyData[dependency]?.includes(contextName)) {
        integrationType = 'peer-to-peer'; // Bidirectional dependency
      }
      if (['shared', 'kernel', 'common'].some(term => contextName.includes(term) || dependency.includes(term))) {
        integrationType = 'shared-kernel';
      }

      // Get agents from both contexts
      // dynamic agent fetch per context now

      const context1Agents = getAgentsForContext(contextName, 2).map(a => a.name);
      const context2Agents = getAgentsForContext(dependency, 2).map(a => a.name);
      const combinedAgentNames = [...new Set([...context1Agents, ...context2Agents])].slice(0, 4);

      // Define integration patterns based on context types
      const integrationPatterns = getIntegrationPatterns(contextName, dependency, integrationType);

      const integrationSession: IntegrationSession = {
        sessionName: `${contextName.replace(/_/g, ' ')} ↔ ${dependency.replace(/_/g, ' ')} Integration`,
        contextPair: [contextName, dependency],
        integrationType,
        assignedAgents: combinedAgentNames.map(name => ({
          name,
          category: 'Integration' as const,
          expertise: [contextName, dependency],
          contexts: [contextName, dependency]
        })),
        sessionDuration: integrationType === 'shared-kernel' ? '3 hours' : '2 hours',
        integrationPatterns,
        deliverables: [
          'Integration specification document',
          'API contract definitions',
          'Event schema specifications',
          'Anti-corruption layer design',
          'Integration test scenarios',
          'Error handling and rollback procedures'
        ],
        validationPoints: [
          'Context boundary validation',
          'Data consistency requirements',
          'Event flow verification',
          'Performance impact assessment',
          'Security and authorization checks',
          'Monitoring and observability setup'
        ]
      };

      integrationSessions.push(integrationSession);
    }
  }

  return integrationSessions;
}

function getIntegrationPatterns(context1: string, context2: string, type: string): string[] {
  const basePatterns = [
    'Domain Event Publishing/Subscribing',
    'API Gateway Integration',
    'Message Queue Communication',
    'Database Integration Patterns'
  ];

  // Context-specific integration patterns
  const contextPatterns: Record<string, string[]> = {
    'inventory_management': ['Stock Reservation Events', 'FEFO Inventory Updates', 'Reorder Point Notifications'],
    'cold_chain': ['Temperature Monitoring Events', 'Cold Chain Breach Alerts', 'Compliance Documentation'],
    'batch_tracking': ['Batch Genealogy Events', 'Traceability Chain Updates', 'Regulatory Reporting'],
    'quality_control': ['Quality Inspection Events', 'Quality Failure Notifications', 'Compliance Status Updates'],
    'order_management': ['Order State Events', 'Fulfillment Triggers', 'Customer Notifications'],
    'payment_billing': ['Payment Events', 'Invoice Generation', 'Financial Reconciliation'],
    'shipping_fulfillment': ['Shipment Events', 'Delivery Confirmations', 'Logistics Updates'],
    'notifications_alerts': ['Multi-channel Delivery', 'Alert Prioritization', 'Delivery Confirmation']
  };

  const patterns = [...basePatterns];
  if (contextPatterns[context1]) patterns.push(...contextPatterns[context1]);
  if (contextPatterns[context2]) patterns.push(...contextPatterns[context2]);

  // Add type-specific patterns
  if (type === 'shared-kernel') {
    patterns.push('Shared Domain Models', 'Common Validation Rules', 'Shared Value Objects');
  } else if (type === 'peer-to-peer') {
    patterns.push('Bidirectional Event Flow', 'Mutual API Contracts', 'Conflict Resolution');
  } else {
    patterns.push('Anti-Corruption Layer', 'Data Translation', 'Upstream/Downstream Contracts');
  }

  return [...new Set(patterns)].slice(0, 8);
}

export async function orchestrateDomain() {
  console.log(chalk.blue("🎭 Orchestrating complete domain modeling workflow..."));
  
  // Load existing data
  const gapsFile = ".windsurf/memories/gap-analysis.md";
  const gaps: string[] = [];
  if (fs.existsSync(gapsFile)) {
    const gapContent = fs.readFileSync(gapsFile, "utf8");
    gaps.push(...gapContent.match(/- \[ \] (.+)/g)?.map(m => m.replace("- [ ] ", "")) || []);
  }

  // Load dependency matrix for prioritization
  const matrixFile = "DDD_Artefacts/docs/analysis/phase1/event-dependency-matrix.md";
  const dependencyData: Record<string, string[]> = {};
  if (fs.existsSync(matrixFile)) {
    const matrixContent = fs.readFileSync(matrixFile, "utf8");
    const lines = matrixContent.split('\n');
    for (const line of lines) {
      if (line.includes('|') && line.includes('**')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 4) {
          const contextMatch = parts[1].match(/\*\*(.+?)\*\*/);
          if (contextMatch) {
            const context = contextMatch[1];
            const deps = parts[2].split(',').map(d => d.trim()).filter(d => d && d !== '-');
            dependencyData[context] = deps;
          }
        }
      }
    }
  }

  // Define all contexts (existing + missing)
  const existingContexts = [
    'order_management', 'customer_management', 'payment_billing', 'product_catalog',
    'shipping_fulfillment', 'pricing_promotions', 'subscription_management', 'admin_reporting'
  ];

  const allContexts = [...existingContexts, ...gaps];
  // dynamic agent fetch per context now

  const sessions: ContextSession[] = [];

  // Create session plans for all contexts
  for (const contextName of allContexts) {
    const isExisting = existingContexts.includes(contextName);
    const agents = getAgentsForContext(contextName);
    const dependencies = dependencyData[contextName] || [];
    
    // Determine priority based on dependencies
    let priority = 1; // High priority (foundation)
    if (dependencies.length > 0 && dependencies.length <= 2) priority = 2; // Medium
    if (dependencies.length > 2) priority = 3; // Low (complex integration)

    // Determine category
    let category: 'core' | 'supporting' | 'strategic' = 'supporting';
    if (['batch_tracking', 'cold_chain', 'inventory_management', 'quality_control', 'supplier_traceability', 'order_management'].includes(contextName)) {
      category = 'core';
    } else if (['marketing', 'analytics_reporting', 'sales_quoting', 'pricing_promotions', 'subscription_management'].includes(contextName)) {
      category = 'strategic';
    }

    const session: ContextSession = {
      contextName,
      status: isExisting ? 'existing' : 'missing',
      category,
      sessionType: isExisting ? 'validation' : 'creation',
      assignedAgents: agents,
      dependencies,
      priority,
      sessionDuration: isExisting ? '2 hours' : '3 hours',
      deliverables: isExisting ? 
        ['Enhanced PRD', 'Validated domain model', 'Integration updates', 'Identified gaps'] :
        ['New PRD', 'Domain model', 'Event catalog', 'Integration specification'],
      elevenPointChecklist: getElevenPointFramework(contextName, isExisting ? 'validation' : 'creation')
    };

    sessions.push(session);
  }

  // Sort sessions by priority and dependencies
  sessions.sort((a, b) => a.priority - b.priority || a.dependencies.length - b.dependencies.length);

  // Generate integration sessions
  const integrationSessions = generateIntegrationSessions(sessions, dependencyData);

  // Generate comprehensive domain orchestration plan
  let md = "# EFI Domain Model Orchestration Plan\n\n";
  md += "> **Purpose**: Complete Eric Evans-style domain modeling workflow for all 20 contexts + cross-context integration\n\n";
  md += `**Total Contexts**: ${allContexts.length} (${existingContexts.length} existing + ${gaps.length} missing)\n`;
  md += `**Context Sessions**: ${sessions.length}\n`;
  md += `**Integration Sessions**: ${integrationSessions.length}\n`;
  md += `**Total Sessions**: ${sessions.length + integrationSessions.length}\n`;
  const totalHours = sessions.reduce((sum, s) => sum + parseInt(s.sessionDuration), 0) + integrationSessions.reduce((sum, s) => sum + parseInt(s.sessionDuration), 0);
  md += `**Estimated Duration**: ${totalHours} hours\n`;
  md += `**Timeline**: 10-12 weeks with proper scheduling\n\n`;

  md += "## Executive Summary\n\n";
  md += `### Session Distribution\n`;
  md += `- **Validation Sessions**: ${sessions.filter(s => s.sessionType === 'validation').length} (existing contexts)\n`;
  md += `- **Creation Sessions**: ${sessions.filter(s => s.sessionType === 'creation').length} (missing contexts)\n`;
  md += `- **Core Domain**: ${sessions.filter(s => s.category === 'core').length} contexts\n`;
  md += `- **Supporting**: ${sessions.filter(s => s.category === 'supporting').length} contexts\n`;
  md += `- **Strategic**: ${sessions.filter(s => s.category === 'strategic').length} contexts\n\n`;

  md += "### Agent Utilization\n";
  const allAgents = new Set<string>();
  sessions.forEach(s => s.assignedAgents.forEach(a => allAgents.add(a.name)));
  md += `- **Total Domain Experts**: ${allAgents.size}\n`;
  md += `- **Average Agents per Session**: ${Math.round((sessions.reduce((sum, s) => sum + s.assignedAgents.length, 0) / sessions.length) * 10) / 10}\n\n`;

  md += "## 11-Point Domain Modeling Framework\n\n";
  md += "Each session will systematically cover:\n\n";
  md += "1. **Domain Scope + KPIs** — Business boundaries and success metrics\n";
  md += "2. **Ubiquitous Language** — Terminology consistency and validation\n";
  md += "3. **Core Events** — Critical business events and triggers\n";
  md += "4. **Commands & Actors** — User actions and system interactions\n";
  md += "5. **Aggregates & Invariants** — Business entities and rules\n";
  md += "6. **Policies / Sagas** — Business processes and workflows\n";
  md += "7. **External Interfaces / Dependencies** — Integration points\n";
  md += "8. **Compliance & Risk** — Regulatory and business risks\n";
  md += "9. **Cross‑Context Touch‑points** — Bounded context relationships\n";
  md += "10. **Edge Cases & Failure Modes** — Exception handling\n";
  md += "11. **Open Questions** — Unresolved issues and follow-ups\n\n";

  // Group sessions by priority phases
  const phase1Sessions = sessions.filter(s => s.priority === 1);
  const phase2Sessions = sessions.filter(s => s.priority === 2);
  const phase3Sessions = sessions.filter(s => s.priority === 3);

  const phases = [
    { name: "Phase 1: Foundation Contexts", sessions: phase1Sessions, description: "Independent contexts with no upstream dependencies" },
    { name: "Phase 2: Integration Contexts", sessions: phase2Sessions, description: "Contexts with 1-2 upstream dependencies" },
    { name: "Phase 3: Complex Integration", sessions: phase3Sessions, description: "Contexts with 3+ upstream dependencies" }
  ];

  for (const phase of phases) {
    md += `## ${phase.name}\n\n`;
    md += `${phase.description}\n\n`;
    md += `**Sessions**: ${phase.sessions.length} | **Duration**: ${phase.sessions.reduce((sum, s) => sum + parseInt(s.sessionDuration), 0)} hours\n\n`;

    for (const session of phase.sessions) {
      md += `### ${session.contextName.replace(/_/g, ' ').toUpperCase()}\n\n`;
      md += `**Type**: ${session.sessionType === 'validation' ? '🔍 Validation' : '🆕 Creation'} | `;
      md += `**Category**: ${session.category} | **Duration**: ${session.sessionDuration}\n\n`;
      
      if (session.dependencies.length > 0) {
        md += `**Dependencies**: ${session.dependencies.join(', ')}\n\n`;
      }

      md += `**Assigned Domain Experts**:\n`;
      session.assignedAgents.forEach(agent => {
        md += `- ${agent.name}\n`;
      });
      md += "\n";

      md += `**Session Deliverables**:\n`;
      session.deliverables.forEach(deliverable => {
        md += `- ${deliverable}\n`;
      });
      md += "\n";

      md += `**11-Point Framework Checklist**:\n\n`;
      
      md += `- **Domain Scope + KPIs**\n`;
      session.elevenPointChecklist.domainScopeKPIs.forEach(item => md += `  - [ ] ${item}\n`);
      md += "\n";

      md += `- **Ubiquitous Language**\n`;
      session.elevenPointChecklist.ubiquitousLanguage.forEach(item => md += `  - [ ] ${item}\n`);
      md += "\n";

      md += `- **Core Events**\n`;
      session.elevenPointChecklist.coreEvents.forEach(item => md += `  - [ ] ${item}\n`);
      md += "\n";

      md += `- **Commands & Actors**\n`;
      session.elevenPointChecklist.commandsActors.forEach(item => md += `  - [ ] ${item}\n`);
      md += "\n";

      md += `- **Aggregates & Invariants**\n`;
      session.elevenPointChecklist.aggregatesInvariants.forEach(item => md += `  - [ ] ${item}\n`);
      md += "\n";

      md += `- **Policies / Sagas**\n`;
      session.elevenPointChecklist.policiesSagas.forEach(item => md += `  - [ ] ${item}\n`);
      md += "\n";

      md += `- **External Interfaces / Dependencies**\n`;
      session.elevenPointChecklist.externalInterfaces.forEach(item => md += `  - [ ] ${item}\n`);
      md += "\n";

      md += `- **Compliance & Risk**\n`;
      session.elevenPointChecklist.complianceRisk.forEach(item => md += `  - [ ] ${item}\n`);
      md += "\n";

      md += `- **Cross-Context Touch-points**\n`;
      session.elevenPointChecklist.crossContextTouchpoints.forEach(item => md += `  - [ ] ${item}\n`);
      md += "\n";

      md += `- **Edge Cases & Failure Modes**\n`;
      session.elevenPointChecklist.edgeCasesFailures.forEach(item => md += `  - [ ] ${item}\n`);
      md += "\n";

      md += `- **Open Questions**\n`;
      session.elevenPointChecklist.openQuestions.forEach(item => md += `  - [ ] ${item}\n`);
      md += "\n";

      md += "---\n\n";
    }
  }

  md += "## Cross-Context Integration Sessions\n\n";
  md += `**Purpose**: Define integration patterns, boundaries, and contracts between contexts\n\n`;
  md += `**Total Integration Sessions**: ${integrationSessions.length}\n`;
  md += `**Integration Duration**: ${integrationSessions.reduce((sum, s) => sum + parseInt(s.sessionDuration), 0)} hours\n\n`;

  for (const integration of integrationSessions) {
    md += `### ${integration.sessionName}\n\n`;
    md += `**Type**: ${integration.integrationType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | **Duration**: ${integration.sessionDuration}\n\n`;
    
    md += `**Context Pair**: ${integration.contextPair[0].replace(/_/g, ' ')} ↔ ${integration.contextPair[1].replace(/_/g, ' ')}\n\n`;
    
    md += `**Assigned Integration Experts**:\n`;
    integration.assignedAgents.forEach(agent => {
      md += `- ${agent.name}\n`;
    });
    md += "\n";
    
    md += `**Integration Patterns**:\n`;
    integration.integrationPatterns.forEach(pattern => {
      md += `- ${pattern}\n`;
    });
    md += "\n";
    
    md += `**Session Deliverables**:\n`;
    integration.deliverables.forEach(deliverable => {
      md += `- ${deliverable}\n`;
    });
    md += "\n";
    
    md += `**Validation Points**:\n`;
    integration.validationPoints.forEach(point => {
      md += `- [ ] ${point}\n`;
    });
    md += "\n";
    
    md += "---\n\n";
  }

  md += "## Session Scheduling Recommendations\n\n";
  md += "### Week 1-3: Foundation Phase\n";
  md += "- Focus on contexts with no dependencies\n";
  md += "- Establish core domain patterns\n";
  md += "- Validate existing implementations\n\n";

  md += "### Week 4-6: Integration Phase\n";
  md += "- Build on foundation contexts\n";
  md += "- Focus on integration patterns\n";
  md += "- Run cross-context integration sessions\n\n";

  md += "### Week 7-9: Complex Integration\n";
  md += "- Address complex multi-dependency contexts\n";
  md += "- Finalize integration specifications\n";
  md += "- Complete domain model validation\n\n";

  md += "### Week 10-12: Consolidation\n";
  md += "- Review and integrate all session outputs\n";
  md += "- Update architecture documentation\n";
  md += "- Plan implementation roadmap\n\n";

  md += "## Success Criteria\n\n";
  md += "- [ ] All 20 contexts have complete domain models\n";
  md += "- [ ] All 11 framework points covered for each context\n";
  md += "- [ ] Integration patterns validated between contexts\n";
  md += "- [ ] Domain experts have signed off on their contexts\n";
  md += "- [ ] Implementation roadmap is ready for execution\n";
  md += "- [ ] Architecture documentation is complete and current\n\n";

  // Write comprehensive orchestration plan
  fs.writeFileSync("DDD_Artefacts/docs/analysis/phase1/domain-orchestration-plan.md", md);
  
  console.log(chalk.green(`✔ Domain orchestration plan generated for ${sessions.length + integrationSessions.length} sessions`));
  console.log(chalk.blue(`🎭 ${allAgents.size} domain experts assigned across all contexts`));
  console.log(chalk.cyan(`🔗 ${integrationSessions.length} cross-context integration sessions planned`));
  console.log(chalk.yellow(`📅 ${totalHours} total hours planned`));
  console.log(chalk.magenta(`📋 Complete 11-point framework applied to all contexts`));
}
