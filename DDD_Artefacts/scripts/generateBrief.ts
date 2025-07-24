import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import slugify from "slugify";
import chalk from "chalk";

interface ContextInfo {
  name: string;
  hasPRD: boolean;
  prdPath?: string;
  hasGlossary: boolean;
  glossaryPath?: string;
  hasSource: boolean;
  sourcePath?: string;
  contextMapRelations: string[];
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
    'analytics_reporting': { filename: 'analytics_reporting.md', category: 'strategic' },
    'reviews_ratings': { filename: 'reviews_ratings.md', category: 'supporting' },
    'sales_quoting': { filename: 'sales_quoting.md', category: 'strategic' }
  };
}

export async function generateBrief(filter?: string) {
  console.log(chalk.blue("📊 Analyzing existing assets..."));
  
  // Read gaps from memory
  const gapsFile = ".windsurf/memories/gap-analysis.md";
  const gaps: string[] = [];
  if (fs.existsSync(gapsFile)) {
    const gapContent = fs.readFileSync(gapsFile, "utf8");
    gaps.push(...gapContent.match(/- \[ \] (.+)/g)?.map(m => m.replace("- [ ] ", "")) || []);
  }
  
  const prdMapping = getContextToPrdMapping();
  
  // Analyze existing assets for each gap
  const contextAnalysis: ContextInfo[] = [];
  for (const contextName of gaps) {
    const info: ContextInfo = {
      name: contextName,
      hasPRD: false,
      hasGlossary: false,
      hasSource: false,
      contextMapRelations: []
    };
    
    // Check for PRD using mapping
    const prdInfo = prdMapping[contextName];
    if (prdInfo) {
      const prdPath = `DDD_Artefacts/docs/prd/${prdInfo.category}/${prdInfo.filename}`;
      if (fs.existsSync(prdPath)) {
        info.hasPRD = true;
        info.prdPath = prdPath;
      }
    }
    
    // Check for glossary
    const glossaryPath = `DDD_Artefacts/docs/ubiquitous-language/${contextName.toLowerCase().replace(/_/g, '-')}-glossary.md`;
    if (fs.existsSync(glossaryPath)) {
      info.hasGlossary = true;
      info.glossaryPath = glossaryPath;
    }
    
    // Check for source code
    const sourcePath = `DDD_Artefacts/src/${contextName.toLowerCase()}`;
    if (fs.existsSync(sourcePath)) {
      info.hasSource = true;
      info.sourcePath = sourcePath;
    }
    
    // Extract context map relations
    const contextMap = fs.readFileSync("DDD_Artefacts/docs/diagrams/context_map.puml", "utf8");
    const contextPattern = new RegExp(`\\[${contextName.replace(/_/g, '\\s+')}\\]`, 'gi');
    if (contextPattern.test(contextMap)) {
      const lines = contextMap.split('\n');
      const contextLines = lines.filter(line => contextPattern.test(line) || line.includes('-->') && contextPattern.test(line));
      info.contextMapRelations = contextLines.slice(0, 5); // Limit to 5 relations
    }
    
    contextAnalysis.push(info);
  }
  
  // Analyze existing contexts (implemented)
  console.log(chalk.blue("📋 Analyzing existing contexts..."));
  
  const existingPRDs = [
    'order_management', 'customer_management', 'payment_billing', 'product_catalog',
    'shipping_fulfillment', 'pricing_promotions', 'subscriptions', 'fulfillment'
  ];
  
  const existingSourceCode = [
    'order_management', 'customer_management', 'payment_billing', 'product_catalog', 
    'shipping_fulfillment', 'pricing_promotions', 'subscription_management', 'billing_invoicing',
    'admin_reporting'
  ];
  
  const existingGlossaries = [
    'order_management', 'customer_management', 'payment_billing', 'product_catalog',
    'shipping_fulfillment', 'pricing_promotions', 'inventory_management'
  ];

  // Generate AI agent brief
  let md = "# AI Agent Validation Brief – EFI Domain Model Completion\n\n";
  md += "> **Mission**: Validate existing PRDs and enhance them with Event Storming insights for Elias Food Imports eCommerce domain model\n\n";
  md += "## Complete Domain Analysis\n\n";
  md += "### Existing Contexts (Implemented)\n";
  md += `- **Total Existing Contexts**: ${existingPRDs.length}\n`;
  md += `- **With PRDs**: ${existingPRDs.length} (100%)\n`;
  md += `- **With Source Code**: ${existingSourceCode.length}\n`;
  md += `- **With Glossaries**: ${existingGlossaries.length}\n\n`;
  md += "### Missing Contexts (To Be Completed)\n";
  md += `- **Total Missing Contexts**: ${gaps.length}\n`;
  md += `- **With Existing PRDs**: ${contextAnalysis.filter(c => c.hasPRD).length}\n`;
  md += `- **With Glossaries**: ${contextAnalysis.filter(c => c.hasGlossary).length}\n`;
  md += `- **With Source Code**: ${contextAnalysis.filter(c => c.hasSource).length}\n\n`;
  md += "### Domain Completion Status\n";
  md += `- **Total Domain Contexts**: ${existingPRDs.length + gaps.length}\n`;
  md += `- **Completion Rate**: ${Math.round((existingPRDs.length / (existingPRDs.length + gaps.length)) * 100)}%\n`;
  md += `- **Remaining Work**: ${gaps.length} contexts to complete\n\n`;
  
  for (const context of contextAnalysis) {
    if (filter && !filter.split(',').some(f => context.name.toLowerCase().includes(f.trim().toLowerCase()))) continue;
    
    md += `## ${context.name} - AI Agent Validation\n\n`;
    
    md += `### 🎯 ${context.name} - Validation Mission\n`;
    if (context.hasPRD) {
      md += `- **PRIMARY**: Validate and enhance existing PRD with Event Storming insights\n`;
      md += `- **SECONDARY**: Identify missing business rules, events, and integration points\n`;
      md += `- **REFERENCE**: [${context.name} PRD](${context.prdPath})\n\n`;
    } else {
      md += `- **PRIMARY**: ⚠️ ERROR: PRD should exist but was not found in mapping\n`;
      md += `- **ACTION REQUIRED**: Check PRD mapping in generateBrief.ts\n`;
      md += `- **EXPECTED LOCATION**: One of the prd subdirectories\n\n`;
    }
    
    md += `### 📚 ${context.name} - Available Assets\n`;
    md += `- **PRD**: ${context.hasPRD ? '✅ Available' : '❌ Missing'}${context.prdPath ? ` - ${context.prdPath}` : ''}\n`;
    md += `- **Glossary**: ${context.hasGlossary ? '✅ Available' : '❌ Missing'}${context.glossaryPath ? ` - ${context.glossaryPath}` : ''}\n`;
    md += `- **Source Code**: ${context.hasSource ? '✅ Available' : '❌ Missing'}${context.sourcePath ? ` - ${context.sourcePath}` : ''}\n\n`;
    
    if (context.contextMapRelations.length > 0) {
      md += `### 🔗 ${context.name} - Context Map Integration Points\n`;
      md += "```plantuml\n";
      context.contextMapRelations.forEach(rel => md += `${rel}\n`);
      md += "```\n\n";
    }
    
    md += `### 🔍 ${context.name} - Validation Checklist\n`;
    md += "- [ ] Business rules align with EFI food import domain\n";
    md += "- [ ] Events support FEFO inventory management\n";
    md += "- [ ] Integration points match context map\n";
    md += "- [ ] Compliance requirements addressed (cold chain, traceability)\n";
    md += "- [ ] Ubiquitous language consistent with glossaries\n";
    md += "- [ ] Implementation gaps identified\n\n";
    
    md += `### 📝 ${context.name} - Expected Deliverables\n`;
    if (context.hasPRD) {
      md += "1. **Enhanced PRD**: Updated with Event Storming insights and missing elements\n";
      md += "2. **Event Catalog**: Complete list of domain events for this context\n";
      md += "3. **Business Rules Validation**: Verification of existing rules and identification of gaps\n";
      md += "4. **Integration Points Review**: Context map relationship validation and updates\n\n";
    } else {
      md += "1. **ERROR REPORT**: PRD mapping issue needs resolution\n";
      md += "2. **INVESTIGATION**: Locate actual PRD file and update mapping\n\n";
    }
    
    md += "---\n\n";
  }
  
  fs.writeFileSync("DDD_Artefacts/event-storming-brief.md", md);
  console.log(chalk.green(`✔ AI agent brief generated for ${contextAnalysis.length} contexts`));
  console.log(chalk.blue(`📋 ${contextAnalysis.filter(c => c.hasPRD).length} contexts have existing PRDs to validate`));
  console.log(chalk.yellow(`🆕 ${contextAnalysis.filter(c => !c.hasPRD).length} contexts need new PRDs`));
}