---

description: Generate a full Domain‑Driven Design artefact set from a business‑model document, without human pauses. globs:

* business\_model.md  
* constraints.json  
* existing\_assets.zip alwaysApply: false

---

# Rule: Generating a DDD Blueprint from a Business Model

## Goal

Transform an explicit **business‑model description** (Strategyzer‑style or similar) into a complete, production‑ready Domain‑Driven Design (DDD) blueprint—covering strategic design, bounded contexts, message catalogue, code skeletons, and CI quality gates—*in a single autonomous run*.

## Output

* **Format:** Markdown \+ code \+ schemas (various) bundled in a ZIP  
* **Location:** Root‑level folders generated as per task list  
* **Primary Manifest:** `/DDD_Artefacts/manifest.json`

## Process

1. **Receive Input Set** – Validate presence and UTF‑8 encoding of `business_model.md` and `constraints.json`; fail fast otherwise.  
2. **Domain Discovery** – Parse narrative → generate `raw_domain_graph.json` and consolidated `glossary.md`.  
3. **Strategic Classification** – Cluster concepts; label 🔴 Core | 🟠 Supporting | 🟢 Generic; output `subdomain_matrix.md` \+ heat‑map.  
4. **Context Mapping** – Create bounded contexts, upstream/downstream relationships, and PlantUML context map.  
5. **Tactical Modelling (per Core Context)** – Derive aggregates, value objects, sagas, and domain events; emit class diagrams and event schemas.  
6. **Supporting & Generic Specs** – Produce lightweight spec sheets for non‑core contexts.  
7. **Policy Binding** – Map each cross‑cutting policy from `constraints.json` to specific aggregate invariants, sagas, or ACLs; output `policy_binding.md`.  
8. **Code Skeleton Generation** – Hexagonal structure in TypeScript (`/code/**`), plus tests and CI script.  
9. **Quality Gates** – Generate and run invariant tests, contract tests, schema validation, glossary drift check.  
10. **Bundle Artefacts** – Zip everything into `DDD_Artefacts.zip`; create checksum manifest.

## Output Format

The AI must create **all** listed artefacts *and* a high‑level task checklist in `/tasks/tasks-ddd-business-model.md` following the structure below:

\#\# Relevant Files

\- \`docs/glossary.md\` – Canonical ubiquitous language table.

\- \`docs/diagrams/c4\_context.svg\` – High‑level system context diagram.

\- \`docs/diagrams/context\_map.puml\` – PlantUML bounded‑context map.

\- \`docs/subdomain\_matrix.md\` – Core/Supporting/Generic classification.

\- \`docs/event\_storming\_board.miro\` – Event‑storm screenshot export.

\- \`docs/core-contexts/Order/aggregates.puml\` – Order aggregate diagram (similar for each core context).

\- \`schemas/events/OrderPlaced.json\` – JSON schema for \`OrderPlaced\` event.

\- \`code/domain/Order/Order.ts\` – Aggregate root implementation.

\- \`code/app/Order/CheckoutSaga.ts\` – Process manager coordinating checkout flow.

\- \`code/infra/Payment/StripeAdapter.ts\` – ACL translating Stripe events.

\- \`tests/invariant/Order.spec.ts\` – Invariant tests for Order aggregate.

\- \`ci.sh\` – Continuous‑integration script running lint \+ tests \+ drift checks.

\#\#\# Notes

\- Tests reside alongside code files.  Run all tests with \`npm test\`.

\- All diagrams stored as SVG or PlantUML; source \`.puml\` provided.

\#\# Tasks

\- \[ \] \*\*1.0 Validate Inputs\*\*

  \- \[ \] 1.1 Ensure \`business\_model.md\` & \`constraints.json\` exist and are UTF‑8.

  \- \[ \] 1.2 Halt with error if mandatory keys (\`regulations\`, \`techStack\`) absent.

\- \[ \] \*\*2.0 Domain Discovery\*\*

  \- \[ \] 2.1 Parse business narrative → extract candidate nouns/verbs.

  \- \[ \] 2.2 Build \`raw\_domain\_graph.json\` (actors • goals • processes).

  \- \[ \] 2.3 Consolidate synonyms → draft glossary table.

\- \[ \] \*\*3.0 Ubiquitous Language Finalisation\*\*

  \- \[ \] 3.1 Promote glossary draft to \`docs/glossary.md\`.

  \- \[ \] 3.2 Report naming drift versus inputs; auto‑fix obvious plural/singular mismatches.

\- \[ \] \*\*4.0 Sub‑Domain Classification\*\*

  \- \[ \] 4.1 Cluster concepts using Louvain; label clusters.

  \- \[ \] 4.2 Generate \`subdomain\_matrix.md\` \+ \`subdomain\_heatmap.svg\`.

\- \[ \] \*\*5.0 Context Mapping\*\*

  \- \[ \] 5.1 Create one bounded context per Core & Supporting cluster.

  \- \[ \] 5.2 Determine upstream/downstream relations \+ integration style.

  \- \[ \] 5.3 Output PlantUML diagram \`docs/diagrams/context\_map.puml\`.

\- \[ \] \*\*6.0 Core Context Modelling (loop per Core)\*\*

  \- \[ \] 6.1 Extract use‑cases; save \`\<ctx\>/usecases.md\`.

  \- \[ \] 6.2 Design aggregates & invariants in \`\<ctx\>/aggregates.puml\`.

  \- \[ \] 6.3 Define domain events & JSON schemas.

  \- \[ \] 6.4 Create sagas/process managers diagrams.

\- \[ \] \*\*7.0 Supporting & Generic Specs\*\*

  \- \[ \] 7.1 Produce spec sheet (≤60 lines) per context.

\- \[ \] \*\*8.0 Policy Binding\*\*

  \- \[ \] 8.1 Map each policy → aggregate/saga/ACL; output \`policy\_binding.md\`.

\- \[ \] \*\*9.0 Code Skeleton Generation\*\*

  \- \[ \] 9.1 Generate TypeScript aggregate classes in \`/code/domain\`.

  \- \[ \] 9.2 Produce command handlers, sagas, adapters.

  \- \[ \] 9.3 Scaffold tests and CI script.

\- \[ \] \*\*10.0 Quality Gates & Packaging\*\*

  \- \[ \] 10.1 Run \`ci.sh\`; ensure exit 0\.

  \- \[ \] 10.2 Zip artefacts into \`DDD\_Artefacts.zip\`; compute SHA‑256 manifest.

## Interaction Model

Because the process must complete autonomously, *no intermediate pause or user confirmation is expected*.  Any validation failure aborts execution with an explicit error log.

## Target Audience

Primary consumer of the generated artefacts is a **junior developer** responsible for implementation and maintenance.  Documentation therefore favours clarity and explicit file paths over abstract theory.  

## Execution Instructions

1. **Prerequisites**: Ensure `business_model.md` and `constraints.json` files are present in the root directory and properly UTF-8 encoded.

2. **Initiate Process**: To start the DDD generation process, use the following command:
   ```bash
   ai-ddd-generator --input-dir=./ --output-dir=./DDD_Artefacts
   ```

3. **Monitor Progress**: The process will run autonomously without pauses. Progress will be logged to stdout.

4. **Completion**: Upon successful completion, all artifacts will be available in the specified output directory and bundled as `DDD_Artefacts.zip`.

5. **Error Handling**: If validation fails, the process will abort with an explicit error log in `ddd_generation_error.log`.
