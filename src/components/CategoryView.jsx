import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import * as d3 from 'd3';
import { getCategoriesForTier, getCategorySiteBreakdown, formatNumber, readinessColor, lastScannedLabel, getCategoryNarrative, getSiteNarrative } from '../data/mockData';
import SiteExplorer from './SiteExplorer';

function CategoryDeepDive({ category, onClose }) {
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mitigationModal, setMitigationModal] = useState(null);
  const [explorerSite, setExplorerSite] = useState(null);
  const [showStateActions, setShowStateActions] = useState(false);
  const [showActivityActions, setShowActivityActions] = useState(false);
  const [siteSortCol, setSiteSortCol] = useState('catDocs');
  const [siteSortDir, setSiteSortDir] = useState('desc');
  const sites = useMemo(() => getCategorySiteBreakdown(category.id, category.documentCount, category.siteCount), [category]);
  const sortedSites = useMemo(() => {
    const sorted = [...sites];
    sorted.sort((a, b) => {
      let va = a[siteSortCol], vb = b[siteSortCol];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase(); }
      if (va < vb) return siteSortDir === 'asc' ? -1 : 1;
      if (va > vb) return siteSortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [sites, siteSortCol, siteSortDir]);
  const handleSiteSort = useCallback((col) => {
    setSiteSortCol(prev => { if (prev === col) { setSiteSortDir(d => d === 'asc' ? 'desc' : 'asc'); return col; } setSiteSortDir('desc'); return col; });
  }, []);
  const siteSort = (col) => siteSortCol !== col ? '' : (siteSortDir === 'asc' ? ' ▲' : ' ▼');

  return createPortal(
    <>
    <div className="dd-overlay" onClick={onClose}>
      <div className="dd-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="dd-header">
          <div className="dd-header-left">
            <span className="dd-cat-badge" style={{ background: category.color + '22', color: category.color }}>{category.icon} {category.name}</span>
            <h2>Category Deep Dive</h2>
            <p>{formatNumber(category.documentCount)} documents from {sites.length} sites · {formatNumber(category.siteCount)} total sites contributing</p>
            <span className="last-scanned">🔄 Last scanned: {lastScannedLabel}</span>
          </div>
          <button className="dd-close" onClick={onClose}>✕</button>
        </div>

        <div className="dd-body">
          {/* Left: Site table */}
          <div className="dd-main">
            <div className="dd-table-header">
              <h3>📍 Sites Contributing to This Category</h3>
            </div>
            <div className="dd-table-wrap">
              <table className="dd-table">
                <thead>
                  <tr>
                    <th style={{cursor:'pointer'}} onClick={() => handleSiteSort('name')}>Site Name{siteSort('name')}</th>
                    <th style={{textAlign:'right',cursor:'pointer'}} onClick={() => handleSiteSort('catDocs')}>Docs in Category{siteSort('catDocs')}</th>
                    <th style={{textAlign:'right',cursor:'pointer'}} onClick={() => handleSiteSort('totalSiteDocs')}>Total Site Docs{siteSort('totalSiteDocs')}</th>
                    <th style={{textAlign:'right',cursor:'pointer'}} onClick={() => handleSiteSort('pct')}>% in Category{siteSort('pct')}</th>
                    <th style={{textAlign:'right',cursor:'pointer'}} onClick={() => handleSiteSort('monthlyReads')}>Reads/mo{siteSort('monthlyReads')}</th>
                    <th style={{textAlign:'right',cursor:'pointer'}} onClick={() => handleSiteSort('monthlyWrites')}>Writes/mo{siteSort('monthlyWrites')}</th>
                    <th style={{textAlign:'right',cursor:'pointer'}} onClick={() => handleSiteSort('totalUsers')}>Users (30d){siteSort('totalUsers')}</th>
                    <th style={{textAlign:'center'}}>Files</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSites.map(site => (
                    <tr
                      key={site.id}
                      className={`dd-tr ${selectedSite?.id === site.id ? 'dd-tr-active' : ''}`}
                      onClick={() => { setSelectedSite(site); setSelectedFile(null); }}
                    >
                      <td className="dd-td-name">
                        <span className="dd-site-dot" style={{ background: category.color }} />
                        {site.name}
                      </td>
                      <td style={{textAlign:'right',fontWeight:600}}>{formatNumber(site.catDocs)}</td>
                      <td style={{textAlign:'right',color:'#6b6b80'}}>{formatNumber(site.totalSiteDocs)}</td>
                      <td style={{textAlign:'right'}}>
                        <div className="dd-pct-cell">
                          <div className="dd-pct-bar-wrap">
                            <div className="dd-pct-bar" style={{ width: `${site.pct}%`, background: site.pct > 50 ? '#f97316' : category.color }} />
                          </div>
                          <span className="dd-pct-val" style={{ color: site.pct > 50 ? '#f97316' : '#a0a0b8' }}>{site.pct}%</span>
                        </div>
                      </td>
                      <td style={{textAlign:'right'}}>{formatNumber(site.monthlyReads)}</td>
                      <td style={{textAlign:'right'}}>{formatNumber(site.monthlyWrites)}</td>
                      <td style={{textAlign:'right'}}>
                        <span className="dd-users-badge">👥 {site.totalUsers}</span>
                      </td>
                      <td style={{textAlign:'center'}}>
                        <button className="dd-sample-btn">View ›</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Detail panel */}
          <div className="dd-detail">
            {!selectedSite ? (
              <div className="dd-empty">
                <div className="dd-empty-icon">📂</div>
                <p>Select a site to view details, files, and user access</p>
              </div>
            ) : (
              <>
                {/* Site header & info */}
                <div className="dd-detail-head">
                  <h3>{selectedSite.name}</h3>
                  <a className="dd-site-url" href={selectedSite.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                    {selectedSite.url} ↗
                  </a>
                  <div className="dd-site-meta-grid">
                    <div className="dd-meta-item"><span className="dd-meta-lbl">Admin</span><span className="dd-meta-val">{selectedSite.admin}</span></div>
                    <div className="dd-meta-item"><span className="dd-meta-lbl">Created</span><span className="dd-meta-val">{selectedSite.createdDate}</span></div>
                    <div className="dd-meta-item"><span className="dd-meta-lbl">In Category</span><span className="dd-meta-val">{formatNumber(selectedSite.catDocs)} docs ({selectedSite.pct}%)</span></div>
                    <div className="dd-meta-item"><span className="dd-meta-lbl">Total Docs</span><span className="dd-meta-val">{formatNumber(selectedSite.totalSiteDocs)}</span></div>
                    <div className="dd-meta-item"><span className="dd-meta-lbl">Users (30d)</span><span className="dd-meta-val">👥 {selectedSite.totalUsers}</span></div>
                    <div className="dd-meta-item"><span className="dd-meta-lbl">Org Groups</span><span className="dd-meta-val">{selectedSite.groupAccess.length}</span></div>
                  </div>
                </div>

                {/* Data Readiness */}
                <div className="dd-section">
                  <h4>🎯 Data Readiness</h4>
                  <div className="dd-readiness-list">
                    <div className="dd-rd dd-rd-tip"><span className="dd-rd-lbl">🏷️ Unlabeled</span><div className="dd-rd-bar-w"><div className="dd-rd-bar" style={{width:`${selectedSite.classificationRisk}%`,background:readinessColor(selectedSite.classificationRisk)}}/></div><span className="dd-rd-v" style={{color:readinessColor(selectedSite.classificationRisk)}}>{selectedSite.classificationRisk}%</span><div className="dd-rd-tooltip">Content without sensitivity labels cannot be protected by DLP policies — Copilot and AI agents can freely access and share this data without controls.</div></div>
                    <div className="dd-rd dd-rd-tip"><span className="dd-rd-lbl">🔓 Overexposed</span><div className="dd-rd-bar-w"><div className="dd-rd-bar" style={{width:`${selectedSite.exposureRisk}%`,background:readinessColor(selectedSite.exposureRisk)}}/></div><span className="dd-rd-v" style={{color:readinessColor(selectedSite.exposureRisk)}}>{selectedSite.exposureRisk}%</span><div className="dd-rd-tooltip">Files with broad permissions are visible to Copilot for every user who has access — oversharing amplifies AI exposure across the organization.</div></div>
                    <div className="dd-rd dd-rd-tip"><span className="dd-rd-lbl">🗑️ ROT</span><div className="dd-rd-bar-w"><div className="dd-rd-bar" style={{width:`${selectedSite.governanceRisk}%`,background:readinessColor(selectedSite.governanceRisk)}}/></div><span className="dd-rd-v" style={{color:readinessColor(selectedSite.governanceRisk)}}>{selectedSite.governanceRisk}%</span><div className="dd-rd-tooltip">ROT content pollutes AI responses with outdated information and increases attack surface — Copilot doesn't know a file is obsolete.</div></div>
                  </div>
                </div>

                {/* Active Risks */}
                <div className="dd-section">
                  <h4>📊 Active Risks</h4>
                  <div className="dd-readiness-list">
                    <div className="dd-rd dd-rd-tip"><span className="dd-rd-lbl">📤 Exfiltration</span><div className="dd-rd-bar-w"><div className="dd-rd-bar" style={{width:`${selectedSite.activityRisk}%`,background:readinessColor(selectedSite.activityRisk)}}/></div><span className="dd-rd-v" style={{color:readinessColor(selectedSite.activityRisk)}}>{selectedSite.activityRisk}%</span><div className="dd-rd-tooltip">Percentage of sensitive data activity (downloads, external shares, USB copies, cloud uploads) not covered by an active DLP policy — this data movement is unmonitored.</div></div>
                    <div className="dd-rd dd-rd-tip"><span className="dd-rd-lbl">👤 User Risk</span><div className="dd-rd-bar-w"><div className="dd-rd-bar" style={{width:`${selectedSite.userRisk}%`,background:readinessColor(selectedSite.userRisk)}}/></div><span className="dd-rd-v" style={{color:readinessColor(selectedSite.userRisk)}}>{selectedSite.userRisk}%</span><div className="dd-rd-tooltip">Percentage of users with access to this site not covered by Insider Risk Management policies — risky behavior by these users would go undetected.</div></div>
                    <div className="dd-rd dd-rd-tip"><span className="dd-rd-lbl">🤖 AI & Agent</span><div className="dd-rd-bar-w"><div className="dd-rd-bar" style={{width:`${selectedSite.aiAgentRisk}%`,background:readinessColor(selectedSite.aiAgentRisk)}}/></div><span className="dd-rd-v" style={{color:readinessColor(selectedSite.aiAgentRisk)}}>{selectedSite.aiAgentRisk}%</span><div className="dd-rd-tooltip">Percentage of content accessed by Copilot or AI agents not protected by DLP controls — AI can freely process and surface this data in responses.</div></div>
                  </div>
                </div>

                <div className="dd-section">
                  <div className="dd-narrative">
                    <div className="dd-narrative-header">
                      <span className="dd-narrative-icon">✨</span>
                      <span className="dd-narrative-label">Posture Agent Insights</span>
                    </div>
                    <p className="dd-narrative-text">{getSiteNarrative(selectedSite.name, selectedSite.totalSiteDocs, selectedSite.totalUsers)}</p>
                    <a className="narrative-logs-link" href="https://www.microsoft.com" target="_blank" rel="noopener noreferrer">View all activity logs →</a>
                  </div>
                </div>

                {/* Improve Data Readiness (collapsible) */}
                <div className="dd-section">
                  <div className="dd-collapse-header" onClick={() => setShowStateActions(!showStateActions)}>
                    <span className="dd-collapse-arrow">{showStateActions ? '▾' : '▸'}</span>
                    <h4>Improve Data Readiness</h4>
                    <span className="dd-collapse-hint">Label, permissions & retention actions</span>
                  </div>
                  {showStateActions && (
                    <div className="dd-collapse-body">
                      <div className="dd-mit-group">
                        <div className="dd-mit-group-head" style={{borderLeftColor:'#8b5cf6'}}>
                          <span className="dd-mit-group-icon">🏷️</span>
                          <div><div className="dd-mit-group-title">Manage Unlabeled Content</div><div className="dd-mit-group-risk" style={{color:readinessColor(selectedSite.classificationRisk)}}>{selectedSite.classificationRisk}% unlabeled</div></div>
                        </div>
                        <div className="dd-mit-group-btns">
                          <button className="dd-mit-btn" onClick={() => setMitigationModal('container-label')}><span className="dd-mit-icon">🏷️</span><div><div className="dd-mit-title">Apply MIP Container Label</div><div className="dd-mit-sub">Set sensitivity label on SPO site</div></div></button>
                          <button className="dd-mit-btn" onClick={() => setMitigationModal('label-in-cat')}><span className="dd-mit-icon">📄</span><div><div className="dd-mit-title">Label In-Category Files</div><div className="dd-mit-sub">{formatNumber(selectedSite.catDocs)} files</div></div></button>
                          <button className="dd-mit-btn" onClick={() => setMitigationModal('ai-classify')}><span className="dd-mit-icon">🤖</span><div><div className="dd-mit-title">AI-Native Classification</div><div className="dd-mit-sub">Graders, SIT & semantic classifiers</div></div></button>
                        </div>
                      </div>

                      <div className="dd-mit-group">
                        <div className="dd-mit-group-head" style={{borderLeftColor:'#f97316'}}>
                          <span className="dd-mit-group-icon">🔓</span>
                          <div><div className="dd-mit-group-title">Manage Overexposed Content</div><div className="dd-mit-group-risk" style={{color:readinessColor(selectedSite.exposureRisk)}}>{selectedSite.exposureRisk}% overexposed</div></div>
                        </div>
                        <div className="dd-mit-group-btns">
                          <button className="dd-mit-btn" onClick={() => setMitigationModal('risk-assessment')}><span className="dd-mit-icon">📋</span><div><div className="dd-mit-title">Add to Data Risk Assessment</div><div className="dd-mit-sub">Purview DSPM oversharing review</div></div></button>
                          <button className="dd-mit-btn" onClick={() => setMitigationModal('perm-rightsizing')}><span className="dd-mit-icon">🤝</span><div><div className="dd-mit-title">Launch Permissions Rightsizing</div><div className="dd-mit-sub">Agent-driven owner outreach</div></div></button>
                          <button className="dd-mit-btn" onClick={() => setMitigationModal('perm-guardrails')}><span className="dd-mit-icon">🛡️</span><div><div className="dd-mit-title">Create Permission Guardrails</div><div className="dd-mit-sub">Drift detection & auto-mitigation</div></div></button>
                        </div>
                      </div>

                      <div className="dd-mit-group">
                        <div className="dd-mit-group-head" style={{borderLeftColor:'#eab308'}}>
                          <span className="dd-mit-group-icon">🗑️</span>
                          <div><div className="dd-mit-group-title">Manage ROT Content</div><div className="dd-mit-group-risk" style={{color:readinessColor(selectedSite.governanceRisk)}}>{selectedSite.governanceRisk}% ROT (1yr+)</div></div>
                        </div>
                        <div className="dd-mit-group-btns">
                          <button className="dd-mit-btn" onClick={() => setMitigationModal('retention-policy')}><span className="dd-mit-icon">📋</span><div><div className="dd-mit-title">Create Retention Policies</div><div className="dd-mit-sub">Purview DLM data lifecycle management</div></div></button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mitigate Active Risks (collapsible) */}
                <div className="dd-section">
                  <div className="dd-collapse-header" onClick={() => setShowActivityActions(!showActivityActions)}>
                    <span className="dd-collapse-arrow">{showActivityActions ? '▾' : '▸'}</span>
                    <h4>Mitigate Active Risks</h4>
                    <span className="dd-collapse-hint">DLP, IRM & AI protection actions</span>
                  </div>
                  {showActivityActions && (
                    <div className="dd-collapse-body">
                      <div className="dd-mit-group">
                        <div className="dd-mit-group-head" style={{borderLeftColor:'#f97316'}}><span className="dd-mit-group-icon">📤</span><div><div className="dd-mit-group-title">Manage Exfiltration Risk</div><div className="dd-mit-group-risk" style={{color:readinessColor(selectedSite.activityRisk)}}>{selectedSite.activityRisk}% unprotected activity</div></div></div>
                        <div className="dd-mit-group-btns">
                          <button className="dd-mit-btn" onClick={() => setMitigationModal('dlp-activity')}><span className="dd-mit-icon">🛡️</span><div><div className="dd-mit-title">Create DLP Policy</div><div className="dd-mit-sub">Cover exfiltration vectors</div></div></button>
                          <button className="dd-mit-btn" onClick={() => setMitigationModal('dlp-alerts')}><span className="dd-mit-icon">🔔</span><div><div className="dd-mit-title">Configure Alerts</div><div className="dd-mit-sub">Alert on sensitive data movement</div></div></button>
                        </div>
                      </div>
                      <div className="dd-mit-group">
                        <div className="dd-mit-group-head" style={{borderLeftColor:'#ef4444'}}><span className="dd-mit-group-icon">👤</span><div><div className="dd-mit-group-title">Manage User Risk</div><div className="dd-mit-group-risk" style={{color:readinessColor(selectedSite.userRisk)}}>{selectedSite.userRisk}% users unmonitored</div></div></div>
                        <div className="dd-mit-group-btns">
                          <button className="dd-mit-btn" onClick={() => setMitigationModal('irm-policy')}><span className="dd-mit-icon">🔍</span><div><div className="dd-mit-title">Configure IRM Policy</div><div className="dd-mit-sub">Monitor risky user behavior</div></div></button>
                          <button className="dd-mit-btn" onClick={() => setMitigationModal('adaptive-protection')}><span className="dd-mit-icon">🛡️</span><div><div className="dd-mit-title">Enable Adaptive Protection</div><div className="dd-mit-sub">Dynamic DLP based on risk level</div></div></button>
                        </div>
                      </div>
                      <div className="dd-mit-group">
                        <div className="dd-mit-group-head" style={{borderLeftColor:'#8b5cf6'}}><span className="dd-mit-group-icon">🤖</span><div><div className="dd-mit-group-title">Manage AI & Agent Risk</div><div className="dd-mit-group-risk" style={{color:readinessColor(selectedSite.aiAgentRisk)}}>{selectedSite.aiAgentRisk}% AI access uncontrolled</div></div></div>
                        <div className="dd-mit-group-btns">
                          <button className="dd-mit-btn" onClick={() => setMitigationModal('copilot-dlp-site')}><span className="dd-mit-icon">🔒</span><div><div className="dd-mit-title">Set Copilot DLP Controls</div><div className="dd-mit-sub">Restrict AI data processing</div></div></button>
                          <button className="dd-mit-btn" onClick={() => setMitigationModal('agent-monitoring')}><span className="dd-mit-icon">🔍</span><div><div className="dd-mit-title">Monitor Agent Access</div><div className="dd-mit-sub">Track AI agent interactions</div></div></button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* User access by org group */}
                <div className="dd-section">
                  <h4>👥 User Access by Group (30 days)</h4>
                  <div className="dd-group-list">
                    {selectedSite.groupAccess.map(ga => (
                      <div key={ga.group} className="dd-grp">
                        <span className="dd-grp-name">{ga.group}</span>
                        <div className="dd-grp-bar-w">
                          <div className="dd-grp-bar" style={{ width: `${(ga.users / selectedSite.groupAccess[0].users) * 100}%` }} />
                        </div>
                        <span className="dd-grp-n">{ga.users} users</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="dd-explore-site-btn" onClick={() => setExplorerSite(selectedSite)}>
                  📂 Explore Full Site — Folders &amp; Files
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    {/* Mitigation modal */}
    {mitigationModal && selectedSite && (
      <div className="dd-mit-overlay" onClick={() => setMitigationModal(null)}>
        <div className="dd-mit-modal" onClick={e => e.stopPropagation()}>
          <div className="dd-mit-modal-head">
            <h3>
              {mitigationModal === 'container-label' && '🏷️ Apply MIP Container Label'}
              {mitigationModal === 'label-in-cat' && '📄 Label In-Category Files'}
              {mitigationModal === 'ai-classify' && '🤖 AI-Native Classification'}
              {mitigationModal === 'risk-assessment' && '📋 Add to Data Risk Assessment'}
              {mitigationModal === 'perm-rightsizing' && '🤝 Launch Permissions Rightsizing'}
              {mitigationModal === 'perm-guardrails' && '🛡️ Create Permission Guardrails'}
              {mitigationModal === 'retention-policy' && '📋 Create Retention Policies'}
              {mitigationModal === 'dlp-activity' && '🛡️ Create DLP Policy'}
              {mitigationModal === 'dlp-alerts' && '🔔 Configure Activity Alerts'}
              {mitigationModal === 'irm-policy' && '🔍 Configure IRM Policy'}
              {mitigationModal === 'adaptive-protection' && '🛡️ Enable Adaptive Protection'}
              {mitigationModal === 'copilot-dlp-site' && '🔒 Set Copilot DLP Controls'}
              {mitigationModal === 'agent-monitoring' && '🔍 Monitor Agent Access'}
            </h3>
            <button className="dd-close" onClick={() => setMitigationModal(null)}>✕</button>
          </div>
          <div className="dd-mit-modal-body">
            <div className="dd-mit-site-tag">
              <span className="dd-mit-site-icon">📍</span>
              <div>
                <div className="dd-mit-site-name">{selectedSite.name}</div>
                <a className="dd-mit-site-url" href={selectedSite.url} target="_blank" rel="noopener noreferrer">{selectedSite.url}</a>
              </div>
            </div>

            {mitigationModal === 'container-label' && (
              <>
                <p>Apply a Microsoft Information Protection <strong>container label</strong> to the SharePoint site. This sets the default sensitivity for all new content and enforces access policies at the site level.</p>
                <div className="dd-mit-field">
                  <label>Select Sensitivity Label</label>
                  <div className="dd-mit-select">
                    {['Confidential', 'Highly Confidential', 'Restricted'].map(l => (
                      <button key={l} className="dd-mit-opt">{l}</button>
                    ))}
                  </div>
                </div>
                <div className="dd-mit-impact">
                  <div className="dd-mi"><span>📍 Site</span><strong>{selectedSite.name}</strong></div>
                  <div className="dd-mi"><span>📄 Total Docs</span><strong>{formatNumber(selectedSite.totalSiteDocs)}</strong></div>
                  <div className="dd-mi"><span>👥 Users</span><strong>{selectedSite.totalUsers}</strong></div>
                </div>
              </>
            )}

            {mitigationModal === 'label-in-cat' && (
              <>
                <p>Apply a sensitivity label to all <strong>{formatNumber(selectedSite.catDocs)}</strong> files in this site that belong to the <strong>{category.name}</strong> category. Files not in the category will remain unchanged.</p>
                <div className="dd-mit-field">
                  <label>Select Sensitivity Label</label>
                  <div className="dd-mit-select">
                    {['General', 'Confidential', 'Highly Confidential', 'Restricted'].map(l => (
                      <button key={l} className="dd-mit-opt">{l}</button>
                    ))}
                  </div>
                </div>
                <div className="dd-mit-impact">
                  <div className="dd-mi"><span>📄 Files to Label</span><strong>{formatNumber(selectedSite.catDocs)}</strong></div>
                  <div className="dd-mi"><span>📊 % of Site</span><strong>{selectedSite.pct}%</strong></div>
                  <div className="dd-mi"><span>⏱️ Est. Time</span><strong>~{Math.max(5, Math.round(selectedSite.catDocs / 10000))} min</strong></div>
                </div>
              </>
            )}

            {mitigationModal === 'risk-assessment' && (
              <>
                <p>Add <strong>{selectedSite.name}</strong> to a Purview DSPM Data Risk Assessment to evaluate oversharing, permissions sprawl, and Copilot exposure across this site.</p>
                <div className="dd-mit-field">
                  <label>Assessment</label>
                  <div className="dd-mit-select">
                    <button className="dd-mit-opt dd-mit-opt-active">📋 Q2 2026 Oversharing Review</button>
                    <button className="dd-mit-opt">📋 Copilot Readiness Assessment</button>
                    <button className="dd-mit-opt dd-mit-opt-new">+ Create New Assessment</button>
                  </div>
                </div>
                <div className="dd-mit-impact">
                  <div className="dd-mi"><span>📍 Site</span><strong>{selectedSite.name}</strong></div>
                  <div className="dd-mi"><span>📄 Docs in Scope</span><strong>{formatNumber(selectedSite.totalSiteDocs)}</strong></div>
                  <div className="dd-mi"><span>👥 Users</span><strong>{selectedSite.totalUsers}</strong></div>
                  <div className="dd-mi"><span>⏱️ Assessment</span><strong>3–5 days</strong></div>
                </div>
              </>
            )}

            {mitigationModal === 'ai-classify' && (
              <>
                <p>Run <strong>AI-Native Classification</strong> on all <strong>{formatNumber(selectedSite.totalSiteDocs)}</strong> documents in <strong>{selectedSite.name}</strong>. This leverages AI-native graders, Sensitive Information Types (SIT), and semantic classifiers to deliver highly accurate content classification.</p>
                <div className="dd-mit-steps">
                  <div className="dd-mit-step"><span className="dd-mit-step-n">1</span><div><strong>Semantic Analysis</strong><br/>AI graders analyze content meaning and context</div></div>
                  <div className="dd-mit-step"><span className="dd-mit-step-n">2</span><div><strong>SIT Detection</strong><br/>Sensitive Information Types scanned across all files</div></div>
                  <div className="dd-mit-step"><span className="dd-mit-step-n">3</span><div><strong>Auto-Label</strong><br/>Labels applied based on classification confidence scores</div></div>
                </div>
                <div className="dd-mit-impact">
                  <div className="dd-mi"><span>📄 Files to Scan</span><strong>{formatNumber(selectedSite.totalSiteDocs)}</strong></div>
                  <div className="dd-mi"><span>🏷️ Unlabeled</span><strong style={{color:readinessColor(selectedSite.classificationRisk)}}>{selectedSite.classificationRisk}%</strong></div>
                  <div className="dd-mi"><span>⏱️ Est. Time</span><strong>~{Math.max(10, Math.round(selectedSite.totalSiteDocs / 5000))} min</strong></div>
                </div>
              </>
            )}

            {mitigationModal === 'perm-rightsizing' && (
              <>
                <p>Launch an <strong>agent-driven permissions rightsizing campaign</strong> for <strong>{selectedSite.name}</strong>. AI agents will identify over-permissioned documents and reach out to document owners to correct excessive access.</p>
                <div className="dd-mit-steps">
                  <div className="dd-mit-step"><span className="dd-mit-step-n">1</span><div><strong>Identify Over-Permissions</strong><br/>Scan {formatNumber(selectedSite.totalSiteDocs)} files for excessive access grants</div></div>
                  <div className="dd-mit-step"><span className="dd-mit-step-n">2</span><div><strong>Owner Outreach</strong><br/>Agents contact document owners with specific remediation requests</div></div>
                  <div className="dd-mit-step"><span className="dd-mit-step-n">3</span><div><strong>Apply Corrections</strong><br/>Approved permission changes applied automatically</div></div>
                </div>
                <div className="dd-mit-impact">
                  <div className="dd-mi"><span>📄 Files in Scope</span><strong>{formatNumber(selectedSite.totalSiteDocs)}</strong></div>
                  <div className="dd-mi"><span>🔓 Overexposed</span><strong style={{color:readinessColor(selectedSite.exposureRisk)}}>{selectedSite.exposureRisk}%</strong></div>
                  <div className="dd-mi"><span>⏱️ Campaign</span><strong>7–14 days</strong></div>
                </div>
              </>
            )}

            {mitigationModal === 'perm-guardrails' && (
              <>
                <p>Create <strong>permission guardrails</strong> for <strong>{selectedSite.name}</strong> to continuously monitor for permission drift. When new oversharing is detected, alerts are raised and auto-mitigations can be triggered.</p>
                <div className="dd-mit-steps">
                  <div className="dd-mit-step"><span className="dd-mit-step-n">1</span><div><strong>Baseline Permissions</strong><br/>Capture current permission state as the baseline</div></div>
                  <div className="dd-mit-step"><span className="dd-mit-step-n">2</span><div><strong>Drift Detection</strong><br/>Continuous monitoring for permission changes that increase exposure</div></div>
                  <div className="dd-mit-step"><span className="dd-mit-step-n">3</span><div><strong>Auto-Remediation</strong><br/>Automated alerts and policy-driven rollbacks on drift</div></div>
                </div>
                <div className="dd-mit-impact">
                  <div className="dd-mi"><span>📍 Site</span><strong>{selectedSite.name}</strong></div>
                  <div className="dd-mi"><span>👥 Users</span><strong>{selectedSite.totalUsers}</strong></div>
                  <div className="dd-mi"><span>🔄 Monitoring</span><strong>Continuous</strong></div>
                </div>
              </>
            )}

            {mitigationModal === 'retention-policy' && (
              <>
                <p>Create <strong>data retention policies</strong> using Purview Data Lifecycle Management (DLM) for <strong>{selectedSite.name}</strong>. ROT content — files not accessed or edited in over 1 year — will be scheduled for deletion, reducing noise and risk.</p>
                <div className="dd-mit-field">
                  <label>Retention Action</label>
                  <div className="dd-mit-select">
                    <button className="dd-mit-opt dd-mit-opt-active">Delete files inactive for 1+ year</button>
                    <button className="dd-mit-opt">Move to archive after 1 year</button>
                    <button className="dd-mit-opt">Apply retention label and review</button>
                  </div>
                </div>
                <div className="dd-mit-impact">
                  <div className="dd-mi"><span>📄 ROT Files</span><strong>{formatNumber(Math.round(selectedSite.totalSiteDocs * selectedSite.governanceRisk / 100))}</strong></div>
                  <div className="dd-mi"><span>🗑️ ROT %</span><strong style={{color:readinessColor(selectedSite.governanceRisk)}}>{selectedSite.governanceRisk}%</strong></div>
                  <div className="dd-mi"><span>💾 Est. Savings</span><strong>~{Math.round(selectedSite.totalSiteDocs * selectedSite.governanceRisk / 100 / 1000)} GB</strong></div>
                </div>
              </>
            )}

            {mitigationModal === 'dlp-activity' && (
              <>
                <p>Create a <strong>DLP policy</strong> to cover exfiltration vectors for <strong>{selectedSite.name}</strong>. This protects against sensitive data leaving through downloads, external shares, USB transfers, and cloud uploads.</p>
                <div className="dd-mit-field">
                  <label>Exfiltration Vectors to Cover</label>
                  <div className="dd-mit-select">
                    <button className="dd-mit-opt dd-mit-opt-active">📥 Downloads & external sharing</button>
                    <button className="dd-mit-opt">💾 USB & removable media</button>
                    <button className="dd-mit-opt">☁️ Cloud upload destinations</button>
                    <button className="dd-mit-opt">📧 Email & messaging channels</button>
                  </div>
                </div>
                <div className="dd-mit-impact">
                  <div className="dd-mi"><span>📤 Activity Risk</span><strong style={{color:readinessColor(selectedSite.activityRisk)}}>{selectedSite.activityRisk}%</strong></div>
                  <div className="dd-mi"><span>📄 Docs in Scope</span><strong>{formatNumber(selectedSite.totalSiteDocs)}</strong></div>
                  <div className="dd-mi"><span>👥 Users</span><strong>{selectedSite.totalUsers}</strong></div>
                </div>
              </>
            )}

            {mitigationModal === 'dlp-alerts' && (
              <>
                <p>Configure <strong>activity alerts</strong> for <strong>{selectedSite.name}</strong> to notify security teams when sensitive data is moved, copied, or shared outside approved channels.</p>
                <div className="dd-mit-field">
                  <label>Alert Threshold</label>
                  <div className="dd-mit-select">
                    <button className="dd-mit-opt">🔴 High sensitivity only</button>
                    <button className="dd-mit-opt dd-mit-opt-active">🟡 Medium & high sensitivity</button>
                    <button className="dd-mit-opt">🟢 All sensitivity levels</button>
                  </div>
                </div>
                <div className="dd-mit-impact">
                  <div className="dd-mi"><span>📤 Activity Risk</span><strong style={{color:readinessColor(selectedSite.activityRisk)}}>{selectedSite.activityRisk}%</strong></div>
                  <div className="dd-mi"><span>📍 Site</span><strong>{selectedSite.name}</strong></div>
                  <div className="dd-mi"><span>🔔 Monitoring</span><strong>Real-time</strong></div>
                </div>
              </>
            )}

            {mitigationModal === 'irm-policy' && (
              <>
                <p>Configure an <strong>Insider Risk Management policy</strong> for <strong>{selectedSite.name}</strong> to monitor risky user behavior including unusual access patterns and data exfiltration attempts. Uses the Risky AI Usage template.</p>
                <div className="dd-mit-field">
                  <label>Policy Template</label>
                  <div className="dd-mit-select">
                    <button className="dd-mit-opt dd-mit-opt-active">🔍 Risky AI Usage</button>
                    <button className="dd-mit-opt">📤 Data Theft by Departing Users</button>
                    <button className="dd-mit-opt">⚠️ General Data Leaks</button>
                  </div>
                </div>
                <div className="dd-mit-impact">
                  <div className="dd-mi"><span>👤 User Risk</span><strong style={{color:readinessColor(selectedSite.userRisk)}}>{selectedSite.userRisk}%</strong></div>
                  <div className="dd-mi"><span>👥 Users</span><strong>{selectedSite.totalUsers}</strong></div>
                  <div className="dd-mi"><span>⏱️ Setup</span><strong>~30 min</strong></div>
                </div>
              </>
            )}

            {mitigationModal === 'adaptive-protection' && (
              <>
                <p>Enable <strong>Adaptive Protection</strong> for <strong>{selectedSite.name}</strong> to dynamically adjust DLP enforcement based on each user's insider risk level. High-risk users get stricter controls automatically.</p>
                <div className="dd-mit-field">
                  <label>Protection Level</label>
                  <div className="dd-mit-select">
                    <button className="dd-mit-opt dd-mit-opt-active">🛡️ Block high-risk users from sharing</button>
                    <button className="dd-mit-opt">⚠️ Warn elevated-risk users</button>
                    <button className="dd-mit-opt">📋 Audit all risk levels</button>
                  </div>
                </div>
                <div className="dd-mit-impact">
                  <div className="dd-mi"><span>👤 User Risk</span><strong style={{color:readinessColor(selectedSite.userRisk)}}>{selectedSite.userRisk}%</strong></div>
                  <div className="dd-mi"><span>📍 Site</span><strong>{selectedSite.name}</strong></div>
                  <div className="dd-mi"><span>🔄 Enforcement</span><strong>Dynamic</strong></div>
                </div>
              </>
            )}

            {mitigationModal === 'copilot-dlp-site' && (
              <>
                <p>Set <strong>Copilot DLP controls</strong> for <strong>{selectedSite.name}</strong> to restrict Microsoft Copilot and other AI services from processing sensitive data on this site.</p>
                <div className="dd-mit-field">
                  <label>Restriction Level</label>
                  <div className="dd-mit-select">
                    <button className="dd-mit-opt">🚫 Block all AI processing</button>
                    <button className="dd-mit-opt dd-mit-opt-active">🔒 Block for highly confidential content</button>
                    <button className="dd-mit-opt">📋 Audit AI access only</button>
                  </div>
                </div>
                <div className="dd-mit-impact">
                  <div className="dd-mi"><span>🤖 AI Risk</span><strong style={{color:readinessColor(selectedSite.aiAgentRisk)}}>{selectedSite.aiAgentRisk}%</strong></div>
                  <div className="dd-mi"><span>📄 Docs in Scope</span><strong>{formatNumber(selectedSite.totalSiteDocs)}</strong></div>
                  <div className="dd-mi"><span>🔒 Protection</span><strong>Immediate</strong></div>
                </div>
              </>
            )}

            {mitigationModal === 'agent-monitoring' && (
              <>
                <p>Enable <strong>agent access monitoring</strong> for <strong>{selectedSite.name}</strong> to track which AI agents and automated services access data on this site, with full audit trails.</p>
                <div className="dd-mit-field">
                  <label>Monitoring Scope</label>
                  <div className="dd-mit-select">
                    <button className="dd-mit-opt dd-mit-opt-active">🤖 All AI agents & Copilot</button>
                    <button className="dd-mit-opt">🔌 Third-party integrations</button>
                    <button className="dd-mit-opt">📊 Custom automation workflows</button>
                  </div>
                </div>
                <div className="dd-mit-impact">
                  <div className="dd-mi"><span>🤖 AI Risk</span><strong style={{color:readinessColor(selectedSite.aiAgentRisk)}}>{selectedSite.aiAgentRisk}%</strong></div>
                  <div className="dd-mi"><span>📍 Site</span><strong>{selectedSite.name}</strong></div>
                  <div className="dd-mi"><span>🔄 Monitoring</span><strong>Continuous</strong></div>
                </div>
              </>
            )}

            <div className="dd-mit-actions">
              <button className="dd-mit-apply">
                {mitigationModal === 'container-label' && 'Apply Container Label'}
                {mitigationModal === 'label-in-cat' && 'Apply Label to Files'}
                {mitigationModal === 'ai-classify' && 'Start AI Classification'}
                {mitigationModal === 'risk-assessment' && 'Add to Assessment'}
                {mitigationModal === 'perm-rightsizing' && 'Launch Campaign'}
                {mitigationModal === 'perm-guardrails' && 'Create Guardrails'}
                {mitigationModal === 'retention-policy' && 'Create Policy'}
                {mitigationModal === 'dlp-activity' && 'Create DLP Policy'}
                {mitigationModal === 'dlp-alerts' && 'Configure Alerts'}
                {mitigationModal === 'irm-policy' && 'Create IRM Policy'}
                {mitigationModal === 'adaptive-protection' && 'Enable Protection'}
                {mitigationModal === 'copilot-dlp-site' && 'Apply Controls'}
                {mitigationModal === 'agent-monitoring' && 'Enable Monitoring'}
              </button>
              <button className="dd-mit-cancel" onClick={() => setMitigationModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    )}
    {explorerSite && (
      <SiteExplorer site={explorerSite} category={category} onClose={() => setExplorerSite(null)} />
    )}
    <style>{`
      .dd-overlay {
        position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(10px);
        z-index:9999; display:flex; align-items:center; justify-content:center;
        animation:ddFadeIn .2s ease;
        font-family:'Segoe UI',system-ui,-apple-system,sans-serif; color:#e0e0f0;
      }
      @keyframes ddFadeIn { from{opacity:0} to{opacity:1} }
      .dd-container {
        background:linear-gradient(145deg, #0a0a18 0%, #0f0f24 100%);
        border:1px solid rgba(99,102,241,0.2); border-radius:18px;
        width:94vw; max-width:1400px; height:88vh; display:flex; flex-direction:column;
        box-shadow:0 24px 80px rgba(0,0,0,0.7);
        animation:ddScaleIn .25s ease; overflow:hidden;
      }
      @keyframes ddScaleIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
      .dd-header {
        display:flex; justify-content:space-between; align-items:flex-start;
        padding:18px 24px 12px; border-bottom:1px solid rgba(255,255,255,0.06); flex-shrink:0;
      }
      .dd-header-left h2 { font-size:17px; font-weight:700; margin:4px 0 2px; }
      .dd-header-left p { font-size:11px; color:#8888a0; margin:0; }
      .dd-cat-badge { font-size:10px; font-weight:600; padding:3px 10px; border-radius:6px; display:inline-block; }
      .dd-close {
        background:none; border:1px solid rgba(255,255,255,0.1); color:#6b6b80;
        width:28px; height:28px; border-radius:8px; cursor:pointer; font-size:14px;
        display:flex; align-items:center; justify-content:center; transition:all .15s;
      }
      .dd-close:hover { background:rgba(255,255,255,0.08); color:white; }

      /* Body: table left, detail right */
      .dd-body { flex:1; display:flex; gap:0; min-height:0; overflow:hidden; }

      /* Left: site table */
      .dd-main { flex:1.1; display:flex; flex-direction:column; min-width:0; border-right:1px solid rgba(255,255,255,0.06); }
      .dd-table-header { padding:12px 20px 8px; flex-shrink:0; }
      .dd-table-header h3 { font-size:13px; font-weight:600; margin:0; }
      .dd-table-wrap { flex:1; overflow-y:auto; padding:0 8px 12px 8px; }
      .dd-table { width:100%; border-collapse:collapse; font-size:11px; }
      .dd-table thead { position:sticky; top:0; z-index:2; }
      .dd-table th {
        background:rgba(10,10,24,0.98); padding:8px 12px; text-align:left;
        font-weight:600; color:#6b6b80; font-size:9px; text-transform:uppercase;
        letter-spacing:.4px; border-bottom:1px solid rgba(255,255,255,0.06);
      }
      .dd-table td { padding:9px 12px; border-bottom:1px solid rgba(255,255,255,0.03); }
      .dd-tr { cursor:pointer; transition:all .12s; }
      .dd-tr:hover { background:rgba(255,255,255,0.03); }
      .dd-tr-active { background:rgba(99,102,241,0.08) !important; }
      .dd-td-name { display:flex; align-items:center; gap:8px; font-weight:600; font-size:12px; white-space:nowrap; }
      .dd-site-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

      .dd-pct-cell { display:flex; align-items:center; gap:6px; justify-content:flex-end; }
      .dd-pct-bar-wrap { width:50px; height:5px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden; }
      .dd-pct-bar { height:100%; border-radius:3px; transition:width .5s ease; }
      .dd-pct-val { font-size:11px; font-weight:700; min-width:30px; text-align:right; }

      .dd-users-badge { font-size:11px; color:#a0a0b8; }
      .dd-sample-btn {
        background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.2);
        color:#a5b4fc; padding:3px 10px; border-radius:5px; font-size:10px;
        cursor:pointer; font-family:inherit; transition:all .15s;
      }
      .dd-sample-btn:hover { background:rgba(99,102,241,0.2); }

      /* Right: detail panel */
      .dd-detail { width:380px; flex-shrink:0; overflow-y:auto; padding:16px 20px; }
      .dd-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; }
      .dd-empty-icon { font-size:40px; margin-bottom:12px; opacity:0.3; }
      .dd-empty p { font-size:12px; color:#4a4a60; max-width:200px; line-height:1.5; }

      .dd-detail-head { margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.06); }
      .dd-detail-head h3 { font-size:14px; font-weight:700; margin:0 0 4px; }
      .dd-detail-stats { display:flex; flex-wrap:wrap; gap:4px; font-size:10px; color:#8888a0; }
      .dd-sep { color:#333; }

      .dd-section { margin-bottom:16px; }
      .dd-section h4 { font-size:11px; font-weight:600; margin:0 0 8px; }
      .dd-muted-title { color:#6b6b80 !important; }

      /* Group bars */
      .dd-group-list { display:flex; flex-direction:column; gap:5px; }
      .dd-grp { display:flex; align-items:center; gap:6px; }
      .dd-grp-name { font-size:10px; width:75px; color:#a0a0b8; flex-shrink:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .dd-grp-bar-w { flex:1; height:7px; background:rgba(255,255,255,0.04); border-radius:4px; overflow:hidden; }
      .dd-grp-bar { height:100%; background:linear-gradient(90deg,#6366f1,#8b5cf6); border-radius:4px; transition:width .4s ease; }
      .dd-grp-n { font-size:10px; color:#6b6b80; min-width:55px; text-align:right; white-space:nowrap; }

      /* File list */
      .dd-flist { display:flex; flex-direction:column; gap:3px; }
      .dd-files-section { flex:1; display:flex; flex-direction:column; min-height:0; }
      .dd-files-section .dd-flist { overflow-y:auto; max-height:none; }
      .dd-fitem {
        background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.04);
        border-radius:7px; cursor:pointer; transition:all .15s; overflow:hidden;
      }
      .dd-fitem:hover { border-color:rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); }
      .dd-fitem-active { border-color:rgba(99,102,241,0.3) !important; background:rgba(99,102,241,0.06) !important; }
      .dd-fitem-risk { border-left:2px solid rgba(239,68,68,0.4); }
      .dd-fitem-muted { cursor:default; opacity:0.5; }
      .dd-fitem-muted:hover { opacity:0.65; }

      .dd-fitem-top { display:flex; align-items:center; gap:6px; padding:7px 10px; font-size:11px; }
      .dd-fitem-icon { font-size:14px; flex-shrink:0; }
      .dd-fitem-name { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#c0c0d0; }
      .dd-fitem-users { font-size:10px; color:#8888a0; flex-shrink:0; }
      .dd-fitem-ai { font-size:11px; flex-shrink:0; }
      .dd-fitem-risk { font-size:10px; font-weight:700; flex-shrink:0; }

      /* File user access table */
      .dd-fusers { padding:4px 10px 8px; border-top:1px solid rgba(255,255,255,0.04); animation:ddSlide .15s ease; }
      @keyframes ddSlide { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
      .dd-fusers-head {
        display:grid; grid-template-columns:1fr 80px 65px 50px; gap:4px;
        font-size:8px; color:#4a4a60; text-transform:uppercase; letter-spacing:.4px;
        padding:4px 0; margin-bottom:2px; border-bottom:1px solid rgba(255,255,255,0.03);
      }
      .dd-fuser-row {
        display:grid; grid-template-columns:1fr 80px 65px 50px; gap:4px;
        font-size:10px; padding:3px 0; border-bottom:1px solid rgba(255,255,255,0.02);
      }
      .dd-fuser-row:last-child { border-bottom:none; }
      .dd-fu-name { color:#c0c0d0; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .dd-fu-group { color:#8b5cf6; font-size:9px; }
      .dd-fu-days { color:#6b6b80; }
      .dd-fu-acts { color:#a0a0b8; text-align:right; }

      .dd-flist-muted .dd-fitem { background:rgba(255,255,255,0.01); }

      /* Site info in detail panel */
      .dd-site-url {
        display:block; font-size:10px; color:#6366f1; text-decoration:none; margin:2px 0 8px;
        word-break:break-all;
      }
      .dd-site-url:hover { text-decoration:underline; color:#818cf8; }
      .dd-site-meta-grid { display:grid; grid-template-columns:1fr 1fr; gap:4px 12px; }
      .dd-meta-item { display:flex; flex-direction:column; padding:4px 0; }
      .dd-meta-lbl { font-size:8px; color:#4a4a60; text-transform:uppercase; letter-spacing:.4px; }
      .dd-meta-val { font-size:11px; color:#c0c0d0; font-weight:500; }

      /* AI Readiness in deep dive */
      .dd-readiness-list { display:flex; flex-direction:column; gap:4px; }
      .dd-rd { display:flex; align-items:center; gap:6px; }
      .dd-rd-lbl { font-size:10px; color:#8888a0; width:85px; flex-shrink:0; }
      .dd-rd-bar-w { flex:1; height:5px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden; }
      .dd-rd-bar { height:100%; border-radius:3px; transition:width .5s ease; }
      .dd-rd-v { font-size:11px; font-weight:700; min-width:32px; text-align:right; }
      .dd-rd-tip{position:relative;cursor:help}
      .dd-rd-tooltip{display:none;position:absolute;left:0;bottom:calc(100% + 6px);width:260px;padding:8px 12px;border-radius:7px;background:rgba(10,10,25,0.97);border:1px solid rgba(99,102,241,0.25);box-shadow:0 6px 20px rgba(0,0,0,0.5);font-size:10px;color:#c0c0d8;line-height:1.5;z-index:100;pointer-events:none}
      .dd-rd-tip:hover .dd-rd-tooltip{display:block}

      .dd-narrative{padding:10px 12px;border-radius:8px;background:linear-gradient(135deg,rgba(99,102,241,0.04),rgba(139,92,246,0.03));border:1px solid rgba(99,102,241,0.1)}
      .dd-narrative-header{display:flex;align-items:center;gap:5px;margin-bottom:6px}
      .dd-narrative-icon{font-size:14px}
      .dd-narrative-label{font-size:9px;font-weight:700;color:#8b5cf6;text-transform:uppercase;letter-spacing:0.5px}
      .dd-narrative-text{font-size:11px;color:#a0a0b8;line-height:1.6;margin:0}
      .dd-narrative .narrative-logs-link{display:inline-block;font-size:10px;color:#818cf8;text-decoration:none;margin-top:6px;font-weight:600;transition:color .15s}
      .dd-narrative .narrative-logs-link:hover{color:#a5b4fc;text-decoration:underline}

      /* Mitigation groups */
      .dd-mitigation { padding-bottom:8px; }
      .dd-mit-group { margin-bottom:10px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.04); border-radius:10px; padding:10px; }
      .dd-mit-group-head { display:flex; align-items:center; gap:8px; margin-bottom:8px; padding-left:8px; border-left:3px solid; }
      .dd-mit-group-icon { font-size:14px; }
      .dd-mit-group-title { font-size:11px; font-weight:700; color:#e0e0f0; }
      .dd-mit-group-risk { font-size:9px; font-weight:600; }
      .dd-mit-group-btns { display:grid; grid-template-columns:1fr 1fr; gap:4px; }
      .dd-mit-btn {
        display:flex; align-items:flex-start; gap:8px; padding:7px 9px;
        background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);
        border-radius:7px; cursor:pointer; transition:all .15s; text-align:left;
        font-family:inherit; color:#e0e0f0;
      }
      .dd-mit-btn:hover { background:rgba(99,102,241,0.08); border-color:rgba(99,102,241,0.2); }
      .dd-mit-icon { font-size:14px; flex-shrink:0; margin-top:1px; }
      .dd-mit-title { font-size:10px; font-weight:600; }
      .dd-mit-sub { font-size:8px; color:#6b6b80; margin-top:1px; }

      /* Mitigation modal */
      .dd-mit-overlay {
        position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(6px);
        z-index:10000; display:flex; align-items:center; justify-content:center;
        animation:ddFadeIn .15s ease;
      }
      .dd-mit-modal {
        background:#111128; border:1px solid rgba(99,102,241,0.25); border-radius:16px;
        width:480px; max-height:80vh; overflow-y:auto;
        box-shadow:0 20px 60px rgba(0,0,0,0.6); animation:ddScaleIn .2s ease;
      }
      .dd-mit-modal-head {
        display:flex; justify-content:space-between; align-items:center;
        padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.06);
      }
      .dd-mit-modal-head h3 { font-size:14px; font-weight:600; margin:0; }
      .dd-mit-modal-body { padding:16px 20px; }
      .dd-mit-modal-body p { font-size:12px; color:#a0a0b8; line-height:1.6; margin:0 0 14px; }
      .dd-mit-modal-body strong { color:#e0e0f0; }

      .dd-mit-site-tag {
        display:flex; gap:10px; align-items:center; padding:10px 12px; margin-bottom:14px;
        background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:8px;
      }
      .dd-mit-site-icon { font-size:18px; }
      .dd-mit-site-name { font-size:12px; font-weight:600; }
      .dd-mit-site-url { font-size:9px; color:#6366f1; text-decoration:none; }
      .dd-mit-site-url:hover { text-decoration:underline; }

      .dd-mit-field { margin-bottom:14px; }
      .dd-mit-field label { font-size:10px; color:#6b6b80; text-transform:uppercase; letter-spacing:.4px; display:block; margin-bottom:6px; }
      .dd-mit-select { display:flex; flex-direction:column; gap:4px; }
      .dd-mit-opt {
        padding:8px 12px; border-radius:7px; font-size:11px; font-weight:500;
        background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);
        color:#c0c0d0; cursor:pointer; transition:all .15s; text-align:left; font-family:inherit;
      }
      .dd-mit-opt:hover { background:rgba(99,102,241,0.08); border-color:rgba(99,102,241,0.2); }
      .dd-mit-opt-active { background:rgba(99,102,241,0.1); border-color:rgba(99,102,241,0.3); color:#a5b4fc; }
      .dd-mit-opt-new { color:#22c55e; border-style:dashed; }
      .dd-mit-opt-new:hover { background:rgba(34,197,94,0.08); border-color:rgba(34,197,94,0.25); }

      .dd-mit-impact { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:16px; }
      .dd-mi { flex:1; min-width:90px; text-align:center; padding:8px 6px; background:rgba(255,255,255,0.03); border-radius:7px; }
      .dd-mi span { display:block; font-size:9px; color:#6b6b80; margin-bottom:2px; }
      .dd-mi strong { font-size:13px; }

      .dd-mit-actions { display:flex; gap:8px; justify-content:flex-end; padding-top:12px; border-top:1px solid rgba(255,255,255,0.06); }
      .dd-mit-apply {
        padding:8px 20px; border-radius:8px; font-size:12px; font-weight:600;
        background:linear-gradient(135deg,#6366f1,#8b5cf6); border:none;
        color:white; cursor:pointer; font-family:inherit; transition:all .15s;
      }
      .dd-mit-apply:hover { opacity:0.9; }
      .dd-mit-cancel {
        padding:8px 16px; border-radius:8px; font-size:12px;
        background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
        color:#a0a0b8; cursor:pointer; font-family:inherit; transition:all .15s;
      }
      .dd-mit-cancel:hover { background:rgba(255,255,255,0.1); }

      .dd-mit-steps { display:flex; flex-direction:column; gap:8px; margin-bottom:14px; }
      .dd-mit-step { display:flex; gap:10px; align-items:flex-start; padding:8px; background:rgba(255,255,255,0.02); border-radius:7px; }
      .dd-mit-step-n { width:22px; height:22px; display:flex; align-items:center; justify-content:center; background:rgba(99,102,241,0.2); color:#a5b4fc; border-radius:50%; font-size:11px; font-weight:700; flex-shrink:0; }
      .dd-mit-step div { font-size:11px; color:#a0a0b8; line-height:1.4; }
      .dd-mit-step strong { color:#e0e0f0; }

      .dd-explore-site-btn {
        width:100%; padding:10px 14px; border-radius:8px; font-size:12px; font-weight:600;
        cursor:pointer; transition:all 0.2s; font-family:inherit; margin-bottom:12px;
        background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2);
        color:#86efac; text-align:center;
      }
      .dd-explore-site-btn:hover { background:rgba(34,197,94,0.15); border-color:rgba(34,197,94,0.4); color:white; }
      .last-scanned { font-size: 10px; color: #4a4a60; display: inline-flex; align-items: center; gap: 4px; }
      .dd-collapse-header{display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 0;transition:all .15s}
      .dd-collapse-header:hover{opacity:0.8}
      .dd-collapse-arrow{font-size:11px;color:#6b6b80;width:14px}
      .dd-collapse-header h4{font-size:11px;font-weight:600;margin:0;flex:1}
      .dd-collapse-hint{font-size:9px;color:#4a4a60}
      .dd-collapse-body{padding-top:8px;animation:ddCollapseIn .15s ease}
      @keyframes ddCollapseIn{from{opacity:0;max-height:0}to{opacity:1;max-height:800px}}
    `}</style>
    </>,
    document.body
  );
}

function fileIcon(type) {
  const icons = { xlsx: '📗', pptx: '📙', docx: '📘', pdf: '📕', vsdx: '📐', pbix: '📊', md: '📝', yaml: '⚙️', csv: '📋' };
  return icons[type] || '📄';
}

export default function CategoryView({ tier, onSelectCategory, onOpenTopicGraph }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);
  const [subdivided, setSubdivided] = useState({});
  const [subdividing, setSubdividing] = useState(null);
  const [deepDiveCat, setDeepDiveCat] = useState(null);
  const [quickAction, setQuickAction] = useState(null);
  const cats = useMemo(() => getCategoriesForTier(tier.id), [tier.id]);

  const handleCellClick = useCallback((cat) => {
    setTooltip(null);
    setSelectedCat(cat);
  }, []);

  const handleSubdivide = useCallback((catId) => {
    setSubdividing(catId);
    setTimeout(() => {
      setSubdivided(prev => ({ ...prev, [catId]: true }));
      setSubdividing(null);
    }, 2200);
  }, []);

  const handleExplore = useCallback((cat) => {
    onSelectCategory(cat);
  }, [onSelectCategory]);

  useEffect(() => {
    if (!containerRef.current) return;
    const W = containerRef.current.clientWidth;
    const H = containerRef.current.clientHeight;
    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');
    cats.forEach(c => {
      const lg = defs.append('linearGradient').attr('id', `tm-${c.id}`).attr('x1','0%').attr('y1','0%').attr('x2','100%').attr('y2','100%');
      lg.append('stop').attr('offset','0%').attr('stop-color', c.color).attr('stop-opacity', 0.25);
      lg.append('stop').attr('offset','100%').attr('stop-color', c.color).attr('stop-opacity', 0.08);
    });

    const hierarchy = d3.hierarchy({ children: cats })
      .sum(d => d.documentCount)
      .sort((a, b) => b.value - a.value);

    const treemap = d3.treemap()
      .size([W, H])
      .paddingOuter(4)
      .paddingInner(3)
      .round(true);

    treemap(hierarchy);

    const g = svg.append('g');

    const cells = g.selectAll('.tm-cell')
      .data(hierarchy.leaves())
      .join('g')
      .attr('class', 'tm-cell')
      .style('cursor', 'pointer');

    // Background rect with gradient
    cells.append('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => Math.max(0, d.x1 - d.x0))
      .attr('height', d => Math.max(0, d.y1 - d.y0))
      .attr('rx', 6)
      .attr('fill', d => `url(#tm-${d.data.id})`)
      .attr('stroke', d => d.data.color)
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.3)
      .style('transition', 'all 0.2s ease');

    // Icon, name, doc count per cell
    cells.each(function(d) {
      const w = d.x1 - d.x0;
      const h = d.y1 - d.y0;
      const cx = (d.x0 + d.x1) / 2;
      const cy = (d.y0 + d.y1) / 2;
      const cell = d3.select(this);

      if (w > 50 && h > 40) {
        cell.append('text')
          .attr('x', cx).attr('y', cy - (h > 80 ? 10 : 2))
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', Math.min(w * 0.2, h * 0.25, 28))
          .text(d.data.icon)
          .style('pointer-events', 'none');
      }

      if (w > 70 && h > 55) {
        const maxChars = Math.floor(w / 7);
        const name = d.data.name.length > maxChars ? d.data.name.slice(0, maxChars - 1) + '…' : d.data.name;
        cell.append('text')
          .attr('x', cx).attr('y', cy + 12)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', Math.min(11, w * 0.08))
          .attr('font-weight', 600)
          .attr('fill', 'white')
          .text(name)
          .style('pointer-events', 'none');
      }

      if (w > 80 && h > 70) {
        cell.append('text')
          .attr('x', cx).attr('y', cy + 26)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', 9)
          .attr('fill', 'rgba(255,255,255,0.5)')
          .text(`${formatNumber(d.data.documentCount)} docs · ${formatNumber(d.data.siteCount)} sites`)
          .style('pointer-events', 'none');
      }

      // Readiness risk bars in larger cells
      if (w > 110 && h > 95) {
        const barY = cy + 38;
        const barW = Math.min(w * 0.6, 80);
        const barH = 3;
        const barX = cx - barW / 2;
        const risks = [
          { val: d.data.classificationRisk, label: 'U' },
          { val: d.data.exposureRisk, label: 'E' },
          { val: d.data.governanceRisk, label: 'R' },
        ];
        risks.forEach((r, ri) => {
          const ry = barY + ri * 10;
          cell.append('rect').attr('x', barX).attr('y', ry).attr('width', barW).attr('height', barH).attr('rx', 1.5).attr('fill', 'rgba(255,255,255,0.06)').style('pointer-events', 'none');
          cell.append('rect').attr('x', barX).attr('y', ry).attr('width', barW * r.val / 100).attr('height', barH).attr('rx', 1.5).attr('fill', readinessColor(r.val)).attr('opacity', 0.8).style('pointer-events', 'none');
          cell.append('text').attr('x', barX + barW + 4).attr('y', ry + 2.5).attr('font-size', 7).attr('font-weight', 700).attr('fill', readinessColor(r.val)).attr('dominant-baseline', 'central').text(`${r.val}%`).style('pointer-events', 'none');
          cell.append('text').attr('x', barX - 3).attr('y', ry + 2.5).attr('font-size', 6).attr('fill', 'rgba(255,255,255,0.35)').attr('text-anchor', 'end').attr('dominant-baseline', 'central').text(r.label).style('pointer-events', 'none');
        });
      }
    });

    // Entrance animation
    cells.attr('opacity', 0)
      .transition().duration(500).delay((_, i) => i * 50)
      .attr('opacity', 1);

    // Interactions
    cells
      .on('mouseenter', function(event, d) {
        d3.select(this).select('rect')
          .transition().duration(150)
          .attr('stroke-width', 2).attr('stroke-opacity', 1);
        setHoveredId(d.data.id);
        const rect = containerRef.current.getBoundingClientRect();
        setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, data: d.data });
      })
      .on('mousemove', function(event) {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltip(p => p ? { ...p, x: event.clientX - rect.left, y: event.clientY - rect.top } : null);
      })
      .on('mouseleave', function() {
        d3.select(this).select('rect')
          .transition().duration(150)
          .attr('stroke-width', 1).attr('stroke-opacity', 0.3);
        setHoveredId(null);
        setTooltip(null);
      })
      .on('click', (_, d) => handleCellClick(d.data));

    return () => svg.selectAll('*').remove();
  }, [cats, handleCellClick]);

  return (
    <div className="cat-view">
      <div className="cat-top">
        <div>
          <h2><span style={{ color: tier.color }}>■</span> {tier.name}</h2>
          <p>{tier.sites.toLocaleString()} sites · {formatNumber(tier.totalDocs)} documents — Organized into {cats.length} topic categories by Posture Agent, sized by document volume</p>
          <span className="last-scanned">🔄 Last scanned: {lastScannedLabel}</span>
        </div>
      </div>

      <div className="cat-body">
        <div className="treemap-area" ref={containerRef}>
          <svg ref={svgRef} />
          {tooltip && !selectedCat && (
            <div className="cat-tooltip" style={{
              left: tooltip.x + 14, top: tooltip.y - 10,
              transform: tooltip.x > (containerRef.current?.clientWidth || 0) * 0.6 ? 'translateX(-105%)' : 'none',
            }}>
              <div className="ctt-head">
                <span className="ctt-icon">{tooltip.data.icon}</span>
                <div>
                  <div className="ctt-name">{tooltip.data.name}</div>
                </div>
              </div>
              <div className="ctt-stats">
                <div><span className="ctt-v">{formatNumber(tooltip.data.documentCount)}</span><span className="ctt-l">Documents</span></div>
                <div><span className="ctt-v">{formatNumber(tooltip.data.siteCount)}</span><span className="ctt-l">Sites</span></div>
              </div>
              <div className="ctt-readiness">
                <div className="ctt-ri"><span className="ctt-ri-lbl">Unlabeled</span><div className="ctt-ri-bar-w"><div className="ctt-ri-bar" style={{width:`${tooltip.data.classificationRisk}%`,background:readinessColor(tooltip.data.classificationRisk)}}/></div><span className="ctt-ri-v" style={{color:readinessColor(tooltip.data.classificationRisk)}}>{tooltip.data.classificationRisk}%</span></div>
                <div className="ctt-ri"><span className="ctt-ri-lbl">Overexposed</span><div className="ctt-ri-bar-w"><div className="ctt-ri-bar" style={{width:`${tooltip.data.exposureRisk}%`,background:readinessColor(tooltip.data.exposureRisk)}}/></div><span className="ctt-ri-v" style={{color:readinessColor(tooltip.data.exposureRisk)}}>{tooltip.data.exposureRisk}%</span></div>
                <div className="ctt-ri"><span className="ctt-ri-lbl">ROT</span><div className="ctt-ri-bar-w"><div className="ctt-ri-bar" style={{width:`${tooltip.data.governanceRisk}%`,background:readinessColor(tooltip.data.governanceRisk)}}/></div><span className="ctt-ri-v" style={{color:readinessColor(tooltip.data.governanceRisk)}}>{tooltip.data.governanceRisk}%</span></div>
              </div>

              <div className="ctt-cta">Click to view category details</div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="cat-side">
          {/* Selected category detail panel */}
          {selectedCat && (
            <div className="cat-panel cat-detail-panel" style={{ borderColor: selectedCat.color + '44' }}>
              <div className="cd-header">
                <span className="cd-icon">{selectedCat.icon}</span>
                <div>
                  <div className="cd-name">{selectedCat.name}</div>
                </div>
                <button className="cd-close" onClick={() => setSelectedCat(null)}>✕</button>
              </div>

              <div className="cd-stats">
                <div><span className="cd-v">{formatNumber(selectedCat.documentCount)}</span><span className="cd-l">Documents</span></div>
                <div><span className="cd-v">{formatNumber(selectedCat.siteCount)}</span><span className="cd-l">Sites</span></div>
              </div>

              <div className="cd-readiness">
                <div className="cd-ri">
                  <span className="cd-ri-lbl">🏷️ Unlabeled</span>
                  <div className="cd-ri-bar-w"><div className="cd-ri-bar" style={{width:`${selectedCat.classificationRisk}%`,background:readinessColor(selectedCat.classificationRisk)}}/></div>
                  <span className="cd-ri-v" style={{color:readinessColor(selectedCat.classificationRisk)}}>{selectedCat.classificationRisk}%</span>
                  <button className="cd-ri-action" onClick={() => setQuickAction({type:'label',cat:selectedCat})}>Label all →</button>
                </div>
                <div className="cd-ri">
                  <span className="cd-ri-lbl">🔓 Overexposed</span>
                  <div className="cd-ri-bar-w"><div className="cd-ri-bar" style={{width:`${selectedCat.exposureRisk}%`,background:readinessColor(selectedCat.exposureRisk)}}/></div>
                  <span className="cd-ri-v" style={{color:readinessColor(selectedCat.exposureRisk)}}>{selectedCat.exposureRisk}%</span>
                  <button className="cd-ri-action" onClick={() => setQuickAction({type:'permissions',cat:selectedCat})}>Review perms →</button>
                </div>
                <div className="cd-ri">
                  <span className="cd-ri-lbl">🗑️ ROT</span>
                  <div className="cd-ri-bar-w"><div className="cd-ri-bar" style={{width:`${selectedCat.governanceRisk}%`,background:readinessColor(selectedCat.governanceRisk)}}/></div>
                  <span className="cd-ri-v" style={{color:readinessColor(selectedCat.governanceRisk)}}>{selectedCat.governanceRisk}%</span>
                  <button className="cd-ri-action" onClick={() => setQuickAction({type:'retention',cat:selectedCat})}>Apply retention →</button>
                </div>
              </div>

              <div className="cd-aiclass-card">
                <div className="cd-aiclass-header">
                  <span className="cd-aiclass-badge">✨ AI-Native Classification</span>
                </div>
                <div className="cd-aiclass-stats">
                  <span className="cd-aiclass-stat"><strong>{selectedCat.sitsMatched}</strong> SITs matched</span>
                  <span className="cd-aiclass-stat cd-aiclass-ok">✅ {selectedCat.sitsAccurate} accurate</span>
                  <span className="cd-aiclass-stat cd-aiclass-up">⚡ {selectedCat.sitsUpgraded} → SmartSIT</span>
                </div>
                <div className="cd-aiclass-bars">
                  <div className="cd-aiclass-bar-row">
                    <span className="cd-aiclass-bar-lbl">Before</span>
                    <div className="cd-aiclass-bar-w"><div className="cd-aiclass-bar" style={{width:`${selectedCat.avgConfidenceBefore}%`,background:'#f97316'}}/></div>
                    <span className="cd-aiclass-bar-v" style={{color:'#f97316'}}>{selectedCat.avgConfidenceBefore}%</span>
                  </div>
                  <div className="cd-aiclass-bar-row">
                    <span className="cd-aiclass-bar-lbl">After</span>
                    <div className="cd-aiclass-bar-w"><div className="cd-aiclass-bar" style={{width:`${selectedCat.avgConfidenceAfter}%`,background:'#22c55e'}}/></div>
                    <span className="cd-aiclass-bar-v" style={{color:'#22c55e'}}>{selectedCat.avgConfidenceAfter}%</span>
                  </div>
                </div>
              </div>


              <div className="cd-narrative">
                <div className="cd-narrative-header">
                  <span className="cd-narrative-icon">✨</span>
                  <span className="cd-narrative-label">Posture Agent Insights</span>
                </div>
                <p className="cd-narrative-text">{getCategoryNarrative(selectedCat.name, selectedCat.documentCount, selectedCat.siteCount)}</p>
                <a className="narrative-logs-link" href="https://www.microsoft.com" target="_blank" rel="noopener noreferrer">View all activity logs →</a>
              </div>

              {/* Explore category deep dive */}
              <button className="cd-deepdive-btn" onClick={() => setDeepDiveCat(selectedCat)}>
                🔍 Explore Category — Sites, Files & Access
              </button>

              <div className="cd-subdivide-section">
                {subdivided[selectedCat.id] ? (
                  <>
                    <div className="cd-status cd-status-ready">
                      <span className="cd-status-icon">✓</span>
                      <span>Subcategories generated</span>
                    </div>
                    <button className="cd-explore-btn" onClick={() => handleExplore(selectedCat)}>
                      Explore Subcategories →
                    </button>
                  </>
                ) : subdividing === selectedCat.id ? (
                  <div className="cd-running">
                    <div className="cd-progress-wrap">
                      <div className="cd-progress-bar" />
                    </div>
                    <span className="cd-running-text">Analyzing documents and generating subcategories…</span>
                  </div>
                ) : (
                  <>
                    <p className="cd-subdivide-desc">
                      This category contains {formatNumber(selectedCat.documentCount)} documents. Run subcategorization to break it into finer-grained topic groups for deeper analysis.
                    </p>
                    <button className="cd-subdivide-btn" onClick={() => handleSubdivide(selectedCat.id)}>
                      ✨ Generate Subcategories with Posture Agent
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {deepDiveCat && (
        <CategoryDeepDive category={deepDiveCat} onClose={() => setDeepDiveCat(null)} />
      )}

      {quickAction && (
        <div className="cd-qa-overlay" onClick={() => setQuickAction(null)}>
          <div className="cd-qa-modal" onClick={e => e.stopPropagation()}>
            <div className="cd-qa-header">
              <h3>
                {quickAction.type === 'label' && '🏷️ Label All Unlabeled Content'}
                {quickAction.type === 'permissions' && '🔓 Launch Permissions Review'}
                {quickAction.type === 'retention' && '🗑️ Apply Retention Policy'}
              </h3>
              <button className="cd-qa-close" onClick={() => setQuickAction(null)}>✕</button>
            </div>
            <div className="cd-qa-body">
              <div className="cd-qa-scope">
                <span className="cd-qa-scope-icon">{quickAction.cat.icon}</span>
                <div>
                  <strong>{quickAction.cat.name}</strong>
                  <span>{formatNumber(quickAction.cat.documentCount)} documents across {formatNumber(quickAction.cat.siteCount)} sites</span>
                </div>
              </div>

              {quickAction.type === 'label' && (
                <>
                  <p>Choose how to label <strong>{formatNumber(Math.round(quickAction.cat.documentCount * quickAction.cat.classificationRisk / 100))}</strong> unlabeled files across {formatNumber(quickAction.cat.siteCount)} sites in <strong>{quickAction.cat.name}</strong>.</p>

                  <div className="cd-qa-option-cards">
                    <div className="cd-qa-option-card">
                      <div className="cd-qa-opt-header">
                        <span className="cd-qa-opt-icon">🏷️</span>
                        <div>
                          <strong>Apply an existing sensitivity label</strong>
                          <span className="cd-qa-opt-desc">Choose from your published labels to apply to all unlabeled files</span>
                        </div>
                      </div>
                      <div className="cd-qa-label-grid">
                        {['General', 'Confidential', 'Highly Confidential', 'Restricted'].map(l => (
                          <button key={l} className="cd-qa-label-btn">{l}</button>
                        ))}
                      </div>
                      <div className="cd-qa-impact">
                        <div><span>📄 Files to label</span><strong>{formatNumber(Math.round(quickAction.cat.documentCount * quickAction.cat.classificationRisk / 100))}</strong></div>
                        <div><span>📍 Sites affected</span><strong>{formatNumber(quickAction.cat.siteCount)}</strong></div>
                      </div>
                    </div>

                    <div className="cd-qa-option-divider"><span>OR</span></div>

                    <div className="cd-qa-option-card">
                      <div className="cd-qa-opt-header">
                        <span className="cd-qa-opt-icon">✨</span>
                        <div>
                          <strong>Create a classifier & auto-label</strong>
                          <span className="cd-qa-opt-desc">Build an AI classifier from this category's content and auto-apply labels based on classification confidence</span>
                        </div>
                      </div>
                      <div className="cd-qa-autolabel-steps">
                        <div className="cd-qa-al-step"><span className="cd-qa-al-num">1</span>Create a trainable classifier from <strong>{quickAction.cat.name}</strong> content</div>
                        <div className="cd-qa-al-step"><span className="cd-qa-al-num">2</span>Classifier evaluates all unlabeled files for match confidence</div>
                        <div className="cd-qa-al-step"><span className="cd-qa-al-num">3</span>Auto-apply labels when confidence exceeds threshold</div>
                      </div>
                      <button className="cd-qa-autolabel-btn">Create Classifier & Auto-Label →</button>
                    </div>
                  </div>
                </>
              )}
              {quickAction.type === 'permissions' && (
                <>
                  <p>Launch an agent-driven permissions review campaign for all <strong>{formatNumber(Math.round(quickAction.cat.documentCount * quickAction.cat.exposureRisk / 100))}</strong> overexposed files in this category. Site owners will be contacted to rightsize permissions.</p>
                  <div className="cd-qa-impact">
                    <div><span>📄 Files to review</span><strong>{formatNumber(Math.round(quickAction.cat.documentCount * quickAction.cat.exposureRisk / 100))}</strong></div>
                    <div><span>📍 Sites affected</span><strong>{formatNumber(quickAction.cat.siteCount)}</strong></div>
                    <div><span>⏱️ Campaign duration</span><strong>7–14 days</strong></div>
                  </div>
                </>
              )}
              {quickAction.type === 'retention' && (
                <>
                  <p>Apply a retention policy to all <strong>{formatNumber(Math.round(quickAction.cat.documentCount * quickAction.cat.governanceRisk / 100))}</strong> ROT files in this category that haven't been accessed in over a year. Files will be flagged for deletion after a 30-day review period.</p>
                  <div className="cd-qa-impact">
                    <div><span>🗑️ ROT files</span><strong>{formatNumber(Math.round(quickAction.cat.documentCount * quickAction.cat.governanceRisk / 100))}</strong></div>
                    <div><span>📍 Sites affected</span><strong>{formatNumber(quickAction.cat.siteCount)}</strong></div>
                    <div><span>⏱️ Review period</span><strong>30 days</strong></div>
                  </div>
                </>
              )}

              <div className="cd-qa-actions">
                <button className="cd-qa-apply" onClick={() => setQuickAction(null)}>
                  {quickAction.type === 'label' && 'Apply Labels'}
                  {quickAction.type === 'permissions' && 'Launch Campaign'}
                  {quickAction.type === 'retention' && 'Apply Retention'}
                </button>
                <button className="cd-qa-cancel" onClick={() => setQuickAction(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cat-view { height:100%; display:flex; flex-direction:column; padding:16px 24px; overflow:hidden; }
        .cat-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; flex-shrink:0; gap:16px; }
        .cat-top h2 { font-size:18px; font-weight:700; margin-bottom:2px; }
        .cat-top p { font-size:12px; color:#a0a0b8; }
        .cat-top-stats { display:flex; gap:10px; }

        .cat-body { flex:1; display:flex; gap:16px; min-height:0; }
        .treemap-area { flex:1; position:relative; min-width:0; }
        .treemap-area svg { width:100%; height:100%; }

        .cat-side { width:300px; flex-shrink:0; overflow-y:auto; display:flex; flex-direction:column; gap:12px; }
        .cat-panel { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:14px; }
        .cat-panel h4 { font-size:12px; font-weight:600; margin-bottom:10px; }

        /* Category detail panel */
        .cat-detail-panel { animation: cd-in 0.2s ease; }
        @keyframes cd-in { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

        .cd-header { display:flex; gap:10px; align-items:flex-start; margin-bottom:12px; }
        .cd-icon { font-size:26px; }
        .cd-name { font-size:14px; font-weight:700; margin-bottom:2px; }
        .cd-badge { font-size:10px; font-weight:700; padding:2px 8px; border-radius:8px; }
        .cd-close {
          margin-left:auto; background:none; border:1px solid rgba(255,255,255,0.1);
          color:#6b6b80; width:22px; height:22px; border-radius:6px; cursor:pointer;
          font-size:11px; display:flex; align-items:center; justify-content:center;
          transition:all 0.15s; flex-shrink:0;
        }
        .cd-close:hover { background:rgba(255,255,255,0.08); color:#c0c0d0; }

        .cd-stats { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:10px; }
        .cd-stats > div { text-align:center; padding:6px; background:rgba(255,255,255,0.04); border-radius:8px; }
        .cd-v { display:block; font-size:15px; font-weight:700; }
        .cd-l { font-size:8px; color:#6b6b80; text-transform:uppercase; letter-spacing:.3px; }

        .cd-narrative{margin-bottom:10px;padding:10px 12px;border-radius:8px;background:linear-gradient(135deg,rgba(99,102,241,0.04),rgba(139,92,246,0.03));border:1px solid rgba(99,102,241,0.1)}
        .cd-narrative-header{display:flex;align-items:center;gap:5px;margin-bottom:6px}
        .cd-narrative-icon{font-size:14px}
        .cd-narrative-label{font-size:9px;font-weight:700;color:#8b5cf6;text-transform:uppercase;letter-spacing:0.5px}
        .cd-narrative-text{font-size:11px;color:#a0a0b8;line-height:1.6;margin:0}
        .cd-narrative .narrative-logs-link{display:inline-block;font-size:10px;color:#818cf8;text-decoration:none;margin-top:6px;font-weight:600;transition:color .15s}
        .cd-narrative .narrative-logs-link:hover{color:#a5b4fc;text-decoration:underline}

        .cd-deepdive-btn {
          width:100%; padding:9px 14px; border-radius:8px; font-size:11px; font-weight:600;
          cursor:pointer; transition:all 0.2s; font-family:inherit; margin-bottom:10px;
          background:rgba(6,182,212,0.08); border:1px solid rgba(6,182,212,0.2);
          color:#67e8f9; text-align:center;
        }
        .cd-deepdive-btn:hover { background:rgba(6,182,212,0.15); border-color:rgba(6,182,212,0.4); color:white; }

        /* Readiness trio */
        .cd-readiness { display:flex; flex-direction:column; gap:4px; margin-bottom:10px; padding:8px 10px; background:rgba(255,255,255,0.02); border-radius:8px; border:1px solid rgba(255,255,255,0.04); }
        .cd-ri { display:flex; align-items:center; gap:6px; }
        .cd-ri-lbl { font-size:9px; color:#8888a0; width:80px; flex-shrink:0; }
        .cd-ri-bar-w { flex:1; height:4px; background:rgba(255,255,255,0.06); border-radius:2px; overflow:hidden; }
        .cd-ri-bar { height:100%; border-radius:2px; transition:width .5s ease; }
        .cd-ri-v { font-size:10px; font-weight:700; min-width:30px; text-align:right; }
        .cd-ri-action{font-size:8px;padding:2px 8px;border-radius:4px;border:1px solid rgba(99,102,241,0.2);background:rgba(99,102,241,0.06);color:#a5b4fc;cursor:pointer;font-family:inherit;transition:all .12s;white-space:nowrap;margin-left:4px;flex-shrink:0}
        .cd-ri-action:hover{background:rgba(99,102,241,0.15);border-color:rgba(99,102,241,0.4);color:white}

        .cd-aiclass-card{margin-bottom:10px;padding:10px 12px;border-radius:8px;background:rgba(139,92,246,0.04);border:1px dashed rgba(139,92,246,0.2)}
        .cd-aiclass-header{margin-bottom:6px}
        .cd-aiclass-badge{font-size:9px;font-weight:700;color:#a78bfa;text-transform:uppercase;letter-spacing:0.4px}
        .cd-aiclass-stats{display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap}
        .cd-aiclass-stat{font-size:10px;color:#8888a0}
        .cd-aiclass-stat strong{color:#e0e0f0}
        .cd-aiclass-ok{color:#22c55e}
        .cd-aiclass-up{color:#a78bfa}
        .cd-aiclass-bars{display:flex;flex-direction:column;gap:4px}
        .cd-aiclass-bar-row{display:flex;align-items:center;gap:6px}
        .cd-aiclass-bar-lbl{font-size:9px;color:#6b6b80;width:40px}
        .cd-aiclass-bar-w{flex:1;height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden}
        .cd-aiclass-bar{height:100%;border-radius:2px;transition:width .5s ease}
        .cd-aiclass-bar-v{font-size:10px;font-weight:700;min-width:28px;text-align:right}

        .cd-qa-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);z-index:1000;display:flex;align-items:center;justify-content:center;animation:cdQaIn .15s ease}
        @keyframes cdQaIn{from{opacity:0}to{opacity:1}}
        .cd-qa-modal{background:#13132a;border:1px solid rgba(99,102,241,0.25);border-radius:14px;width:460px;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.5);animation:cdQaScale .2s ease}
        @keyframes cdQaScale{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
        .cd-qa-header{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06)}
        .cd-qa-header h3{font-size:14px;font-weight:600;margin:0}
        .cd-qa-close{background:none;border:1px solid rgba(255,255,255,0.1);color:#6b6b80;width:24px;height:24px;border-radius:6px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .cd-qa-close:hover{background:rgba(255,255,255,0.08);color:white}
        .cd-qa-body{padding:16px 20px}
        .cd-qa-body p{font-size:12px;color:#a0a0b8;line-height:1.6;margin:0 0 14px}
        .cd-qa-body strong{color:#e0e0f0}
        .cd-qa-scope{display:flex;gap:10px;align-items:center;padding:10px 12px;margin-bottom:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px}
        .cd-qa-scope-icon{font-size:22px}
        .cd-qa-scope strong{display:block;font-size:13px;font-weight:600;color:#e0e0f0}
        .cd-qa-scope span{font-size:10px;color:#6b6b80}
        .cd-qa-impact{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
        .cd-qa-impact>div{flex:1;min-width:100px;text-align:center;padding:8px 6px;background:rgba(255,255,255,0.03);border-radius:7px}
        .cd-qa-impact span{display:block;font-size:9px;color:#6b6b80;margin-bottom:2px}
        .cd-qa-impact strong{font-size:13px;color:#e0e0f0}
        .cd-qa-actions{display:flex;gap:8px;justify-content:flex-end;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06)}
        .cd-qa-apply{padding:8px 18px;border-radius:8px;font-size:12px;font-weight:600;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;color:white;cursor:pointer;font-family:inherit;transition:all .15s}
        .cd-qa-apply:hover{opacity:0.9}
        .cd-qa-cancel{padding:8px 14px;border-radius:8px;font-size:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#a0a0b8;cursor:pointer;font-family:inherit;transition:all .15s}
        .cd-qa-cancel:hover{background:rgba(255,255,255,0.1)}

        /* Label option cards */
        .cd-qa-option-cards{display:flex;flex-direction:column;gap:0}
        .cd-qa-option-card{padding:16px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);transition:all .2s}
        .cd-qa-option-card:hover{background:rgba(255,255,255,0.05);border-color:rgba(99,102,241,0.15)}
        .cd-qa-opt-header{display:flex;gap:10px;align-items:flex-start;margin-bottom:12px}
        .cd-qa-opt-icon{font-size:20px}
        .cd-qa-opt-header strong{font-size:13px;color:#e0e0f0;display:block}
        .cd-qa-opt-desc{font-size:11px;color:#6b6b80;display:block;margin-top:2px}
        .cd-qa-label-grid{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
        .cd-qa-label-btn{padding:7px 16px;border-radius:7px;font-size:12px;font-weight:600;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#c0c0d8;cursor:pointer;font-family:inherit;transition:all .15s}
        .cd-qa-label-btn:hover{background:rgba(99,102,241,0.12);border-color:#6366f1;color:#e0e0ff;box-shadow:0 0 10px rgba(99,102,241,0.15)}
        .cd-qa-option-divider{display:flex;align-items:center;gap:12px;padding:8px 0}
        .cd-qa-option-divider::before,.cd-qa-option-divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,0.06)}
        .cd-qa-option-divider span{font-size:10px;color:#4a4a60;font-weight:600;text-transform:uppercase;letter-spacing:1px}
        .cd-qa-autolabel-steps{display:flex;flex-direction:column;gap:8px;margin-bottom:14px}
        .cd-qa-al-step{display:flex;align-items:flex-start;gap:10px;font-size:12px;color:#a0a0b8;line-height:1.4}
        .cd-qa-al-step strong{color:#c8c8e0}
        .cd-qa-al-num{width:20px;height:20px;border-radius:50%;background:rgba(99,102,241,0.15);color:#818cf8;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .cd-qa-autolabel-btn{padding:9px 18px;border-radius:8px;font-size:12px;font-weight:600;background:linear-gradient(135deg,rgba(139,92,246,0.15),rgba(99,102,241,0.15));border:1px solid rgba(139,92,246,0.3);color:#c4b5fd;cursor:pointer;font-family:inherit;transition:all .15s}
        .cd-qa-autolabel-btn:hover{background:linear-gradient(135deg,rgba(139,92,246,0.25),rgba(99,102,241,0.25));color:white;border-color:#8b5cf6}

        /* Tooltip readiness */
        .ctt-readiness { display:flex; flex-direction:column; gap:3px; margin-bottom:8px; padding:6px 8px; background:rgba(255,255,255,0.02); border-radius:6px; }
        .ctt-ri { display:flex; align-items:center; gap:5px; }
        .ctt-ri-lbl { font-size:8px; color:#6b6b80; width:60px; flex-shrink:0; text-transform:uppercase; letter-spacing:.3px; }
        .ctt-ri-bar-w { flex:1; height:3px; background:rgba(255,255,255,0.06); border-radius:2px; overflow:hidden; }
        .ctt-ri-bar { height:100%; border-radius:2px; }
        .ctt-ri-v { font-size:9px; font-weight:700; min-width:26px; text-align:right; }


        .cd-subdivide-section { border-top:1px solid rgba(255,255,255,0.06); padding-top:12px; }
        .cd-subdivide-desc { font-size:11px; color:#8888a0; line-height:1.5; margin-bottom:12px; }

        .cd-subdivide-btn {
          width:100%; padding:10px 16px; border-radius:8px; font-size:12px; font-weight:600;
          cursor:pointer; transition:all 0.2s; font-family:inherit;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
          color:#a0a0b8; display:flex; align-items:center; justify-content:center; gap:6px;
        }
        .cd-subdivide-btn:hover { background:rgba(99,102,241,0.1); border-color:rgba(99,102,241,0.3); color:#c8c8e0; }

        .cd-running { text-align:center; }
        .cd-progress-wrap { width:100%; height:4px; background:rgba(255,255,255,0.06); border-radius:2px; overflow:hidden; margin-bottom:10px; }
        .cd-progress-bar {
          height:100%; width:0%; border-radius:2px;
          background:linear-gradient(90deg, #6366f1, #8b5cf6);
          animation:cd-progress 2.2s ease-in-out forwards;
        }
        @keyframes cd-progress { 0%{width:0%} 20%{width:15%} 50%{width:55%} 80%{width:85%} 100%{width:100%} }
        .cd-running-text { font-size:11px; color:#8b5cf6; }

        .cd-status { display:flex; align-items:center; gap:6px; margin-bottom:10px; padding:6px 10px; border-radius:6px; font-size:11px; font-weight:600; }
        .cd-status-ready { background:rgba(34,197,94,0.08); color:#22c55e; }
        .cd-status-icon { font-size:13px; }

        .cd-explore-btn {
          width:100%; padding:10px 16px; border-radius:8px; font-size:12px; font-weight:600;
          cursor:pointer; transition:all 0.2s; font-family:inherit;
          background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15));
          border:1px solid rgba(99,102,241,0.3); color:#a5b4fc;
        }
        .cd-explore-btn:hover { background:linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25)); border-color:#8b5cf6; color:white; }

        /* Remediation section */
        .cd-remediation-section { border-top:1px solid rgba(255,255,255,0.06); padding-top:12px; margin-top:12px; }
        .cd-rem-title { font-size:11px; font-weight:600; margin-bottom:4px; color:#e0e0f0; text-transform:uppercase; letter-spacing:0.3px; }
        .cd-rem-desc { font-size:10px; color:#6b6b80; line-height:1.5; margin-bottom:10px; }
        .cd-rem-buttons { display:flex; flex-direction:column; gap:6px; }
        .cd-rem-btn {
          display:flex; align-items:center; gap:10px; width:100%; padding:10px 12px;
          border-radius:8px; cursor:pointer; transition:all 0.2s; font-family:inherit;
          border:1px solid; text-align:left;
        }
        .cd-rem-label { background:rgba(139,92,246,0.08); border-color:rgba(139,92,246,0.2); }
        .cd-rem-label:hover { background:rgba(139,92,246,0.15); border-color:rgba(139,92,246,0.4); }
        .cd-rem-campaign { background:rgba(34,197,94,0.06); border-color:rgba(34,197,94,0.15); }
        .cd-rem-campaign:hover { background:rgba(34,197,94,0.12); border-color:rgba(34,197,94,0.3); }
        .cd-rem-icon { font-size:18px; flex-shrink:0; }
        .cd-rem-btn-title { font-size:11px; font-weight:600; color:#e0e0f0; }
        .cd-rem-label .cd-rem-btn-title { color:#c4b5fd; }
        .cd-rem-campaign .cd-rem-btn-title { color:#86efac; }
        .cd-rem-btn-sub { font-size:9px; color:#6b6b80; margin-top:1px; }

        /* Tooltip */
        .cat-tooltip {
          position:absolute; background:rgba(12,12,25,0.95); backdrop-filter:blur(20px);
          border:1px solid rgba(99,102,241,0.25); border-radius:12px; padding:14px;
          pointer-events:none; z-index:100; min-width:250px;
          box-shadow:0 8px 32px rgba(0,0,0,0.5); animation:ct-in .15s ease;
        }
        @keyframes ct-in { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .ctt-head { display:flex; gap:10px; align-items:flex-start; margin-bottom:10px; }
        .ctt-icon { font-size:22px; }
        .ctt-name { font-size:13px; font-weight:600; }
        .ctt-badge { font-size:10px; font-weight:700; padding:2px 8px; border-radius:8px; }
        .ctt-stats { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px; }
        .ctt-stats > div { text-align:center; padding:5px; background:rgba(255,255,255,0.04); border-radius:6px; }
        .ctt-v { display:block; font-size:14px; font-weight:700; }
        .ctt-l { font-size:8px; color:#6b6b80; text-transform:uppercase; letter-spacing:.3px; }
        .ctt-cta { text-align:center; font-size:10px; color:#8b5cf6; font-weight:500; padding-top:6px; border-top:1px solid rgba(255,255,255,0.06); }

        /* Action Modal */
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(8px); z-index:1000; display:flex; align-items:center; justify-content:center; animation:mo-in .2s ease; }
        @keyframes mo-in { from{opacity:0} to{opacity:1} }
        .modal-box { background:#13132a; border:1px solid rgba(99,102,241,0.25); border-radius:16px; width:540px; max-height:80vh; overflow-y:auto; box-shadow:0 20px 60px rgba(0,0,0,0.5); animation:mb-in .25s ease; }
        @keyframes mb-in { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
        .modal-header { display:flex; justify-content:space-between; align-items:center; padding:18px 20px; border-bottom:1px solid rgba(255,255,255,0.06); }
        .modal-header h3 { font-size:15px; font-weight:600; }
        .modal-close { background:none; border:none; color:#6b6b80; font-size:20px; cursor:pointer; }
        .modal-close:hover { color:white; }
        .modal-body { padding:20px; }
        .modal-body p { font-size:13px; color:#b0b0c8; line-height:1.6; margin-bottom:16px; }
        .modal-steps { display:flex; flex-direction:column; gap:10px; margin-bottom:16px; }
        .ms { display:flex; gap:12px; align-items:flex-start; padding:10px; background:rgba(255,255,255,0.03); border-radius:8px; }
        .ms-num { width:24px; height:24px; display:flex; align-items:center; justify-content:center; background:rgba(99,102,241,0.2); color:#a5b4fc; border-radius:50%; font-size:12px; font-weight:700; flex-shrink:0; }
        .ms div { font-size:12px; color:#a0a0b8; line-height:1.4; }
        .ms strong { color:#e0e0f0; }
        .modal-impact { display:flex; gap:8px; margin-bottom:18px; }
        .mi { flex:1; text-align:center; padding:8px; background:rgba(255,255,255,0.04); border-radius:8px; }
        .mi span { display:block; font-size:10px; color:#6b6b80; margin-bottom:2px; }
        .mi strong { font-size:14px; }
        .modal-actions { display:flex; gap:10px; justify-content:flex-end; padding-top:12px; border-top:1px solid rgba(255,255,255,0.06); }
        .modal-btn { padding:8px 20px; border-radius:8px; font-size:13px; font-family:inherit; cursor:pointer; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#e0e0f0; transition:all .2s; }
        .modal-btn:hover { background:rgba(255,255,255,0.1); }
        .modal-btn.primary { background:linear-gradient(135deg,#6366f1,#8b5cf6); border:none; color:white; font-weight:600; }
        .modal-btn.primary:hover { opacity:0.9; }
        .last-scanned { font-size: 10px; color: #4a4a60; display: inline-flex; align-items: center; gap: 4px; }
      `}</style>
    </div>
  );
}

