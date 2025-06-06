# **🎯 Goal:** Secure, manage, and steward the assets that power EFI’s Key Activities—so every promise of authenticity, provenance, and friction-free service is kept for B2C, B2B, and importer customers.

**Strategyzer Lens:** Every asset must

1. underpin a Priority Key Activity,

2. have a single Owner with an SLA-anchored KPI, and

3. be linked to a **Feasibility (F) experiment card** on the *Testing Business Ideas* (TBI) board.

---

## **1 │ Physical Resources**

| Core Asset | Supports These Key Activities | Single Best Management Action | TBI Card |
| ----- | ----- | ----- | ----- |
| **Dual 3PL hub network** (Florida & Barbados) | Ocean-freight intake, customs clearance, pick-&-pack fulfilment, duty-relief | Maintain two pre-approved 3PLs; embed RFID/IoT cold-chain sensors; audit temp logs monthly | 🔗 F-KR-01 |
| **Bonded overflow warehouse** (100-pallet, temp-controlled) | 2-week inventory buffer for “never run out” subscriptions | Release space if utilization \< 60 % for 60 d; rotate aged stock weekly | 🔗 F-KR-02 |
| **Portable micro-lab & sampling kit** | Lot-based ISO 22000 safety checks; QR-provenance capture | Calibrate quarterly; log results to QA dashboard within 24 h | 🔗 F-KR-03 |
| **Pop-up festival booth kit** | Field sampling & community events | Inspect hardware after each event; replace damaged assets within 7 d | 🔗 F-KR-04 |

---

## **2 │ Technological Resources**

| Core Asset | Supports These Key Activities | Single Best Management Action & Scale/Sunset Trigger | TBI Card |
| ----- | ----- | ----- | ----- |
| **Next.js \+ MERN storefront** (Rumble Cloud monorepo) | Mobile-first shopping & B2B portal (Exchange) | Audit Core Web Vitals monthly; reserve 15 % dev time for tech-debt; **If p95 latency \> 500 ms for 2 wk → evaluate microservices split** | 🔗 F-KR-05 |
| **Edge CDN & WAF – Cloudflare** | Global caching, DDoS protection | Maintain cache-hit ≥ 80 %; review WAF logs weekly; **If \< 80 % cache-hit for 2 wk → re-tune rules** | 🔗 F-KR-06 |
| **Headless CMS – Sanity** | No-code content & SEO updates | Time-to-publish \< 30 min; quarterly orphan-content audit; **If \> 10 orphan pages → archive or purge** | 🔗 F-KR-07 |
| **Cloudinary media pipeline** | Image/video optimization & UGC moderation | CLS \< 0.1; reject-rate tracked; weekly broken-link scan; **If rejection \> 5 % for 1 mo → re-evaluate moderation model** | 🔗 F-KR-08 |
| **Smile.io loyalty engine** | Points & VIP tier logic (Satisfaction & Significance) | Verify liability monthly; A/B perks quarterly; **If churn \> 15 % in VIP → refine tier benefits** | 🔗 F-KR-09 |
| **FinTech stack – Stripe & Wise** | Checkout, billing, FX payouts | Chargeback \< 0.4 %; FX markup ≤ 0.4 %; enforce 3-D Secure; **If chargeback \> 0.5 % for 2 wk → audit dispute workflow** | 🔗 F-KR-10 |
| **Data platform – GA4, Mixpanel, Redshift \+ Looker** | KPI dashboarding & experiment analytics | Data latency \< 1 h; schema audit quarterly; **If latency \> 2 h for 1 wk → scale cluster** | 🔗 F-KR-11 |
| **ERP & OMS – Odoo \+ ShipStation** | Inventory, purchasing & order orchestration | Sync-failure \< 0.5 %; module ROI review quarterly; **If failure \> 1 % for 2 wk → debug or upgrade connector** | 🔗 F-KR-12 |
| **Gen-AI & Vector Store – OpenAI, Gemini, pgvector** | Chatbot CX, product recommendations, internal RAG search | Token spend ≤ 4 % of revenue; refresh embeddings quarterly; **If RAG accuracy \< 80 % → retrain with new data** | 🔗 F-KR-13 |
| **Visibility APIs – Portcast & MarineTraffic** | Live container status & demurrage alerts | SLA: alert if ETA slips \> 24 h; **If \> 2 missed alerts/mo → escalate to Ops lead** | 🔗 F-KR-14 |

---

## **3 │ Intellectual Resources**

| Core Asset | Supports These Key Activities | Single Best Management Action | TBI Card |
| ----- | ----- | ----- | ----- |
| **EFI brand & trademarks** | Story-driven acquisition; premium pricing | Register in US \+ CARICOM; quarterly infringement scan | 🔗 F-KR-15 |
| **Regulatory dossier vault** | Duty-relief workflow; compliance audits | Update after every shipment; encrypt & back up quarterly | 🔗 F-KR-16 |
| **Supplier, recipe & velocity database** | Sourcing, merchandising, content marketing | NDAs for data; cleanse & back up monthly | 🔗 F-KR-17 |
| **Branded media library** | Omnichannel content calendar | Annual licensing & usage audit | 🔗 F-KR-18 |
| **Process playbooks (SOPs)** | Import ops, QA, CX, Growth Guild | Version control in GitBook; 6-month review cycle | 🔗 F-KR-19 |

---

## **4 │ Human Resources**

| Role / Partner | Supports These Key Activities | Single Best Management Action | TBI Card |
| ----- | ----- | ----- | ----- |
| **Founders & Core Leadership** | Ops, Tech, Growth OKRs & alliances | Block 10 h/wk for stakeholder touchpoints; quarterly OKR retro | 🔗 F-KR-20 |
| **Multilingual Procurement Trio** (AR/TR/EN) | Supplier relations; duty-relief documentation | Bonus on audit-pass rate & landed-cost delta | 🔗 F-KR-21 |
| **Full-stack Dev Squad** (2 FTE \+ 0.5 DevOps) | Storefront, CI/CD, data platform | Ship weekly; bug backlog \< 3 % | 🔗 F-KR-22 |
| **Growth & Community Team** (2) | Content calendar, CRM flows, advocacy | On-time posts ≥ 95 %; NPS ≥ 60 | 🔗 F-KR-23 |
| **Fractional Specialists** (QA, Accessibility, Legal) | ISO audits, WCAG compliance, SLAs | Time-boxed SOWs; milestone payments | 🔗 F-KR-24 |
| **AI co-workers** (chatbot, anomaly alerts) | First-line CX; data surveillance | First-contact resolution ≥ 70 %; retrain quarterly | 🔗 F-KR-25 |

---

## **5 │ Financial Resources**

| Funding Pool | Deployed Into | Stewardship Action | TBI Card |
| ----- | ----- | ----- | ----- |
| **BBD $200 K [SAFE](https://docs.google.com/document/d/1Vu1XdbecK_eaT9Hlq2yrg4RHVfAjPc_MA97VAyX0Iug/edit?usp=sharing)** | Tech build • Inventory • Marketing • Ops • Working capital  | Maintain 18-month runway forecast; quarterly investor update | 🔗 F-KR-26 |
| **Operating cash & Cedar Club float** | Loyalty rewards, re-orders, FX hedging | Reinvest 30 % GP into CAC-positive growth; maintain 3-mo OPEX buffer | 🔗 F-KR-27 |
| **Revolving import credit line** | Container purchasing & port fees | Utilisation ≤ 70 %; interest vs. cash balance review monthly | 🔗 F-KR-28 |

---

## **Next Actions**

1. **Implement Scale/Sunset Triggers:** Verify every tech asset’s SLA includes a clear trigger for scale or sunset, as annotated above.

2. **Dedupe SLA Stewardship:** Audit overlapping SLAs across resources and partners; assign one steward per metric and collapse duplicates.

3. **Link TBI Cards:** Replace all 🔗 placeholders with actual Testing Board URLs.

*Key Resources brief is now fully aligned with Segments, Value Props, Channels, Relationships, and Activities—each table includes a Feasibility (F) Card column, scale triggers, and single-steward SLAs.*

---

## **Key Terms**

| Acronym / Term | Meaning |
| ----- | ----- |
| **3PL** | Third‑Party Logistics provider (outsourced warehousing/fulfilment) |
| **IoT** | Internet of Things (connected sensors) |
| **ERP** | Enterprise Resource Planning system |
| **MERN** | Tech stack: MongoDB, Express, React, Node |
| **Rumble** | Cloud hosting platforms |
| **IaC** | Infrastructure as Code (automated server setup) |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **i18n** | Internationalisation (multi‑language capability) |
| **API** | Application Programming Interface |
| **ETA** | Estimated Time of Arrival |
| **SLA** | Service‑Level Agreement |
| **SOW** | Statement of Work |
| [**SAFE**](https://drive.google.com/drive/folders/19IldT0BgnjZqliziBt0Aj9gtftEVgIBc?usp=sharing) | Simple Agreement for Future Equity |
| **EPA (trade)** | CARIFORUM‑EU Economic Partnership Agreement (duty relief) |
| **MoU** | Memorandum of Understanding |
| **OKR** | Objective and Key Results |
| **WAF** | Web Application Firewall |
| **SOP** | Standard Operating Procedure |
| **RAG** | Retrieval-Augmented Generation |
| **CDN** | Content Delivery Network |
| **FCP / TTFB** | First Contentful Paint / Time To First Byte |
| **OPEX** | Operating Expenses |

