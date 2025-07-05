# Performance Requirements

## Response Time & Throughput

- **Page load:** ≤ 2 s (P95) for catalogue pages, ≤ 3 s (P95) for checkout.
- **API latency:** ≤ 300 ms (P95) per call under normal load; ≤ 500 ms at 2 × peak.
- **Transaction throughput:** Sustain 1 000 TPS during peak events.
- **Performance testing:** Load, stress, and endurance tests executed in CI/CD.

## AI-Driven Performance Optimisation

- Real-time monitoring agents analyse CPU, memory, and request-rate anomalies.
- Predictive maintenance: ML forecasts bottlenecks and triggers auto-scaling.
- Dynamic resource allocation: autoscaler adjusts pods/VMs for optimal utilisation.

## ML Prediction Latency

- **Inference response:** ≤ 150 ms (P95) for personalised search & pricing.
- **Batch windows:** Nightly training jobs must finish within 4 h.

---

For observability implementation details see [ADR-010: Observability & Monitoring](../../adr/010-observability-monitoring-strategy.md) and caching guidance in [ADR-011](../../adr/011-multi-layered-caching-strategy.md).
