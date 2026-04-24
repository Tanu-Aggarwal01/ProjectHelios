import React, { useState, useRef, useMemo, useCallback } from 'react';
import { formatNumber, readinessColor } from '../data/mockData';

/* ──────────────────────── helpers ──────────────────────── */

const fileIcon = (name) => {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'xlsx' || ext === 'csv') return '📗';
  if (ext === 'pptx') return '📙';
  if (ext === 'docx' || ext === 'md') return '📘';
  if (ext === 'pdf') return '📕';
  return '📋';
};

const sensitivityStyle = (s) => {
  if (s === 'Highly Sensitive') return { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' };
  if (s === 'Sensitive') return { background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' };
  if (s === 'Internal') return { background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' };
  return { background: 'rgba(255,255,255,0.04)', color: '#6b6b80', border: '1px solid rgba(255,255,255,0.08)' };
};

const labelStyle = (l) => {
  if (l === 'Confidential') return { background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' };
  if (l === 'General') return { background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' };
  return { background: 'transparent', color: '#6b6b80', border: '1px dashed rgba(255,255,255,0.15)' };
};

const sharingStyle = (s) => {
  if (s === 'Anyone') return { background: 'rgba(239,68,68,0.15)', color: '#f87171' };
  if (s === 'Org-wide') return { background: 'rgba(249,115,22,0.15)', color: '#fb923c' };
  return { background: 'rgba(34,197,94,0.15)', color: '#4ade80' };
};

const flagColor = { Departing: '#ef4444', 'IRM-flagged': '#f97316', Admin: '#6366f1' };

/* ──────────────────────── mock data ──────────────────────── */

const MOCK_FILES = [
  { name: 'Q4-Revenue-Forecast.xlsx', sensitivity: 'Highly Sensitive', label: 'Confidential', sharing: 'Team only', modified: '2025-01-14', folder: 'Finance', filter: 'sensitive' },
  { name: 'Employee-SSN-List.csv', sensitivity: 'Highly Sensitive', label: 'None', sharing: 'Anyone', modified: '2025-01-12', folder: 'Finance', filter: 'unlabeled' },
  { name: 'Board-Presentation-Draft.pptx', sensitivity: 'Sensitive', label: 'None', sharing: 'Org-wide', modified: '2025-01-11', folder: 'Reports', filter: 'overexposed' },
  { name: 'Patent-Filing-2025.docx', sensitivity: 'Highly Sensitive', label: 'Confidential', sharing: 'Team only', modified: '2025-01-10', folder: 'Legal', filter: 'sensitive' },
  { name: 'Marketing-Budget-FY25.xlsx', sensitivity: 'Sensitive', label: 'None', sharing: 'Anyone', modified: '2025-01-09', folder: 'Finance', filter: 'overexposed' },
  { name: 'Old-Policy-v2-DRAFT.docx', sensitivity: 'Internal', label: 'None', sharing: 'Team only', modified: '2023-03-15', folder: 'Archive', filter: 'rot' },
  { name: 'Customer-PII-Export.csv', sensitivity: 'Highly Sensitive', label: 'Confidential', sharing: 'Anyone', modified: '2025-01-08', folder: 'Reports', filter: 'overexposed' },
  { name: 'Team-Offsite-Photos.pdf', sensitivity: 'Internal', label: 'None', sharing: 'Org-wide', modified: '2024-06-20', folder: 'Shared', filter: 'rot' },
  { name: 'Merger-Term-Sheet.pdf', sensitivity: 'Highly Sensitive', label: 'None', sharing: 'Org-wide', modified: '2025-01-07', folder: 'Legal', filter: 'unlabeled' },
  { name: 'API-Integration-Spec.docx', sensitivity: 'Internal', label: 'General', sharing: 'Team only', modified: '2025-01-06', folder: 'Drafts', filter: 'all' },
  { name: 'Vendor-Contract-2024.pdf', sensitivity: 'Sensitive', label: 'Confidential', sharing: 'Team only', modified: '2024-12-20', folder: 'Legal', filter: 'sensitive' },
  { name: 'Onboarding-Checklist.docx', sensitivity: 'Internal', label: 'General', sharing: 'Team only', modified: '2024-11-01', folder: 'Shared', filter: 'all' },
  { name: 'Deprecated-Schema-v1.xlsx', sensitivity: 'Internal', label: 'None', sharing: 'Team only', modified: '2022-08-10', folder: 'Archive', filter: 'rot' },
  { name: 'Exec-Comp-Analysis.xlsx', sensitivity: 'Highly Sensitive', label: 'None', sharing: 'Org-wide', modified: '2025-01-05', folder: 'Finance', filter: 'unlabeled' },
  { name: 'Release-Notes-v3.2.docx', sensitivity: 'Internal', label: 'General', sharing: 'Team only', modified: '2025-01-13', folder: 'Drafts', filter: 'all' },
];

const FOLDERS = [
  { name: 'Finance', count: 4, risk: 'high' },
  { name: 'Legal', count: 3, risk: 'high' },
  { name: 'Reports', count: 2, risk: 'medium' },
  { name: 'Drafts', count: 2, risk: 'low' },
  { name: 'Shared', count: 2, risk: 'low' },
  { name: 'Archive', count: 2, risk: 'medium' },
];

const MOCK_USERS = [
  { name: 'James Wilson', dept: 'Engineering', badge: 'Departing', lastAccess: '2025-01-14' },
  { name: 'Maria Garcia', dept: 'Finance', badge: 'IRM-flagged', lastAccess: '2025-01-13' },
  { name: 'David Okafor', dept: 'Legal', badge: 'Departing', lastAccess: '2025-01-12' },
  { name: 'Sarah Chen', dept: 'IT', badge: 'Admin', lastAccess: '2025-01-14' },
];

const riskDotColor = { high: '#ef4444', medium: '#f97316', low: '#22c55e' };

/* ──────────────────────── component ──────────────────────── */

export default function SiteAnalysisView({ site, category, onBack }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const filesRef = useRef(null);

  const s = site || {};
  const siteName = s.name || 'Unknown Site';
  const siteUrl = s.url || 'https://contoso.sharepoint.com/sites/unknown';
  const siteAdmin = s.admin || 'Unknown';
  const createdDate = s.createdDate || '2024-01-15';
  const docCount = s.totalSiteDocs || s.catDocs || 0;
  const totalUsers = s.totalUsers || 0;

  const classRisk = s.classificationRisk ?? 55;
  const expRisk = s.exposureRisk ?? 62;
  const govRisk = s.governanceRisk ?? 48;
  const actRisk = s.activityRisk ?? 38;
  const usrRisk = s.userRisk ?? 30;
  const dlpCov = s.dlpCoverage ?? 34;
  const irmCov = s.irmCoverage ?? 22;
  const groupAccess = s.groupAccess || [];

  const scrollToFiles = useCallback((filter) => {
    setActiveFilter(filter);
    setSelectedFolder(null);
    setTimeout(() => filesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, []);

  /* Build risk drivers sorted by score, pick top 3 */
  const allRisks = useMemo(() => {
    const list = [
      { key: 'config', icon: '⚙️', name: 'Configuration', score: govRisk,
        finding: `This site is <b>orphaned</b> with no active owner. DLP coverage is only <b>${dlpCov}%</b>, leaving ${100 - dlpCov}% of content unprotected by data loss prevention policies.`,
        actions: ['Assign Owner'] },
      { key: 'class', icon: '📝', name: 'Classification', score: classRisk,
        finding: `<b>${Math.round(classRisk * 1.7)} sensitive files</b> are missing sensitivity labels. Auto-labeling could resolve an estimated 78% of these classification gaps.`,
        actions: ['Apply Labels', 'Create Classifier'] },
      { key: 'exposure', icon: '🌐', name: 'Exposure', score: expRisk,
        finding: `<b>${expRisk}%</b> of files are accessible via org-wide or anonymous links. ${Math.round(expRisk * 0.6)} confidential documents are shared beyond their intended audience.`,
        actions: ['Restrict Access'] },
      { key: 'activity', icon: '📈', name: 'Activity', score: actRisk,
        finding: `<b>Suspicious download patterns</b> detected from ${Math.round(actRisk * 0.12)} users in the past 30 days. Bulk downloads of sensitive content flagged for review.`,
        actions: ['Review Activity'] },
      { key: 'user', icon: '👤', name: 'User Risk', score: usrRisk,
        finding: `<b>2 departing employees</b> have active access to sensitive documents. Guest accounts have not been reviewed in over 90 days.`,
        actions: ['Review Access'] },
    ];
    list.sort((a, b) => b.score - a.score);
    return list.slice(0, 3);
  }, [govRisk, classRisk, expRisk, actRisk, usrRisk, dlpCov]);

  /* Narrative referencing actual risk numbers */
  const catName = category?.name || 'this category';
  const topRisk = allRisks[0];
  const narrative = `This ${catName} site has significant data security posture gaps requiring attention. Classification risk is elevated at <b>${classRisk}%</b> — approximately ${Math.round(classRisk * 1.7)} documents lack sensitivity labels, including files containing PII and financial data. Exposure risk stands at <b>${expRisk}%</b> due to ${Math.round(expRisk * 0.6)} sensitive files shared via org-wide or anonymous links. ${topRisk.name} risk is the primary concern at <b>${topRisk.score}%</b>, and should be prioritized for remediation.`;

  /* Filtered files */
  const filteredFiles = useMemo(() => {
    let files = MOCK_FILES;
    if (activeFilter !== 'all') {
      if (activeFilter === 'sensitive') files = files.filter(f => f.sensitivity === 'Highly Sensitive' || f.sensitivity === 'Sensitive');
      else files = files.filter(f => f.filter === activeFilter);
    }
    if (selectedFolder) files = files.filter(f => f.folder === selectedFolder);
    return files;
  }, [activeFilter, selectedFolder]);

  /* Unlabeled / overexposed / ROT counts */
  const unlabeledCount = MOCK_FILES.filter(f => f.filter === 'unlabeled').length;
  const overexposedCount = MOCK_FILES.filter(f => f.filter === 'overexposed').length;
  const rotCount = MOCK_FILES.filter(f => f.filter === 'rot').length;

  const filterPills = [
    { key: 'all', label: 'All' },
    { key: 'unlabeled', label: 'Unlabeled' },
    { key: 'overexposed', label: 'Overexposed' },
    { key: 'rot', label: 'ROT' },
    { key: 'sensitive', label: 'Sensitive' },
  ];

  /* Group access cards from props */
  const groups = groupAccess.length > 0 ? groupAccess : [
    { name: 'Everyone except external', users: 12400, reads: 3200, writes: 180 },
    { name: 'Finance Team', users: 24, reads: 890, writes: 340 },
    { name: 'Legal Reviewers', users: 8, reads: 420, writes: 65 },
    { name: 'External Auditors', users: 3, reads: 150, writes: 0 },
  ];

  const groupTint = (users) => {
    const u = users || 0;
    if (u >= 1000) return 'rgba(239,68,68,0.08)';
    if (u >= 100) return 'rgba(249,115,22,0.06)';
    return 'rgba(34,197,94,0.06)';
  };

  const groupBorder = (users) => {
    const u = users || 0;
    if (u >= 1000) return 'rgba(239,68,68,0.2)';
    if (u >= 100) return 'rgba(249,115,22,0.15)';
    return 'rgba(34,197,94,0.15)';
  };

  return (
    <div style={{ height: '100%', overflow: 'auto', background: '#1a1a2e' }}>
      <style>{`
        .sav-header {
          position: sticky; top: 0; z-index: 20;
          background: rgba(26,26,46,0.95); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 16px 32px;
        }
        .sav-header-top {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
        }
        .sav-back {
          background: none; border: none; color: #a0a0b8; font-size: 13px;
          cursor: pointer; padding: 4px 0; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;
          transition: color 0.15s;
        }
        .sav-back:hover { color: #e0e0f0; }
        .sav-site-name { color: #e0e0f0; font-size: 20px; font-weight: 700; margin: 0; line-height: 1.3; }
        .sav-site-url { color: #6b6b80; font-size: 12px; font-family: 'Cascadia Code', 'Consolas', monospace; margin-top: 2px; }
        .sav-meta-row {
          display: flex; align-items: center; gap: 16px; margin-top: 10px; flex-wrap: wrap;
        }
        .sav-meta-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px; padding: 3px 10px; font-size: 12px; color: #a0a0b8;
        }
        .sav-ghost-btn {
          background: none; border: 1px solid rgba(255,255,255,0.12); border-radius: 6px;
          color: #a0a0b8; font-size: 12px; padding: 5px 14px; cursor: pointer;
          transition: all 0.15s; display: inline-flex; align-items: center; gap: 5px;
        }
        .sav-ghost-btn:hover { border-color: rgba(255,255,255,0.25); color: #e0e0f0; }
        .sav-section {
          padding: 28px 32px;
        }
        .sav-section-heading {
          font-size: 16px; font-weight: 600; color: #e0e0f0; margin: 0 0 18px 0;
          padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 8px;
        }
        .sav-hero {
          display: flex; gap: 24px; padding: 28px 32px;
        }
        .sav-ai-col {
          width: 300px; min-width: 300px; display: flex; flex-direction: column; gap: 12px;
        }
        .sav-posture-col { flex: 1; min-width: 0; }
        .sav-metric-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 14px 16px; cursor: pointer;
          transition: all 0.15s;
        }
        .sav-metric-card:hover {
          background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12);
          transform: translateY(-1px);
        }
        .sav-metric-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .sav-metric-label { font-size: 13px; color: #e0e0f0; font-weight: 500; display: flex; align-items: center; gap: 6px; }
        .sav-metric-val { font-size: 18px; font-weight: 700; }
        .sav-metric-bar { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.06); overflow: hidden; }
        .sav-metric-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
        .sav-metric-link {
          font-size: 11px; color: #7c7c99; margin-top: 6px; display: block;
          transition: color 0.15s;
        }
        .sav-metric-card:hover .sav-metric-link { color: #a78bfa; }
        .sav-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 20px 22px;
        }
        .sav-narrative {
          font-size: 14px; line-height: 1.7; color: #a0a0b8; margin: 0 0 20px 0;
        }
        .sav-narrative b { color: #e0e0f0; font-weight: 600; }
        .sav-risk-drivers { display: flex; gap: 14px; }
        .sav-risk-driver {
          flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; overflow: hidden; display: flex; transition: all 0.15s;
        }
        .sav-risk-driver:hover { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.04); }
        .sav-risk-accent { width: 4px; min-height: 100%; flex-shrink: 0; }
        .sav-risk-body { padding: 14px 16px; flex: 1; }
        .sav-risk-title { font-size: 13px; font-weight: 600; color: #e0e0f0; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .sav-risk-text { font-size: 12px; line-height: 1.6; color: #8888a0; margin: 0 0 12px 0; }
        .sav-risk-text b { color: #c8c8e0; font-weight: 600; }
        .sav-risk-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .sav-action-btn {
          background: rgba(167,139,250,0.12); border: 1px solid rgba(167,139,250,0.25);
          color: #a78bfa; border-radius: 5px; font-size: 11px; padding: 3px 10px;
          cursor: pointer; transition: all 0.15s;
        }
        .sav-action-btn:hover { background: rgba(167,139,250,0.22); }
        .sav-risk-detail-link {
          font-size: 11px; color: #6b6b80; margin-top: 8px; display: block;
          cursor: pointer; transition: color 0.15s;
        }
        .sav-risk-detail-link:hover { color: #a78bfa; }

        /* Files section */
        .sav-files-layout { display: flex; gap: 0; }
        .sav-folder-sidebar {
          width: 220px; min-width: 220px; border-right: 1px solid rgba(255,255,255,0.06);
          padding: 12px 0;
        }
        .sav-folder-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 16px; cursor: pointer; font-size: 13px; color: #a0a0b8;
          transition: all 0.15s; border-left: 3px solid transparent;
        }
        .sav-folder-item:hover { background: rgba(255,255,255,0.04); color: #e0e0f0; }
        .sav-folder-item.active {
          background: rgba(167,139,250,0.08); color: #e0e0f0;
          border-left-color: #a78bfa;
        }
        .sav-folder-meta { display: flex; align-items: center; gap: 8px; }
        .sav-folder-dot { width: 7px; height: 7px; border-radius: 50%; }
        .sav-file-table-wrap { flex: 1; min-width: 0; overflow-x: auto; }
        .sav-pills { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
        .sav-pill {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 4px 14px; font-size: 12px; color: #a0a0b8;
          cursor: pointer; transition: all 0.15s;
        }
        .sav-pill:hover { border-color: rgba(255,255,255,0.18); color: #e0e0f0; }
        .sav-pill.active {
          background: rgba(167,139,250,0.15); border-color: rgba(167,139,250,0.35);
          color: #a78bfa;
        }
        .sav-table {
          width: 100%; border-collapse: collapse; font-size: 13px;
        }
        .sav-table th {
          text-align: left; padding: 10px 14px; color: #6b6b80; font-weight: 500;
          font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255,255,255,0.06); white-space: nowrap;
        }
        .sav-table td {
          padding: 10px 14px; color: #a0a0b8; border-bottom: 1px solid rgba(255,255,255,0.03);
          white-space: nowrap;
        }
        .sav-table tr:hover td { background: rgba(255,255,255,0.02); }
        .sav-table tr { cursor: pointer; transition: background 0.1s; }
        .sav-badge {
          display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px;
          font-weight: 500;
        }
        .sav-row-actions {
          opacity: 0; transition: opacity 0.15s; display: flex; gap: 4px;
        }
        .sav-table tr:hover .sav-row-actions { opacity: 1; }
        .sav-row-action {
          background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.2);
          color: #a78bfa; border-radius: 4px; font-size: 10px; padding: 2px 8px;
          cursor: pointer; white-space: nowrap; transition: all 0.15s;
        }
        .sav-row-action:hover { background: rgba(167,139,250,0.2); }

        /* Access section */
        .sav-group-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; margin-bottom: 28px; }
        .sav-group-card {
          border-radius: 10px; padding: 16px; transition: all 0.15s;
        }
        .sav-group-card:hover { transform: translateY(-1px); }
        .sav-group-name { font-size: 14px; font-weight: 600; color: #e0e0f0; margin-bottom: 10px; }
        .sav-group-stats { display: flex; gap: 16px; }
        .sav-group-stat { font-size: 12px; color: #8888a0; }
        .sav-group-stat span { color: #e0e0f0; font-weight: 600; }
        .sav-user-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.1s;
        }
        .sav-user-row:hover { background: rgba(255,255,255,0.02); }
        .sav-user-left { display: flex; align-items: center; gap: 12px; }
        .sav-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(167,139,250,0.15); display: flex; align-items: center; justify-content: center;
          font-size: 13px; color: #a78bfa; font-weight: 600;
        }
        .sav-user-name { font-size: 13px; color: #e0e0f0; font-weight: 500; }
        .sav-user-dept { font-size: 11px; color: #6b6b80; }
        .sav-user-badge {
          display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;
        }
        .sav-review-btn {
          background: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 5px;
          color: #a0a0b8; font-size: 11px; padding: 4px 12px; cursor: pointer;
          transition: all 0.15s;
        }
        .sav-review-btn:hover { border-color: #a78bfa; color: #a78bfa; }
        .sav-timestamp { font-size: 11px; color: #6b6b80; font-weight: 400; margin-left: 8px; }
      `}</style>

      {/* ── Section 1: Header ── */}
      <div className="sav-header">
        <div className="sav-header-top">
          <div style={{ flex: 1 }}>
            <button className="sav-back" onClick={onBack}>
              ← Back to {category?.name || 'Category'}
            </button>
            <h1 className="sav-site-name">{siteName}</h1>
            <div className="sav-site-url">{siteUrl}</div>
            <div className="sav-meta-row">
              <span className="sav-meta-badge">👤 {siteAdmin}</span>
              <span className="sav-meta-badge">📅 Created {createdDate}</span>
              <span className="sav-meta-badge">📄 {formatNumber(docCount)} documents</span>
              <span className="sav-meta-badge">👥 {formatNumber(totalUsers)} users</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', paddingTop: 24 }}>
            <button className="sav-ghost-btn">🖨️ Print</button>
            <button className="sav-ghost-btn">⬇️ Download</button>
          </div>
        </div>
      </div>

      {/* ── Section 2: AI Readiness + Posture (hero) ── */}
      <div className="sav-hero">
        {/* Left: AI Readiness */}
        <div className="sav-ai-col">
          <div style={{ fontSize: 15, fontWeight: 600, color: '#e0e0f0', marginBottom: 4 }}>AI Readiness</div>

          {/* Unlabeled */}
          <div className="sav-metric-card" onClick={() => scrollToFiles('unlabeled')}>
            <div className="sav-metric-top">
              <span className="sav-metric-label">🏷️ Unlabeled</span>
              <span className="sav-metric-val" style={{ color: readinessColor(classRisk) }}>{classRisk}%</span>
            </div>
            <div className="sav-metric-bar">
              <div className="sav-metric-bar-fill" style={{ width: `${classRisk}%`, background: readinessColor(classRisk) }} />
            </div>
            <span style={{ fontSize: 11, color: '#6b6b80', marginTop: 4, display: 'block' }}>~{unlabeledCount} files missing labels</span>
            <span className="sav-metric-link">View files →</span>
          </div>

          {/* Overexposed */}
          <div className="sav-metric-card" onClick={() => scrollToFiles('overexposed')}>
            <div className="sav-metric-top">
              <span className="sav-metric-label">🔓 Overexposed</span>
              <span className="sav-metric-val" style={{ color: readinessColor(expRisk) }}>{expRisk}%</span>
            </div>
            <div className="sav-metric-bar">
              <div className="sav-metric-bar-fill" style={{ width: `${expRisk}%`, background: readinessColor(expRisk) }} />
            </div>
            <span style={{ fontSize: 11, color: '#6b6b80', marginTop: 4, display: 'block' }}>~{overexposedCount} files overshared</span>
            <span className="sav-metric-link">View files →</span>
          </div>

          {/* ROT */}
          <div className="sav-metric-card" onClick={() => scrollToFiles('rot')}>
            <div className="sav-metric-top">
              <span className="sav-metric-label">🗑️ ROT</span>
              <span className="sav-metric-val" style={{ color: readinessColor(govRisk) }}>{govRisk}%</span>
            </div>
            <div className="sav-metric-bar">
              <div className="sav-metric-bar-fill" style={{ width: `${govRisk}%`, background: readinessColor(govRisk) }} />
            </div>
            <span style={{ fontSize: 11, color: '#6b6b80', marginTop: 4, display: 'block' }}>~{rotCount} stale/redundant files</span>
            <span className="sav-metric-link">View files →</span>
          </div>
        </div>

        {/* Right: Posture Summary */}
        <div className="sav-posture-col">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#e0e0f0' }}>Posture Summary</span>
            <span className="sav-timestamp">Last scanned Jan 14, 2025 at 09:42 AM</span>
          </div>

          <div className="sav-card" style={{ marginBottom: 20 }}>
            <p className="sav-narrative" dangerouslySetInnerHTML={{ __html: narrative }} />
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: '#a0a0b8', marginBottom: 12 }}>Primary Risk Drivers</div>
          <div className="sav-risk-drivers">
            {allRisks.map(r => (
              <div className="sav-risk-driver" key={r.key}>
                <div className="sav-risk-accent" style={{ background: readinessColor(r.score) }} />
                <div className="sav-risk-body">
                  <div className="sav-risk-title">{r.icon} {r.name}</div>
                  <p className="sav-risk-text" dangerouslySetInnerHTML={{ __html: r.finding }} />
                  <div className="sav-risk-actions">
                    {r.actions.map(a => <button className="sav-action-btn" key={a}>{a}</button>)}
                  </div>
                  <span className="sav-risk-detail-link" onClick={() => scrollToFiles('all')}>View details →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 3: Files & Folders ── */}
      <div className="sav-section" ref={filesRef}>
        <div className="sav-section-heading">📁 Files &amp; Folders</div>

        <div className="sav-pills">
          {filterPills.map(p => (
            <button
              key={p.key}
              className={`sav-pill${activeFilter === p.key ? ' active' : ''}`}
              onClick={() => { setActiveFilter(p.key); setSelectedFolder(null); }}
            >{p.label}</button>
          ))}
        </div>

        <div className="sav-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sav-files-layout">
            {/* Folder sidebar */}
            <div className="sav-folder-sidebar">
              <div
                className={`sav-folder-item${selectedFolder === null ? ' active' : ''}`}
                onClick={() => setSelectedFolder(null)}
              >
                <span>📂 All folders</span>
                <span style={{ fontSize: 11, color: '#6b6b80' }}>{filteredFiles.length}</span>
              </div>
              {FOLDERS.map(f => (
                <div
                  key={f.name}
                  className={`sav-folder-item${selectedFolder === f.name ? ' active' : ''}`}
                  onClick={() => setSelectedFolder(f.name)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>📁 {f.name}</span>
                  <div className="sav-folder-meta">
                    <span style={{ fontSize: 11, color: '#6b6b80' }}>{f.count}</span>
                    <div className="sav-folder-dot" style={{ background: riskDotColor[f.risk] }} />
                  </div>
                </div>
              ))}
            </div>

            {/* File table */}
            <div className="sav-file-table-wrap">
              <table className="sav-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Sensitivity</th>
                    <th>Label</th>
                    <th>Sharing</th>
                    <th>Last Modified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#6b6b80' }}>No files match current filters</td></tr>
                  )}
                  {filteredFiles.map((f, i) => (
                    <tr key={i}>
                      <td style={{ color: '#e0e0f0', fontWeight: 500 }}>
                        {fileIcon(f.name)} {f.name}
                      </td>
                      <td>
                        <span className="sav-badge" style={sensitivityStyle(f.sensitivity)}>{f.sensitivity}</span>
                      </td>
                      <td>
                        <span className="sav-badge" style={labelStyle(f.label)}>{f.label}</span>
                      </td>
                      <td>
                        <span className="sav-badge" style={sharingStyle(f.sharing)}>{f.sharing}</span>
                      </td>
                      <td style={{ fontSize: 12 }}>{f.modified}</td>
                      <td>
                        <div className="sav-row-actions">
                          {f.label === 'None' && <button className="sav-row-action">Apply label</button>}
                          {(f.sharing === 'Anyone' || f.sharing === 'Org-wide') && <button className="sav-row-action">Restrict</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 4: Access & Users ── */}
      <div className="sav-section" style={{ paddingBottom: 48 }}>
        <div className="sav-section-heading">👥 Access &amp; Users</div>

        <div className="sav-group-grid">
          {groups.map((g, i) => (
            <div
              className="sav-group-card"
              key={i}
              style={{ background: groupTint(g.users), border: `1px solid ${groupBorder(g.users)}` }}
            >
              <div className="sav-group-name">{g.name}</div>
              <div className="sav-group-stats">
                <div className="sav-group-stat"><span>{formatNumber(g.users)}</span> users</div>
                <div className="sav-group-stat"><span>{formatNumber(g.reads)}</span> reads</div>
                <div className="sav-group-stat"><span>{formatNumber(g.writes)}</span> writes</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0f0', marginBottom: 12 }}>High-risk users</div>
        <div className="sav-card" style={{ padding: 0, overflow: 'hidden' }}>
          {MOCK_USERS.map((u, i) => (
            <div className="sav-user-row" key={i}>
              <div className="sav-user-left">
                <div className="sav-avatar">{u.name.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <div className="sav-user-name">{u.name}</div>
                  <div className="sav-user-dept">{u.dept}</div>
                </div>
                <span
                  className="sav-user-badge"
                  style={{
                    background: `${flagColor[u.badge] || '#6b6b80'}20`,
                    color: flagColor[u.badge] || '#6b6b80',
                    border: `1px solid ${flagColor[u.badge] || '#6b6b80'}40`,
                  }}
                >{u.badge}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 12, color: '#6b6b80' }}>Last access: {u.lastAccess}</span>
                <button className="sav-review-btn">Review →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
