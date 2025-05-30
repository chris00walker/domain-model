# **🎯 Goal:** Craft a Strategyzer-ready **Customer Relationships** block that picks up where Channels ends—at **Exchange**—and guides each priority segment through **Experience → Satisfaction → Significance**, maximising LTV while protecting the gross-margin and CAC guardrails in the master VPA.

**Strategyzer Lens:** Every relationship mechanic must

1. Start at Exchange and move customers toward Significance,

2. Map to a measurable KPI, and

3. Be linked to a **Desirability (F) experiment card** on the *Testing Business Ideas* (TBI) board.

---

## **1 │ Relationship Architecture**

| Journey Stage | B2C (Diaspora, Expats, Foodies) | B2B (Food-Trucks, Mini-Markets, LSR-Pilot) | TBI Card |
| ----- | ----- | ----- | ----- |
| **Exchange** | • One-click checkout (Stripe)• Instant WhatsApp receipt• Next-order coupon (5 %) | • Portal PO or field-rep upload• Auto-proforma & logistics ETA• First-reorder credit (BBD 50\) | 🔗 |
| **Experience** | • Premium unboxing: thank-you card \+ QR recipe• “Share-your-dish” IG promo (10 % off) | • Post-delivery call \+ HACCP docs• Menu-pilot kit credit• Delivery ETA SMS feed | 🔗 |
| **Satisfaction** | • NPS survey \+ loyalty points (\< 14 d)• Referral code (15 %/15 %) | • Quarterly account review (Teams)• Volume-rebate tracker dashboard• Satisfaction poll \+ reorder incentive | 🔗 |
| **Significance** | • VIP tier (≥ BBD 3 k/yr): early-access drops, 12 % lifetime discount[1](https://chatgpt.com/c/68306eee-e300-8006-9054-d2e32e1e1625#user-content-fn-2)• Brand-ambassador feature in blog | • Partner tier (≥ BBD 10 k/yr): priority pricing, co-op MDF, success-story spotlight• Beta-tester club for new SKUs | 🔗 |

---

## **2 │ Relationship Mechanisms & Rationale**

1. **Self-Service First (B2C)** – AI chatbot \+ FAQ hub resolves ≥ 70 % of tickets under 2 min → frees margin for loyalty perks.

2. **High-Touch Lite (B2B)** – Dedicated AM for Mini-Markets & LSR pilots; Food-Truck WhatsApp hotline keeps CAC payback \< 1 order.

3. **Mutual Upside Incentives** – Referral, volume rebates, and VIP tiers mirror customer gains (social pride, cost control) and are directly testable.

4. **Shared Digital Spine** – HubSpot tickets \+ Odoo order data feed a unified NPS & CLV dashboard, enabling rapid A/B on perks.

---

## **3 │ KPI & Experiment Matrix**

| Relationship Lever | KPI | Baseline Target | TBI Card |
| ----- | ----- | ----- | ----- |
| B2C NPS push note | NPS Δ vs. control | \+ 10 pts | 🔗 |
| WhatsApp receipt | Repeat-order rate (\< 60 d) | ≥ 35 % | 🔗 |
| B2B QBR cadence | Reorder cycle (days) | – 15 % | 🔗 |
| VIP tier launch | ARPU uplift (VIP vs. base) | ≥ 25 % | 🔗 |

---

## **4 │ Systems & Tooling**

| Layer | Tool | Purpose |
| ----- | ----- | ----- |
| CRM | **HubSpot** | Ticketing, segmentation, email/SMS flows |
| ERP | **Odoo** | Order & delivery data feeding CLV calc |
| Messaging | **WhatsApp Business API** | Real-time receipts, support, reorder links |
| Loyalty | **Smile.io** | Points & VIP tier logic with perk caps |

---

## **5 │ Next Steps**

1. **Document CLV**: Publish the CLV formula[2](https://chatgpt.com/c/68306eee-e300-8006-9054-d2e32e1e1625#user-content-fn-1) in Finance & CRM playbooks so all teams use the same calculation.

2. **Enforce perk cap**: Configure Smile.io to cap total perk spend at ≤ 10 % of incremental VIP GM[1](https://chatgpt.com/c/68306eee-e300-8006-9054-d2e32e1e1625#user-content-fn-2), and model stacked discounts against margin floors.

3. **Assign NPS recovery owner**: Appoint the **CRM Manager** to monitor NPS triggers, lead recovery actions, and report weekly.

4. Draft and link the four Experiment Cards (use the 🔗 placeholders above) with hypotheses, metrics, and cheap-test designs.

5. Build the unified NPS & CLV dashboard in HubSpot/Odoo and validate data flows.

---

## **Footnotes**

1. **Perk spend ≤ 10 % of incremental VIP GM**

2. **CLV \= Σ (GM per order × avg orders × retention rate) − CAC**

