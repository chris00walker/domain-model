#!/usr/bin/env node
/*
 * addAgentBlocks.js
 * Scans all PRD markdown files under docs/prd/** and ensures each contains
 * a YAML agents block inside an HTML comment right below the Domain Experts section.
 * It uses the bullet list under **Domain Experts** to auto-populate roles.
 */
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'docs', 'prd');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((ent) => {
    const res = path.join(dir, ent.name);
    return ent.isDirectory() ? walk(res) : res;
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.md')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('<!--- agents:')) return; // already has block

  const lines = content.split(/\r?\n/);
  const newLines = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    newLines.push(line);

    if (/^\s*[-*] \*\*Domain Experts\*\*/i.test(line) || /\*\*Domain Experts\*\*/i.test(line)) {
      // This rare variant, but we treat header list differently
    }

    if (/\*\*Domain Experts\*\*/.test(line)) {
      // Collect bullet list following
      const roles = [];
      let j = i + 1;
      while (j < lines.length) {
        const l = lines[j];
        if (/^\s*[-*]\s+/.test(l)) {
          roles.push(l.replace(/^\s*[-*]\s+/, '').trim());
          j++;
        } else {
          break;
        }
      }
      if (roles.length) {
        newLines.push('<!--- agents:');
        roles.forEach((r) => {
          newLines.push(`  - role: ${r}`);
        });
        newLines.push('-->');
      }
      // push the remaining lines from j onwards and break outer processing loop
      while (j < lines.length) {
        newLines.push(lines[j]);
        j++;
      }
      fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
      console.log(`Injected agents block into ${path.relative(baseDir, filePath)}`);
      return;
    }
    i++;
  }
}

walk(baseDir).forEach(processFile);
