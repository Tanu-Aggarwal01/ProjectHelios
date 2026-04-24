import React, { useState, useMemo, useCallback } from 'react';
import { readinessColor, formatNumber } from '../data/mockData';

/* ──────────────────────── helpers ──────────────────────── */

const riskColor = (score) =>
  score >= 85 ? '#ef4444' : score >= 65 ? '#f97316' : score >= 40 ? '#eab308' : '#22c55e';

const riskLabel = (score) =>
  score >= 85 ? 'Critical' : score >= 65 ? 'High' : score >= 40 ? 'Medium' : 'Low';

const postureLabel = (score) =>
  score < 40 ? 'At Risk' : score < 70 ? 'Needs Attention' : 'Good';

const postureColor = (score) =>
  score < 40 ? '#ef4444' : score < 70 ? '#eab308' : '#22c55e';

/* ──────────────────────── mock data generators ──────────────────────── */

const generateMockFiles = () => [
  { name: 'Q4-Revenue-Forecast.xlsx', sensitivity: 'Confidential', label: 'Confidential', exposure: 'Internal', modified: '2025-01-14', status: 'Labeled' },
  { name: 'Employee-SSN-List.csv', sensitivity: 'Highly Confidential', label: null, exposure: 'Anyone with link', modified: '2025-01-12', status: 'Unlabeled' },
  { name: 'Board-Presentation-Draft.pptx', sensitivity: 'Confidential', label: null, exposure: 'Org-wide', modified: '2025-01-11', status: 'Unlabeled' },
  { name: 'Patent-Filing-2025.docx', sensitivity: 'Highly Confidential', label: 'Highly Confidential', exposure: 'Specific people', modified: '2025-01-10', status: 'Labeled' },
  { name: 'Marketing-Budget-FY25.xlsx', sensitivity: 'General', label: null, exposure: 'Anyone with link', modified: '2025-01-09', status: 'Overexposed' },
  { name: 'Old-Policy-v2-DRAFT.docx', sensitivity: 'General', label: null, exposure: 'Internal', modified: '2023-03-15', status: 'ROT' },
  { name: 'Customer-PII-Export.csv', sensitivity: 'Highly Confidential', label: 'Highly Confidential', exposure: 'Anyone with link', modified: '2025-01-08', status: 'Overexposed' },
  { name: 'Team-Offsite-Photos.zip', sensitivity: 'General', label: null, exposure: 'Internal', modified: '2024-06-20', status: 'ROT' },
  { name: 'Merger-Term-Sheet.pdf', sensitivity: 'Highly Confidential', label: null, exposure: 'Org-wide', modified: '2025-01-07', status: 'Unlabeled' },
  { name: 'API-Keys-Staging.txt', sensitivity: 'Highly Confidential', label: null, exposure: 'Anyone with link', modified: '2025-01-06', status: 'Overexposed' },
  { name: 'Vendor-Contract-2024.pdf', sensitivity: 'Confidential', label: 'Confidential', exposure: 'Specific people', modified: '2024-12-20', status: 'Labeled' },
  { name: 'Onboarding-Checklist.docx', sensitivity: 'General', label: 'General', exposure: 'Internal', modified: '2024-11-01', status: 'Labeled' },
  { name: 'Deprecated-Schema-v1.sql', sensitivity: 'General', label: null, exposure: 'Internal', modified: '2022-08-10', status: 'ROT' },
  { name: 'Exec-Comp-Analysis.xlsx', sensitivity: 'Highly Confidential', label: null, exposure: 'Org-wide', modified: '2025-01-05', status: 'Unlabeled' },
  { name: 'Release-Notes-v3.2.md', sensitivity: 'General', label: 'General', exposure: 'Internal', modified: '2025-01-13', status: 'Labeled' },
];

const generateMockUsers = () => [
  { name: 'Sarah Chen', type: 'User', role: 'Owner', riskFlags: ['Admin'], accessVia: 'Direct' },
  { name: 'James Wilson', type: 'User', role: 'Member', riskFlags: ['Departing'], accessVia: 'Direct' },
  { name: 'External Auditors', type: 'Group', role: 'Viewer', riskFlags: ['Guest'], accessVia: 'Sharing link' },
  { name: 'Maria Garcia', type: 'User', role: 'Member', riskFlags: ['IRM-flagged'], accessVia: 'Direct' },
  { name: 'Engineering Team', type: 'Group', role: 'Member', riskFlags: [], accessVia: 'Site membership' },
  { name: 'Alex Kowalski', type: 'User', role: 'Viewer', riskFlags: ['Guest'], accessVia: 'Sharing link' },
  { name: 'Finance Admins', type: 'Group', role: 'Owner', riskFlags: ['Admin'], accessVia: 'Site membership' },
  { name: 'David Okafor', type: 'User', role: 'Member', riskFlags: ['IRM-flagged', 'Departing'], accessVia: 'Direct' },
  { name: 'Everyone except external', type: 'Group', role: 'Viewer', riskFlags: [], accessVia: 'Org-wide sharing' },
  { name: 'Priya Sharma', type: 'User', role: 'Member', riskFlags: [], accessVia: 'Direct' },
];

const generateMockActivity = () => [
  { time: '2025-01-14 09:42', user: 'James Wilson', action: 'Downloaded 23 files in bulk', target: 'Q4 Financial Reports/', severity: 'high', flag: 'Exfiltration risk' },
  { time: '2025-01-14 08:15', user: 'Maria Garcia', action: 'Shared externally via anonymous link', target: 'Customer-PII-Export.csv', severity: 'high', flag: 'Policy violation' },
  { time: '2025-01-13 17:30', user: 'David Okafor', action: 'Removed sensitivity label', target: 'Merger-Term-Sheet.pdf', severity: 'high', flag: 'Label downgrade' },
  { time: '2025-01-13 14:22', user: 'Alex Kowalski', action: 'Accessed from unmanaged device', target: 'Board-Presentation-Draft.pptx', severity: 'medium', flag: 'Anomalous' },
  { time: '2025-01-13 11:05', user: 'Sarah Chen', action: 'Modified sharing permissions', target: 'API-Keys-Staging.txt', severity: 'medium', flag: 'Sharing change' },
  { time: '2025-01-12 16:48', user: 'Engineering Team', action: 'Bulk upload 47 files', target: '/Deployments/', severity: 'low', flag: '' },
  { time: '2025-01-12 10:30', user: 'Priya Sharma', action: 'Viewed document', target: 'Vendor-Contract-2024.pdf', severity: 'low', flag: '' },
  { time: '2025-01-11 15:12', user: 'External Auditors', action: 'Accessed 8 files', target: 'Compliance folder/', severity: 'medium', flag: 'Guest access' },
  { time: '2025-01-11 09:00', user: 'David Okafor', action: 'Copied to personal OneDrive', target: 'Exec-Comp-Analysis.xlsx', severity: 'high', flag: 'Exfiltration risk' },
  { time: '2025-01-10 14:35', user: 'Sarah Chen', action: 'Applied sensitivity label', target: 'Patent-Filing-2025.docx', severity: 'low', flag: '' },
];

const flagColor = { Departing: '#ef4444', 'IRM-flagged': '#f97316', Admin: '#6366f1', Guest: '#eab308' };

/* ──────────────────────── component ──────────────────────── */

export default function SiteAnalysisView({ site, category, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [assetFilter, setAssetFilter] = useState('All');
  const [entitlementFilter, setEntitlementFilter] = useState('All');
  const [activityFilter, setActivityFilter] = useState('All');
  const [showAllRisks, setShowAllRisks] = useState(false);

  const mockFiles = useMemo(generateMockFiles, []);
  const mockUsers = useMemo(generateMockUsers, []);
  const mockActivity = useMemo(generateMockActivity, []);

  const s = site || {};
  const siteName = s.name || 'Unknown Site';
  const siteUrl = s.url || '';
  const siteAdmin = s.admin || 'Unknown';
  const createdDate = s.createdDate || '2024-01-15';
  const docCount = s.totalSiteDocs || s.catDocs || 0;

  const classRisk = s.classificationRisk ?? 55;
  const expRisk = s.exposureRisk ?? 62;
  const govRisk = s.governanceRisk ?? 48;
  const actRisk = s.activityRisk ?? 38;
  const usrRisk = s.userRisk ?? 30;

  const postureScore = Math.round(100 - (classRisk * 0.25 + expRisk * 0.25 + govRisk * 0.2 + actRisk * 0.15 + usrRisk * 0.15));

  /* navigate to tab with pre‑applied filter */
  const goToAssets = useCallback((filter) => { setAssetFilter(filter); setActiveTab('assets'); }, []);
  const goToEntitlements = useCallback((filter) => { setEntitlementFilter(filter); setActiveTab('entitlements'); }, []);
  const goToActivity = useCallback((filter) => { setActivityFilter(filter); setActiveTab('activity'); }, []);

  /* filtered data */
  const filteredFiles = useMemo(() => {
    if (assetFilter === 'All') return mockFiles;
    if (assetFilter === 'Sensitive') return mockFiles.filter(f => f.sensitivity.includes('Confidential'));
    return mockFiles.filter(f => f.status === assetFilter);
  }, [assetFilter, mockFiles]);

  const filteredUsers = useMemo(() => {
    if (entitlementFilter === 'All') return mockUsers;
    if (entitlementFilter === 'High-risk users') return mockUsers.filter(u => u.riskFlags.some(f => ['Departing', 'IRM-flagged'].includes(f)));
    if (entitlementFilter === 'External') return mockUsers.filter(u => u.riskFlags.includes('Guest'));
    if (entitlementFilter === 'Broad groups') return mockUsers.filter(u => u.type === 'Group');
    return mockUsers;
  }, [entitlementFilter, mockUsers]);

  const filteredActivity = useMemo(() => {
    if (activityFilter === 'All') return mockActivity;
    if (activityFilter === 'Anomalous') return mockActivity.filter(e => e.severity === 'high');
    if (activityFilter === 'Sharing events') return mockActivity.filter(e => e.action.toLowerCase().includes('shar'));
    if (activityFilter === 'Downloads') return mockActivity.filter(e => e.action.toLowerCase().includes('download') || e.action.toLowerCase().includes('copied'));
    return mockActivity;
  }, [activityFilter, mockActivity]);

  /* narrative */
  const narrative = `This site has a posture score of ${postureScore}/100 and requires attention. Classification risk is elevated at ${classRisk}% — approximately 34% of documents lack sensitivity labels, including files containing PII and financial data. Exposure risk is at ${expRisk}% due to ${Math.round(expRisk * 0.68)}% of sensitive files being shared via org-wide or anonymous links. Recent activity from departing employees flagged by Insider Risk Management adds additional concern.`;

  /* risk drivers */
  const riskDrivers = [
    {
      key: 'config', name: 'Configuration', score: govRisk, icon: '⚙️',
      finding: `Site governance policies are ${govRisk >= 50 ? 'significantly' : 'partially'} misaligned with organizational standards. **DLP coverage is only ${s.dlpCoverage ?? 34}%**, leaving ${100 - (s.dlpCoverage ?? 34)}% of content unprotected. Default sharing is set to "Anyone with a link" instead of the recommended "Specific people" setting.`,
      link: 'View governance gaps →', linkAction: () => goToAssets('All'),
      actions: ['Apply recommended DLP policy', 'Restrict default sharing'],
    },
    {
      key: 'class', name: 'Classification', score: classRisk, icon: '🏷️',
      finding: `**34% of files are unlabeled**, including ${Math.round(classRisk * 0.3)} documents containing sensitive information types (SSNs, financial data, PII). Auto-labeling policies could resolve an estimated 78% of these gaps. Several high-confidence matches were detected but not labeled.`,
      link: 'View sensitive files →', linkAction: () => goToAssets('Unlabeled'),
      actions: ['Enable auto-labeling', 'Review suggested labels'],
    },
    {
      key: 'exposure', name: 'Exposure', score: expRisk, icon: '🔓',
      finding: `**42% of files are overexposed** beyond their intended audience. ${Math.round(expRisk * 0.4)} files with "Confidential" or higher labels are accessible via anonymous sharing links. ${Math.round(expRisk * 0.25)} files are shared org-wide despite containing restricted content.`,
      link: 'View overshared files →', linkAction: () => goToAssets('Overexposed'),
      actions: ['Revoke anonymous links', 'Review org-wide shares'],
    },
    {
      key: 'activity', name: 'Activity', score: actRisk, icon: '📊',
      finding: `**${Math.round(actRisk * 0.15)} anomalous events** detected in the past 30 days. A departing employee downloaded 23 files in bulk, and sensitive content was shared externally without authorization. Label downgrades on confidential documents were also observed.`,
      link: 'View risky activities →', linkAction: () => goToActivity('Anomalous'),
      actions: ['Investigate bulk download', 'Review sharing events'],
    },
    {
      key: 'user', name: 'User', score: usrRisk, icon: '👤',
      finding: `**2 users flagged by Insider Risk Management** have active access to this site. 1 departing employee retains edit permissions to ${Math.round(usrRisk * 0.5)} sensitive documents. 2 external guest accounts have not been reviewed in over 90 days.`,
      link: 'View high-risk users →', linkAction: () => goToEntitlements('High-risk users'),
      actions: ['Revoke departing user access', 'Review guest accounts'],
    },
  ];

  const sortedRisks = [...riskDrivers].sort((a, b) => b.score - a.score);
  const visibleRisks = showAllRisks ? sortedRisks : sortedRisks.slice(0, 3);
  const hiddenCount = sortedRisks.length - 3;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'assets', label: 'Assets' },
    { id: 'entitlements', label: 'Entitlements' },
    { id: 'activity', label: 'Activity' },
  ];

  const severityBg = { high: 'rgba(239,68,68,0.10)', medium: 'rgba(234,179,8,0.08)', low: 'rgba(255,255,255,0.03)' };
  const severityBorder = { high: 'rgba(239,68,68,0.25)', medium: 'rgba(234,179,8,0.18)', low: 'rgba(255,255,255,0.06)' };

  /* ──────────── semicircle gauge ──────────── */
  const Gauge = ({ score }) => {
    const r = 70, cx = 85, cy = 82, stroke = 12;
    const circ = Math.PI * r;
    const pct = Math.max(0, Math.min(100, score)) / 100;
    const color = postureColor(score);
    return (
      <svg width={170} height={100} viewBox="0 0 170 100">
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} strokeLinecap="round" />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${circ * pct} ${circ}`} style={{ transition: 'stroke-dasharray 0.6s ease' }} />
        <text x={cx} y={cy - 8} textAnchor="middle" fill={color} fontSize="28" fontWeight="700">{score}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#a0a0b8" fontSize="10">/100</text>
      </svg>
    );
  };

  /* ──────────── posture sidebar ──────────── */
  const riskBars = [
    { label: 'Configuration risk', value: govRisk },
    { label: 'Classification risk', value: classRisk },
    { label: 'Exposure risk', value: expRisk },
    { label: 'Activity risk', value: actRisk },
    { label: 'User risk', value: usrRisk },
  ];

  /* ──────────── render ──────────── */
  return (
    <div className="sa-root">
      <style>{`
        .sa-root { color: #e0e0f0; font-family: 'Segoe UI', system-ui, sans-serif; min-height: 100vh; }

        /* header */
        .sa-header { padding: 20px 28px 0; }
        .sa-back { display: inline-flex; align-items: center; gap: 6px; color: #a0a0b8; font-size: 13px; cursor: pointer; background: none; border: none; padding: 4px 0; margin-bottom: 10px; transition: color 0.15s; }
        .sa-back:hover { color: #e0e0f0; }
        .sa-back svg { width: 16px; height: 16px; }
        .sa-title { font-size: 22px; font-weight: 700; margin: 0 0 6px; color: #e0e0f0; }
        .sa-meta { display: flex; flex-wrap: wrap; gap: 18px; margin-bottom: 18px; }
        .sa-meta-item { font-size: 12px; color: #a0a0b8; }
        .sa-meta-item span { color: #6b6b80; margin-right: 4px; }

        /* tabs */
        .sa-tabs { display: flex; gap: 0; border-bottom: 1px solid rgba(255,255,255,0.06); padding: 0 28px; }
        .sa-tab { padding: 10px 18px; font-size: 13px; color: #a0a0b8; cursor: pointer; border: none; background: none; position: relative; transition: color 0.15s; }
        .sa-tab:hover { color: #e0e0f0; }
        .sa-tab.active { color: #e0e0f0; }
        .sa-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 10px; right: 10px; height: 2px; background: #6366f1; border-radius: 2px; }

        /* body */
        .sa-body { padding: 24px 28px; }

        /* overview layout */
        .sa-overview { display: flex; gap: 24px; }
        .sa-sidebar { width: 250px; min-width: 250px; }
        .sa-main { flex: 1; min-width: 0; }

        /* cards */
        .sa-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
        .sa-card-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #6b6b80; margin: 0 0 14px; }

        /* gauge card */
        .sa-gauge-card { text-align: center; padding: 20px 16px; }
        .sa-posture-label { font-size: 13px; font-weight: 600; margin-top: 4px; }
        .sa-impact-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #6b6b80; margin: 16px 0 10px; text-align: left; }

        /* risk bars */
        .sa-risk-bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .sa-risk-bar-label { font-size: 11px; color: #a0a0b8; width: 120px; min-width: 120px; }
        .sa-risk-bar-track { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
        .sa-risk-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
        .sa-risk-bar-val { font-size: 10px; color: #6b6b80; width: 30px; text-align: right; }

        /* narrative */
        .sa-narrative { font-size: 13px; line-height: 1.65; color: #a0a0b8; }

        /* data readiness */
        .sa-readiness { display: flex; gap: 12px; margin-bottom: 16px; }
        .sa-readiness-card { flex: 1; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 16px; cursor: pointer; transition: background 0.15s, border-color 0.15s; text-align: center; }
        .sa-readiness-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(99,102,241,0.3); }
        .sa-readiness-icon { font-size: 20px; margin-bottom: 4px; }
        .sa-readiness-label { font-size: 11px; color: #a0a0b8; margin-bottom: 2px; }
        .sa-readiness-value { font-size: 22px; font-weight: 700; }
        .sa-readiness-sub { font-size: 10px; color: #6b6b80; margin-top: 2px; }

        /* risk driver cards */
        .sa-drivers { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
        .sa-driver { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
        .sa-driver-head { display: flex; align-items: center; gap: 8px; }
        .sa-driver-icon { font-size: 16px; }
        .sa-driver-name { font-size: 14px; font-weight: 600; color: #e0e0f0; }
        .sa-driver-dot { width: 8px; height: 8px; border-radius: 50%; margin-left: auto; }
        .sa-driver-finding { font-size: 12px; line-height: 1.6; color: #a0a0b8; }
        .sa-driver-finding strong { color: #e0e0f0; font-weight: 600; }
        .sa-driver-link { font-size: 12px; color: #818cf8; cursor: pointer; background: none; border: none; padding: 0; text-align: left; transition: color 0.15s; }
        .sa-driver-link:hover { color: #a5b4fc; }
        .sa-driver-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; }
        .sa-driver-btn { font-size: 11px; padding: 5px 12px; border-radius: 6px; border: 1px solid rgba(99,102,241,0.3); background: rgba(99,102,241,0.08); color: #818cf8; cursor: pointer; transition: background 0.15s, border-color 0.15s; }
        .sa-driver-btn:hover { background: rgba(99,102,241,0.18); border-color: rgba(99,102,241,0.5); }
        .sa-toggle-more { background: none; border: none; color: #818cf8; font-size: 12px; cursor: pointer; padding: 8px 0; transition: color 0.15s; }
        .sa-toggle-more:hover { color: #a5b4fc; }

        /* tables */
        .sa-filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .sa-pill { font-size: 12px; padding: 6px 14px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: #a0a0b8; cursor: pointer; transition: all 0.15s; }
        .sa-pill:hover { border-color: rgba(99,102,241,0.3); color: #e0e0f0; }
        .sa-pill.active { background: rgba(99,102,241,0.12); border-color: rgba(99,102,241,0.4); color: #818cf8; }
        .sa-table { width: 100%; border-collapse: separate; border-spacing: 0; }
        .sa-table th { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #6b6b80; text-align: left; padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .sa-table td { font-size: 12px; color: #a0a0b8; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
        .sa-table tr:hover td { background: rgba(255,255,255,0.02); }
        .sa-badge { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600; margin-right: 4px; }
        .sa-sensitivity-hc { background: rgba(239,68,68,0.12); color: #ef4444; }
        .sa-sensitivity-c { background: rgba(249,115,22,0.12); color: #f97316; }
        .sa-sensitivity-g { background: rgba(34,197,94,0.12); color: #22c55e; }
        .sa-exposure-bad { color: #ef4444; }
        .sa-exposure-warn { color: #eab308; }
        .sa-exposure-ok { color: #22c55e; }
        .sa-row-action { font-size: 11px; color: #818cf8; cursor: pointer; background: none; border: none; padding: 0; opacity: 0; transition: opacity 0.15s; }
        .sa-table tr:hover .sa-row-action { opacity: 1; }

        /* activity timeline */
        .sa-timeline { display: flex; flex-direction: column; gap: 10px; }
        .sa-event { border-radius: 10px; padding: 14px 18px; display: flex; gap: 16px; align-items: flex-start; transition: background 0.15s; }
        .sa-event-time { font-size: 11px; color: #6b6b80; min-width: 110px; padding-top: 1px; }
        .sa-event-body { flex: 1; }
        .sa-event-user { font-size: 13px; font-weight: 600; color: #e0e0f0; }
        .sa-event-action { font-size: 12px; color: #a0a0b8; margin-top: 2px; }
        .sa-event-target { color: #818cf8; }
        .sa-event-flag { font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600; margin-left: 8px; }

        @media (max-width: 900px) {
          .sa-overview { flex-direction: column; }
          .sa-sidebar { width: 100%; min-width: 0; }
          .sa-readiness { flex-direction: column; }
          .sa-drivers { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ──── header ──── */}
      <div className="sa-header">
        <button className="sa-back" onClick={onBack}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3L5 8l5 5" /></svg>
          Back to {category?.name || 'Category'}
        </button>
        <h1 className="sa-title">{siteName}</h1>
        <div className="sa-meta">
          <div className="sa-meta-item"><span>URL</span>{siteUrl || '—'}</div>
          <div className="sa-meta-item"><span>Owner</span>{siteAdmin}</div>
          <div className="sa-meta-item"><span>Created</span>{createdDate}</div>
          <div className="sa-meta-item"><span>Documents</span>{formatNumber(docCount)}</div>
        </div>
      </div>

      {/* ──── tabs ──── */}
      <div className="sa-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`sa-tab${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ──── body ──── */}
      <div className="sa-body">

        {/* ──── OVERVIEW ──── */}
        {activeTab === 'overview' && (
          <div className="sa-overview">
            {/* sidebar */}
            <div className="sa-sidebar">
              <div className="sa-card sa-gauge-card">
                <Gauge score={postureScore} />
                <div className="sa-posture-label" style={{ color: postureColor(postureScore) }}>{postureLabel(postureScore)}</div>
                <div className="sa-impact-title">What's impacting your score?</div>
                {riskBars.map(b => (
                  <div className="sa-risk-bar-row" key={b.label}>
                    <div className="sa-risk-bar-label">{b.label}</div>
                    <div className="sa-risk-bar-track"><div className="sa-risk-bar-fill" style={{ width: `${b.value}%`, background: readinessColor(b.value) }} /></div>
                    <div className="sa-risk-bar-val">{b.value}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* main */}
            <div className="sa-main">
              {/* narrative */}
              <div className="sa-card">
                <div className="sa-card-title">Overall Posture Summary</div>
                <div className="sa-narrative">{narrative}</div>
              </div>

              {/* data readiness */}
              <div className="sa-card">
                <div className="sa-card-title">Data Readiness</div>
                <div className="sa-readiness">
                  <div className="sa-readiness-card" onClick={() => goToAssets('Unlabeled')}>
                    <div className="sa-readiness-icon">🏷️</div>
                    <div className="sa-readiness-label">Unlabeled</div>
                    <div className="sa-readiness-value" style={{ color: readinessColor(34) }}>34%</div>
                    <div className="sa-readiness-sub">of files missing labels</div>
                  </div>
                  <div className="sa-readiness-card" onClick={() => goToAssets('Overexposed')}>
                    <div className="sa-readiness-icon">🔓</div>
                    <div className="sa-readiness-label">Overexposed</div>
                    <div className="sa-readiness-value" style={{ color: readinessColor(42) }}>42%</div>
                    <div className="sa-readiness-sub">shared beyond intended audience</div>
                  </div>
                  <div className="sa-readiness-card" onClick={() => goToAssets('ROT')}>
                    <div className="sa-readiness-icon">🗑️</div>
                    <div className="sa-readiness-label">ROT</div>
                    <div className="sa-readiness-value" style={{ color: readinessColor(8) }}>8%</div>
                    <div className="sa-readiness-sub">redundant, obsolete, trivial</div>
                  </div>
                </div>
              </div>

              {/* risk drivers */}
              <div className="sa-card">
                <div className="sa-card-title">Primary Risk Drivers</div>
                <div className="sa-drivers">
                  {visibleRisks.map(d => (
                    <div className="sa-driver" key={d.key}>
                      <div className="sa-driver-head">
                        <span className="sa-driver-icon">{d.icon}</span>
                        <span className="sa-driver-name">{d.name}</span>
                        <span className="sa-driver-dot" style={{ background: riskColor(d.score) }} title={`${riskLabel(d.score)} (${d.score}%)`} />
                      </div>
                      <div className="sa-driver-finding" dangerouslySetInnerHTML={{ __html: d.finding.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      <button className="sa-driver-link" onClick={d.linkAction}>{d.link}</button>
                      <div className="sa-driver-actions">
                        {d.actions.map(a => <button key={a} className="sa-driver-btn">{a}</button>)}
                      </div>
                    </div>
                  ))}
                </div>
                {hiddenCount > 0 && (
                  <button className="sa-toggle-more" onClick={() => setShowAllRisks(!showAllRisks)}>
                    {showAllRisks ? 'Show fewer risks ▲' : `Show ${hiddenCount} more risk${hiddenCount > 1 ? 's' : ''} ▼`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ──── ASSETS ──── */}
        {activeTab === 'assets' && (
          <>
            <div className="sa-filters">
              {['All', 'Unlabeled', 'Overexposed', 'ROT', 'Sensitive'].map(f => (
                <button key={f} className={`sa-pill${assetFilter === f ? ' active' : ''}`} onClick={() => setAssetFilter(f)}>{f}</button>
              ))}
            </div>
            <div className="sa-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>File name</th><th>Sensitivity</th><th>Label</th><th>Exposure</th><th>Last Modified</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((f, i) => {
                    const sensClass = f.sensitivity === 'Highly Confidential' ? 'sa-sensitivity-hc' : f.sensitivity === 'Confidential' ? 'sa-sensitivity-c' : 'sa-sensitivity-g';
                    const expClass = f.exposure === 'Anyone with link' ? 'sa-exposure-bad' : f.exposure === 'Org-wide' ? 'sa-exposure-warn' : 'sa-exposure-ok';
                    const action = !f.label ? 'Apply label' : f.exposure === 'Anyone with link' || f.exposure === 'Org-wide' ? 'Review sharing' : null;
                    return (
                      <tr key={i}>
                        <td style={{ color: '#e0e0f0', fontWeight: 500 }}>{f.name}</td>
                        <td><span className={`sa-badge ${sensClass}`}>{f.sensitivity}</span></td>
                        <td>{f.label || <span style={{ color: '#6b6b80' }}>—</span>}</td>
                        <td className={expClass}>{f.exposure}</td>
                        <td>{f.modified}</td>
                        <td><span className="sa-badge" style={{
                          background: f.status === 'Overexposed' ? 'rgba(239,68,68,0.12)' : f.status === 'Unlabeled' ? 'rgba(234,179,8,0.12)' : f.status === 'ROT' ? 'rgba(107,107,128,0.15)' : 'rgba(34,197,94,0.12)',
                          color: f.status === 'Overexposed' ? '#ef4444' : f.status === 'Unlabeled' ? '#eab308' : f.status === 'ROT' ? '#6b6b80' : '#22c55e',
                        }}>{f.status}</span></td>
                        <td>{action && <button className="sa-row-action">{action}</button>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ──── ENTITLEMENTS ──── */}
        {activeTab === 'entitlements' && (
          <>
            <div className="sa-filters">
              {['All', 'High-risk users', 'External', 'Broad groups'].map(f => (
                <button key={f} className={`sa-pill${entitlementFilter === f ? ' active' : ''}`} onClick={() => setEntitlementFilter(f)}>{f}</button>
              ))}
            </div>
            <div className="sa-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="sa-table">
                <thead>
                  <tr><th>Name</th><th>Type</th><th>Role</th><th>Risk Flags</th><th>Access Via</th></tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={i}>
                      <td style={{ color: '#e0e0f0', fontWeight: 500 }}>{u.name}</td>
                      <td>{u.type}</td>
                      <td>{u.role}</td>
                      <td>
                        {u.riskFlags.length > 0 ? u.riskFlags.map(f => (
                          <span key={f} className="sa-badge" style={{ background: (flagColor[f] || '#6b6b80') + '1a', color: flagColor[f] || '#6b6b80' }}>{f}</span>
                        )) : <span style={{ color: '#6b6b80' }}>—</span>}
                      </td>
                      <td>{u.accessVia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ──── ACTIVITY ──── */}
        {activeTab === 'activity' && (
          <>
            <div className="sa-filters">
              {['All', 'Anomalous', 'Sharing events', 'Downloads'].map(f => (
                <button key={f} className={`sa-pill${activityFilter === f ? ' active' : ''}`} onClick={() => setActivityFilter(f)}>{f}</button>
              ))}
            </div>
            <div className="sa-timeline">
              {filteredActivity.map((e, i) => (
                <div key={i} className="sa-event" style={{ background: severityBg[e.severity], border: `1px solid ${severityBorder[e.severity]}`, }}>
                  <div className="sa-event-time">{e.time}</div>
                  <div className="sa-event-body">
                    <span className="sa-event-user">{e.user}</span>
                    {e.flag && <span className="sa-event-flag" style={{
                      background: e.severity === 'high' ? 'rgba(239,68,68,0.15)' : e.severity === 'medium' ? 'rgba(234,179,8,0.12)' : 'rgba(255,255,255,0.06)',
                      color: e.severity === 'high' ? '#ef4444' : e.severity === 'medium' ? '#eab308' : '#6b6b80',
                    }}>{e.flag}</span>}
                    <div className="sa-event-action">{e.action} — <span className="sa-event-target">{e.target}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
