import fs from "fs";
import chalk from "chalk";

interface ContextDependency {
  name: string;
  hasPRD: boolean;
  prdPath?: string;
  upstreamContexts: string[];
  downstreamContexts: string[];
  sharedEvents: string[];
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

// Map gap analysis names to context map component names
function getContextMapNameMapping(): Record<string, string[]> {
  return {
    'batch_tracking': ['BatchTracking'],
    'cold_chain': ['ColdChainMonitor'],
    'inventory_management': ['InventoryShelfLife'],
    'quality_control': ['QualityControl'],
    'returns': ['ReturnsMgmt'],
    'shopping_cart': ['ShoppingCart'],
    'marketing': ['Marketing'],
    'supplier_traceability': ['SupplierTrace'],
    'notifications_alerts': ['NotificationsAlerts'],
    'analytics_reporting': ['AnalyticsReporting'],
    'reviews_ratings': ['Reviews'],
    'sales_quoting': ['SalesQuoting']
  };
}

export async function buildMatrix() {
  console.log(chalk.blue("🔗 Building context dependency matrix..."));
  
  // Read gaps and context map
  const gapsFile = ".windsurf/memories/gap-analysis.md";
  const gaps: string[] = [];
  if (fs.existsSync(gapsFile)) {
    const gapContent = fs.readFileSync(gapsFile, "utf8");
    gaps.push(...gapContent.match(/- \[ \] (.+)/g)?.map(m => m.replace("- [ ] ", "")) || []);
  }
  
  const contextMap = fs.readFileSync("DDD_Artefacts/docs/diagrams/context_map.puml", "utf8");
  
  // Analyze dependencies for each context
  const dependencies: ContextDependency[] = [];
  for (const contextName of gaps) {
    const dep: ContextDependency = {
      name: contextName,
      hasPRD: false,
      upstreamContexts: [],
      downstreamContexts: [],
      sharedEvents: []
    };
    
    // Check for PRD using mapping
    const prdMapping = getContextToPrdMapping();
    const prdInfo = prdMapping[contextName];
    if (prdInfo) {
      const prdPath = `DDD_Artefacts/docs/prd/${prdInfo.category}/${prdInfo.filename}`;
      if (fs.existsSync(prdPath)) {
        dep.hasPRD = true;
        dep.prdPath = prdPath;
        
        // Extract events from PRD
        const prdContent = fs.readFileSync(prdPath, "utf8");
        const eventMatches = prdContent.match(/\*\*([A-Z][a-zA-Z]+(?:Event|ed|ing))\*\*/g);
        if (eventMatches) {
          dep.sharedEvents = eventMatches.map(e => e.replace(/\*\*/g, '')).slice(0, 5);
        }
      }
    }
    
    // Extract upstream/downstream dependencies from context map
    const contextMapNames = getContextMapNameMapping();
    const mapNames = contextMapNames[contextName] || [];
    
    for (const mapName of mapNames) {
      // Find lines where this context is the target (upstream dependencies)
      const upstreamPattern = new RegExp(`(\\w+)\\s*-->\\s*${mapName}\\s*:`, 'gi');
      // Find lines where this context is the source (downstream dependencies)
      const downstreamPattern = new RegExp(`${mapName}\\s*-->\\s*(\\w+)\\s*:`, 'gi');
      
      let match;
      while ((match = upstreamPattern.exec(contextMap)) !== null) {
        dep.upstreamContexts.push(match[1]);
      }
      
      while ((match = downstreamPattern.exec(contextMap)) !== null) {
        dep.downstreamContexts.push(match[1]);
      }
    }
    
    dependencies.push(dep);
  }
  
  // Generate dependency matrix
  let md = "# EFI Context Dependency Matrix\n\n";
  md += "> **Purpose**: Map integration dependencies between missing contexts and existing system\n\n";
  
  md += "## Summary\n\n";
  md += `- **Total Missing Contexts**: ${dependencies.length}\n`;
  md += `- **With Existing PRDs**: ${dependencies.filter(d => d.hasPRD).length}\n`;
  md += `- **With Upstream Dependencies**: ${dependencies.filter(d => d.upstreamContexts.length > 0).length}\n`;
  md += `- **With Downstream Dependencies**: ${dependencies.filter(d => d.downstreamContexts.length > 0).length}\n\n`;
  
  md += "## Context Dependencies\n\n";
  md += "| Context | Status | Upstream Dependencies | Downstream Dependencies | Key Events |\n";
  md += "| --- | --- | --- | --- | --- |\n";
  
  dependencies.forEach(dep => {
    const status = dep.hasPRD ? '✅ Has PRD' : '❌ Needs PRD';
    const upstream = dep.upstreamContexts.length > 0 ? dep.upstreamContexts.join(', ') : '-';
    const downstream = dep.downstreamContexts.length > 0 ? dep.downstreamContexts.join(', ') : '-';
    const events = dep.sharedEvents.length > 0 ? dep.sharedEvents.slice(0, 3).join(', ') : '-';
    
    md += `| **${dep.name}** | ${status} | ${upstream} | ${downstream} | ${events} |\n`;
  });
  
  md += "\n## Implementation Priority\n\n";
  md += "Based on dependency analysis:\n\n";
  
  // Sort by upstream dependencies (fewer = higher priority)
  const prioritized = [...dependencies].sort((a, b) => a.upstreamContexts.length - b.upstreamContexts.length);
  
  md += "### Phase 1: Foundation (No upstream dependencies)\n";
  const phase1 = prioritized.filter(d => d.upstreamContexts.length === 0);
  phase1.forEach(dep => {
    md += `- **${dep.name}** ${dep.hasPRD ? '(validate PRD)' : '(create PRD)'}\n`;
  });
  
  md += "\n### Phase 2: Integration (1-2 upstream dependencies)\n";
  const phase2 = prioritized.filter(d => d.upstreamContexts.length >= 1 && d.upstreamContexts.length <= 2);
  phase2.forEach(dep => {
    md += `- **${dep.name}** ${dep.hasPRD ? '(validate PRD)' : '(create PRD)'} - depends on: ${dep.upstreamContexts.join(', ')}\n`;
  });
  
  md += "\n### Phase 3: Complex Integration (3+ upstream dependencies)\n";
  const phase3 = prioritized.filter(d => d.upstreamContexts.length > 2);
  phase3.forEach(dep => {
    md += `- **${dep.name}** ${dep.hasPRD ? '(validate PRD)' : '(create PRD)'} - depends on: ${dep.upstreamContexts.join(', ')}\n`;
  });
  
  md += "\n---\n\n";
  md += "Generated from context map analysis and existing PRD review\n";
  
  fs.writeFileSync("DDD_Artefacts/event-dependency-matrix.md", md);
  console.log(chalk.green(`✔ Dependency matrix built for ${dependencies.length} contexts`));
  console.log(chalk.blue(`🔄 ${phase1.length} contexts ready for Phase 1 (foundation)`));
  console.log(chalk.yellow(`🔗 ${phase2.length} contexts ready for Phase 2 (integration)`));
  console.log(chalk.red(`🎆 ${phase3.length} contexts ready for Phase 3 (complex)`));
}