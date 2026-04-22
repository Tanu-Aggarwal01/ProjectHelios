# SharePoint Site Tiering Algorithm — Engineering Spec

**Product:** Microsoft Purview — Data Security Posture Management (DSPM)  
**Component:** Posture Agent — Site Prioritization & Tiering  
**Status:** Draft  
**Author:** Tanu Aggarwal  

---

## 1. Problem Statement

DSPM needs to prioritize which SharePoint sites in a tenant receive deep AI-driven categorization by the Posture Agent. Large tenants can have millions of sites — running full categorization on all of them is infeasible.

**Current approach (activity-based tiering) is flawed:**  
Purely ranking by read/write volume surfaces high-traffic but low-risk sites (company newsletters, HR portals, public communication sites) while burying quiet but critically sensitive sites (board materials, M&A war rooms, legal case files).

**Goal:** Tier sites by *security-relevant risk* — the intersection of data sensitivity and exposure — so we spend categorization budget where it matters most.

---

## 2. Approach Overview

### 2.1 Two-Axis Risk Model

Sites are scored on two independent axes:

```
Risk Score = f(Sensitivity Score, Exposure Score)
```

- **Sensitivity Score (0–100):** How likely is this site to contain sensitive, business-critical, or regulated data?
- **Exposure Score (0–100):** How broadly accessible is this site, and what is the blast radius if data is compromised?

**Activity** is used as a **secondary signal** within each tier for remediation ordering — not for tier assignment.

### 2.2 Three-Phase Evaluation Pipeline

| Phase | Scope | Cost | Input | Output |
|-------|-------|------|-------|--------|
| **Phase 1: Metadata Scoring** | 100% of sites | Zero / near-zero (API metadata only) | Site metadata, permissions, existing labels, DLP matches, audit signals | Preliminary risk scores + confidence scores |
| **Phase 2: Stratified Sampling** | Top candidates from Phase 1 + low-confidence sites | Moderate (targeted doc scanning) | Document content sampling per site | Refined sensitivity scores |
| **Phase 3: Full Categorization** | Confirmed Tier 1–2 sites | High (Posture Agent LLM analysis) | Full site content | Topic categories, detailed risk posture |

### 2.3 Dual-Score Model: Risk + Confidence

Every site receives two scores:

- **Risk Score** — Estimated sensitivity × exposure (what we think the risk is)
- **Confidence Score** — Evidence sufficiency (how sure we are about the risk estimate)

This prevents blind spots: a site with sparse telemetry scores *low confidence*, not *low risk*.

| Risk | Confidence | Action |
|------|-----------|--------|
| High | High | → Phase 3 (categorize immediately) |
| High | Low | → Phase 2 (sample to confirm) |
| Medium | Low | → Phase 2 (sample to clarify) |
| Low | High | → Tier 3–4 (deprioritize) |
| Low | Low | → Reserve budget for exploratory sampling |

---

## 3. Phase 1: Metadata-Based Scoring

### 3.1 Sensitivity Score Signals

Each signal produces a normalized sub-score (0–100). Missing signals contribute 0 to the weighted sum but reduce the Confidence Score.

| # | Signal | Source | Raw Metric | Normalization | Weight | Fallback if Missing |
|---|--------|--------|-----------|---------------|--------|-------------------|
| S1 | **Existing sensitivity labels** | MIP label metadata via Graph API | Count and max-severity of labeled items | Normalize by total items; weight by label severity (Confidential=1.0, Internal=0.4, General=0.1) | 0.20 | Reduce confidence by 0.15 |
| S2 | **DLP policy match counts** | DLP match telemetry | Total matches in last 90 days, by severity | Log-scale normalization; high/medium/low severity weighted 3:2:1 | 0.20 | Reduce confidence by 0.15 |
| S3 | **Auto-classification SIT hits** | Purview auto-labeling logs | Count of SIT matches by type | Normalize by doc count; weight by SIT risk tier (PII/financial/health > general) | 0.15 | Reduce confidence by 0.10 |
| S4 | **Site ownership / org context** | Azure AD group membership, org hierarchy | Owner's department, role level, org distance from CEO | Categorical mapping: Exec/Legal/Finance/HR/Security → high; Engineering/Sales → medium; General → low | 0.15 | Default to medium (0.5); reduce confidence by 0.05 |
| S5 | **Site name/description heuristics** | SharePoint site metadata | NLP keyword matching against sensitivity lexicon | Score based on keyword density and match strength (e.g., "Confidential", "M&A", "Board", "Legal Hold", "PII") | 0.08 | Score = 0; no confidence penalty |
| S6 | **Retention / legal hold / eDiscovery** | Purview compliance center | Boolean: any active hold, retention policy, or eDiscovery case | Binary: present = 80, absent = 0 | 0.07 | Score = 0; reduce confidence by 0.05 |
| S7 | **File type distribution** | SharePoint file metadata | Ratio of high-risk file types (xlsx, pdf, docx, csv, pst) vs low-risk (pptx, png, mp4) | Weighted ratio normalized to 0–100 | 0.05 | Default to 50; no confidence penalty |
| S8 | **Historical incidents** | DLP alerts, IRM signals, eDiscovery | Count of past DLP violations, IRM alerts, exfil events in last 12 months | Log-scale; any incident in last 90 days = high boost | 0.05 | Score = 0; no confidence penalty |
| S9 | **Document concentration risk** | Label + SIT metadata | Max sensitivity of any single document or library vs. site average | If any sub-container has sensitivity > 2× site average, boost score | 0.05 | Skip; no penalty |

**Sensitivity Score formula:**

```
SensitivityScore = Σ(signal_weight × signal_score) / Σ(available_signal_weights)
```

Re-normalize to 0–100 after excluding missing signals.

### 3.2 Exposure Score Signals

| # | Signal | Source | Raw Metric | Normalization | Weight | Fallback if Missing |
|---|--------|--------|-----------|---------------|--------|-------------------|
| E1 | **Permission breadth** | SharePoint permissions API | Classification: Anonymous links → 100, Everyone/EveryoneExceptExternal → 85, Org-wide groups → 70, Large explicit groups → 50, Small teams → 20 | Categorical; use max permission level across all items | 0.30 | Reduce confidence by 0.20 |
| E2 | **Unique user count (relative)** | SharePoint analytics / audit log | Unique users who accessed site in last 90 days / total org users | Percentile within tenant | 0.20 | Reduce confidence by 0.10 |
| E3 | **External / guest access** | Azure AD guest accounts, sharing audit | Count of guest users, number of external domains, stale guest ratio | Log-scale normalization; weight stale guests higher (access not revoked) | 0.15 | Score = 0; reduce confidence by 0.05 |
| E4 | **Sharing event volume** | Unified audit log | Sharing events in last 90 days (creates, modifies, external shares) | Log-scale, normalized per doc count | 0.10 | Score = 0; reduce confidence by 0.05 |
| E5 | **Recent permission broadening** | Audit log delta analysis | Any permission scope increase in last 30 days | Binary boost: +20 if broadened recently | 0.10 | Score = 0; no penalty |
| E6 | **Search discoverability** | SharePoint search config | Is site indexed / discoverable broadly? Excluded from search = lower exposure | Binary: discoverable = 60, excluded = 10 | 0.05 | Default to 60 (assume discoverable) |
| E7 | **Access concentration** | Audit log analysis | Herfindahl index of accessing users' departments | Low concentration (spread across org) = higher exposure; high concentration (one team) = lower | 0.05 | Default to medium (0.5); no penalty |
| E8 | **Inherited/nested permissions** | SharePoint permissions, Azure AD group nesting | Effective reach through nested groups, hub inheritance, inherited ACLs | Estimated effective user count vs explicit user count; ratio > 2× = exposure boost | 0.05 | Skip; no penalty |

**Exposure Score formula:**

```
ExposureScore = Σ(signal_weight × signal_score) / Σ(available_signal_weights)
```

### 3.3 Confidence Score

```
ConfidenceScore = 1.0 - Σ(confidence_penalties_for_missing_signals)
```

Clamp to [0.0, 1.0]. Express as percentage (0–100).

**Confidence thresholds:**
- **High confidence:** ≥ 70 — sufficient evidence for tier assignment
- **Medium confidence:** 40–69 — tier assignment tentative; candidate for Phase 2 sampling
- **Low confidence:** < 40 — insufficient evidence; route to Phase 2 regardless of risk score

### 3.4 Dormancy Handling

> **Critical:** Dormancy is a *modifier*, NOT a terminal tier.

A site with no activity in 12+ months can still be Tier 1 if it has high sensitivity and broad exposure (e.g., an externally shared legal archive).

**Rules:**
- Dormancy flag is set if: zero writes in 12 months AND fewer than 10 reads in 12 months
- Dormant sites receive an **activity modifier** of 0.3× on their within-tier remediation priority
- Dormant sites do NOT get their tier downgraded
- Exception: If dormancy + low sensitivity + low exposure → eligible for Tier 5 (archive candidates)

**Tier 5 criteria (Archive Candidates):**
```
Tier 5 = Dormant AND SensitivityScore < 20 AND ExposureScore < 20 AND ConfidenceScore ≥ 50
```

---

## 4. Tier Assignment

### 4.1 Tier Definitions

| Tier | Name | Criteria | Action |
|------|------|----------|--------|
| **Tier 1** | Crown Jewels at Risk | Sensitivity ≥ 60 AND Exposure ≥ 60 | Phase 3: Full Posture Agent categorization. Highest priority. |
| **Tier 2** | Well-Guarded Secrets | Sensitivity ≥ 60 AND Exposure < 60 | Phase 3: Full categorization. Validate existing controls. |
| **Tier 3** | Overshared, Low-Risk | Sensitivity < 60 AND Exposure ≥ 60 | Phase 2: Sample to confirm low sensitivity. Recommend permission right-sizing. |
| **Tier 4** | Low Priority | Sensitivity < 60 AND Exposure < 60 | Monitor. Re-evaluate on signal changes. |
| **Tier 5** | Archive Candidates | Dormant AND Sensitivity < 20 AND Exposure < 20 | Recommend archival or deletion via DLM policy. |

### 4.2 Threshold Calibration — Tenant-Adaptive

> **Absolute thresholds don't hold across tenants with 10K vs 10M sites.**

**Normalization strategy:**

1. Compute raw scores for all sites
2. Normalize within tenant using **percentile ranks**:
   - Sensitivity: percentile within tenant, optionally within site-type class
   - Exposure: percentile within tenant, normalized by org size
3. Apply tier thresholds to percentile-normalized scores
4. Apply **budget caps** per phase:

| Tenant Size | Phase 2 Budget | Phase 3 Budget |
|-------------|---------------|----------------|
| < 10K sites | Top 20% | Top 10% |
| 10K – 100K | Top 10% | Top 5% |
| 100K – 1M | Top 5% | Top 2% |
| > 1M sites | Top 2% | Top 0.5% |

*Budgets are configurable per tenant. Above are defaults.*

5. If a budget is exceeded, use **risk score × confidence score** as the tiebreaker to select top-K sites within each tier

### 4.3 Tier Transition Hysteresis

To prevent sites from flapping between tiers on small score changes:

- A site must exceed the tier boundary by **+5 points** to be promoted
- A site must fall below the tier boundary by **-5 points** to be demoted
- Minimum dwell time: site must remain in current tier for **7 days** before re-evaluation triggers a change

---

## 5. Phase 2: Stratified Sampling

### 5.1 Candidate Selection

Sites enter Phase 2 if:
- Tier 1–2 candidates from Phase 1 (to confirm before spending Phase 3 budget)
- Low-confidence sites regardless of score (Confidence < 40)
- Medium-risk + medium-confidence sites (borderline cases)

### 5.2 Sampling Strategy

> **Random sampling systematically misses concentrated sensitive content.** Use stratified sampling.

For each candidate site, sample documents across these strata:

| Stratum | Selection Logic | Sample Size |
|---------|----------------|-------------|
| **Recently modified** | Last 90 days, by recency | 15% of sample |
| **High-risk file types** | .xlsx, .pdf, .csv, .docx, .pst | 20% of sample |
| **Unlabeled documents** | No sensitivity label applied | 25% of sample |
| **Broadly shared items** | Items with org-wide or anonymous links | 15% of sample |
| **Per-library coverage** | At least 1 doc per document library | 15% of sample |
| **Random baseline** | Uniform random across remaining docs | 10% of sample |

### 5.3 Sample Size

| Site Document Count | Minimum Sample | Maximum Sample |
|--------------------|---------------|----------------|
| < 500 | 50 docs or all (whichever is less) | 100 |
| 500 – 5,000 | 100 | 300 |
| 5,000 – 50,000 | 200 | 500 |
| > 50,000 | 300 | 750 |

### 5.4 Scoring Update

After sampling:
- Re-compute Sensitivity Score incorporating SIT scan results with weight 0.30 (highest single signal post-sampling)
- Boost Confidence Score by +20 (evidence now includes content inspection)
- Re-evaluate tier assignment with hysteresis rules

### 5.5 Stopping Criteria

Sampling for a site can stop early if:
- First 50 docs already yield Sensitivity > 80 (confirmed high-sensitivity; promote to Phase 3)
- Full sample yields Sensitivity < 15 AND Confidence > 80 (confirmed low-sensitivity; demote)

---

## 6. Phase 3: Full Posture Agent Categorization

Applied only to confirmed Tier 1 and Tier 2 sites.

- Full LLM-driven topic categorization
- Detailed sensitivity classification per document cluster
- Subcategory generation
- Risk narrative and remediation recommendations

*Phase 3 design is out of scope for this spec — see Posture Agent Categorization Spec.*

---

## 7. Within-Tier Remediation Priority

Within each tier, sites are ordered by a **remediation priority score**:

```
RemediationPriority = RiskScore × ActivityModifier × RecencyBoost
```

Where:
- `RiskScore = SensitivityScore × ExposureScore / 100`
- `ActivityModifier`:
  - Active (reads + writes in last 30 days): 1.0
  - Moderate (activity in last 90 days): 0.7
  - Low (activity in last 12 months): 0.5
  - Dormant (no meaningful activity in 12+ months): 0.3
- `RecencyBoost`:
  - Permission broadened in last 30 days: 1.5×
  - DLP incident in last 30 days: 1.5×
  - New external sharing in last 30 days: 1.3×
  - Otherwise: 1.0×

---

## 8. Recalculation & Freshness

### 8.1 Event-Driven Recalculation (Real-time / Near-real-time)

Trigger immediate score recalculation for a site when:
- Permission scope is broadened (new sharing links, group membership changes)
- External guests are added
- DLP policy match or alert fires
- Sensitivity label is applied or changed on > 10 items
- Site is placed on legal hold or eDiscovery

### 8.2 Scheduled Recalculation

| Cadence | Scope |
|---------|-------|
| **Daily** | Tier 1–2 sites: refresh exposure signals (sharing, access patterns) |
| **Weekly** | Tier 3–4 sites: refresh all Phase 1 signals |
| **Monthly** | Full tenant re-baseline: recompute all scores, re-normalize percentiles, re-apply budget caps |

### 8.3 Signal Decay

- Sharing events: 90-day rolling window, exponentially weighted (recent events weighted 3×)
- DLP matches: 90-day window for score; 12-month window for historical incident signal
- Access patterns: 90-day window
- Labels/permissions: Current state (no decay — these are persistent)

---

## 9. Edge Cases & Mitigations

| Edge Case | Risk | Mitigation |
|-----------|------|-----------|
| **High-sensitivity, low-volume sites** (board, M&A war rooms) | Under-ranked due to few documents / little DLP history | S4 (org context) and S6 (legal hold) signals provide strong priors independent of volume |
| **Large site with one sensitive library** | Site-level averaging washes out hotspot | S9 (document concentration risk) boosts score if any sub-container exceeds 2× site average |
| **Dormant but externally shared archives** | Activity-based logic would deprioritize | Dormancy is a modifier not a tier; exposure score persists regardless of activity |
| **Tenants with poor labeling hygiene** | Label-dependent signals systematically miss unlabeled sensitive content | Labels are 1 of 9 sensitivity signals (weight 0.20); low label coverage reduces confidence, routing to Phase 2 sampling |
| **Template-based false positives** (HR portals, news sites) | Site type heuristics may over-suppress or over-promote | Site type is a prior within S4/S5, not a hard filter; still evaluated on actual sensitivity/exposure signals |
| **Newly created sites** | No historical signals | Start with Confidence < 40 → auto-route to Phase 2 after 30-day observation period |
| **Sites with sensitive site names but no sensitive content** (e.g., "Confidential Templates" that's actually a template library) | S5 heuristic false positive | S5 has low weight (0.08); Phase 2 sampling corrects |

---

## 10. Data Requirements

### 10.1 APIs & Data Sources

| Data | Source API | Latency | Auth |
|------|-----------|---------|------|
| Site metadata (name, description, template, hub) | SharePoint REST API / Graph Sites API | Near-real-time | App-only permission: Sites.Read.All |
| Sensitivity labels on items | Graph Security / MIP API | Near-real-time | App-only: InformationProtection.Read.All |
| DLP match telemetry | Purview DLP API / Compliance Center | Daily batch | Compliance admin role |
| Auto-labeling SIT matches | Purview auto-labeling logs | Daily batch | Compliance admin role |
| Site permissions & sharing links | SharePoint Permissions API / Graph | Near-real-time | Sites.FullControl.All (read-only usage) |
| Audit log (sharing events, access) | Office 365 Management Activity API | Near-real-time (streaming) | ActivityFeed.Read |
| Azure AD group membership | Microsoft Graph Groups API | Near-real-time | GroupMember.Read.All |
| Retention / legal holds | Purview Compliance API | Daily batch | Compliance admin role |
| eDiscovery case association | Purview eDiscovery API | Daily batch | eDiscovery admin role |

### 10.2 Storage

- Per-site score record: ~500 bytes × number of sites
- Score history (for trend analysis): rolling 90-day window
- Phase 2 sample results: ~2KB per sampled site

---

## 11. Success Metrics & Evaluation

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Tier 1 recall** | ≥ 95% of known sensitive sites land in Tier 1–2 | Validate against manually curated "crown jewel" site list per tenant |
| **Tier 1 precision** | ≥ 70% of Tier 1 sites confirmed sensitive after Phase 2 | Phase 2 sampling confirmation rate |
| **Budget efficiency** | Phase 3 categorization covers ≥ 80% of sensitive docs with ≤ 5% of sites | Compare categorized doc sensitivity to total tenant sensitivity |
| **Classification stability** | < 10% of sites change tiers week-over-week | Measure tier flapping rate |
| **Phase 2 false-negative rate** | < 5% of sampled sites misclassified as low-sensitivity | Post-hoc full-scan validation on sample of "low" sites |
| **Time to first tier assignment** | < 4 hours for tenants < 100K sites; < 24 hours for > 1M sites | End-to-end Phase 1 pipeline latency |

---

## 12. Open Questions

1. **Weight tuning:** Initial weights are expert-estimated. Should we plan an A/B framework to tune weights based on Phase 2/3 outcomes?
2. **Cross-workload signals:** Should Exchange/Teams/OneDrive signals inform SharePoint site sensitivity (e.g., a user who emails sensitive content likely stores it in their connected SharePoint site)?
3. **Customer overrides:** Should admins be able to manually pin sites to Tier 1 or exclude sites from categorization?
4. **Multi-geo:** How do we handle tenants with multi-geo configurations where sites span regions with different compliance requirements?
5. **Incremental rollout:** Should Phase 1 be GA-gated or can it run in shadow mode (score without acting) for initial validation?
