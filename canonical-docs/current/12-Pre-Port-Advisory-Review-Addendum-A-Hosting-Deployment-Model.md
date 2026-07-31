# InvestScape — Pre-Port Advisory Review: Addendum A — Hosting & Deployment Model (Doc 12A)

**Extends Part 4 (CTO Lens) with a fifth item. Prompted by Eric's question about a possible future "Route 3" — self-hosting on private company servers. Short addendum; fold into Doc 12 Part 4 as §4.5 on the next full-doc pass.**

---

### 🟢 4.5 "Route 3" is not a new architecture — it's a deployment decision inside Route 2

**What:** Eric raised a possible future "Route 3": hosting InvestScape on private company-owned servers with an internally-managed database, to reduce reliance on third-party software.

**Clarification — this isn't a third build path.** Route 2 (Executive Summary: custom stack, Postgres/React) already means owning the schema and the code, free of Bubble's proprietary engine lock-in (Bubble's own docs confirm apps cannot migrate off Bubble hosting — you either stay on their infrastructure or rebuild). What Eric described is really a choice of *where Route 2's code runs*: managed cloud (Supabase/Vercel/AWS/Azure managed services) versus infrastructure Eric leases or owns outright (colocation or on-prem hardware). Both are "Route 2" in architecture terms — the difference is entirely operational.

**Why self-hosting bare metal is the wrong default, even eventually:**
- InvestScape handles portfolio equity, deal inputs, and other financial data. Security patching, DDoS mitigation, backup integrity, and uptime are a managed cloud provider's full-time job; a solo founder taking that on directly adds real operational liability at exactly the layer the E&O insurance and legal consultations (3.3) exist to de-risk.
- **Data-sovereignty needs (PIPEDA/PIPA) are very likely solvable without owning hardware.** AWS operates two Canadian regions (ca-central-1 Montreal, ca-west-1 Calgary); Azure and GCP have Canadian regions too. That satisfies "Canadian data residency" without the ops burden of physical servers. Bubble itself only offers region choice on its Enterprise/dedicated-instance tier (still Bubble-managed AWS, not literal ownership) — another data point that "region control" and "hardware ownership" are usually two different asks, and the cheaper one is almost always sufficient.
- **Self-hosting doesn't reduce the dependency Eric may actually be picturing.** Owning servers changes *where the code runs*, not *where the data comes from*. InvestScape still pulls from CMHC, StatCan, Census, Redfin, FRED, CREA (Doc 28) regardless of hosting model — nobody self-hosts the census. Same for the Claude API narrative layer: that dependency is only solvable by self-hosting an open-weights LLM, an unrelated and much larger tradeoff, and not one to revisit given how deliberately the interpret-only liability architecture (Doc 05) is built around Claude specifically. Stripe stays third-party regardless too — self-hosting payment processing means taking on PCI-DSS compliance as its own business, not a founder side-effect.

**Recommendation:** don't design around "Route 3" now — there's no decision to make yet. When Route 2 itself becomes real, put one concrete question to regulatory counsel: *does compliance actually require physical infrastructure ownership, or does a Canadian cloud region satisfy it?* Add it to the same legal-consultation agenda as the CREA/Teranet/OSM licensing items already logged in Doc 28 §10. If the answer is "a Canadian region is enough" — the far more likely outcome — the deployment question resolves itself as a config choice within Route 2, not a rebuild.

**Cost of late:** none, if left as a note. The risk runs the other way — treating "Route 3" as a real third architecture could pull design or infrastructure effort toward server ownership before there's a documented reason to need it.

---
*End of Doc 12A · Extends: 12-Pre-Port-Advisory-Review.md Part 4 (CTO Lens), inserted as §4.5 · Related: 28-External-Data-Source-Registry.md §10 (legal consultation agenda)*
