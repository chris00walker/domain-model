#!/usr/bin/env node
/**********************************************************************
 * make-codex-tickets.js
 * Generates CODEX test tickets for the lowest-coverage source files.
 *********************************************************************/
require('dotenv').config({ path: `${__dirname}/../.env` });
const fs = require('fs');
const { execSync } = require('child_process');

// Configuration
const THRESHOLD = 80; // Minimum coverage percentage
const TOP_N = 5; // Number of tickets to create
const COV_FILE = 'coverage/coverage-final.json';

// Validate environment
if (!process.env.GITHUB_TOKEN) {
  console.error('❌  GITHUB_TOKEN environment variable is not set');
  console.log('Please add your GitHub token to the .env file:');
  console.log('GITHUB_TOKEN=your_token_here');
  process.exit(1);
}

if (!fs.existsSync(COV_FILE)) {
  console.error(`❌  ${COV_FILE} not found – run \`npm test --coverage\` first`);
  process.exit(1);
}

const cov = JSON.parse(fs.readFileSync(COV_FILE, 'utf8'));

const entries = Object.entries(cov)
  // 1️⃣ only keep items with a numeric lines.pct
  .filter(([file, data]) => data && data.lines && typeof data.lines.pct === 'number')
  // 2️⃣ map to our {file, pct} shape
  .map(([file, data]) => ({
    file,
    pct: data.lines.pct,
  }));

const worst = entries
  .filter((e) => e.file.startsWith('src/')) // ignore legacy and node_modules
  .filter((e) => e.pct < THRESHOLD) // below your threshold
  .sort((a, b) => a.pct - b.pct) // worst first
  .slice(0, TOP_N); // limit to TOP_N

if (!worst.length) {
  console.log('🎉  Coverage above threshold – no tickets created.');
  process.exit(0);
}

worst.forEach(({ file, pct }) => {
  const slug = file
    .replace(/^src\//, '') // drop leading src/
    .replace(/\.(ts|js)$/, '') // drop .ts /.js
    .replace(/[\/\.]/g, '-'); // kebab case

  const today = new Date().toISOString().slice(0, 10);
  const mdPath = `docs/codex-tickets/${today}-${slug}-tests.md`;
  const md = `# CODEX Ticket · ${today} · ${slug} tests

## 📋 Context
Coverage for **${file}** is **${pct}%**, below the ${THRESHOLD}% target.

## 🎯 Goal
Raise line coverage of ${file} to ≥ ${THRESHOLD}% by adding Jest tests.

## 🛠️ Scope of Work
- **Branch:** \`codex/${slug}-tests\`
- **Files:** tests alongside \`${file}\`
- **Constraints**
  - Follow testing README guidelines.
  - Ignore legacy test path.
  - \`npm test\` must pass locally.

## ✅ Acceptance Criteria
| # | Scenario | Expected |
|---|----------|----------|
| 1 | \`npm test\` | green |
| 2 | coverage \`${file}\` | ≥ ${THRESHOLD}% lines |

## 🔄 CI Gate
PR must pass **ci-test** workflow.

*Commit prefix:* \`[codex] ${slug}-tests:\`
`;

  fs.mkdirSync('docs/codex-tickets', { recursive: true });
  fs.writeFileSync(mdPath, md);
  console.log(`📝  Generated ${mdPath}`);

  // open GitHub issue (requires gh + GH_TOKEN)
  try {
    execSync(
      `gh issue create --title "CODEX: ${slug} tests" --body-file "${mdPath}" --label codex,automated`,
      { stdio: 'inherit' }
    );
  } catch (err) {
    console.error('⚠️  gh issue create failed – run manually or check GH_TOKEN.');
  }
});
