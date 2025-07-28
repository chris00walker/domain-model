# Hexagonal Architecture Overview

> See also: [DDD Automation Workflow](./README.md)

This document summarises the ports & adapters refactor completed in July 2025.

## Layers

```
┌──────────────────────────────┐
│        CLI / UI Adapters     │  ← scripts/cli/*  (calls core via adapters)
├──────────────────────────────┤
│            Adapters          │  ← scripts/infra/* implements ports
├──────────────────────────────┤
│             Ports            │  ← scripts/core/ports.ts (interfaces)
├──────────────────────────────┤
│             Core             │  ← scripts/core/*  (pure domain logic)
└──────────────────────────────┘
```

* Core never imports from adapters.
* Tests inject `InMemoryFileSystem`, `NullLogger`, `StubLLM`.

## Key Ports
| Port | Purpose |
|------|---------|
| `FileSystemPort` | minimal sync file access |
| `LoggerPort` | structured logging |
| `LLMPort` | Chat completion access |

## Running a Virtual Storm
```bash
npm run storm               # thin CLI → core/stormSession
```

## Extending
1. Implement a new adapter (e.g. WinstonLogger) in `scripts/infra` that satisfies a port.
2. Wire it in the CLI or service entry-point.

---
_This doc fulfils the documentation part of ADR-007 & ADR-013._
