import fs from "fs";
import chalk from "chalk";

interface ImplementationTask {
  contextName: string;
  priority: number;
  effortWeeks: number;
  dependencies: string[];
  deliverables: string[];
  risks: string[];
  acceptanceCriteria: string[];
  teamSkills: string[];
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

function estimateEffort(contextName: string, prdContent: string, hasExistingCode: boolean): number {
  let baseWeeks = 3; // Default for new context
  
  // Adjust based on complexity indicators
  const complexityIndicators = [
    'compliance', 'regulation', 'audit', 'integration', 'external system',
    'real-time', 'notification', 'workflow', 'approval', 'batch processing'
  ];
  
  const complexityScore = complexityIndicators.reduce((score, indicator) => {
    return score + (prdContent.toLowerCase().includes(indicator) ? 1 : 0);
  }, 0);
  
  // Context-specific adjustments
  const contextComplexity: Record<string, number> = {
    'batch_tracking': 4,      // Complex traceability requirements
    'cold_chain': 5,          // Real-time monitoring, compliance
    'inventory_management': 6, // Complex FEFO logic, integrations
    'quality_control': 4,     // Compliance workflows
    'returns': 3,             // Standard CRUD with workflow
    'shopping_cart': 2,       // Well-understood domain
    'marketing': 3,           // Campaign management complexity
    'supplier_traceability': 5, // EDI integration, compliance
    'notifications_alerts': 4,  // Multi-channel, real-time
    'analytics_reporting': 5,   // Data aggregation, visualization
    'reviews_ratings': 2,       // Simple domain
    'sales_quoting': 4          // Complex pricing calculations
  };
  
  baseWeeks = contextComplexity[contextName] || baseWeeks;
  baseWeeks += Math.floor(complexityScore / 2); // Add complexity bonus
  
  // Reduce if existing code provides foundation
  if (hasExistingCode) {
    baseWeeks = Math.max(1, Math.floor(baseWeeks * 0.6));
  }
  
  return baseWeeks;
}

function identifyRisks(contextName: string, prdContent: string): string[] {
  const risks: string[] = [];
  
  // Technical risks
  if (prdContent.toLowerCase().includes('real-time')) {
    risks.push('Real-time processing complexity may require specialized infrastructure');
  }
  if (prdContent.toLowerCase().includes('integration')) {
    risks.push('External system integration dependencies may cause delays');
  }
  if (prdContent.toLowerCase().includes('compliance')) {
    risks.push('Regulatory compliance requirements may require legal review');
  }
  
  // Context-specific risks
  const contextRisks: Record<string, string[]> = {
    'batch_tracking': [
      'Regulatory compliance requirements may change during development',
      'Integration with supplier systems may have data quality issues'
    ],
    'cold_chain': [
      'IoT sensor integration reliability concerns',
      'Real-time alerting infrastructure scaling challenges'
    ],
    'inventory_management': [
      'FEFO algorithm complexity may require performance optimization',
      'Multi-channel inventory synchronization race conditions'
    ],
    'quality_control': [
      'Quality standards may evolve during development',
      'Integration with lab systems may have technical constraints'
    ],
    'notifications_alerts': [
      'Multi-channel delivery reliability concerns',
      'Message volume scaling challenges'
    ],
    'analytics_reporting': [
      'Data pipeline performance at scale',
      'Business intelligence tool integration complexity'
    ]
  };
  
  if (contextRisks[contextName]) {
    risks.push(...contextRisks[contextName]);
  }
  
  return risks.slice(0, 4);
}

function generateAcceptanceCriteria(contextName: string, prdContent: string): string[] {
  const criteria: string[] = [];
  
  // Standard criteria for all contexts
  criteria.push('All domain events are properly published and handled');
  criteria.push('Business rules are validated with domain experts');
  criteria.push('Integration tests pass with dependent contexts');
  criteria.push('Performance meets SLA requirements under expected load');
  
  // Context-specific criteria
  const contextCriteria: Record<string, string[]> = {
    'batch_tracking': [
      'Batch genealogy can be traced end-to-end',
      'Regulatory reporting generates compliant documentation',
      'Batch splitting and merging operations maintain traceability'
    ],
    'cold_chain': [
      'Temperature excursions trigger alerts within 5 minutes',
      'Cold chain documentation is audit-ready',
      'Integration with shipping carriers provides real-time visibility'
    ],
    'inventory_management': [
      'FEFO logic correctly prioritizes expiring inventory',
      'Inventory reservations prevent overselling',
      'Reorder points trigger automatic purchase recommendations'
    ],
    'quality_control': [
      'Quality inspections follow defined workflows',
      'Failed quality checks prevent product release',
      'Quality metrics are tracked and reportable'
    ]
  };
  
  if (contextCriteria[contextName]) {
    criteria.push(...contextCriteria[contextName]);
  }
  
  return criteria.slice(0, 6);
}

function identifyRequiredSkills(contextName: string, prdContent: string): string[] {
  const skills: string[] = ['TypeScript/Node.js', 'Domain-Driven Design', 'Event-Driven Architecture'];
  
  // Add skills based on content analysis
  if (prdContent.toLowerCase().includes('real-time')) {
    skills.push('Real-time Systems');
  }
  if (prdContent.toLowerCase().includes('integration')) {
    skills.push('API Integration');
  }
  if (prdContent.toLowerCase().includes('compliance')) {
    skills.push('Regulatory Compliance');
  }
  if (prdContent.toLowerCase().includes('analytics')) {
    skills.push('Data Analytics');
  }
  
  // Context-specific skills
  const contextSkills: Record<string, string[]> = {
    'batch_tracking': ['Supply Chain Management', 'Regulatory Compliance'],
    'cold_chain': ['IoT Systems', 'Real-time Monitoring'],
    'inventory_management': ['Inventory Management', 'FEFO Algorithms'],
    'quality_control': ['Quality Management Systems', 'Workflow Design'],
    'notifications_alerts': ['Message Queues', 'Multi-channel Communication'],
    'analytics_reporting': ['Data Warehousing', 'Business Intelligence'],
    'supplier_traceability': ['EDI Integration', 'B2B Communication']
  };
  
  if (contextSkills[contextName]) {
    skills.push(...contextSkills[contextName]);
  }
  
  return [...new Set(skills)].slice(0, 6);
}

export async function planImplementation() {
  console.log(chalk.blue("📋 Generating implementation plan..."));
  
  // Read gaps and dependency matrix
  const gapsFile = ".windsurf/memories/gap-analysis.md";
  const gaps: string[] = [];
  if (fs.existsSync(gapsFile)) {
    const gapContent = fs.readFileSync(gapsFile, "utf8");
    gaps.push(...gapContent.match(/- \[ \] (.+)/g)?.map(m => m.replace("- [ ] ", "")) || []);
  }
  
  // Read dependency matrix for priority ordering
  const matrixFile = "DDD_Artefacts/event-dependency-matrix.md";
  const dependencyData: Record<string, string[]> = {};
  if (fs.existsSync(matrixFile)) {
    const matrixContent = fs.readFileSync(matrixFile, "utf8");
    // Parse upstream dependencies from matrix
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
  
  const prdMapping = getContextToPrdMapping();
  const tasks: ImplementationTask[] = [];
  
  // Generate implementation tasks
  for (const contextName of gaps) {
    const prdInfo = prdMapping[contextName];
    if (!prdInfo) continue;
    
    const prdPath = `DDD_Artefacts/docs/prd/${prdInfo.category}/${prdInfo.filename}`;
    if (!fs.existsSync(prdPath)) continue;
    
    const prdContent = fs.readFileSync(prdPath, "utf8");
    const hasExistingCode = fs.existsSync(`DDD_Artefacts/src/${contextName}`);
    
    // Determine priority based on dependencies
    const deps = dependencyData[contextName] || [];
    let priority = 1; // High priority (foundation)
    if (deps.length > 0 && deps.length <= 2) priority = 2; // Medium
    if (deps.length > 2) priority = 3; // Low (complex integration)
    
    tasks.push({
      contextName,
      priority,
      effortWeeks: estimateEffort(contextName, prdContent, hasExistingCode),
      dependencies: deps.slice(0, 5),
      deliverables: [
        'Domain model implementation',
        'API endpoints and controllers',
        'Integration event handlers',
        'Unit and integration tests',
        'Updated documentation'
      ],
      risks: identifyRisks(contextName, prdContent),
      acceptanceCriteria: generateAcceptanceCriteria(contextName, prdContent),
      teamSkills: identifyRequiredSkills(contextName, prdContent)
    });
  }
  
  // Sort by priority then by effort
  tasks.sort((a, b) => a.priority - b.priority || a.effortWeeks - b.effortWeeks);
  
  // Generate implementation plan
  let md = "# EFI Domain Model Implementation Plan\n\n";
  md += "> **Purpose**: Actionable implementation roadmap for completing the EFI domain model\n\n";
  
  const totalEffort = tasks.reduce((sum, task) => sum + task.effortWeeks, 0);
  const phase1Tasks = tasks.filter(t => t.priority === 1);
  const phase2Tasks = tasks.filter(t => t.priority === 2);
  const phase3Tasks = tasks.filter(t => t.priority === 3);
  
  md += "## Executive Summary\n\n";
  md += `- **Total Implementation Effort**: ${totalEffort} weeks\n`;
  md += `- **Phase 1 (Foundation)**: ${phase1Tasks.length} contexts, ${phase1Tasks.reduce((sum, t) => sum + t.effortWeeks, 0)} weeks\n`;
  md += `- **Phase 2 (Integration)**: ${phase2Tasks.length} contexts, ${phase2Tasks.reduce((sum, t) => sum + t.effortWeeks, 0)} weeks\n`;
  md += `- **Phase 3 (Complex)**: ${phase3Tasks.length} contexts, ${phase3Tasks.reduce((sum, t) => sum + t.effortWeeks, 0)} weeks\n`;
  md += `- **Estimated Timeline**: ${Math.ceil(totalEffort / 2)} weeks with 2 parallel development streams\n\n`;
  
  md += "## Implementation Phases\n\n";
  
  const phases = [
    { name: "Phase 1: Foundation Contexts", tasks: phase1Tasks, description: "Independent contexts with no upstream dependencies" },
    { name: "Phase 2: Integration Contexts", tasks: phase2Tasks, description: "Contexts with 1-2 upstream dependencies" },
    { name: "Phase 3: Complex Integration", tasks: phase3Tasks, description: "Contexts with 3+ upstream dependencies" }
  ];
  
  for (const phase of phases) {
    md += `### ${phase.name}\n\n`;
    md += `${phase.description}\n\n`;
    
    for (const task of phase.tasks) {
      md += `#### ${task.contextName.replace(/_/g, ' ').toUpperCase()}\n\n`;
      md += `**Effort**: ${task.effortWeeks} weeks | **Priority**: ${task.priority === 1 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}\n\n`;
      
      if (task.dependencies.length > 0) {
        md += `**Dependencies**: ${task.dependencies.join(', ')}\n\n`;
      }
      
      md += `**Required Skills**:\n`;
      task.teamSkills.forEach(skill => md += `- ${skill}\n`);
      md += "\n";
      
      md += `**Key Deliverables**:\n`;
      task.deliverables.forEach(deliverable => md += `- ${deliverable}\n`);
      md += "\n";
      
      md += `**Acceptance Criteria**:\n`;
      task.acceptanceCriteria.forEach(criteria => md += `- [ ] ${criteria}\n`);
      md += "\n";
      
      if (task.risks.length > 0) {
        md += `**Risk Mitigation**:\n`;
        task.risks.forEach(risk => md += `- ⚠️ ${risk}\n`);
        md += "\n";
      }
      
      md += "---\n\n";
    }
  }
  
  md += "## Resource Planning\n\n";
  md += "### Team Composition Recommendations\n\n";
  md += "- **Senior Backend Developer** (DDD/Event Sourcing experience)\n";
  md += "- **Domain Expert** (Food import/supply chain knowledge)\n";
  md += "- **Integration Specialist** (API/EDI integration experience)\n";
  md += "- **QA Engineer** (Domain testing and compliance validation)\n\n";
  
  md += "### Parallel Development Strategy\n\n";
  md += "- **Stream 1**: Focus on core business contexts (batch_tracking, cold_chain, inventory)\n";
  md += "- **Stream 2**: Focus on supporting contexts (notifications, reviews, shopping_cart)\n";
  md += "- **Integration Points**: Coordinate between streams for context boundaries\n\n";
  
  md += "## Success Metrics\n\n";
  md += "- [ ] All contexts pass integration tests with existing system\n";
  md += "- [ ] Performance benchmarks meet SLA requirements\n";
  md += "- [ ] Domain experts validate business logic accuracy\n";
  md += "- [ ] Regulatory compliance requirements are satisfied\n";
  md += "- [ ] Documentation is complete and maintainable\n\n";
  
  // Write implementation plan
  fs.writeFileSync("DDD_Artefacts/implementation-plan.md", md);
  
  console.log(chalk.green(`✔ Implementation plan generated for ${tasks.length} contexts`));
  console.log(chalk.blue(`📊 Total effort: ${totalEffort} weeks across 3 phases`));
  console.log(chalk.yellow(`📋 Review DDD_Artefacts/implementation-plan.md for detailed planning`));
}
