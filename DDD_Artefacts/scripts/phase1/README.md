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

## Next Steps

- Add CI workflow to type-check, lint, and smoke-test Phase 1 discovery.
- Migrate Phase 1 workflows into existing GitHub Actions pipelines.
