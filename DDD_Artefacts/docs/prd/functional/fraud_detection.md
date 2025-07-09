# Fraud Detection

[RELATED: ADR-009]

## Overview

> **Status:** Draft — auto-normalised. Update with meaningful content.

## Functional Requirements

> _TBD – add detailed requirements here._

## Benefits

> Establishes consistent documentation and enables lint compliance.



> **Status:** Draft — scaffolded automatically. Replace with context-specific summary.


> _TBD – flesh out detailed requirements here._


> Clear documentation enables alignment, compliance, and future traceability.

> **Status:** Draft — initial functional requirements captured from PRD section 1.15.

## 1. Transaction Monitoring

### 1.1 Real-Time Analysis
- Evaluate each transaction via rule-based filters **and** ML risk models.
- Flag high-risk orders before payment capture.

### 1.2 Rule-Based Detection
- Threshold rules: high-value orders, shipping–billing mismatch, velocity anomalies.
- Configurable via admin UI (no code deploy).

### 1.3 Machine-Learning Models
- Train on historical labelled fraud data.
- Features: purchase velocity, device fingerprint, geolocation, IP reputation.

### 1.4 Risk Scoring & Actions
- Assign numeric risk score 0-100.
- ≥ 80 triggers manual review; 60-79 triggers 3-D-Secure / MFA; <60 auto-approve.

### 1.5 Alerts & Notifications
- Instant alert to fraud-prevention Slack channel + email when score ≥ threshold.

---

## 2. Fraudulent Activity Alerts

### 2.1 Automated Alerts
- Notify fraud team (email/SMS) for high-risk transactions.

### 2.2 Customer Notifications
- Inform customers when their order requires verification.

### 2.3 Incident Logging & Workflow
- Log alert, investigation steps, resolution status.
- SLA: 24 h for closure; escalations after 12 h.

---

## 3. Risk Assessment

### 3.1 Metrics & Profiling
- Evaluate risk factors: amount, velocity, device anomalies, IP risk.
- Build customer risk profiles from history.

### 3.2 Adaptive Models & Reporting
- Retrain models weekly with latest fraud cases.
- Produce weekly risk assessment reports.

---

## 4. Anomaly Detection with ML

- Unsupervised models to spot novel patterns.
- Real-time inference pipeline with Kafka stream.
- Threshold tuning to balance false positives/negatives.

---

- Reduces financial losses and chargebacks.
- Protects legitimate customers and brand reputation.
