#!/usr/bin/env node
/**********************************************************************
 * make-codex-tickets.js
 * Generates CODEX test tickets for the lowest-coverage source files.
 *********************************************************************/

require('dotenv').config({ path: `${__dirname}/../.env` });
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Configuration
const THRESHOLD = 80; // Minimum coverage percentage
const TOP_N = 5; // Number of tickets to create
const COV_FILE = 'coverage/coverage-final.json';

// 1️⃣ Validate environment
if (!process.env.GH_TOKEN) {
  console.error('❌  GH_TOKEN environment variable is not set');
  console.log('   Please add your GitHub token to the .env file:');
  console.log('   GH_TOKEN=your_token_here');
  process.exit(1);
}

// 2️⃣ Read coverage JSON
if (!fs.existsSync(COV_FILE)) {
  console.error(`❌  ${COV_FILE} not found – run \`npm test -- --coverage\` first`);
  process.exit(1);
}
const cov = JSON.parse(fs.readFileSync(COV_FILE, 'utf8'));

// 3️⃣ Build entries with guard for missing pct
const entries = Object.entries(cov).map(([file, data]) => ({
  file,
  pct: data.lines?.pct,
  hasPct: typeof data.lines?.pct === 'number',
}));

console.log('First few coverage entries:', entries.slice(0, 3));

// 4️⃣ Filter & sort the worst-covered files
const repoRoot = process.cwd() + path.sep;
const worst = entries
  .filter((e) => {
    // Include any file under src/ or DDD_Artefacts/src/, exclude node_modules
    return (
      (e.file.startsWith(repoRoot + 'src' + path.sep) ||
        e.file.startsWith(repoRoot + 'DDD_Artefacts' + path.sep + 'src' + path.sep)) &&
      !e.file.includes(path.sep + 'node_modules' + path.sep) &&
      // Keep items with no pct (to seed tests) OR pct below threshold
      (!e.hasPct || e.pct < THRESHOLD)
    );
  })
  .sort((a, b) => {
    // Put no-coverage first, then ascending pct
    if (!a.hasPct && b.hasPct) return -1;
    if (a.hasPct && !b.hasPct) return 1;
    if (!a.hasPct && !b.hasPct) return 0;
    return a.pct - b.pct;
  })
  .slice(0, TOP_N);

console.log(`\nFound ${worst.length} files to ticket (pct < ${THRESHOLD} or no coverage).`);

if (!worst.length) {
  console.log('🎉  Coverage above threshold – no tickets created.');
  process.exit(0);
}

// 5️⃣ Generate tickets
worst.forEach(({ file, pct, hasPct }) => {
  // Derive a slug from the path under src/
  let rel = file.startsWith(repoRoot) ? file.slice(repoRoot.length) : file;
  rel = rel.replace(/^src\/|^DDD_Artefacts\/src\//, '');
  const slug = rel.replace(/\.(ts|js)$/, '').replace(/[\/\.]/g, '-');

  const today = new Date().toISOString().slice(0, 10);
  const mdDir = 'docs/codex-tickets';
  const mdPath = `${mdDir}/${today}-${slug}-tests.md`;

  // Build ticket markdown
  const coverageText = hasPct ? `${pct}%` : 'no data';
  const md = `# CODEX Ticket · ${today} · ${slug} tests

## 📋 Context
Coverage for **${rel}** is **${coverageText}**, below the ${THRESHOLD}% target.

## 🎯 Goal
Raise line coverage of \`${rel}\` to ≥ ${THRESHOLD}% by adding Jest tests.

## 🛠️ Scope of Work
- **Branch:** \`codex/${slug}-tests\`
- **Files:** tests alongside \`${rel}\`
- **Constraints**
  - Follow testing README guidelines.
  - Ignore legacy test path.
  - \`npm test\` must pass locally.

## ✅ Acceptance Criteria
| # | Scenario        | Expected                          |
|---|-----------------|-----------------------------------|
| 1 | \`npm test\`    | green                             |
| 2 | coverage \`${rel}\` | ≥ ${THRESHOLD}% lines            |

## 🔄 CI Gate
PR must pass **ci-test** workflow.

*Commit prefix:* \`[codex] ${slug}-tests:\`
`;

  fs.mkdirSync(mdDir, { recursive: true });
  fs.writeFileSync(mdPath, md);
  console.log(`📝  Generated ${mdPath}`);

  // Open a GitHub Issue
  try {
    execSync(
      `gh issue create --title "CODEX: ${slug} tests" --body-file "${mdPath}" --label codex,automated`,
      { stdio: 'inherit', env: { ...process.env, GH_TOKEN: process.env.GH_TOKEN } }
    );
  } catch (err) {
    console.error('⚠️  gh issue create failed – check GH_TOKEN or install gh CLI.');
  }
});
