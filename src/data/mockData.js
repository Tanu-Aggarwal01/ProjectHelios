// ──────────────────────────────────────────
// TIERS — SharePoint sites grouped by activity
// ──────────────────────────────────────────
export const tiers = [
  {
    id: 1,
    name: 'Tier 1 — Highly Active',
    label: 'Hot',
    color: '#ef4444',
    gradient: ['#ff6b6b', '#dc2626'],
    glow: 'rgba(239,68,68,0.35)',
    sites: 487,
    totalDocs: 2_450_000,
    monthlyReads: 1_950_000,
    monthlyWrites: 550_000,
    get monthlyActivity() { return this.monthlyReads + this.monthlyWrites; },
    topSites: ['Executive Portal', 'Global Finance Hub', 'Legal Central', 'HR Confidential', 'Customer 360'],
    description: 'Sites with the highest read/write volume. These are your most actively used sites and have already been automatically categorized into topics.',
    categorized: true,
    classificationRisk: 34, exposureRisk: 42, governanceRisk: 8,
    dlpCoverage: 72, dlpBreakdown: { block: 22, warn: 25, audit: 18, simulation: 7 },
    irmCoverage: 65, irmSignals: 24,
  },
  {
    id: 2,
    name: 'Tier 2 — Active',
    label: 'Active',
    color: '#f97316',
    gradient: ['#ffaa44', '#ea580c'],
    glow: 'rgba(249,115,22,0.3)',
    sites: 2_340,
    totalDocs: 8_900_000,
    monthlyReads: 680_000,
    monthlyWrites: 210_000,
    get monthlyActivity() { return this.monthlyReads + this.monthlyWrites; },
    topSites: ['Marketing Campaigns', 'Engineering Wiki', 'Sales Enablement', 'Product Roadmap', 'Design Assets'],
    description: 'Sites with steady read/write traffic and regular collaboration activity.',
    categorized: false,
    classificationRisk: 48, exposureRisk: 38, governanceRisk: 18,
    dlpCoverage: 58, dlpBreakdown: { block: 14, warn: 20, audit: 16, simulation: 8 },
    irmCoverage: 48, irmSignals: 18,
  },
  {
    id: 3,
    name: 'Tier 3 — Moderate',
    label: 'Moderate',
    color: '#eab308',
    gradient: ['#fde047', '#ca8a04'],
    glow: 'rgba(234,179,8,0.2)',
    sites: 8_120,
    totalDocs: 15_200_000,
    monthlyReads: 198_000,
    monthlyWrites: 47_000,
    get monthlyActivity() { return this.monthlyReads + this.monthlyWrites; },
    topSites: ['Project Archives', 'Training Portal', 'Department Libraries', 'Meeting Notes', 'Policy Docs'],
    description: 'Sites with periodic access and moderate activity levels.',
    categorized: false,
    classificationRisk: 62, exposureRisk: 31, governanceRisk: 35,
    dlpCoverage: 42, dlpBreakdown: { block: 8, warn: 14, audit: 12, simulation: 8 },
    irmCoverage: 35, irmSignals: 12,
  },
  {
    id: 4,
    name: 'Tier 4 — Low Activity',
    label: 'Low',
    color: '#6366f1',
    gradient: ['#818cf8', '#4f46e5'],
    glow: 'rgba(99,102,241,0.15)',
    sites: 24_800,
    totalDocs: 22_100_000,
    monthlyReads: 41_000,
    monthlyWrites: 11_000,
    get monthlyActivity() { return this.monthlyReads + this.monthlyWrites; },
    topSites: ['Legacy Projects', 'Old Team Sites', 'Archived Initiatives', 'Previous Fiscal Year', 'Migration Staging'],
    description: 'Low-traffic sites with infrequent access.',
    categorized: false,
    classificationRisk: 74, exposureRisk: 26, governanceRisk: 58,
    dlpCoverage: 28, dlpBreakdown: { block: 4, warn: 8, audit: 9, simulation: 7 },
    irmCoverage: 20, irmSignals: 6,
  },
  {
    id: 5,
    name: 'Tier 5 — Dormant',
    label: 'Stale',
    color: '#64748b',
    gradient: ['#94a3b8', '#475569'],
    glow: 'rgba(100,116,139,0.1)',
    sites: 64_253,
    totalDocs: 18_300_000,
    monthlyReads: 3_900,
    monthlyWrites: 900,
    get monthlyActivity() { return this.monthlyReads + this.monthlyWrites; },
    topSites: ['Decommissioned Teams', 'Former Employee Sites', 'Sunset Products', 'Pre-Migration Data', 'Test Sites'],
    description: 'Dormant or stale sites with almost no activity. Candidates for archival or deletion.',
    categorized: false,
    classificationRisk: 82, exposureRisk: 19, governanceRisk: 78,
    dlpCoverage: 12, dlpBreakdown: { block: 1, warn: 3, audit: 4, simulation: 4 },
    irmCoverage: 8, irmSignals: 2,
  },
];

export const tierSummary = {
  totalSites: tiers.reduce((s, t) => s + t.sites, 0),
  totalDocs: tiers.reduce((s, t) => s + t.totalDocs, 0),
  totalMonthlyActivity: tiers.reduce((s, t) => s + t.monthlyReads + t.monthlyWrites, 0),
};

// ──────────────────────────────────────────
// CATEGORIES — LLM-derived topic categories
// ──────────────────────────────────────────
export const categories = [
  { id: 'financial',    name: 'Financial Operations',       icon: '📊', color: '#f59e0b' },
  { id: 'hr',           name: 'Human Resources',            icon: '👥', color: '#ec4899' },
  { id: 'legal',        name: 'Legal & Compliance',         icon: '⚖️', color: '#8b5cf6' },
  { id: 'engineering',  name: 'Engineering & Development',  icon: '💻', color: '#3b82f6' },
  { id: 'customer',     name: 'Customer Information',       icon: '🔐', color: '#ef4444' },
  { id: 'sales',        name: 'Sales & Marketing',          icon: '📢', color: '#22c55e' },
  { id: 'executive',    name: 'Executive Strategy',         icon: '🏛️', color: '#f97316' },
  { id: 'product',      name: 'Product Management',         icon: '🗺️', color: '#06b6d4' },
  { id: 'research',     name: 'Research & Innovation',      icon: '🔬', color: '#a855f7' },
  { id: 'it',           name: 'IT Operations',              icon: '🖥️', color: '#64748b' },
];

// Distribution of categories per tier (document counts)
export function getCategoriesForTier(tierId) {
  const distributions = {
    1: [320000,185000,210000,95000,280000,245000,390000,110000,75000,140000],
    2: [680000,420000,390000,850000,310000,920000,180000,560000,410000,280000],
    3: [1100000,890000,620000,1800000,540000,1650000,320000,980000,1200000,900000],
    4: [2200000,1800000,1500000,3100000,1200000,2800000,680000,1900000,2500000,2120000],
    5: [1800000,1400000,1200000,2500000,980000,2100000,520000,1500000,2000000,1800000],
  };
  const dist = distributions[tierId] || distributions[3];
  const tierRisks = {
    1: { cl: [28,40,30,22,38,20,42,24,26,32], ex: [38,48,36,28,50,22,44,30,32,40], gv: [6,10,8,4,12,5,9,3,5,7] },
    2: { cl: [42,52,44,36,50,34,48,38,40,46], ex: [34,42,32,26,44,20,38,28,30,36], gv: [14,20,16,12,22,10,18,11,15,17] },
    3: { cl: [56,66,58,50,64,48,60,52,54,60], ex: [28,34,26,22,36,18,32,24,26,30], gv: [30,38,32,28,40,26,35,29,33,36] },
    4: { cl: [68,78,70,62,76,60,72,64,66,74], ex: [22,28,20,18,30,14,26,20,22,24], gv: [52,62,54,48,64,46,58,50,55,60] },
    5: { cl: [78,86,80,74,84,72,82,76,78,82], ex: [16,22,14,12,24,10,20,14,16,18], gv: [72,82,74,68,84,66,78,70,75,80] },
  };
  const tr = tierRisks[tierId] || tierRisks[3];
  const tierSecurity = {
    1: { dlp: [78,68,82,55,75,48,85,52,58,72], irm: [70,62,58,45,72,40,68,48,52,60] },
    2: { dlp: [62,52,68,42,58,35,72,40,45,55], irm: [52,44,48,35,55,30,52,38,42,48] },
    3: { dlp: [48,38,52,30,42,25,55,28,32,40], irm: [38,32,35,25,42,22,38,28,32,35] },
    4: { dlp: [32,24,38,20,28,15,40,18,22,28], irm: [24,18,22,15,28,12,24,16,18,22] },
    5: { dlp: [15,10,18,8,14,6,20,10,12,15], irm: [10,6,8,4,12,4,10,6,8,8] },
  };
  const ts = tierSecurity[tierId] || tierSecurity[3];
  return categories.map((cat, i) => ({
    ...cat,
    documentCount: dist[i],
    siteCount: Math.round(dist[i] / (800 + i * 200)),
    overexposed: Math.round(dist[i] * (tr.ex[i] / 100)),
    classificationRisk: tr.cl[i],
    exposureRisk: tr.ex[i],
    governanceRisk: tr.gv[i],
    dlpCoverage: ts.dlp[i],
    dlpBreakdown: (() => { const dlpVal = ts.dlp[i]; const dlpBlock = Math.round(dlpVal * 0.28); const dlpWarn = Math.round(dlpVal * 0.32); const dlpAudit = Math.round(dlpVal * 0.25); const dlpSim = dlpVal - dlpBlock - dlpWarn - dlpAudit; return { block: dlpBlock, warn: dlpWarn, audit: dlpAudit, simulation: dlpSim }; })(),
    irmCoverage: ts.irm[i],
    irmSignals: Math.round(ts.irm[i] * 0.3),
  }));
}

// ──────────────────────────────────────────
// SUBCATEGORIES
// ──────────────────────────────────────────
const subcategoryMap = {
  financial: [
    { id: 'quarterly-earnings',   name: 'Quarterly Earnings & Reports', docs: 0.22 },
    { id: 'budget-planning',      name: 'Budget & Planning',            docs: 0.18 },
    { id: 'tax-compliance',       name: 'Tax & Compliance Filings',     docs: 0.15 },
    { id: 'revenue-forecasting',  name: 'Revenue Forecasting Models',   docs: 0.20 },
    { id: 'audit-docs',           name: 'Audit Documentation',          docs: 0.12 },
    { id: 'expense-mgmt',         name: 'Expense Management',           docs: 0.13 },
  ],
  hr: [
    { id: 'employee-records', name: 'Employee Records & PII',     docs: 0.25 },
    { id: 'compensation',    name: 'Compensation & Benefits',     docs: 0.18 },
    { id: 'recruiting',      name: 'Recruiting & Hiring',         docs: 0.20 },
    { id: 'performance',     name: 'Performance Reviews',         docs: 0.15 },
    { id: 'training',        name: 'Training & Development',      docs: 0.12 },
    { id: 'policies-hr',     name: 'HR Policies & Handbooks',     docs: 0.10 },
  ],
  legal: [
    { id: 'contracts',       name: 'Contracts & Agreements',     docs: 0.28 },
    { id: 'regulatory',      name: 'Regulatory Compliance',      docs: 0.22 },
    { id: 'litigation',      name: 'Litigation & Disputes',      docs: 0.15 },
    { id: 'ip-patents',      name: 'IP & Patents',               docs: 0.18 },
    { id: 'privacy',         name: 'Privacy & Data Protection',  docs: 0.17 },
  ],
  engineering: [
    { id: 'source-code',     name: 'Source Code & Repos',        docs: 0.30 },
    { id: 'architecture',    name: 'Architecture & Design Docs', docs: 0.18 },
    { id: 'api-docs',        name: 'API Documentation',          docs: 0.15 },
    { id: 'devops',          name: 'DevOps & CI/CD Configs',     docs: 0.12 },
    { id: 'testing',         name: 'Test Plans & Results',       docs: 0.13 },
    { id: 'tech-debt',       name: 'Tech Debt & Incident Reports', docs: 0.12 },
  ],
  customer: [
    { id: 'contact-info',    name: 'Customer Contact Data',      docs: 0.22 },
    { id: 'purchase-history',name: 'Purchase & Order History',   docs: 0.20 },
    { id: 'support-cases',   name: 'Support Cases & Tickets',    docs: 0.25 },
    { id: 'feedback',        name: 'Customer Feedback & Surveys',docs: 0.18 },
    { id: 'pii-sensitive',   name: 'PII & Sensitive Records',    docs: 0.15 },
  ],
  sales: [
    { id: 'campaigns',       name: 'Campaign Materials',          docs: 0.22 },
    { id: 'sales-decks',     name: 'Sales Presentations & Decks', docs: 0.20 },
    { id: 'brand-assets',    name: 'Brand Assets & Guidelines',   docs: 0.18 },
    { id: 'market-research', name: 'Market Research & Analysis',  docs: 0.15 },
    { id: 'leads-pipeline',  name: 'Leads & Pipeline Data',       docs: 0.15 },
    { id: 'partner-materials', name: 'Partner & Channel Materials', docs: 0.10 },
  ],
  executive: [
    { id: 'board-materials', name: 'Board Meeting Materials',     docs: 0.25 },
    { id: 'strategy-plans',  name: 'Strategic Plans & Roadmaps',  docs: 0.22 },
    { id: 'ma-docs',         name: 'M&A Documentation',           docs: 0.18 },
    { id: 'investor-relations', name: 'Investor Relations',       docs: 0.15 },
    { id: 'exec-memos',      name: 'Executive Memos & Briefs',    docs: 0.20 },
  ],
  product: [
    { id: 'feature-specs',   name: 'Feature Specifications',      docs: 0.25 },
    { id: 'roadmap-plans',   name: 'Roadmap & Release Plans',     docs: 0.20 },
    { id: 'ux-research',     name: 'UX Research & Mockups',       docs: 0.18 },
    { id: 'competitive',     name: 'Competitive Analysis',        docs: 0.15 },
    { id: 'metrics',         name: 'Product Metrics & KPIs',      docs: 0.12 },
    { id: 'feedback-product', name: 'Product Feedback Logs',      docs: 0.10 },
  ],
  research: [
    { id: 'research-papers', name: 'Research Papers & Journals',  docs: 0.25 },
    { id: 'experiments',     name: 'Experimental Data & Results', docs: 0.22 },
    { id: 'patents-filings', name: 'Patent Filings & Prior Art',  docs: 0.18 },
    { id: 'lab-notebooks',   name: 'Lab Notebooks & Protocols',   docs: 0.15 },
    { id: 'innovation',      name: 'Innovation Proposals',        docs: 0.10 },
    { id: 'datasets',        name: 'Datasets & Models',           docs: 0.10 },
  ],
  it: [
    { id: 'server-configs',  name: 'Server & Cloud Configs',      docs: 0.22 },
    { id: 'security-policies', name: 'Security Policies & Certs', docs: 0.20 },
    { id: 'network-docs',    name: 'Network Architecture',        docs: 0.15 },
    { id: 'runbooks',        name: 'Runbooks & SOPs',             docs: 0.18 },
    { id: 'access-logs',     name: 'Access Logs & Audit Trails',  docs: 0.13 },
    { id: 'incident-response', name: 'Incident Response Plans',   docs: 0.12 },
  ],
};

export function getSubcategories(categoryId, parentDocCount, parentCR, parentER, parentGR, parentDlp, parentIrm) {
  const subs = subcategoryMap[categoryId] || [];
  return subs.map((sub, idx) => {
    const docs = Math.round(parentDocCount * sub.docs);
    const cr = parentCR != null ? Math.max(5, Math.min(95, parentCR + Math.round((idx - 2) * 4 + (Math.random() - 0.5) * 8))) : 45;
    const er = parentER != null ? Math.max(5, Math.min(95, parentER + Math.round((idx - 2) * 3 + (Math.random() - 0.5) * 6))) : 30;
    const gr = parentGR != null ? Math.max(2, Math.min(95, parentGR + Math.round((idx - 2) * 5 + (Math.random() - 0.5) * 10))) : 25;
    const dlpVal = parentDlp != null ? Math.max(3, Math.min(95, parentDlp + Math.round((idx - 2) * 3 + (Math.random() - 0.5) * 8))) : 40;
    const dlpBlock = Math.round(dlpVal * 0.28);
    const dlpWarn = Math.round(dlpVal * 0.32);
    const dlpAudit = Math.round(dlpVal * 0.25);
    const dlpSim = dlpVal - dlpBlock - dlpWarn - dlpAudit;
    const irmVal = parentIrm != null ? Math.max(3, Math.min(95, parentIrm + Math.round((idx - 2) * 3 + (Math.random() - 0.5) * 8))) : 30;
    return {
      ...sub,
      categoryId,
      documentCount: docs,
      siteCount: Math.max(3, Math.round(docs / (1200 + idx * 300))),
      overexposed: Math.round(docs * (er / 100)),
      classificationRisk: cr,
      exposureRisk: er,
      governanceRisk: gr,
      dlpCoverage: dlpVal,
      dlpBreakdown: { block: dlpBlock, warn: dlpWarn, audit: dlpAudit, simulation: dlpSim },
      irmCoverage: irmVal,
      irmSignals: Math.round(irmVal * 0.3),
    };
  });
}

// ──────────────────────────────────────────
// FILES — sample files for subcategory drill-in
// ──────────────────────────────────────────
const fileTemplates = {
  'quarterly-earnings': [
    { name: 'Q4_2025_Revenue_Report.xlsx', size: '2.4 MB', type: 'xlsx' },
    { name: 'FY2026_Earnings_Presentation.pptx', size: '8.1 MB', type: 'pptx' },
    { name: 'Q1_2026_Preliminary_Results.xlsx', size: '1.8 MB', type: 'xlsx' },
    { name: 'Annual_Report_Draft_2025.docx', size: '4.5 MB', type: 'docx' },
    { name: 'Earnings_Call_Transcript_Q4.pdf', size: '340 KB', type: 'pdf' },
    { name: 'Revenue_by_Segment_Analysis.xlsx', size: '3.2 MB', type: 'xlsx' },
    { name: 'Board_Financial_Summary.pptx', size: '5.6 MB', type: 'pptx' },
    { name: 'Quarterly_KPI_Dashboard.pbix', size: '12.3 MB', type: 'pbix' },
    { name: 'Investor_Deck_Q4_FINAL.pptx', size: '9.4 MB', type: 'pptx' },
    { name: 'Consolidated_P&L_Statement.xlsx', size: '1.1 MB', type: 'xlsx' },
  ],
  'employee-records': [
    { name: 'Employee_Master_List_2026.xlsx', size: '4.8 MB', type: 'xlsx' },
    { name: 'SSN_Tax_Forms_Batch.pdf', size: '22.1 MB', type: 'pdf' },
    { name: 'New_Hire_Onboarding_Pack.docx', size: '2.3 MB', type: 'docx' },
    { name: 'Benefits_Enrollment_2026.xlsx', size: '3.1 MB', type: 'xlsx' },
    { name: 'Employee_Handbook_v4.2.pdf', size: '1.8 MB', type: 'pdf' },
    { name: 'Org_Chart_Engineering.vsdx', size: '890 KB', type: 'vsdx' },
    { name: 'Salary_Bands_Confidential.xlsx', size: '420 KB', type: 'xlsx' },
    { name: 'I9_Verification_Records.pdf', size: '15.6 MB', type: 'pdf' },
    { name: 'Emergency_Contact_List.xlsx', size: '180 KB', type: 'xlsx' },
    { name: 'Background_Check_Results.pdf', size: '5.2 MB', type: 'pdf' },
  ],
  'contracts': [
    { name: 'MSA_Acme_Corp_2025.pdf', size: '1.2 MB', type: 'pdf' },
    { name: 'NDA_Template_External.docx', size: '340 KB', type: 'docx' },
    { name: 'Vendor_Agreement_CloudCo.pdf', size: '890 KB', type: 'pdf' },
    { name: 'License_Agreement_v3.docx', size: '560 KB', type: 'docx' },
    { name: 'Service_Level_Agreement.pdf', size: '420 KB', type: 'pdf' },
    { name: 'Amendment_2_MSA_GlobalTech.pdf', size: '280 KB', type: 'pdf' },
    { name: 'Contractor_Terms_2026.docx', size: '390 KB', type: 'docx' },
    { name: 'Data_Processing_Addendum.pdf', size: '450 KB', type: 'pdf' },
    { name: 'Partnership_Agreement_Draft.docx', size: '1.1 MB', type: 'docx' },
    { name: 'Renewal_Terms_FY2026.xlsx', size: '210 KB', type: 'xlsx' },
  ],
};

const sitePool = [
  'Finance Portal', 'HR Central', 'Legal Vault', 'Engineering Hub',
  'Customer 360', 'Sales Operations', 'Executive Suite', 'Product Wiki',
  'R&D Lab', 'IT Operations', 'Global Compliance', 'Marketing Assets',
  'M&A Confidential', 'Budget Reviews', 'Recruiting Pipeline',
];

const userPool = [
  'Sarah Chen', 'James Wilson', 'Maria Garcia', 'David Kim', 'Emily Johnson',
  'Michael Brown', 'Lisa Wang', 'Robert Taylor', 'Jennifer Lee', 'William Davis',
  'Amanda Martinez', 'Christopher Anderson', 'Jessica Thomas', 'Daniel White',
];

const mipLabels = [null, 'Public', 'General', 'Confidential', 'Highly Confidential', 'Restricted'];
const classifiers = [
  [], ['Financial Data'], ['PII - SSN'], ['PII - Email'], ['Credit Card Numbers'],
  ['Financial Data', 'PII - SSN'], ['Source Code'], ['Legal Privilege'],
  ['Health Information'], ['Credentials & Secrets'], [],
];

const deptPool = ['Finance','HR','Legal','Engineering','Sales','Marketing','Product','IT','R&D','Executive'];
const rolePool = ['Viewer','Editor','Owner','Full Control','Contributor'];

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export function getFilesForSubcategory(subcategoryId) {
  const templates = fileTemplates[subcategoryId] || fileTemplates['quarterly-earnings'];
  const rand = seededRandom(subcategoryId.length * 997 + 42);

  return templates.map((tpl, i) => {
    const riskRand = rand();
    const viewers = 5 + Math.floor(rand() * 80);
    const editors = 2 + Math.floor(rand() * 20);
    const owners = 1 + Math.floor(rand() * 4);
    const mipLabel = mipLabels[Math.floor(rand() * mipLabels.length)];
    const cls = classifiers[Math.floor(rand() * classifiers.length)];
    const overexposed = riskRand > 0.55;
    const dlpProtected = rand() > 0.5;
    const daysAgo = Math.floor(rand() * 120);

    return {
      id: `${subcategoryId}-file-${i}`,
      name: tpl.name,
      size: tpl.size,
      type: tpl.type,
      site: sitePool[Math.floor(rand() * sitePool.length)],
      lastModified: new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10),
      modifiedBy: userPool[Math.floor(rand() * userPool.length)],
      permissions: { viewers, editors, owners, total: viewers + editors + owners },
      mipLabel,
      classifierMatches: cls,
      dlpProtected,
      overexposed,
    };
  });
}

// ──────────────────────────────────────────
// FILE GRAPH — lineage & access graph for a single file
// ──────────────────────────────────────────
export function generateFileGraph(file) {
  if (!file) return { nodes: [], links: [] };
  const nodes = [];
  const links = [];
  const rand = seededRandom(file.name.length * 31 + 7);

  // Central file node
  nodes.push({ id: 'file', label: file.name, type: 'file', size: 50, riskScore: file.riskScore, mipLabel: file.mipLabel });

  // Site node
  nodes.push({ id: 'site', label: file.site, type: 'site', size: 30 });
  links.push({ source: 'file', target: 'site', type: 'located-in', label: 'Located in' });

  // User access nodes
  const userCount = 4 + Math.floor(rand() * 5);
  for (let i = 0; i < userCount; i++) {
    const userName = userPool[Math.floor(rand() * userPool.length)];
    const dept = deptPool[Math.floor(rand() * deptPool.length)];
    const role = rolePool[Math.floor(rand() * rolePool.length)];
    const isOverPermissioned = (role === 'Full Control' || role === 'Owner') && rand() > 0.4;
    const uid = `user-${i}`;
    nodes.push({
      id: uid, label: userName, type: 'user', department: dept, role,
      isOverPermissioned, size: 20 + (isOverPermissioned ? 5 : 0),
    });
    links.push({
      source: 'file', target: uid, type: 'access',
      label: role, isOverPermissioned,
    });
  }

  // Activity nodes
  const activities = ['Downloaded', 'Edited', 'Shared externally', 'Copied to OneDrive', 'Accessed via Copilot'];
  const actCount = 2 + Math.floor(rand() * 3);
  for (let i = 0; i < actCount; i++) {
    const act = activities[Math.floor(rand() * activities.length)];
    const aid = `activity-${i}`;
    const who = userPool[Math.floor(rand() * userPool.length)];
    const daysAgo = Math.floor(rand() * 30);
    nodes.push({ id: aid, label: act, type: 'activity', who, daysAgo, size: 18 });
    links.push({ source: 'file', target: aid, type: 'activity', label: `${daysAgo}d ago by ${who}` });
  }

  return { nodes, links, file };
}

// ──────────────────────────────────────────
// TOPIC GRAPH — who accesses, where, activity
// ──────────────────────────────────────────
export function generateTopicGraph(categoryId, label) {
  const rand = seededRandom(categoryId.length * 53 + 13);
  const nodes = [];
  const links = [];

  nodes.push({ id: 'topic', label: label || categoryId, type: 'topic', size: 55 });

  // User groups
  const userGroups = [
    { dept: 'Finance', users: 15 + Math.floor(rand() * 40) },
    { dept: 'HR', users: 8 + Math.floor(rand() * 25) },
    { dept: 'Engineering', users: 20 + Math.floor(rand() * 60) },
    { dept: 'Legal', users: 5 + Math.floor(rand() * 15) },
    { dept: 'Sales', users: 10 + Math.floor(rand() * 30) },
    { dept: 'Executive', users: 3 + Math.floor(rand() * 8) },
  ].filter(() => rand() > 0.25);

  userGroups.forEach((ug, i) => {
    const isAnomaly = rand() > 0.8;
    const uid = `ug-${i}`;
    nodes.push({
      id: uid, label: `${ug.dept} Users`, type: 'user-group',
      department: ug.dept, userCount: ug.users, isAnomaly,
      size: 18 + ug.users / 4,
    });
    links.push({ source: 'topic', target: uid, type: 'accessed-by', strength: 0.3 + rand() * 0.7 });
  });

  // Sites
  const siteSample = sitePool.sort(() => rand() - 0.5).slice(0, 3 + Math.floor(rand() * 4));
  siteSample.forEach((site, i) => {
    const sid = `site-${i}`;
    const docCount = 500 + Math.floor(rand() * 5000);
    nodes.push({ id: sid, label: site, type: 'site', docCount, size: 15 + docCount / 400 });
    links.push({ source: 'topic', target: sid, type: 'located-in', strength: 0.2 + rand() * 0.6 });
  });

  // Activities
  const acts = ['Downloads', 'External Shares', 'Edits', 'Copies', 'AI/Copilot Queries'];
  acts.forEach((act, i) => {
    if (rand() < 0.15) return;
    const aid = `act-${i}`;
    const count = 100 + Math.floor(rand() * 5000);
    const trend = rand() > 0.6 ? 'up' : rand() > 0.3 ? 'stable' : 'down';
    nodes.push({ id: aid, label: act, type: 'activity', count, trend, size: 15 + count / 400 });
    links.push({ source: 'topic', target: aid, type: 'activity', strength: 0.2 + rand() * 0.5 });
  });

  return { nodes, links };
}

// ──────────────────────────────────────────
// USER ACCESS HEATMAP DATA
// ──────────────────────────────────────────
export const departments = deptPool;

export const accessMatrix = [
  [95,12,30, 8,15,20,25,18,10, 5],
  [15,98,25, 3,22, 8,20, 5, 4,10],
  [35,30,95, 5,40,12,45, 8,15, 8],
  [ 8, 5, 4,97,10, 6, 3,65,55,40],
  [20, 8,15, 4,92,45,10,25, 8, 5],
  [12, 6, 8, 3,35,96,15,30,12, 4],
  [18,10,12,45, 8,15, 5,55,48,30],
  [10,15, 8,35,12, 5, 8,10,15,95],
  [ 6, 3,10,42, 5, 8, 4,35,97,20],
  [40,25,55, 8,30,20,98,35,18,12],
];

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────
export function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

export const riskColor = (score) =>
  score >= 85 ? '#ef4444' : score >= 65 ? '#f97316' : score >= 40 ? '#eab308' : '#22c55e';

export const riskLabel = (score) =>
  score >= 85 ? 'Critical' : score >= 65 ? 'High' : score >= 40 ? 'Medium' : 'Low';

export const readinessColor = (pct) =>
  pct >= 60 ? '#ef4444' : pct >= 35 ? '#f97316' : pct >= 15 ? '#eab308' : '#22c55e';

// ──────────────────────────────────────────
// CATEGORY SITE BREAKDOWN — sites contributing to a category
// ──────────────────────────────────────────
const siteNames = [
  'Finance Portal', 'HR Central', 'Legal Vault', 'Engineering Hub', 'Customer 360',
  'Sales Operations', 'Executive Suite', 'Product Wiki', 'R&D Lab', 'IT Operations',
  'Global Compliance', 'Marketing Assets', 'M&A Confidential', 'Budget Reviews',
  'Recruiting Pipeline', 'Brand Central', 'Developer Docs', 'Training Hub',
  'Investor Relations', 'Partner Portal', 'Analytics Dashboard', 'Policy Library',
  'Security Center', 'Data Warehouse', 'Innovation Lab', 'Quality Assurance',
  'Supply Chain Ops', 'Customer Support', 'Field Operations', 'Internal Comms',
];

const orgGroups = ['Finance', 'HR', 'Legal', 'Engineering', 'Sales', 'Marketing', 'Product', 'IT', 'R&D', 'Executive', 'Operations', 'Customer Success'];

const sampleFileNames = {
  financial: ['Q4_Revenue_Summary.xlsx','Budget_Forecast_2026.xlsx','Audit_Report_Final.pdf','Tax_Filing_Corp.pdf','Expense_Report_Q3.xlsx','Cash_Flow_Model.xlsx','Board_Financial_Pack.pptx','Invoice_Batch_42.pdf'],
  hr: ['Employee_Roster_2026.xlsx','Benefits_Summary.pdf','Offer_Letter_Template.docx','Performance_Review_Q4.docx','Salary_Band_Analysis.xlsx','Onboarding_Checklist.docx','Termination_Policy.pdf','Leave_Tracker.xlsx'],
  legal: ['NDA_Template_v3.docx','Patent_Filing_US2026.pdf','Compliance_Checklist.xlsx','Litigation_Brief.pdf','Contract_Amendment.docx','Regulatory_Response.pdf','IP_Portfolio.xlsx','Privacy_Impact.pdf'],
  engineering: ['Architecture_RFC_42.md','API_Spec_v3.yaml','Deployment_Runbook.docx','Incident_Postmortem.pdf','Code_Review_Guide.md','Release_Notes_v8.md','Test_Results_Sprint.xlsx','Security_Scan.pdf'],
  customer: ['Customer_List_Enterprise.xlsx','Support_Escalation_Log.xlsx','NPS_Survey_Results.pdf','Account_Health_Q4.pptx','Contact_Export_CRM.csv','Churn_Analysis.xlsx','Onboarding_Guide.pdf','Feedback_Report.docx'],
  sales: ['Pipeline_Report_Q4.xlsx','Sales_Deck_2026.pptx','Win_Loss_Analysis.xlsx','Territory_Map.pptx','Commission_Structure.xlsx','Partner_Agreement.pdf','Campaign_ROI.xlsx','Lead_Scoring.xlsx'],
  executive: ['Board_Deck_Q4.pptx','Strategy_Plan_2026.pdf','M&A_Target_List.xlsx','Investor_Update.pptx','CEO_Memo_Jan.docx','KPI_Dashboard.xlsx','Risk_Register.xlsx','Annual_Report_Draft.pdf'],
  product: ['PRD_Feature_X.docx','Roadmap_H1_2026.pptx','User_Research_Q4.pdf','Competitive_Matrix.xlsx','Feature_Metrics.xlsx','UX_Wireframes.pdf','Sprint_Backlog.xlsx','Beta_Feedback.docx'],
  research: ['Research_Paper_v2.pdf','Experiment_Results_42.xlsx','Grant_Proposal.docx','Lab_Protocol.pdf','Patent_Disclosure.docx','Conference_Poster.pptx','Data_Set_Analysis.xlsx','Peer_Review.pdf'],
  it: ['Infra_Inventory.xlsx','Incident_Log_Q4.xlsx','Change_Request_42.docx','Vendor_Assessment.pdf','Backup_Schedule.xlsx','Network_Diagram.vsdx','License_Tracker.xlsx','DR_Plan_v3.pdf'],
};

export function getCategorySiteBreakdown(categoryId, totalDocs, siteCount) {
  const rand = seededRandom(categoryId.length * 1337 + 99);
  const count = Math.max(6, Math.min(siteCount || 15, 25));
  const shuffled = [...siteNames].sort(() => rand() - 0.5).slice(0, count);

  // distribute docs across sites with a realistic long-tail
  let weights = shuffled.map(() => Math.pow(rand(), 0.5));
  const wSum = weights.reduce((a, b) => a + b, 0);
  weights = weights.map(w => w / wSum);

  const templates = sampleFileNames[categoryId] || sampleFileNames.financial;
  const nonCatTemplates = Object.entries(sampleFileNames)
    .filter(([k]) => k !== categoryId)
    .flatMap(([, v]) => v);

  return shuffled.map((siteName, i) => {
    const catDocs = Math.round(totalDocs * weights[i]);
    const totalSiteDocs = Math.round(catDocs / (0.15 + rand() * 0.55));
    const pct = Math.round((catDocs / totalSiteDocs) * 100);

    // sample files in category
    const inCatCount = 3 + Math.floor(rand() * 4);
    const inCatFiles = [];
    for (let f = 0; f < inCatCount; f++) {
      const tpl = templates[Math.floor(rand() * templates.length)];
      const overexposed = rand() > 0.55;
      const accessUserCount = 2 + Math.floor(rand() * 18);
      const accessUsers = [];
      const usedNames = new Set();
      for (let u = 0; u < accessUserCount; u++) {
        let uname = userPool[Math.floor(rand() * userPool.length)];
        if (usedNames.has(uname)) uname = uname + ' Jr.';
        usedNames.add(uname);
        accessUsers.push({
          name: uname,
          group: orgGroups[Math.floor(rand() * orgGroups.length)],
          lastAccess: Math.floor(rand() * 30) + 1,
          actions: Math.floor(rand() * 12) + 1,
        });
      }
      accessUsers.sort((a, b) => a.lastAccess - b.lastAccess);
      inCatFiles.push({
        id: `${categoryId}-site-${i}-in-${f}`,
        name: tpl, type: tpl.split('.').pop(),
        lastModified: new Date(Date.now() - Math.floor(rand() * 90) * 86400000).toISOString().slice(0, 10),
        overexposed,
        accessUsers,
      });
    }

    // sample files NOT in category
    const outCatCount = 2 + Math.floor(rand() * 3);
    const outCatFiles = [];
    for (let f = 0; f < outCatCount; f++) {
      const tpl = nonCatTemplates[Math.floor(rand() * nonCatTemplates.length)];
      outCatFiles.push({
        id: `${categoryId}-site-${i}-out-${f}`,
        name: tpl, type: tpl.split('.').pop(),
        lastModified: new Date(Date.now() - Math.floor(rand() * 120) * 86400000).toISOString().slice(0, 10),
        overexposed: rand() > 0.7,
      });
    }

    // user access breakdown by org group (last 30 days)
    const activeGroupCount = 3 + Math.floor(rand() * 5);
    const groupAccess = orgGroups
      .sort(() => rand() - 0.5)
      .slice(0, activeGroupCount)
      .map(group => ({
        group,
        users: 2 + Math.floor(rand() * 40),
        reads: Math.floor(rand() * 500),
        writes: Math.floor(rand() * 80),
      }))
      .sort((a, b) => b.users - a.users);

    const totalUsers = groupAccess.reduce((s, g) => s + g.users, 0);

    const slug = siteName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const siteUrl = `https://contoso.sharepoint.com/sites/${slug}`;
    const adminPool = ['Alex Thompson', 'Priya Patel', 'Marcus Johnson', 'Sofia Rodriguez', 'Wei Chen', 'Fatima Al-Hassan', 'Ryan O\'Connor', 'Keiko Tanaka'];
    const siteAdmin = adminPool[Math.floor(rand() * adminPool.length)];
    const createdYear = 2018 + Math.floor(rand() * 7);
    const createdMonth = 1 + Math.floor(rand() * 12);
    const createdDay = 1 + Math.floor(rand() * 28);
    const createdDate = `${createdYear}-${String(createdMonth).padStart(2,'0')}-${String(createdDay).padStart(2,'0')}`;

    const siteClassificationRisk = Math.round(20 + rand() * 60);
    const siteExposureRisk = Math.round(10 + rand() * 50);
    const siteGovernanceRisk = Math.round(5 + rand() * 70);
    const siteDlpCoverage = Math.round(15 + rand() * 65);
    const siteDlpBlock = Math.round(siteDlpCoverage * 0.28);
    const siteDlpWarn = Math.round(siteDlpCoverage * 0.32);
    const siteDlpAudit = Math.round(siteDlpCoverage * 0.25);
    const siteDlpSim = siteDlpCoverage - siteDlpBlock - siteDlpWarn - siteDlpAudit;
    const siteIrmCoverage = Math.round(10 + rand() * 55);
    const siteIrmSignals = Math.floor(rand() * 8);

    return {
      id: `${categoryId}-site-${i}`,
      name: siteName,
      url: siteUrl,
      admin: siteAdmin,
      createdDate,
      catDocs,
      totalSiteDocs,
      pct,
      monthlyReads: Math.round(catDocs * (0.5 + rand() * 4)),
      monthlyWrites: Math.round(catDocs * (0.1 + rand() * 0.8)),
      inCatFiles,
      outCatFiles,
      groupAccess,
      totalUsers,
      classificationRisk: siteClassificationRisk,
      exposureRisk: siteExposureRisk,
      governanceRisk: siteGovernanceRisk,
      activityRisk: Math.round(5 + rand() * 25),
      userRisk: Math.round(8 + rand() * 30),
      aiAgentRisk: Math.round(1 + rand() * 10),
      dlpCoverage: siteDlpCoverage,
      dlpBreakdown: { block: siteDlpBlock, warn: siteDlpWarn, audit: siteDlpAudit, simulation: siteDlpSim },
      irmCoverage: siteIrmCoverage,
      irmSignals: siteIrmSignals,
    };
  }).sort((a, b) => b.catDocs - a.catDocs);
}

// ──────────────────────────────────────────
// SITE FILE EXPLORER — folder tree + files
// ──────────────────────────────────────────

const explorerFileNames = [
  'Q4_Revenue_Report.xlsx','Budget_Forecast_FY2026.xlsx','Audit_Findings_Final.pdf',
  'Tax_Filing_Federal.pdf','Expense_Report_Q3.xlsx','Cash_Flow_Projection.xlsx',
  'Board_Presentation.pptx','Invoice_Batch_Summary.pdf','Vendor_Contract_v3.docx',
  'Employee_Roster.xlsx','Benefits_Summary_2026.pdf','Offer_Letter_Template.docx',
  'Performance_Review_Template.docx','Salary_Band_Analysis.xlsx','Onboarding_Checklist.docx',
  'Termination_Policy.pdf','Leave_Tracker_2026.xlsx','NDA_Template_v3.docx',
  'Patent_Filing_US2026.pdf','Compliance_Checklist.xlsx','Litigation_Brief.pdf',
  'Architecture_RFC_42.md','API_Spec_v3.yaml','Deployment_Runbook.docx',
  'Incident_Postmortem.pdf','Code_Review_Guide.md','Release_Notes_v8.md',
  'Customer_List_Enterprise.xlsx','Support_Escalation_Log.xlsx','NPS_Survey_Results.pdf',
  'Pipeline_Report_Q4.xlsx','Sales_Deck_2026.pptx','Win_Loss_Analysis.xlsx',
  'Board_Deck_Q4.pptx','Strategy_Plan_2026.pdf','M_A_Target_List.xlsx',
  'PRD_Feature_X.docx','Roadmap_H1_2026.pptx','User_Research_Q4.pdf',
  'Research_Paper_Draft.pdf','Experiment_Results.xlsx','Grant_Proposal.docx',
  'Infra_Inventory.xlsx','Incident_Log_Q4.xlsx','Change_Request_42.docx',
  'Data_Migration_Plan.docx','Access_Review_2026.xlsx','Security_Audit_Report.pdf',
  'Meeting_Notes_Weekly.docx','Project_Status_Update.pptx','Risk_Register.xlsx',
  'Training_Manual_v2.pdf','SOP_Document_Control.docx','Org_Chart_2026.vsdx',
  'Commission_Structure.xlsx','Partner_Agreement.pdf','Campaign_ROI_Analysis.xlsx',
  'Competitive_Matrix.xlsx','Feature_Metrics_Dashboard.xlsx','UX_Wireframes.pdf',
  'Sprint_Backlog.xlsx','Beta_Feedback_Summary.docx','Conference_Poster.pptx',
  'Network_Diagram.vsdx','DR_Plan_v3.pdf','License_Tracker.xlsx',
  'Backup_Schedule.xlsx','Vendor_Assessment.pdf','Policy_Update_Memo.docx',
  'Annual_Review_Summary.pdf','Quarterly_OKR_Tracking.xlsx','Brand_Guidelines_v5.pdf',
  'Social_Media_Calendar.xlsx','Press_Release_Draft.docx','Investor_Update_Q4.pptx',
];

const subfolderNames = [
  'Finance','Legal','Reports','Drafts','HR','Compliance','Templates',
  'Marketing','Engineering','Product','Executive','Analytics','Archive',
  'Operations','Planning','Research','Design','QA','Training','Policies',
];

const subSubfolderNames = [
  'Q1','Q2','Q3','Q4','2024','2025','2026','Internal','External',
  'Review','Final','Pending','Approved','Historical','Current',
];

const exposureTypes = ['Shared with everyone','External sharing','Organization-wide','Specific users','Private'];
const mipLabelOptions = [null, null, null, 'Public', 'General', 'Confidential', 'Highly Confidential', 'Restricted'];
const classifierOptions = [
  [],[],[],[],['Credit Card'],['SSN'],['PII - Email'],['Financial Data'],
  ['Credit Card','SSN'],['Health Information'],['Source Code'],['Legal Privilege'],
  ['Credentials & Secrets'],['Financial Data','PII - Email'],[],
];

export function getFilesForFolder(folderId) {
  const rand = seededRandom(folderId.length * 7919 + 31);
  const fileCount = 15 + Math.floor(rand() * 11); // 15-25 files
  const files = [];
  const folderPath = '/' + folderId.replace(/-/g, '/');

  for (let i = 0; i < fileCount; i++) {
    const nameIdx = Math.floor(rand() * explorerFileNames.length);
    const baseName = explorerFileNames[nameIdx];
    const ext = baseName.split('.').pop();
    const name = i < explorerFileNames.length ? baseName : baseName.replace('.' + ext, `_${i}.${ext}`);
    const fullPath = folderPath + '/' + name;

    const permissionedUsers = 5 + Math.floor(rand() * 196);
    const accessedUsers30d = Math.floor(rand() * Math.min(permissionedUsers, Math.max(1, Math.floor(permissionedUsers * 0.4))));
    const exposureIdx = Math.floor(rand() * exposureTypes.length);
    const exposure = exposureTypes[exposureIdx];
    const mipLabel = mipLabelOptions[Math.floor(rand() * mipLabelOptions.length)];
    const classifications = classifierOptions[Math.floor(rand() * classifierOptions.length)];
    const owner = userPool[Math.floor(rand() * userPool.length)];

    const now = Date.now();
    const createdDaysAgo = 60 + Math.floor(rand() * 900);
    const lastAccessedDaysAgo = Math.floor(rand() * (rand() > 0.25 ? 300 : 500));
    const lastEditedDaysAgo = lastAccessedDaysAgo + Math.floor(rand() * 60);

    const createdDate = new Date(now - createdDaysAgo * 86400000).toISOString().slice(0, 10);
    const lastAccessed = new Date(now - lastAccessedDaysAgo * 86400000).toISOString().slice(0, 10);
    const lastEdited = new Date(now - lastEditedDaysAgo * 86400000).toISOString().slice(0, 10);

    const isUnlabeled = mipLabel === null;
    const isOverexposed = exposure === 'Shared with everyone' || exposure === 'External sharing' || exposure === 'Organization-wide' || permissionedUsers > accessedUsers30d * 3;
    const isROT = lastAccessedDaysAgo > 365;

    // Assign a category: 90% get a real category, 10% get 'Unknown'
    const catRoll = rand();
    const category = catRoll < 0.1 ? 'Unknown' : categories[Math.floor(rand() * categories.length)].name;

    // DLP policy: ~40% null, rest distributed across modes
    const dlpRoll = rand();
    const dlpPolicy = dlpRoll < 0.4 ? null : dlpRoll < 0.55 ? 'Block' : dlpRoll < 0.70 ? 'Warn' : dlpRoll < 0.85 ? 'Audit' : 'Simulation';
    const irmFlagged = rand() < 0.15;

    files.push({
      id: `${folderId}-file-${i}`,
      name,
      fullPath,
      type: ext,
      owner,
      permissionedUsers,
      accessedUsers30d,
      exposure,
      mipLabel,
      classifications,
      createdDate,
      lastAccessed,
      lastEdited,
      isUnlabeled,
      isOverexposed,
      isROT,
      category,
      dlpPolicy,
      irmFlagged,
    });
  }
  return files;
}

// Generate a random time yesterday for demo purposes
const _yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
_yesterday.setHours(2 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 60), 0, 0);
export const lastScannedDate = _yesterday;
export const lastScannedLabel = `${_yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${_yesterday.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;

export function getCategoryNarrative(categoryName, docCount, siteCount) {
  const narratives = {
    'Financial Operations': `Financial Operations saw 12,400 file interactions across 340 users this week. 23 files were shared externally — primarily to @contoso-partner.com and @deloitte.com. 8 documents were grounded in Copilot responses, including 3 with Confidential labels. 4 users from Sales accessed files they hadn't previously viewed.`,
    'Human Resources': `HR documents were accessed by 285 users across 8 departments this month. 12 employee record files were downloaded by users outside HR — flagged for review. 6 compensation documents were grounded in Copilot responses. External sharing is minimal, with only 2 files sent to benefits@provider.com.`,
    'Legal & Compliance': `Legal & Compliance content had 8,200 interactions this month. 15 contract files were shared with external legal counsel at @bakermckenzie.com and @dlapiper.com. 4 litigation documents were accessed by users in Engineering — unusual cross-department access. No files were copied to USB or external storage.`,
    'Engineering & Development': `Engineering documents show high collaboration activity — 18,500 interactions across 420 users. 45 source code files were accessed via Copilot grounding. 12 architecture docs were downloaded to local devices. 3 API documentation files were shared externally to @partner-dev.com. USB activity: 2 files copied by a contractor account.`,
    'Customer Information': `Customer data had 6,800 access events this month. 8 customer contact lists were downloaded — 3 by users in Marketing (authorized) and 5 by users in IT (flagged). 14 files with PII classifications were grounded in Copilot. External sharing is blocked by DLP for this category. 2 support case files were printed.`,
    'Sales & Marketing': `Sales & Marketing saw 22,100 interactions — the highest activity category. 34 sales decks were shared externally to prospect domains. 12 pipeline reports were grounded in Copilot. Campaign materials were downloaded 156 times. 8 brand asset files were uploaded to a third-party design tool at @figma.com.`,
    'Executive Strategy': `Executive content is tightly controlled — 3,400 interactions across only 45 users. 2 board meeting materials were accessed by users outside the Executive team, triggering alerts. 1 M&A document was grounded in Copilot by a user in Legal. No external sharing or USB activity detected.`,
    'Product Management': `Product documents had 9,600 interactions this month. 18 roadmap files were accessed cross-department — primarily by Engineering and Sales. 6 competitive analysis documents were grounded in Copilot. 4 UX mockup files were shared externally to @design-agency.com. No unusual download patterns.`,
    'Research & Innovation': `R&D content had 5,200 interactions. 8 experiment result files were downloaded to local devices by 3 researchers. 2 patent disclosure documents were emailed externally to @patent-counsel.com. 12 research papers were grounded in Copilot. 1 grant proposal was printed — flagged as it contains budget details.`,
    'IT Operations': `IT Operations documents saw 7,800 interactions across 180 users. 22 infrastructure inventory files were accessed — normal operational activity. 4 incident response plans were downloaded by users outside IT. 3 vendor assessment documents were shared externally. Network diagrams were grounded in Copilot 6 times.`,
  };
  return narratives[categoryName] || `This category contains ${formatNumber(docCount)} documents across ${siteCount} sites. Activity patterns are being analyzed — detailed insights will be available after the next scan.`;
}

export function getSubcategoryNarrative(subName, docCount) {
  const rand = seededRandom(subName.length * 31 + 7);
  const users = 20 + Math.floor(rand() * 200);
  const change = Math.floor(rand() * 60) - 15;
  const downloads = 5 + Math.floor(rand() * 40);
  const extShares = Math.floor(rand() * 8);
  const copilotGrounds = Math.floor(rand() * 12);
  const domains = ['@contoso-partner.com', '@deloitte.com', '@bakermckenzie.com', '@pwc.com', '@accenture.com', '@kpmg.com'];
  const domain = domains[Math.floor(rand() * domains.length)];
  const changeText = change >= 0 ? `a ${change}% increase` : `a ${Math.abs(change)}% decrease`;
  return `${subName} documents were accessed by ${users} users in the last 30 days, ${changeText} from the prior period. ${downloads} files were downloaded to local devices. ${extShares > 0 ? `${extShares} files were shared externally — including to ${domain}.` : 'No external sharing detected.'} ${copilotGrounds > 0 ? `${copilotGrounds} documents were grounded in Copilot responses.` : ''}`;
}

export function getSiteNarrative(siteName, totalDocs, totalUsers) {
  const rand = seededRandom(siteName.length * 47 + 13);
  const downloads7d = 20 + Math.floor(rand() * 200);
  const avg = Math.round(downloads7d * (0.6 + rand() * 0.8));
  const pctAbove = Math.round(((downloads7d / Math.max(avg, 1)) - 1) * 100);
  const usbFiles = Math.floor(rand() * 6);
  const usbUsers = Math.max(1, Math.floor(rand() * 3));
  const dept = ['Engineering', 'Sales', 'Marketing', 'Finance', 'IT', 'Legal'][Math.floor(rand() * 6)];
  const copilotFlag = rand() > 0.5;
  return `${siteName} has ${pctAbove > 0 ? 'elevated' : 'normal'} download activity — ${downloads7d} files downloaded in the last 7 days${pctAbove > 0 ? `, ${pctAbove}% above the 30-day average` : ''}. ${usbFiles > 0 ? `${usbFiles} files were copied to USB by ${usbUsers} user(s) in the ${dept} department. ` : ''}${copilotFlag ? 'Several documents were grounded in Copilot responses — review for sensitive content.' : 'No unusual Copilot grounding detected.'}`;
}

export function getSiteFileExplorer(siteId) {
  const rand = seededRandom((siteId || 'default').length * 4217 + 73);
  const rootFolderNames = ['Documents', 'Shared Documents', 'Site Assets', 'Project Files', 'Archive'];

  function buildFolder(name, parentPath, depth) {
    const path = parentPath + '/' + name;
    const folderId = (siteId + path).replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');

    let subfolders = [];
    if (depth < 2) {
      const subCount = depth === 0 ? (2 + Math.floor(rand() * 3)) : Math.floor(rand() * 3);
      const usedNames = new Set();
      for (let s = 0; s < subCount; s++) {
        let subName = subfolderNames[Math.floor(rand() * subfolderNames.length)];
        if (usedNames.has(subName)) subName = subSubfolderNames[Math.floor(rand() * subSubfolderNames.length)];
        if (usedNames.has(subName)) continue;
        usedNames.add(subName);
        subfolders.push(buildFolder(subName, path, depth + 1));
      }
    }

    const files = getFilesForFolder(folderId);
    const fileCount = files.length;
    const unlabeledCount = files.filter(f => f.isUnlabeled).length;
    const overexposedCount = files.filter(f => f.isOverexposed).length;
    const rotCount = files.filter(f => f.isROT).length;

    return {
      id: folderId,
      name,
      path,
      fileCount,
      classificationRisk: fileCount > 0 ? Math.round((unlabeledCount / fileCount) * 100) : 0,
      exposureRisk: fileCount > 0 ? Math.round((overexposedCount / fileCount) * 100) : 0,
      governanceRisk: fileCount > 0 ? Math.round((rotCount / fileCount) * 100) : 0,
      subfolders,
    };
  }

  const folders = rootFolderNames.map(name => buildFolder(name, '', 0));
  return { folders };
}

export function getFileNarrative(fileName, fileType, owner) {
  const rand = seededRandom(fileName.length * 53 + 17);
  const actions = [];
  
  const users = ['Sarah Chen', 'James Wilson', 'Maria Garcia', 'David Kim', 'Emily Johnson', 'Michael Brown', 'Lisa Wang', 'Robert Taylor'];
  const departments = ['Finance', 'HR', 'Legal', 'Engineering', 'Sales', 'Marketing', 'Product', 'IT'];
  
  const eventCount = 3 + Math.floor(rand() * 4);
  for (let i = 0; i < eventCount; i++) {
    const user = users[Math.floor(rand() * users.length)];
    const dept = departments[Math.floor(rand() * departments.length)];
    const dAgo = 1 + Math.floor(rand() * 30);
    const eventTypes = [
      `${user} (${dept}) viewed this file ${dAgo} day(s) ago`,
      `${user} (${dept}) downloaded this file ${dAgo} day(s) ago`,
      `${user} (${dept}) edited this file ${dAgo} day(s) ago`,
      `${user} (${dept}) shared this file externally ${dAgo} day(s) ago`,
      `This file was grounded in a Copilot response ${dAgo} day(s) ago`,
      `${user} (${dept}) copied this file to OneDrive ${dAgo} day(s) ago`,
      `${user} (${dept}) printed this file ${dAgo} day(s) ago`,
      `This file was accessed via mobile device by ${user} ${dAgo} day(s) ago`,
    ];
    actions.push(eventTypes[Math.floor(rand() * eventTypes.length)]);
  }
  
  const viewCount = 5 + Math.floor(rand() * 40);
  const editCount = Math.floor(rand() * 8);
  const downloadCount = Math.floor(rand() * 6);
  
  const summary = `${fileName} has had ${viewCount} views, ${editCount} edits, and ${downloadCount} downloads in the last 30 days. Owner: ${owner}. Recent activity:`;
  
  return { summary, actions };
}
