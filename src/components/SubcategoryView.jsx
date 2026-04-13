import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import * as d3 from 'd3';
import { getSubcategories, getCategorySiteBreakdown, formatNumber, readinessColor, lastScannedLabel, getSubcategoryNarrative, getSiteNarrative } from '../data/mockData';
import SiteExplorer from './SiteExplorer';

function SubcategoryDeepDive({ subcategory, category, onClose }) {
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mitigationModal, setMitigationModal] = useState(null);
  const [explorerSite, setExplorerSite] = useState(null);
  const sites = useMemo(() => getCategorySiteBreakdown(subcategory.id, subcategory.documentCount, subcategory.siteCount), [subcategory]);

  return createPortal(
    <>
    <div className="dd-overlay" onClick={onClose}>
      <div className="dd-container" onClick={e => e.stopPropagation()}>
        <div className="dd-header">
          <div className="dd-header-left">
            <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:4}}>
              <span className="dd-cat-badge" style={{ background: category.color + '22', color: category.color }}>{category.icon} {category.name}</span>
              <span style={{color:'#4a4a60',fontSize:11}}>›</span>
              <span style={{fontSize:11,color:'#a0a0b8'}}>{subcategory.name}</span>
            </div>
            <h2>Subcategory Deep Dive</h2>
            <p>{formatNumber(subcategory.documentCount)} documents from {sites.length} sites</p>
            <span className="last-scanned">🔄 Last scanned: {lastScannedLabel}</span>
          </div>
          <button className="dd-close" onClick={onClose}>✕</button>
        </div>

        <div className="dd-body">
          <div className="dd-main">
            <div className="dd-table-header"><h3>📍 Sites Contributing to This Subcategory</h3></div>
            <div className="dd-table-wrap">
              <table className="dd-table">
                <thead>
                  <tr>
                    <th>Site Name</th>
                    <th style={{textAlign:'right'}}>Docs in Subcategory</th>
                    <th style={{textAlign:'right'}}>Total Site Docs</th>
                    <th style={{textAlign:'right'}}>% in Subcategory</th>
                    <th style={{textAlign:'right'}}>Users (30d)</th>
                    <th style={{textAlign:'center'}}>Files</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map(site => (
                    <tr key={site.id} className={`dd-tr ${selectedSite?.id === site.id ? 'dd-tr-active' : ''}`} onClick={() => { setSelectedSite(site); setSelectedFile(null); }}>
                      <td className="dd-td-name"><span className="dd-site-dot" style={{ background: category.color }} />{site.name}</td>
                      <td style={{textAlign:'right',fontWeight:600}}>{formatNumber(site.catDocs)}</td>
                      <td style={{textAlign:'right',color:'#6b6b80'}}>{formatNumber(site.totalSiteDocs)}</td>
                      <td style={{textAlign:'right'}}>
                        <div className="dd-pct-cell">
                          <div className="dd-pct-bar-wrap"><div className="dd-pct-bar" style={{ width: `${site.pct}%`, background: site.pct > 50 ? '#f97316' : category.color }} /></div>
                          <span className="dd-pct-val" style={{ color: site.pct > 50 ? '#f97316' : '#a0a0b8' }}>{site.pct}%</span>
                        </div>
                      </td>
                      <td style={{textAlign:'right'}}><span className="dd-users-badge">👥 {site.totalUsers}</span></td>
                      <td style={{textAlign:'center'}}><button className="dd-sample-btn">View ›</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dd-detail">
            {!selectedSite ? (
              <div className="dd-empty"><div className="dd-empty-icon">📂</div><p>Select a site to view details, files, and user access</p></div>
            ) : (
              <>
                <div className="dd-detail-head">
                  <h3>{selectedSite.name}</h3>
                  <a className="dd-site-url" href={selectedSite.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>{selectedSite.url} ↗</a>
                  <div className="dd-site-meta-grid">
                    <div className="dd-meta-item"><span className="dd-meta-lbl">Admin</span><span className="dd-meta-val">{selectedSite.admin}</span></div>
                    <div className="dd-meta-item"><span className="dd-meta-lbl">Created</span><span className="dd-meta-val">{selectedSite.createdDate}</span></div>
                    <div className="dd-meta-item"><span className="dd-meta-lbl">In Subcategory</span><span className="dd-meta-val">{formatNumber(selectedSite.catDocs)} docs ({selectedSite.pct}%)</span></div>
                    <div className="dd-meta-item"><span className="dd-meta-lbl">Total Docs</span><span className="dd-meta-val">{formatNumber(selectedSite.totalSiteDocs)}</span></div>
                    <div className="dd-meta-item"><span className="dd-meta-lbl">Users (30d)</span><span className="dd-meta-val">👥 {selectedSite.totalUsers}</span></div>
                    <div className="dd-meta-item"><span className="dd-meta-lbl">Org Groups</span><span className="dd-meta-val">{selectedSite.groupAccess.length}</span></div>
                  </div>
                </div>

                <div className="dd-section">
                  <h4>🎯 AI Readiness</h4>
                  <div className="dd-readiness-list">
                    <div className="dd-rd"><span className="dd-rd-lbl">🏷️ Unlabeled</span><div className="dd-rd-bar-w"><div className="dd-rd-bar" style={{width:`${selectedSite.classificationRisk}%`,background:readinessColor(selectedSite.classificationRisk)}}/></div><span className="dd-rd-v" style={{color:readinessColor(selectedSite.classificationRisk)}}>{selectedSite.classificationRisk}%</span></div>
                    <div className="dd-rd"><span className="dd-rd-lbl">🔓 Overexposed</span><div className="dd-rd-bar-w"><div className="dd-rd-bar" style={{width:`${selectedSite.exposureRisk}%`,background:readinessColor(selectedSite.exposureRisk)}}/></div><span className="dd-rd-v" style={{color:readinessColor(selectedSite.exposureRisk)}}>{selectedSite.exposureRisk}%</span></div>
                    <div className="dd-rd"><span className="dd-rd-lbl">🗑️ ROT</span><div className="dd-rd-bar-w"><div className="dd-rd-bar" style={{width:`${selectedSite.governanceRisk}%`,background:readinessColor(selectedSite.governanceRisk)}}/></div><span className="dd-rd-v" style={{color:readinessColor(selectedSite.governanceRisk)}}>{selectedSite.governanceRisk}%</span></div>
                  </div>
                </div>

                <div className="dd-section">
                  <div className="dd-narrative">
                    <div className="dd-narrative-header">
                      <span className="dd-narrative-icon">✨</span>
                      <span className="dd-narrative-label">Security Copilot Insights</span>
                    </div>
                    <p className="dd-narrative-text">{getSiteNarrative(selectedSite.name, selectedSite.totalSiteDocs, selectedSite.totalUsers)}</p>
                    <a className="narrative-logs-link" href="https://www.microsoft.com" target="_blank" rel="noopener noreferrer">View all activity logs →</a>
                  </div>
                </div>

                <div className="dd-section dd-mitigation">
                  <div className="dd-mit-group">
                    <div className="dd-mit-group-head" style={{borderLeftColor:'#8b5cf6'}}><span className="dd-mit-group-icon">🏷️</span><div><div className="dd-mit-group-title">Manage Unlabeled Content</div><div className="dd-mit-group-risk" style={{color:readinessColor(selectedSite.classificationRisk)}}>{selectedSite.classificationRisk}% unlabeled</div></div></div>
                    <div className="dd-mit-group-btns">
                      <button className="dd-mit-btn" onClick={() => setMitigationModal('container-label')}><span className="dd-mit-icon">🏷️</span><div><div className="dd-mit-title">Apply MIP Container Label</div><div className="dd-mit-sub">Set sensitivity label on SPO site</div></div></button>
                      <button className="dd-mit-btn" onClick={() => setMitigationModal('label-in-cat')}><span className="dd-mit-icon">📄</span><div><div className="dd-mit-title">Label In-Subcategory Files</div><div className="dd-mit-sub">{formatNumber(selectedSite.catDocs)} files</div></div></button>
                      <button className="dd-mit-btn" onClick={() => setMitigationModal('ai-classify')}><span className="dd-mit-icon">🤖</span><div><div className="dd-mit-title">AI-Native Classification</div><div className="dd-mit-sub">Graders, SIT & semantic classifiers</div></div></button>
                    </div>
                  </div>
                  <div className="dd-mit-group">
                    <div className="dd-mit-group-head" style={{borderLeftColor:'#f97316'}}><span className="dd-mit-group-icon">🔓</span><div><div className="dd-mit-group-title">Manage Overexposed Content</div><div className="dd-mit-group-risk" style={{color:readinessColor(selectedSite.exposureRisk)}}>{selectedSite.exposureRisk}% overexposed</div></div></div>
                    <div className="dd-mit-group-btns">
                      <button className="dd-mit-btn" onClick={() => setMitigationModal('risk-assessment')}><span className="dd-mit-icon">📋</span><div><div className="dd-mit-title">Add to Data Risk Assessment</div><div className="dd-mit-sub">Purview DSPM oversharing review</div></div></button>
                      <button className="dd-mit-btn" onClick={() => setMitigationModal('perm-rightsizing')}><span className="dd-mit-icon">🤝</span><div><div className="dd-mit-title">Launch Permissions Rightsizing</div><div className="dd-mit-sub">Agent-driven owner outreach</div></div></button>
                      <button className="dd-mit-btn" onClick={() => setMitigationModal('perm-guardrails')}><span className="dd-mit-icon">🛡️</span><div><div className="dd-mit-title">Create Permission Guardrails</div><div className="dd-mit-sub">Drift detection & auto-mitigation</div></div></button>
                    </div>
                  </div>
                  <div className="dd-mit-group">
                    <div className="dd-mit-group-head" style={{borderLeftColor:'#eab308'}}><span className="dd-mit-group-icon">🗑️</span><div><div className="dd-mit-group-title">Manage ROT Content</div><div className="dd-mit-group-risk" style={{color:readinessColor(selectedSite.governanceRisk)}}>{selectedSite.governanceRisk}% stale (1yr+)</div></div></div>
                    <div className="dd-mit-group-btns">
                      <button className="dd-mit-btn" onClick={() => setMitigationModal('retention-policy')}><span className="dd-mit-icon">📋</span><div><div className="dd-mit-title">Create Retention Policies</div><div className="dd-mit-sub">Purview DLM data lifecycle management</div></div></button>
                    </div>
                  </div>
                </div>

                <div className="dd-section">
                  <h4>👥 User Access by Group (30 days)</h4>
                  <div className="dd-group-list">
                    {selectedSite.groupAccess.map(ga => (
                      <div key={ga.group} className="dd-grp"><span className="dd-grp-name">{ga.group}</span><div className="dd-grp-bar-w"><div className="dd-grp-bar" style={{ width: `${(ga.users / selectedSite.groupAccess[0].users) * 100}%` }} /></div><span className="dd-grp-n">{ga.users} users</span></div>
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
    {mitigationModal && selectedSite && (
      <div className="dd-mit-overlay" onClick={() => setMitigationModal(null)}>
        <div className="dd-mit-modal" onClick={e => e.stopPropagation()}>
          <div className="dd-mit-modal-head">
            <h3>
              {mitigationModal === 'container-label' && '🏷️ Apply MIP Container Label'}
              {mitigationModal === 'label-in-cat' && '📄 Label In-Subcategory Files'}
              {mitigationModal === 'ai-classify' && '🤖 AI-Native Classification'}
              {mitigationModal === 'risk-assessment' && '📋 Add to Data Risk Assessment'}
              {mitigationModal === 'perm-rightsizing' && '🤝 Launch Permissions Rightsizing'}
              {mitigationModal === 'perm-guardrails' && '🛡️ Create Permission Guardrails'}
              {mitigationModal === 'retention-policy' && '📋 Create Retention Policies'}
            </h3>
            <button className="dd-close" onClick={() => setMitigationModal(null)}>✕</button>
          </div>
          <div className="dd-mit-modal-body">
            <div className="dd-mit-site-tag"><span className="dd-mit-site-icon">📍</span><div><div className="dd-mit-site-name">{selectedSite.name}</div><a className="dd-mit-site-url" href={selectedSite.url} target="_blank" rel="noopener noreferrer">{selectedSite.url}</a></div></div>
            {mitigationModal === 'container-label' && (<><p>Apply a MIP <strong>container label</strong> to the SharePoint site, setting default sensitivity for all new content.</p><div className="dd-mit-field"><label>Select Sensitivity Label</label><div className="dd-mit-select">{['Confidential','Highly Confidential','Restricted'].map(l => <button key={l} className="dd-mit-opt">{l}</button>)}</div></div><div className="dd-mit-impact"><div className="dd-mi"><span>📍 Site</span><strong>{selectedSite.name}</strong></div><div className="dd-mi"><span>📄 Total Docs</span><strong>{formatNumber(selectedSite.totalSiteDocs)}</strong></div></div></>)}
            {mitigationModal === 'label-in-cat' && (<><p>Apply a sensitivity label to all <strong>{formatNumber(selectedSite.catDocs)}</strong> files belonging to this subcategory.</p><div className="dd-mit-field"><label>Select Sensitivity Label</label><div className="dd-mit-select">{['General','Confidential','Highly Confidential','Restricted'].map(l => <button key={l} className="dd-mit-opt">{l}</button>)}</div></div><div className="dd-mit-impact"><div className="dd-mi"><span>📄 Files</span><strong>{formatNumber(selectedSite.catDocs)}</strong></div><div className="dd-mi"><span>📊 % of Site</span><strong>{selectedSite.pct}%</strong></div></div></>)}
            {mitigationModal === 'ai-classify' && (<><p>Run <strong>AI-Native Classification</strong> using AI graders, SIT, and semantic classifiers for accurate auto-labeling.</p><div className="dd-mit-impact"><div className="dd-mi"><span>📄 Files</span><strong>{formatNumber(selectedSite.totalSiteDocs)}</strong></div><div className="dd-mi"><span>🏷️ Unlabeled</span><strong style={{color:readinessColor(selectedSite.classificationRisk)}}>{selectedSite.classificationRisk}%</strong></div></div></>)}
            {mitigationModal === 'risk-assessment' && (<><p>Add to a Purview DSPM Data Risk Assessment for oversharing evaluation.</p><div className="dd-mit-field"><label>Assessment</label><div className="dd-mit-select"><button className="dd-mit-opt dd-mit-opt-active">📋 Q2 2026 Oversharing Review</button><button className="dd-mit-opt">📋 Copilot Readiness Assessment</button><button className="dd-mit-opt dd-mit-opt-new">+ Create New Assessment</button></div></div><div className="dd-mit-impact"><div className="dd-mi"><span>📄 Docs</span><strong>{formatNumber(selectedSite.totalSiteDocs)}</strong></div><div className="dd-mi"><span>⏱️ Duration</span><strong>3–5 days</strong></div></div></>)}
            {mitigationModal === 'perm-rightsizing' && (<><p>Launch an <strong>agent-driven permissions rightsizing campaign</strong> — agents contact document owners to correct excessive access.</p><div className="dd-mit-impact"><div className="dd-mi"><span>📄 Files</span><strong>{formatNumber(selectedSite.totalSiteDocs)}</strong></div><div className="dd-mi"><span>🔓 Overexposed</span><strong style={{color:readinessColor(selectedSite.exposureRisk)}}>{selectedSite.exposureRisk}%</strong></div><div className="dd-mi"><span>⏱️ Campaign</span><strong>7–14 days</strong></div></div></>)}
            {mitigationModal === 'perm-guardrails' && (<><p>Create <strong>permission guardrails</strong> for continuous drift detection with auto-remediation alerts.</p><div className="dd-mit-impact"><div className="dd-mi"><span>📍 Site</span><strong>{selectedSite.name}</strong></div><div className="dd-mi"><span>👥 Users</span><strong>{selectedSite.totalUsers}</strong></div><div className="dd-mi"><span>🔄 Monitoring</span><strong>Continuous</strong></div></div></>)}
            {mitigationModal === 'retention-policy' && (<><p>Create <strong>retention policies</strong> using Purview DLM. ROT content inactive for 1+ year will be scheduled for deletion.</p><div className="dd-mit-field"><label>Retention Action</label><div className="dd-mit-select"><button className="dd-mit-opt dd-mit-opt-active">Delete files inactive for 1+ year</button><button className="dd-mit-opt">Move to archive after 1 year</button><button className="dd-mit-opt">Apply retention label and review</button></div></div><div className="dd-mit-impact"><div className="dd-mi"><span>🗑️ ROT</span><strong style={{color:readinessColor(selectedSite.governanceRisk)}}>{selectedSite.governanceRisk}%</strong></div><div className="dd-mi"><span>📄 ROT Files</span><strong>{formatNumber(Math.round(selectedSite.totalSiteDocs * selectedSite.governanceRisk / 100))}</strong></div></div></>)}
            <div className="dd-mit-actions">
              <button className="dd-mit-apply">
                {mitigationModal === 'container-label' && 'Apply Container Label'}
                {mitigationModal === 'label-in-cat' && 'Apply Label to Files'}
                {mitigationModal === 'ai-classify' && 'Start AI Classification'}
                {mitigationModal === 'risk-assessment' && 'Add to Assessment'}
                {mitigationModal === 'perm-rightsizing' && 'Launch Campaign'}
                {mitigationModal === 'perm-guardrails' && 'Create Guardrails'}
                {mitigationModal === 'retention-policy' && 'Create Policy'}
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
      .dd-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);z-index:9999;display:flex;align-items:center;justify-content:center;animation:ddFadeIn .2s ease;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:#e0e0f0}
      @keyframes ddFadeIn{from{opacity:0}to{opacity:1}}
      .dd-container{background:linear-gradient(145deg,#0a0a18 0%,#0f0f24 100%);border:1px solid rgba(99,102,241,0.2);border-radius:18px;width:94vw;max-width:1400px;height:88vh;display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(0,0,0,0.7);animation:ddScaleIn .25s ease;overflow:hidden}
      @keyframes ddScaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
      .dd-header{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 24px 12px;border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0}
      .dd-header-left h2{font-size:17px;font-weight:700;margin:4px 0 2px}.dd-header-left p{font-size:11px;color:#8888a0;margin:0}
      .dd-cat-badge{font-size:10px;font-weight:600;padding:3px 10px;border-radius:6px;display:inline-block}
      .dd-close{background:none;border:1px solid rgba(255,255,255,0.1);color:#6b6b80;width:28px;height:28px;border-radius:8px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all .15s}.dd-close:hover{background:rgba(255,255,255,0.08);color:white}
      .dd-body{flex:1;display:flex;gap:0;min-height:0;overflow:hidden}
      .dd-main{flex:1.1;display:flex;flex-direction:column;min-width:0;border-right:1px solid rgba(255,255,255,0.06)}
      .dd-table-header{padding:12px 20px 8px;flex-shrink:0}.dd-table-header h3{font-size:13px;font-weight:600;margin:0}
      .dd-table-wrap{flex:1;overflow-y:auto;padding:0 8px 12px 8px}
      .dd-table{width:100%;border-collapse:collapse;font-size:11px}
      .dd-table thead{position:sticky;top:0;z-index:2}
      .dd-table th{background:rgba(10,10,24,0.98);padding:8px 12px;text-align:left;font-weight:600;color:#6b6b80;font-size:9px;text-transform:uppercase;letter-spacing:.4px;border-bottom:1px solid rgba(255,255,255,0.06)}
      .dd-table td{padding:9px 12px;border-bottom:1px solid rgba(255,255,255,0.03)}
      .dd-tr{cursor:pointer;transition:all .12s}.dd-tr:hover{background:rgba(255,255,255,0.03)}.dd-tr-active{background:rgba(99,102,241,0.08)!important}
      .dd-td-name{display:flex;align-items:center;gap:8px;font-weight:600;font-size:12px;white-space:nowrap}
      .dd-site-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
      .dd-pct-cell{display:flex;align-items:center;gap:6px;justify-content:flex-end}
      .dd-pct-bar-wrap{width:50px;height:5px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden}
      .dd-pct-bar{height:100%;border-radius:3px;transition:width .5s ease}
      .dd-pct-val{font-size:11px;font-weight:700;min-width:30px;text-align:right}
      .dd-users-badge{font-size:11px;color:#a0a0b8}
      .dd-sample-btn{background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);color:#a5b4fc;padding:3px 10px;border-radius:5px;font-size:10px;cursor:pointer;font-family:inherit;transition:all .15s}.dd-sample-btn:hover{background:rgba(99,102,241,0.2)}
      .dd-detail{width:380px;flex-shrink:0;overflow-y:auto;padding:16px 20px}
      .dd-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center}.dd-empty-icon{font-size:40px;margin-bottom:12px;opacity:0.3}.dd-empty p{font-size:12px;color:#4a4a60;max-width:200px;line-height:1.5}
      .dd-detail-head{margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.06)}.dd-detail-head h3{font-size:14px;font-weight:700;margin:0 0 4px}
      .dd-site-url{display:block;font-size:10px;color:#6366f1;text-decoration:none;margin:2px 0 8px;word-break:break-all}.dd-site-url:hover{text-decoration:underline;color:#818cf8}
      .dd-site-meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 12px}.dd-meta-item{display:flex;flex-direction:column;padding:4px 0}.dd-meta-lbl{font-size:8px;color:#4a4a60;text-transform:uppercase;letter-spacing:.4px}.dd-meta-val{font-size:11px;color:#c0c0d0;font-weight:500}
      .dd-section{margin-bottom:16px}.dd-section h4{font-size:11px;font-weight:600;margin:0 0 8px}.dd-muted-title{color:#6b6b80!important}
      .dd-readiness-list{display:flex;flex-direction:column;gap:4px}.dd-rd{display:flex;align-items:center;gap:6px}.dd-rd-lbl{font-size:10px;color:#8888a0;width:85px;flex-shrink:0}.dd-rd-bar-w{flex:1;height:5px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden}.dd-rd-bar{height:100%;border-radius:3px;transition:width .5s ease}.dd-rd-v{font-size:11px;font-weight:700;min-width:32px;text-align:right}
      .dd-narrative{padding:10px 12px;border-radius:8px;background:linear-gradient(135deg,rgba(99,102,241,0.04),rgba(139,92,246,0.03));border:1px solid rgba(99,102,241,0.1)}
      .dd-narrative-header{display:flex;align-items:center;gap:5px;margin-bottom:6px}
      .dd-narrative-icon{font-size:14px}
      .dd-narrative-label{font-size:9px;font-weight:700;color:#8b5cf6;text-transform:uppercase;letter-spacing:0.5px}
      .dd-narrative-text{font-size:11px;color:#a0a0b8;line-height:1.6;margin:0}
      .dd-narrative .narrative-logs-link{display:inline-block;font-size:10px;color:#818cf8;text-decoration:none;margin-top:6px;font-weight:600;transition:color .15s}
      .dd-narrative .narrative-logs-link:hover{color:#a5b4fc;text-decoration:underline}
      .dd-mitigation{padding-bottom:8px}.dd-mit-group{margin-bottom:10px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:10px;padding:10px}
      .dd-mit-group-head{display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-left:8px;border-left:3px solid}.dd-mit-group-icon{font-size:14px}.dd-mit-group-title{font-size:11px;font-weight:700;color:#e0e0f0}.dd-mit-group-risk{font-size:9px;font-weight:600}
      .dd-mit-group-btns{display:grid;grid-template-columns:1fr 1fr;gap:4px}
      .dd-mit-btn{display:flex;align-items:flex-start;gap:8px;padding:7px 9px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:7px;cursor:pointer;transition:all .15s;text-align:left;font-family:inherit;color:#e0e0f0}.dd-mit-btn:hover{background:rgba(99,102,241,0.08);border-color:rgba(99,102,241,0.2)}
      .dd-mit-icon{font-size:14px;flex-shrink:0;margin-top:1px}.dd-mit-title{font-size:10px;font-weight:600}.dd-mit-sub{font-size:8px;color:#6b6b80;margin-top:1px}
      .dd-group-list{display:flex;flex-direction:column;gap:5px}.dd-grp{display:flex;align-items:center;gap:6px}.dd-grp-name{font-size:10px;width:75px;color:#a0a0b8;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dd-grp-bar-w{flex:1;height:7px;background:rgba(255,255,255,0.04);border-radius:4px;overflow:hidden}.dd-grp-bar{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:4px;transition:width .4s ease}.dd-grp-n{font-size:10px;color:#6b6b80;min-width:55px;text-align:right;white-space:nowrap}
      .dd-flist{display:flex;flex-direction:column;gap:3px}.dd-files-section{flex:1;display:flex;flex-direction:column;min-height:0}.dd-files-section .dd-flist{overflow-y:auto}
      .dd-fitem{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.04);border-radius:7px;cursor:pointer;transition:all .15s;overflow:hidden}.dd-fitem:hover{border-color:rgba(255,255,255,0.1);background:rgba(255,255,255,0.04)}.dd-fitem-active{border-color:rgba(99,102,241,0.3)!important;background:rgba(99,102,241,0.06)!important}.dd-fitem-risk{border-left:2px solid rgba(239,68,68,0.4)}.dd-fitem-muted{cursor:default;opacity:0.5}.dd-fitem-muted:hover{opacity:0.65}
      .dd-fitem-top{display:flex;align-items:center;gap:6px;padding:7px 10px;font-size:11px}.dd-fitem-icon{font-size:14px;flex-shrink:0}.dd-fitem-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#c0c0d0}.dd-fitem-users{font-size:10px;color:#8888a0;flex-shrink:0}
      .dd-fusers{padding:4px 10px 8px;border-top:1px solid rgba(255,255,255,0.04);animation:ddSlide .15s ease}@keyframes ddSlide{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
      .dd-fusers-head{display:grid;grid-template-columns:1fr 80px 65px 50px;gap:4px;font-size:8px;color:#4a4a60;text-transform:uppercase;letter-spacing:.4px;padding:4px 0;margin-bottom:2px;border-bottom:1px solid rgba(255,255,255,0.03)}
      .dd-fuser-row{display:grid;grid-template-columns:1fr 80px 65px 50px;gap:4px;font-size:10px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.02)}.dd-fuser-row:last-child{border-bottom:none}
      .dd-fu-name{color:#c0c0d0;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dd-fu-group{color:#8b5cf6;font-size:9px}.dd-fu-days{color:#6b6b80}.dd-fu-acts{color:#a0a0b8;text-align:right}
      .dd-flist-muted .dd-fitem{background:rgba(255,255,255,0.01)}
      .dd-mit-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);z-index:10000;display:flex;align-items:center;justify-content:center;animation:ddFadeIn .15s ease}
      .dd-mit-modal{background:#111128;border:1px solid rgba(99,102,241,0.25);border-radius:16px;width:480px;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.6);animation:ddScaleIn .2s ease}
      .dd-mit-modal-head{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06)}.dd-mit-modal-head h3{font-size:14px;font-weight:600;margin:0}
      .dd-mit-modal-body{padding:16px 20px}.dd-mit-modal-body p{font-size:12px;color:#a0a0b8;line-height:1.6;margin:0 0 14px}.dd-mit-modal-body strong{color:#e0e0f0}
      .dd-mit-site-tag{display:flex;gap:10px;align-items:center;padding:10px 12px;margin-bottom:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px}.dd-mit-site-icon{font-size:18px}.dd-mit-site-name{font-size:12px;font-weight:600}.dd-mit-site-url{font-size:9px;color:#6366f1;text-decoration:none}.dd-mit-site-url:hover{text-decoration:underline}
      .dd-mit-field{margin-bottom:14px}.dd-mit-field label{font-size:10px;color:#6b6b80;text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:6px}
      .dd-mit-select{display:flex;flex-direction:column;gap:4px}.dd-mit-opt{padding:8px 12px;border-radius:7px;font-size:11px;font-weight:500;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);color:#c0c0d0;cursor:pointer;transition:all .15s;text-align:left;font-family:inherit}.dd-mit-opt:hover{background:rgba(99,102,241,0.08);border-color:rgba(99,102,241,0.2)}.dd-mit-opt-active{background:rgba(99,102,241,0.1);border-color:rgba(99,102,241,0.3);color:#a5b4fc}.dd-mit-opt-new{color:#22c55e;border-style:dashed}.dd-mit-opt-new:hover{background:rgba(34,197,94,0.08);border-color:rgba(34,197,94,0.25)}
      .dd-mit-impact{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}.dd-mi{flex:1;min-width:90px;text-align:center;padding:8px 6px;background:rgba(255,255,255,0.03);border-radius:7px}.dd-mi span{display:block;font-size:9px;color:#6b6b80;margin-bottom:2px}.dd-mi strong{font-size:13px}
      .dd-mit-actions{display:flex;gap:8px;justify-content:flex-end;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06)}
      .dd-mit-apply{padding:8px 20px;border-radius:8px;font-size:12px;font-weight:600;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;color:white;cursor:pointer;font-family:inherit;transition:all .15s}.dd-mit-apply:hover{opacity:0.9}
      .dd-mit-cancel{padding:8px 16px;border-radius:8px;font-size:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#a0a0b8;cursor:pointer;font-family:inherit;transition:all .15s}.dd-mit-cancel:hover{background:rgba(255,255,255,0.1)}
      .dd-explore-site-btn{width:100%;padding:10px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit;margin-bottom:12px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);color:#86efac;text-align:center}
      .dd-explore-site-btn:hover{background:rgba(34,197,94,0.15);border-color:rgba(34,197,94,0.4);color:white}
      .last-scanned { font-size: 10px; color: #4a4a60; display: inline-flex; align-items: center; gap: 4px; }
    `}</style>
    </>,
    document.body
  );
}

export default function SubcategoryView({ tier, category, selectedSub, onSelectSubcategory }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [deepDiveSub, setDeepDiveSub] = useState(null);

  const subs = useMemo(() => getSubcategories(category.id, category.documentCount, category.classificationRisk, category.exposureRisk, category.governanceRisk, category.dlpCoverage, category.irmCoverage), [category]);

  const activeSub = selectedDetail || selectedSub || null;

  const handleCellClick = useCallback((sub) => {
    setTooltip(null);
    setSelectedDetail(sub);
  }, []);

  // Draw treemap
  useEffect(() => {
    if (!containerRef.current) return;
    const W = containerRef.current.clientWidth;
    const H = containerRef.current.clientHeight;
    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');
    subs.forEach(s => {
      const lg = defs.append('linearGradient').attr('id', `stm-${s.id}`).attr('x1','0%').attr('y1','0%').attr('x2','100%').attr('y2','100%');
      lg.append('stop').attr('offset','0%').attr('stop-color', category.color).attr('stop-opacity', 0.22);
      lg.append('stop').attr('offset','100%').attr('stop-color', category.color).attr('stop-opacity', 0.06);
    });

    const hierarchy = d3.hierarchy({ children: subs })
      .sum(d => d.documentCount)
      .sort((a, b) => b.value - a.value);

    const treemap = d3.treemap()
      .size([W, H])
      .paddingOuter(4)
      .paddingInner(3)
      .round(true);

    treemap(hierarchy);

    const g = svg.append('g');

    const cells = g.selectAll('.stm-cell')
      .data(hierarchy.leaves())
      .join('g')
      .attr('class', 'stm-cell')
      .style('cursor', 'pointer');

    cells.append('rect')
      .attr('x', d => d.x0).attr('y', d => d.y0)
      .attr('width', d => Math.max(0, d.x1 - d.x0))
      .attr('height', d => Math.max(0, d.y1 - d.y0))
      .attr('rx', 6)
      .attr('fill', d => `url(#stm-${d.data.id})`)
      .attr('stroke', category.color)
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.25)
      .style('transition', 'all 0.2s ease');

    cells.each(function(d) {
      const w = d.x1 - d.x0;
      const h = d.y1 - d.y0;
      const cx = (d.x0 + d.x1) / 2;
      const cy = (d.y0 + d.y1) / 2;
      const cell = d3.select(this);

      if (w > 70 && h > 40) {
        const maxChars = Math.floor(w / 6.5);
        const name = d.data.name.length > maxChars ? d.data.name.slice(0, maxChars - 1) + '…' : d.data.name;
        cell.append('text')
          .attr('x', cx).attr('y', cy - (h > 60 ? 6 : 0))
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
          .attr('font-size', Math.min(11, w * 0.075)).attr('font-weight', 600).attr('fill', 'white')
          .text(name).style('pointer-events', 'none');
      }

      if (w > 70 && h > 55) {
        cell.append('text')
          .attr('x', cx).attr('y', cy + 10)
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
          .attr('font-size', 9).attr('fill', 'rgba(255,255,255,0.5)')
          .text(`${formatNumber(d.data.documentCount)} docs`).style('pointer-events', 'none');
      }

      if (w > 110 && h > 90) {
        const barY = cy + 22;
        const barW = Math.min(w * 0.6, 70);
        const barH = 3;
        const barX = cx - barW / 2;
        const risks = [
          { val: d.data.classificationRisk, label: 'U' },
          { val: d.data.exposureRisk, label: 'E' },
          { val: d.data.governanceRisk, label: 'R' },
        ];
        risks.forEach((r, ri) => {
          const ry = barY + ri * 9;
          cell.append('rect').attr('x', barX).attr('y', ry).attr('width', barW).attr('height', barH).attr('rx', 1.5).attr('fill', 'rgba(255,255,255,0.06)').style('pointer-events', 'none');
          cell.append('rect').attr('x', barX).attr('y', ry).attr('width', barW * r.val / 100).attr('height', barH).attr('rx', 1.5).attr('fill', readinessColor(r.val)).attr('opacity', 0.8).style('pointer-events', 'none');
          cell.append('text').attr('x', barX + barW + 4).attr('y', ry + 2).attr('font-size', 7).attr('font-weight', 700).attr('fill', readinessColor(r.val)).attr('dominant-baseline', 'central').text(`${r.val}%`).style('pointer-events', 'none');
        });
      }
    });

    cells.attr('opacity', 0)
      .transition().duration(500).delay((_, i) => i * 40)
      .attr('opacity', 1);

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
          .attr('stroke-width', 1).attr('stroke-opacity', 0.25);
        setHoveredId(null);
        setTooltip(null);
      })
      .on('click', (_, d) => handleCellClick(d.data));

    return () => svg.selectAll('*').remove();
  }, [subs, category.color, handleCellClick]);

  return (
    <div className="sub-view">
      {/* Top info bar — shows parent category context */}
      <div className="sub-top">
        <div className="sub-top-left">
          <div className="sub-breadcrumb">
            <span className="sub-parent-badge" style={{ background: category.color + '22', color: category.color }}>
              {category.icon} {category.name}
            </span>
            <span className="sub-bc-arrow">›</span>
            <span className="sub-bc-current">Subcategories</span>
          </div>
          <h2>
            <span style={{ color: category.color }}>{category.icon}</span> {category.name}
          </h2>
          <p>{formatNumber(category.documentCount)} documents · {subs.length} subcategories generated by Security Copilot</p>
          <span className="last-scanned">🔄 Last scanned: {lastScannedLabel}</span>
        </div>
      </div>

      <div className="sub-body">
        {/* Treemap area */}
        <div className="sub-treemap-area" ref={containerRef}>
          <svg ref={svgRef} />
          {tooltip && !activeSub && (
            <div className="sub-tooltip" style={{
              left: tooltip.x + 14, top: tooltip.y - 10,
              transform: tooltip.x > (containerRef.current?.clientWidth || 0) * 0.6 ? 'translateX(-105%)' : 'none',
            }}>
              <div className="stt-name">{tooltip.data.name}</div>
              <div className="stt-stats">
                <div><span className="stt-v">{formatNumber(tooltip.data.documentCount)}</span><span className="stt-l">Documents</span></div>
              </div>
              <div className="stt-readiness">
                <div className="stt-ri"><span className="stt-ri-lbl">Unlabeled</span><div className="stt-ri-bar-w"><div className="stt-ri-bar" style={{width:`${tooltip.data.classificationRisk}%`,background:readinessColor(tooltip.data.classificationRisk)}}/></div><span className="stt-ri-v" style={{color:readinessColor(tooltip.data.classificationRisk)}}>{tooltip.data.classificationRisk}%</span></div>
                <div className="stt-ri"><span className="stt-ri-lbl">Overexposed</span><div className="stt-ri-bar-w"><div className="stt-ri-bar" style={{width:`${tooltip.data.exposureRisk}%`,background:readinessColor(tooltip.data.exposureRisk)}}/></div><span className="stt-ri-v" style={{color:readinessColor(tooltip.data.exposureRisk)}}>{tooltip.data.exposureRisk}%</span></div>
                <div className="stt-ri"><span className="stt-ri-lbl">ROT</span><div className="stt-ri-bar-w"><div className="stt-ri-bar" style={{width:`${tooltip.data.governanceRisk}%`,background:readinessColor(tooltip.data.governanceRisk)}}/></div><span className="stt-ri-v" style={{color:readinessColor(tooltip.data.governanceRisk)}}>{tooltip.data.governanceRisk}%</span></div>
              </div>
              <div className="stt-cta">Click to view details & files</div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="sub-side">
          {/* Selected subcategory detail */}
          {activeSub && (
            <div className="sub-panel sub-detail-panel" style={{ borderColor: category.color + '44' }}>
              <div className="sd-header">
                <div>
                  <div className="sd-name">{activeSub.name}</div>
                </div>
                <button className="sd-close" onClick={() => setSelectedDetail(null)}>✕</button>
              </div>

              <div className="sd-stats">
                <div><span className="sd-v">{formatNumber(activeSub.documentCount)}</span><span className="sd-l">Documents</span></div>
                <div><span className="sd-v">{formatNumber(activeSub.siteCount)}</span><span className="sd-l">Sites</span></div>
              </div>

              <div className="sd-readiness">
                <div className="sd-ri"><span className="sd-ri-lbl">🏷️ Unlabeled</span><div className="sd-ri-bar-w"><div className="sd-ri-bar" style={{width:`${activeSub.classificationRisk}%`,background:readinessColor(activeSub.classificationRisk)}}/></div><span className="sd-ri-v" style={{color:readinessColor(activeSub.classificationRisk)}}>{activeSub.classificationRisk}%</span></div>
                <div className="sd-ri"><span className="sd-ri-lbl">🔓 Overexposed</span><div className="sd-ri-bar-w"><div className="sd-ri-bar" style={{width:`${activeSub.exposureRisk}%`,background:readinessColor(activeSub.exposureRisk)}}/></div><span className="sd-ri-v" style={{color:readinessColor(activeSub.exposureRisk)}}>{activeSub.exposureRisk}%</span></div>
                <div className="sd-ri"><span className="sd-ri-lbl">🗑️ ROT</span><div className="sd-ri-bar-w"><div className="sd-ri-bar" style={{width:`${activeSub.governanceRisk}%`,background:readinessColor(activeSub.governanceRisk)}}/></div><span className="sd-ri-v" style={{color:readinessColor(activeSub.governanceRisk)}}>{activeSub.governanceRisk}%</span></div>
              </div>



              <div className="sd-narrative">
                <div className="sd-narrative-header">
                  <span className="sd-narrative-icon">✨</span>
                  <span className="sd-narrative-label">Security Copilot Insights</span>
                </div>
                <p className="sd-narrative-text">{getSubcategoryNarrative(activeSub.name, activeSub.documentCount)}</p>
                <a className="narrative-logs-link" href="https://www.microsoft.com" target="_blank" rel="noopener noreferrer">View all activity logs →</a>
              </div>

              {/* Explore subcategory deep dive */}
              <button className="sd-deepdive-btn" onClick={() => setDeepDiveSub(activeSub)}>
                🔍 Explore Subcategory — Sites, Files & Access
              </button>
            </div>
          )}

          {/* Subcategory list */}
          <div className="sub-panel">
            <h4>📂 Subcategories</h4>
            <div className="sub-risk-list">
              {[...subs].sort((a, b) => b.classificationRisk - a.classificationRisk).map(s => (
                <div
                  key={s.id}
                  className={`sri ${hoveredId === s.id ? 'sri-active' : ''} ${activeSub?.id === s.id ? 'sri-selected' : ''}`}
                  onClick={() => handleCellClick(s)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="sri-name">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {deepDiveSub && (
        <SubcategoryDeepDive subcategory={deepDiveSub} category={category} onClose={() => setDeepDiveSub(null)} />
      )}

      <style>{`
        .sub-view { height:100%; display:flex; flex-direction:column; padding:14px 24px; overflow:hidden; }

        /* Top bar with parent context */
        .sub-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; flex-shrink:0; gap:12px; }
        .sub-top-left h2 { font-size:17px; font-weight:700; margin-bottom:2px; }
        .sub-top-left p { font-size:12px; color:#a0a0b8; }
        .sub-breadcrumb { display:flex; align-items:center; gap:6px; margin-bottom:6px; }
        .sub-parent-badge { font-size:10px; font-weight:600; padding:3px 10px; border-radius:6px; }
        .sub-bc-arrow { color:#4a4a60; font-size:12px; }
        .sub-bc-current { font-size:10px; color:#6b6b80; text-transform:uppercase; letter-spacing:0.3px; }
        .graph-btn { background:rgba(99,102,241,0.12); border:1px solid rgba(99,102,241,0.25); color:#a5b4fc; padding:7px 14px; border-radius:8px; cursor:pointer; font-size:12px; font-family:inherit; transition:all .2s; flex-shrink:0; }
        .graph-btn:hover { background:rgba(99,102,241,0.2); }

        /* Body layout */
        .sub-body { flex:1; display:flex; gap:16px; min-height:0; }
        .sub-treemap-area { flex:1; position:relative; min-width:0; }
        .sub-treemap-area svg { width:100%; height:100%; }

        .sub-side { width:320px; flex-shrink:0; overflow-y:auto; display:flex; flex-direction:column; gap:12px; }
        .sub-panel { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:14px; }
        .sub-panel h4 { font-size:12px; font-weight:600; margin-bottom:10px; }

        /* Detail panel */
        .sub-detail-panel { animation: sd-in 0.2s ease; }
        @keyframes sd-in { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

        .sd-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
        .sd-name { font-size:13px; font-weight:700; margin-bottom:3px; }
        .sd-badge { font-size:10px; font-weight:700; padding:2px 8px; border-radius:8px; }
        .sd-close {
          background:none; border:1px solid rgba(255,255,255,0.1);
          color:#6b6b80; width:22px; height:22px; border-radius:6px; cursor:pointer;
          font-size:11px; display:flex; align-items:center; justify-content:center;
          transition:all 0.15s; flex-shrink:0;
        }
        .sd-close:hover { background:rgba(255,255,255,0.08); color:#c0c0d0; }

        .sd-stats { display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-bottom:12px; }
        .sd-stats > div { text-align:center; padding:5px; background:rgba(255,255,255,0.04); border-radius:6px; }
        .sd-v { display:block; font-size:14px; font-weight:700; }
        .sd-l { font-size:8px; color:#6b6b80; text-transform:uppercase; letter-spacing:.3px; }

        .sd-readiness { display:flex; flex-direction:column; gap:3px; margin-bottom:10px; padding:6px 8px; background:rgba(255,255,255,0.02); border-radius:7px; border:1px solid rgba(255,255,255,0.04); }
        .sd-ri { display:flex; align-items:center; gap:5px; }
        .sd-ri-lbl { font-size:9px; color:#8888a0; width:80px; flex-shrink:0; }
        .sd-ri-bar-w { flex:1; height:4px; background:rgba(255,255,255,0.06); border-radius:2px; overflow:hidden; }
        .sd-ri-bar { height:100%; border-radius:2px; transition:width .5s ease; }
        .sd-ri-v { font-size:10px; font-weight:700; min-width:28px; text-align:right; }



        .stt-readiness { display:flex; flex-direction:column; gap:2px; margin-bottom:6px; padding:4px 6px; background:rgba(255,255,255,0.02); border-radius:5px; }
        .stt-ri { display:flex; align-items:center; gap:4px; }
        .stt-ri-lbl { font-size:7px; color:#6b6b80; width:55px; flex-shrink:0; text-transform:uppercase; letter-spacing:.3px; }
        .stt-ri-bar-w { flex:1; height:3px; background:rgba(255,255,255,0.06); border-radius:2px; overflow:hidden; }
        .stt-ri-bar { height:100%; border-radius:2px; }
        .stt-ri-v { font-size:9px; font-weight:700; min-width:24px; text-align:right; }

        /* Remediation */
        .sd-rem-section { border-top:1px solid rgba(255,255,255,0.06); padding-top:10px; }
        .sd-rem-title { font-size:10px; font-weight:600; margin-bottom:4px; color:#e0e0f0; text-transform:uppercase; letter-spacing:0.3px; }
        .sd-rem-desc { font-size:10px; color:#6b6b80; line-height:1.4; margin-bottom:8px; }
        .sd-narrative{margin-bottom:10px;padding:10px 12px;border-radius:8px;background:linear-gradient(135deg,rgba(99,102,241,0.04),rgba(139,92,246,0.03));border:1px solid rgba(99,102,241,0.1)}
        .sd-narrative-header{display:flex;align-items:center;gap:5px;margin-bottom:6px}
        .sd-narrative-icon{font-size:14px}
        .sd-narrative-label{font-size:9px;font-weight:700;color:#8b5cf6;text-transform:uppercase;letter-spacing:0.5px}
        .sd-narrative-text{font-size:11px;color:#a0a0b8;line-height:1.6;margin:0}
        .sd-narrative .narrative-logs-link{display:inline-block;font-size:10px;color:#818cf8;text-decoration:none;margin-top:6px;font-weight:600;transition:color .15s}
        .sd-narrative .narrative-logs-link:hover{color:#a5b4fc;text-decoration:underline}

        .sd-deepdive-btn {
          width:100%; padding:8px 14px; border-radius:8px; font-size:11px; font-weight:600;
          cursor:pointer; transition:all 0.2s; font-family:inherit; margin-bottom:10px;
          background:rgba(6,182,212,0.08); border:1px solid rgba(6,182,212,0.2);
          color:#67e8f9; text-align:center;
        }
        .sd-deepdive-btn:hover { background:rgba(6,182,212,0.15); border-color:rgba(6,182,212,0.4); color:white; }
        .sd-rem-buttons { display:flex; flex-direction:column; gap:5px; }
        .sd-rem-btn {
          display:flex; align-items:center; gap:8px; width:100%; padding:8px 10px;
          border-radius:7px; cursor:pointer; transition:all 0.2s; font-family:inherit;
          border:1px solid; text-align:left;
        }
        .sd-rem-label { background:rgba(139,92,246,0.08); border-color:rgba(139,92,246,0.2); }
        .sd-rem-label:hover { background:rgba(139,92,246,0.15); border-color:rgba(139,92,246,0.4); }
        .sd-rem-campaign { background:rgba(34,197,94,0.06); border-color:rgba(34,197,94,0.15); }
        .sd-rem-campaign:hover { background:rgba(34,197,94,0.12); border-color:rgba(34,197,94,0.3); }
        .sd-rem-icon { font-size:16px; flex-shrink:0; }
        .sd-rem-btn-title { font-size:11px; font-weight:600; color:#e0e0f0; }
        .sd-rem-label .sd-rem-btn-title { color:#c4b5fd; }
        .sd-rem-campaign .sd-rem-btn-title { color:#86efac; }
        .sd-rem-btn-sub { font-size:9px; color:#6b6b80; margin-top:1px; }

        /* Subcategory risk list */
        .sub-risk-list { display:flex; flex-direction:column; gap:3px; }
        .sri { display:flex; align-items:center; gap:6px; padding:5px 8px; border-radius:6px; transition:all .15s; }
        .sri:hover, .sri-active { background:rgba(255,255,255,0.05); }
        .sri-selected { background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.2); }
        .sri-name { flex:1; font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#c0c0d0; }

        /* Tooltip */
        .sub-tooltip {
          position:absolute; background:rgba(12,12,25,0.95); backdrop-filter:blur(20px);
          border:1px solid rgba(99,102,241,0.25); border-radius:10px; padding:12px;
          pointer-events:none; z-index:100; min-width:220px;
          box-shadow:0 8px 32px rgba(0,0,0,0.5); animation:stt-in .15s ease;
        }
        @keyframes stt-in { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .stt-name { font-size:12px; font-weight:600; margin-bottom:4px; }
        .stt-badge { font-size:10px; font-weight:700; padding:2px 8px; border-radius:8px; display:inline-block; margin-bottom:8px; }
        .stt-stats { display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-bottom:6px; }
        .stt-stats > div { text-align:center; padding:4px; background:rgba(255,255,255,0.04); border-radius:5px; }
        .stt-v { display:block; font-size:13px; font-weight:700; }
        .stt-l { font-size:7px; color:#6b6b80; text-transform:uppercase; letter-spacing:.3px; }
        .stt-cta { text-align:center; font-size:10px; color:#8b5cf6; font-weight:500; padding-top:5px; border-top:1px solid rgba(255,255,255,0.06); }

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

function fileIcon(type) {
  const icons = { xlsx: '📗', pptx: '📙', docx: '📘', pdf: '📕', vsdx: '📐', pbix: '📊' };
  return icons[type] || '📄';
}
