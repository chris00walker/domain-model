# Phase 1 Discovery CLI

This CLI runs the Phase 1 Event Storming discovery using the OpenAI multi-agent orchestration SDK.

## Prerequisites

- Node.js >= 14
- Dependencies installed: `npm install` or `yarn install`

## Usage

```bash
# Run full discovery for all contexts
tsx scripts/phase1/cli/virtualDiscover.ts

# Filter to a specific context name
tsx scripts/phase1/cli/virtualDiscover.ts --context "ContextName"

# Limit maximum agent turns
tsx scripts/phase1/cli/virtualDiscover.ts --max 10
```

## Integration

Add to `package.json` scripts for convenience:

```json
"scripts": {
  "discover:phase1": "tsx scripts/phase1/cli/virtualDiscover.ts"
}
```

## Output

Generated Markdown artefacts are saved under:

```
DDD_Artefacts/docs/analysis/phase1/
```

- `gap-analysis.md`
- `context-dependency-matrix.md`
- `implementation-plan.md`
- `event-storming-session-prep.md`
- `event-storming-brief.md`
- `domain-orchestration-plan.md`
```

## CI Integration

Add the following GitHub Actions workflow file at `.github/workflows/phase1-discovery.yml` to automate Phase 1 discovery:

```yaml
name: Phase 1 Discovery Workflow
on:
  push:
    paths:
      - 'scripts/phase1/**'
jobs:
  phase1-discovery:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '14'
      - run: npm ci
      - run: npm run lint -- --fix
      - run: npm run build
      - run: npm test
      - run: npm run discover:phase1
```

## Next Steps

- Review and customize this workflow to fit your repository settings.
- Merge into your main branch to trigger automated Phase 1 discovery.
