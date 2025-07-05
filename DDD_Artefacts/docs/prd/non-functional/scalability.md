# Scalability Requirements

## Horizontal & Vertical Scaling

- Services must scale linearly to **10×** baseline traffic with ≤ 20 % performance degradation.
- Stateless design enables adding replicas; Kubernetes HPA adjusts pods automatically.
- Upgrade instance types (CPU/RAM) on-the-fly for single-instance services when needed.

## Storage Scalability

- Datastores must support sharding or partitioning to **10 TB** without downtime.
- Multi-AZ replication and resilient backup strategy (incremental every 6 h, full daily).

## CI/CD Pipeline Scalability

- Build-test-deploy cycle should finish in **≤ 15 min** for 90 % of commits.
- Parallelise tests; use build-caching and container layers.

## ML Model Scalability

- Serve up to **50 inference QPS** per model instance; autoscale based on GPU utilisation.
- Distributed inference service behind load balancer; cache popular predictions.

---

Related ADRs:

- [ADR-011: Multi-Layered Caching Strategy](../../adr/011-multi-layered-caching-strategy.md)
- [ADR-005: Distributed Transaction Strategy](../../adr/005-distributed-transactions-strategy.md)
