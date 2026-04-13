# Project Helios — Purview DSPM Prototype

An interactive prototype for **Microsoft Purview Data Security Posture Management (DSPM)**, demonstrating how organizations can get their data estate ready for AI.

## 🚀 Quick Start

```bash
git clone https://github.com/talhahm_microsoft/Project-Helios-Prototype.git
cd Project-Helios-Prototype
npm install
npm run build
npx vite preview
```

Open **http://localhost:4173** in your browser.

## 📋 What This Prototype Demonstrates

### Homepage — Get Your Data Estate Ready for AI
Two parallel lanes for fast time-to-value:
- **🎯 Understand & Remediate** — Data Security Posture Agent organizes your data estate by activity tiers and AI-derived categories
- **🛡️ Detect & Protect** — Start managing active risks today with Copilot DLP, Inline DLP, and IRM controls

### Core Risk Framework
Three consistent metrics at every level (tenant → tier → category → subcategory → site → folder → file):
- **🏷️ Unlabeled** — % of content without sensitivity labels
- **🔓 Overexposed** — % of content with overly broad permissions
- **🗑️ ROT** — % of content that is Redundant, Obsolete, or Trivial (not accessed in 1+ year)

### Key Features
- **Tier-based organization** — Sites grouped by activity volume (Highly Active → Dormant)
- **AI-powered categorization** — LLM-derived topic categories with Security Copilot branding
- **Treemap visualizations** — Categories and subcategories sized by document volume with inline risk bars
- **Site deep dives** — Full site metadata, user access by org group, grouped mitigations
- **File explorer** — Breadcrumb folder navigation, sortable file table with 11+ columns
- **File-level actions** — Apply label, AI-classify, restrict access, revoke external, retention label, flag for review
- **Security Copilot Insights** — AI-generated activity narratives at category, subcategory, site, and file levels
- **AI-Native Classification** — Smart SITs and semantic classifiers for high-accuracy content classification
- **Protection controls** — Copilot DLP, Inline DLP for AI, Risky AI Usage Detection with status indicators

### Mitigation Actions (at site/folder level)
Organized into three groups matching the risk pillars:
1. **Manage Unlabeled Content** — MIP container labels, file labeling, AI-native classification
2. **Manage Overexposed Content** — Data risk assessments, permissions rightsizing, permission guardrails
3. **Manage ROT Content** — Retention policies via Purview DLM

## 🛠️ Development

```bash
npm install
npm run dev      # Start dev server (hot reload)
npm run build    # Production build
npm run preview  # Preview production build
```

## 📁 Project Structure

```
src/
├── App.jsx                    # Main app with navigation
├── main.jsx                   # Entry point
├── index.css                  # Global styles
├── data/
│   └── mockData.js            # All mock data and generators
└── components/
    ├── HomePage.jsx           # DSPM homepage with dual-lane hero
    ├── TierView.jsx           # Tier listing with risk metrics
    ├── CategoryView.jsx       # Treemap + detail panel + deep dive
    ├── SubcategoryView.jsx    # Treemap + detail panel + deep dive
    ├── SiteExplorer.jsx       # Full site folder/file explorer
    ├── FileGraph.jsx          # Single file relationship graph
    └── TopicGraph.jsx         # Topic relationship graph
```

## ⚠️ Disclaimer

This is a **design prototype** with mock data for demonstration purposes only. It is not connected to any live Microsoft Purview services or real customer data.

---

*Built with React, D3.js, and Vite*
