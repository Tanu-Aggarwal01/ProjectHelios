import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getSiteFileExplorer, getFilesForFolder, getFileNarrative, formatNumber, readinessColor, lastScannedLabel } from '../data/mockData';

/* ── helpers ── */
function fileIcon(type) {
  const icons = { xlsx: '📗', pptx: '📙', docx: '📘', pdf: '📕', vsdx: '📐', pbix: '📊', md: '📝', yaml: '⚙️', csv: '📋' };
  return icons[type] || '📄';
}

function worstRisk(f) {
  return Math.max(f.classificationRisk, f.exposureRisk, f.governanceRisk);
}

function exposureStyle(exposure) {
  if (exposure === 'Shared with everyone') return { background: '#dc2626', color: '#fff' };
  if (exposure === 'External sharing') return { background: '#ea580c', color: '#fff' };
  if (exposure === 'Organization-wide') return { background: '#ca8a04', color: '#fff' };
  return { background: 'rgba(34,197,94,0.15)', color: '#86efac' };
}

function compactDate(d) {
  if (!d) return '—';
  const parts = d.split('-');
  if (parts.length === 3) return parts[1] + '/' + parts[2] + '/' + parts[0].slice(2);
  return d;
}

/* ── mini risk bars (inline) ── */
function RiskBars({ u, e, r, size }) {
  const sz = size || 'normal';
  const h = sz === 'small' ? 4 : 6;
  const w = sz === 'small' ? 28 : 40;
  const bar = (label, pct) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginRight: sz === 'small' ? 3 : 6 }}>
      <span style={{ fontSize: sz === 'small' ? 7 : 9, color: '#94a3b8', width: sz === 'small' ? 6 : 8 }}>{label}</span>
      <span style={{ width: w, height: h, background: '#1e293b', borderRadius: 2, display: 'inline-block', position: 'relative', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: pct + '%', background: readinessColor(pct), borderRadius: 2 }} />
      </span>
    </span>
  );
  return <span style={{ display: 'inline-flex', alignItems: 'center' }}>{bar('U', u)}{bar('E', e)}{bar('R', r)}</span>;
}

/* ════════════════════════════════════════ */
export default function SiteExplorer({ site, category, onClose }) {
  const explorer = useMemo(() => getSiteFileExplorer(site.id), [site.id]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [mitigationModal, setMitigationModal] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [fileActionModal, setFileActionModal] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);

  const currentFolders = useMemo(() => {
    if (currentPath.length === 0) return explorer.folders;
    return currentPath[currentPath.length - 1].subfolders || [];
  }, [currentPath, explorer]);

  const navigateToFolder = (folder) => {
    setSelectedFolder(folder);
    if (folder.subfolders && folder.subfolders.length > 0) {
      setCurrentPath(prev => [...prev, folder]);
    }
  };

  const navigateToBreadcrumb = (index) => {
    if (index < 0) {
      setCurrentPath([]);
      setSelectedFolder(null);
    } else {
      setCurrentPath(prev => prev.slice(0, index + 1));
      setSelectedFolder(currentPath[index]);
    }
  };

  /* files for selected folder */
  const files = useMemo(() => {
    if (!selectedFolder) return [];
    return getFilesForFolder(selectedFolder.id);
  }, [selectedFolder]);

  /* mitigation counts */
  const mitCounts = useMemo(() => {
    const u = files.filter(f => f.isUnlabeled).length;
    const e = files.filter(f => f.isOverexposed).length;
    const r = files.filter(f => f.isROT).length;
    return { unlabeled: u, overexposed: e, rot: r };
  }, [files]);

  /* sorting */
  const sortedFiles = useMemo(() => {
    if (!sortCol) return files;
    const sorted = [...files];
    sorted.sort((a, b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase(); }
      if (typeof va === 'boolean') { va = va ? 1 : 0; vb = vb ? 1 : 0; }
      if (va == null) va = '';
      if (vb == null) vb = '';
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [files, sortCol, sortDir]);

  const handleSort = useCallback((col) => {
    setSortCol(prev => {
      if (prev === col) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return col; }
      setSortDir('asc');
      return col;
    });
  }, []);

  const sortIndicator = (col) => sortCol !== col ? '' : (sortDir === 'asc' ? ' ▲' : ' ▼');

  /* ── mitigation modal content ── */
  const renderMitigationModal = () => {
    if (!mitigationModal) return null;

    const unlabeledFiles = files.filter(f => f.isUnlabeled);
    const overexposedFiles = files.filter(f => f.isOverexposed);
    const rotFiles = files.filter(f => f.isROT);

    // Determine dominant category from files
    const catCounts = {};
    files.forEach(f => { if (f.category && f.category !== 'Unknown') catCounts[f.category] = (catCounts[f.category] || 0) + 1; });
    const dominantCategory = Object.entries(catCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'General';

    const modalConfig = {
      'folder-auto-label': {
        title: '🏷️ Auto-Label This Folder',
        desc: `Apply sensitivity labels to all ${unlabeledFiles.length} unlabeled file(s) in "${selectedFolder?.name}". The suggested label is based on the dominant category in this folder.`,
        content: (
          <>
            <div className="dd-mit-field"><label>Suggested label</label>
              <div className="dd-mit-select">
                <button className="dd-mit-opt dd-mit-opt-active">{dominantCategory}_LABEL (recommended)</button>
                {['General', 'Confidential', 'Highly Confidential', 'Restricted'].map(l => <button key={l} className="dd-mit-opt">{l}</button>)}
              </div>
            </div>
            <div className="dd-mit-info-row"><span>📄 Files to label</span><strong>{unlabeledFiles.length}</strong></div>
            <div className="dd-mit-info-row"><span>📂 Folder</span><strong>{selectedFolder?.name}</strong></div>
            <div className="dd-mit-file-preview">{unlabeledFiles.slice(0,5).map(f => <div key={f.id} className="dd-mit-file-item">{fileIcon(f.type)} {f.name} <span className="dd-mit-file-suggest">→ {f.category === 'Unknown' ? 'General' : f.category}_LABEL</span></div>)}{unlabeledFiles.length > 5 && <div className="dd-mit-file-more">+{unlabeledFiles.length - 5} more files</div>}</div>
          </>
        ),
        action: 'Apply Labels'
      },
      'folder-ai-classify': {
        title: '🤖 AI-Native Classification',
        desc: `Run AI-native classification on all ${files.length} files in "${selectedFolder?.name}" using Smart SITs and semantic classifiers for high-accuracy labeling.`,
        content: (
          <>
            <div className="dd-mit-steps-compact">
              <div className="dd-mit-step-c"><span className="dd-mit-step-n">1</span><span>Content Analysis — AI graders analyze each file</span></div>
              <div className="dd-mit-step-c"><span className="dd-mit-step-n">2</span><span>SIT Detection — Scan for sensitive information types</span></div>
              <div className="dd-mit-step-c"><span className="dd-mit-step-n">3</span><span>Auto-Label — Apply labels based on confidence scores</span></div>
            </div>
            <div className="dd-mit-info-row"><span>📄 Files to scan</span><strong>{files.length}</strong></div>
            <div className="dd-mit-info-row"><span>🏷️ Currently unlabeled</span><strong>{unlabeledFiles.length}</strong></div>
            <div className="dd-mit-info-row"><span>⏱️ Estimated time</span><strong>~{Math.max(2, Math.round(files.length / 3))} min</strong></div>
          </>
        ),
        action: 'Start Classification'
      },
      'folder-restrict': {
        title: '🔒 Restrict Folder Permissions',
        desc: `Restrict access permissions for all ${overexposedFiles.length} overexposed file(s) in "${selectedFolder?.name}". ${files.length} total files, ${mitCounts.overexposed} have excessive access.`,
        content: (
          <>
            <div className="dd-mit-field"><label>Restrict to</label>
              <div className="dd-mit-select">
                <button className="dd-mit-opt">Remove all "Everyone" and "Anyone with link" sharing</button>
                <button className="dd-mit-opt">Limit to users who accessed in last 30 days</button>
                <button className="dd-mit-opt">Restrict to folder owner + specific users</button>
                <button className="dd-mit-opt dd-mit-opt-active">Remove external sharing links only</button>
              </div>
            </div>
            <div className="dd-mit-info-row"><span>📄 Files affected</span><strong>{overexposedFiles.length}</strong></div>
            <div className="dd-mit-info-row"><span>📂 Folder</span><strong>{selectedFolder?.name}</strong></div>
          </>
        ),
        action: 'Apply Restrictions'
      },
      'folder-inherit': {
        title: '🔄 Inherit Site Permissions',
        desc: `Reset permissions on "${selectedFolder?.name}" to inherit from the parent site defaults. This removes any custom permission overrides on files in this folder.`,
        content: (
          <>
            <p style={{fontSize:11,color:'#f97316',padding:'8px 12px',background:'rgba(249,115,22,0.06)',borderRadius:7,border:'1px solid rgba(249,115,22,0.15)'}}>⚠️ This will remove all custom permissions on {files.length} files and reset to site-level defaults. Users with custom access will lose their permissions.</p>
            <div className="dd-mit-info-row"><span>📄 Files to reset</span><strong>{files.length}</strong></div>
            <div className="dd-mit-info-row"><span>🔓 Currently overexposed</span><strong>{overexposedFiles.length}</strong></div>
            <div className="dd-mit-info-row"><span>📂 Folder</span><strong>{selectedFolder?.name}</strong></div>
          </>
        ),
        action: 'Reset Permissions'
      },
      'folder-retention': {
        title: '📋 Apply Retention Policy',
        desc: `Apply a data lifecycle management policy to ${rotFiles.length} ROT file(s) in "${selectedFolder?.name}" that haven't been accessed in over a year.`,
        content: (
          <>
            <div className="dd-mit-field"><label>Retention action</label>
              <div className="dd-mit-select">
                <button className="dd-mit-opt dd-mit-opt-active">Delete files after 30-day review period</button>
                <button className="dd-mit-opt">Move ROT files to archive</button>
                <button className="dd-mit-opt">Apply "Review Required" retention label</button>
                <button className="dd-mit-opt">Apply "Regulatory Hold" retention label</button>
              </div>
            </div>
            <div className="dd-mit-info-row"><span>🗑️ ROT files (1yr+)</span><strong>{rotFiles.length}</strong></div>
            <div className="dd-mit-info-row"><span>📂 Folder</span><strong>{selectedFolder?.name}</strong></div>
            <div className="dd-mit-file-preview">{rotFiles.slice(0,5).map(f => <div key={f.id} className="dd-mit-file-item">{fileIcon(f.type)} {f.name} <span style={{color:'#6b6b80',fontSize:9}}>last accessed: {f.lastAccessed}</span></div>)}{rotFiles.length > 5 && <div className="dd-mit-file-more">+{rotFiles.length - 5} more files</div>}</div>
          </>
        ),
        action: 'Apply Retention'
      },
      'folder-flag': {
        title: '🚩 Flag Folder for Review',
        desc: `Flag "${selectedFolder?.name}" for review by the site owner or compliance team to determine the appropriate disposition for its ${files.length} files.`,
        content: (
          <>
            <div className="dd-mit-field"><label>Send review to</label>
              <div className="dd-mit-select">
                <button className="dd-mit-opt dd-mit-opt-active">Site owner</button>
                <button className="dd-mit-opt">Compliance team</button>
                <button className="dd-mit-opt">Custom reviewer</button>
              </div>
            </div>
            <div className="dd-mit-field"><label>Review reason</label>
              <div className="dd-mit-select">
                <button className="dd-mit-opt dd-mit-opt-active">ROT content — not accessed in 1+ year</button>
                <button className="dd-mit-opt">Suspected sensitive content needs review</button>
                <button className="dd-mit-opt">Permissions need administrator review</button>
                <button className="dd-mit-opt">Redundant or duplicate content</button>
              </div>
            </div>
            <div className="dd-mit-info-row"><span>📄 Files in folder</span><strong>{files.length}</strong></div>
            <div className="dd-mit-info-row"><span>📂 Folder</span><strong>{selectedFolder?.name}</strong></div>
          </>
        ),
        action: 'Send for Review'
      }
    };

    const cfg = modalConfig[mitigationModal];
    if (!cfg) return null;

    return (
      <div className="dd-mit-overlay" onClick={() => setMitigationModal(null)}>
        <div className="dd-mit-modal" onClick={e => e.stopPropagation()}>
          <div className="dd-mit-header">
            <h3>{cfg.title}</h3>
            <button className="dd-mit-close" onClick={() => setMitigationModal(null)}>✕</button>
          </div>
          <div className="dd-mit-body">
            <p className="dd-mit-desc">{cfg.desc}</p>
            {cfg.content}
            <div className="dd-mit-actions">
              <button className="dd-mit-apply" onClick={() => setMitigationModal(null)}>{cfg.action}</button>
              <button className="dd-mit-cancel" onClick={() => setMitigationModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ── render ── */
  return createPortal(
    <>
      <div className="se-overlay" onClick={onClose}>
        <div className="se-container" onClick={e => e.stopPropagation()}>

          {/* ─── 1. Header Bar ─── */}
          <div className="se-header">
            <div className="se-header-left">
              <div className="se-header-top">
                <span className="se-site-badge">📍 {site.name}</span>
                <a className="se-site-url" href={site.url} target="_blank" rel="noopener noreferrer">{site.url} ↗</a>
                <span className="se-header-meta">Admin: {site.admin}</span>
                <span className="se-header-meta">Created: {site.createdDate}</span>
                <span className="last-scanned">🔄 Last scanned: {lastScannedLabel}</span>
              </div>
              <div className="se-header-risks">
                <span className="se-risk-trio">
                  <span className="se-risk-trio-label">🏷️ Unlabeled</span>
                  <span className="se-risk-trio-bar"><span style={{ width: site.classificationRisk + '%', background: readinessColor(site.classificationRisk) }} /></span>
                  <span className="se-risk-trio-val" style={{ color: readinessColor(site.classificationRisk) }}>{site.classificationRisk}%</span>
                </span>
                <span className="se-risk-trio">
                  <span className="se-risk-trio-label">🔓 Overexposed</span>
                  <span className="se-risk-trio-bar"><span style={{ width: site.exposureRisk + '%', background: readinessColor(site.exposureRisk) }} /></span>
                  <span className="se-risk-trio-val" style={{ color: readinessColor(site.exposureRisk) }}>{site.exposureRisk}%</span>
                </span>
                <span className="se-risk-trio">
                  <span className="se-risk-trio-label">🗑️ ROT</span>
                  <span className="se-risk-trio-bar"><span style={{ width: site.governanceRisk + '%', background: readinessColor(site.governanceRisk) }} /></span>
                  <span className="se-risk-trio-val" style={{ color: readinessColor(site.governanceRisk) }}>{site.governanceRisk}%</span>
                </span>
              </div>
            </div>
            <button className="se-close" onClick={onClose}>✕</button>
          </div>

          {/* ─── 2. Folder Navigator ─── */}
          <div className="se-folder-nav">
            {/* Breadcrumb */}
            <div className="se-nav-breadcrumb">
              <span className="se-nav-bc-item se-nav-bc-link" onClick={() => navigateToBreadcrumb(-1)}>📍 {site.name}</span>
              {currentPath.map((f, i) => (
                <React.Fragment key={f.id}>
                  <span className="se-nav-bc-sep">›</span>
                  <span className={`se-nav-bc-item ${i < currentPath.length - 1 ? 'se-nav-bc-link' : ''}`} onClick={() => navigateToBreadcrumb(i)}>📁 {f.name}</span>
                </React.Fragment>
              ))}
            </div>

            {/* Folder list */}
            <div className="se-folder-list">
              {currentPath.length > 0 && (
                <div className="se-folder-item se-folder-back" onClick={() => navigateToBreadcrumb(currentPath.length - 2)}>
                  <span className="se-folder-item-icon">⬆️</span>
                  <span className="se-folder-item-name">..</span>
                </div>
              )}
              {currentFolders.map(folder => (
                <div key={folder.id} className={`se-folder-item ${selectedFolder?.id === folder.id ? 'se-folder-item-active' : ''}`} onClick={() => navigateToFolder(folder)}>
                  <span className="se-folder-item-icon">📁</span>
                  <div className="se-folder-item-info">
                    <span className="se-folder-item-name">{folder.name}</span>
                    <span className="se-folder-item-count">{folder.fileCount} files</span>
                  </div>
                  <RiskBars u={folder.classificationRisk} e={folder.exposureRisk} r={folder.governanceRisk} size="small" />
                  {folder.subfolders && folder.subfolders.length > 0 && <span className="se-folder-item-arrow">›</span>}
                </div>
              ))}
            </div>
          </div>

          {/* ─── 3. File Table ─── */}
          <div className="se-table-section">
            {!selectedFolder ? (
              <div className="se-no-folder">
                <span className="se-no-folder-icon">📂</span>
                <p>Click a folder above to explore its files</p>
              </div>
            ) : (
              <>
                {/* folder header + mitigation bar */}
                <div className="se-folder-header">
                  <div className="se-folder-info">
                    <span className="se-folder-name">📁 {selectedFolder.name}</span>
                    <span className="se-folder-count">{selectedFolder.fileCount} files</span>
                    <RiskBars u={selectedFolder.classificationRisk} e={selectedFolder.exposureRisk} r={selectedFolder.governanceRisk} />
                  </div>
                  <div className="se-folder-mit">
                    <div className="se-fm-group">
                      <span className="se-fm-group-label" style={{borderLeftColor:'#8b5cf6'}}>🏷️ Unlabeled ({mitCounts.unlabeled})</span>
                      <div className="se-fm-btns">
                        <button className="se-fm-btn" onClick={() => setMitigationModal('folder-auto-label')}>Auto-label folder</button>
                        <button className="se-fm-btn" onClick={() => setMitigationModal('folder-ai-classify')}>AI-classify</button>
                      </div>
                    </div>
                    <div className="se-fm-group">
                      <span className="se-fm-group-label" style={{borderLeftColor:'#f97316'}}>🔓 Overexposed ({mitCounts.overexposed})</span>
                      <div className="se-fm-btns">
                        <button className="se-fm-btn" onClick={() => setMitigationModal('folder-restrict')}>Restrict permissions</button>
                        <button className="se-fm-btn" onClick={() => setMitigationModal('folder-inherit')}>Inherit site perms</button>
                      </div>
                    </div>
                    <div className="se-fm-group">
                      <span className="se-fm-group-label" style={{borderLeftColor:'#eab308'}}>🗑️ ROT ({mitCounts.rot})</span>
                      <div className="se-fm-btns">
                        <button className="se-fm-btn" onClick={() => setMitigationModal('folder-retention')}>Retention policy</button>
                        <button className="se-fm-btn" onClick={() => setMitigationModal('folder-flag')}>Flag for review</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* data table */}
                <div className="se-table-wrap">
                  <table className="se-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('riskScore')}>Risk{sortIndicator('riskScore')}</th>
                        <th onClick={() => handleSort('name')}>File Name{sortIndicator('name')}</th>
                        <th onClick={() => handleSort('owner')}>Owner{sortIndicator('owner')}</th>
                        <th onClick={() => handleSort('permissionedUsers')}>Perm'd{sortIndicator('permissionedUsers')}</th>
                        <th onClick={() => handleSort('accessedUsers30d')}>30d{sortIndicator('accessedUsers30d')}</th>
                        <th onClick={() => handleSort('exposure')}>Exposure{sortIndicator('exposure')}</th>
                        <th onClick={() => handleSort('mipLabel')}>Label{sortIndicator('mipLabel')}</th>
                        <th>Classifications</th>
                        <th onClick={() => handleSort('category')}>Category{sortIndicator('category')}</th>
                        <th onClick={() => handleSort('createdDate')}>Created{sortIndicator('createdDate')}</th>
                        <th onClick={() => handleSort('lastAccessed')}>Accessed{sortIndicator('lastAccessed')}</th>
                        <th onClick={() => handleSort('lastEdited')}>Edited{sortIndicator('lastEdited')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFiles.map(f => {
                        const allRisk = f.isUnlabeled && f.isOverexposed && f.isROT;
                        const anyRisk = f.isUnlabeled || f.isOverexposed || f.isROT;
                        const isSelected = selectedFileId === f.id;
                        const rowBg = isSelected ? 'rgba(99,102,241,0.08)' : allRisk ? 'rgba(239,68,68,0.12)' : anyRisk ? 'rgba(239,68,68,0.04)' : 'transparent';
                        return (
                          <React.Fragment key={f.id}>
                          <tr style={{ background: rowBg, cursor: 'pointer', borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent' }} onClick={() => setSelectedFileId(isSelected ? null : f.id)}>
                            <td>
                              <span className="se-risk-dots">
                                <span className="se-dot" style={{ background: f.isUnlabeled ? '#ef4444' : '#22c55e', opacity: f.isUnlabeled ? 1 : 0.35 }} title="Unlabeled" />
                                <span className="se-dot" style={{ background: f.isOverexposed ? '#ef4444' : '#22c55e', opacity: f.isOverexposed ? 1 : 0.35 }} title="Overexposed" />
                                <span className="se-dot" style={{ background: f.isROT ? '#ef4444' : '#22c55e', opacity: f.isROT ? 1 : 0.35 }} title="ROT" />
                              </span>
                            </td>
                            <td>
                              <div className="se-fname">{fileIcon(f.type)} <strong>{f.name}</strong></div>
                              <div className="se-fpath">{f.fullPath}</div>
                            </td>
                            <td>{f.owner}</td>
                            <td style={{ color: f.permissionedUsers > 50 ? '#f97316' : '#cbd5e1' }}>{f.permissionedUsers}</td>
                            <td>{f.accessedUsers30d}</td>
                            <td><span className="se-exp-badge" style={exposureStyle(f.exposure)}>{f.exposure}</span></td>
                            <td>{f.mipLabel ? <span className="se-label-badge">{f.mipLabel}</span> : <span className="se-muted">—</span>}</td>
                            <td>{f.classifications && f.classifications.length > 0 ? f.classifications.map((c, i) => (
  <span key={i} className={`se-class-chip ${c.isSmartSIT ? 'se-class-smart' : ''}`} title={c.isSmartSIT ? `SmartSIT — ${c.confidence}% confidence` : `SIT — ${c.confidence}% confidence`}>
    {c.name}{c.isSmartSIT && ' ✨'}
  </span>
)) : <span className="se-muted">—</span>}</td>
                            <td><span className={`se-cat-badge ${f.category === 'Unknown' ? 'se-cat-unknown' : ''}`}>{f.category}</span></td>
                            <td className="se-date">{compactDate(f.createdDate)}</td>
                            <td className="se-date">{compactDate(f.lastAccessed)}</td>
                            <td className="se-date">{compactDate(f.lastEdited)}</td>
                          </tr>
                          {isSelected && (() => {
                            const narrative = getFileNarrative(f.name, f.type, f.owner);
                            return (
                              <tr className="se-file-narrative-row">
                                <td colSpan="100%">
                                  <div className="se-file-narrative">
                                    <div className="se-file-narrative-header">
                                      <span className="se-file-narrative-icon">✨</span>
                                      <span className="se-file-narrative-label">Posture Agent Insights</span>
                                    </div>
                                    <p className="se-file-narrative-summary">{narrative.summary}</p>
                                    <ul className="se-file-narrative-events">
                                      {narrative.actions.map((action, idx) => (
                                        <li key={idx}>{action}</li>
                                      ))}
                                    </ul>
                                    <a className="se-file-narrative-link" href="https://www.microsoft.com" target="_blank" rel="noopener noreferrer">View all activity logs for this file →</a>
                                    <div className="se-file-actions">
                                      <div className="se-fa-group">
                                        <div className="se-fa-group-head">
                                          <span className="se-fa-dot" style={{background: f.isUnlabeled ? '#ef4444' : '#22c55e', boxShadow: f.isUnlabeled ? '0 0 6px rgba(239,68,68,0.4)' : 'none'}} />
                                          <span className="se-fa-group-title">🏷️ Classification</span>
                                        </div>
                                        <div className="se-fa-btns">
                                          <button className="se-fa-btn" onClick={(e) => {e.stopPropagation(); setFileActionModal({type:'apply-label', file:f});}}>Apply label</button>
                                          <button className="se-fa-btn" onClick={(e) => {e.stopPropagation(); setFileActionModal({type:'ai-classify', file:f});}}>AI-classify</button>
                                        </div>
                                      </div>
                                      <div className="se-fa-group">
                                        <div className="se-fa-group-head">
                                          <span className="se-fa-dot" style={{background: f.isOverexposed ? '#ef4444' : '#22c55e', boxShadow: f.isOverexposed ? '0 0 6px rgba(239,68,68,0.4)' : 'none'}} />
                                          <span className="se-fa-group-title">🔓 Permissions</span>
                                        </div>
                                        <div className="se-fa-btns">
                                          <button className="se-fa-btn" onClick={(e) => {e.stopPropagation(); setFileActionModal({type:'restrict-access', file:f});}}>Restrict access</button>
                                          <button className="se-fa-btn" onClick={(e) => {e.stopPropagation(); setFileActionModal({type:'revoke-external', file:f});}}>Revoke external</button>
                                        </div>
                                      </div>
                                      <div className="se-fa-group">
                                        <div className="se-fa-group-head">
                                          <span className="se-fa-dot" style={{background: f.isROT ? '#ef4444' : '#22c55e', boxShadow: f.isROT ? '0 0 6px rgba(239,68,68,0.4)' : 'none'}} />
                                          <span className="se-fa-group-title">🗑️ Governance</span>
                                        </div>
                                        <div className="se-fa-btns">
                                          <button className="se-fa-btn" onClick={(e) => {e.stopPropagation(); setFileActionModal({type:'retention-label', file:f});}}>Retention label</button>
                                          <button className="se-fa-btn" onClick={(e) => {e.stopPropagation(); setFileActionModal({type:'flag-review', file:f});}}>Flag for review</button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })()}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {renderMitigationModal()}

      {fileActionModal && (
        <div className="se-fa-modal-overlay" onClick={() => setFileActionModal(null)}>
          <div className="se-fa-modal" onClick={e => e.stopPropagation()}>
            <div className="se-fa-modal-header">
              <h3>
                {fileActionModal.type === 'apply-label' && '🏷️ Apply Sensitivity Label'}
                {fileActionModal.type === 'ai-classify' && '🤖 AI-Native Classification'}
                {fileActionModal.type === 'restrict-access' && '🔒 Restrict Access'}
                {fileActionModal.type === 'revoke-external' && '🚫 Revoke External Sharing'}
                {fileActionModal.type === 'retention-label' && '📋 Apply Retention Label'}
                {fileActionModal.type === 'flag-review' && '🚩 Flag for Review'}
              </h3>
              <button className="se-fa-modal-close" onClick={() => setFileActionModal(null)}>✕</button>
            </div>
            <div className="se-fa-modal-body">
              <div className="se-fa-modal-file">
                <span className="se-fa-modal-file-icon">{fileActionModal.file.type === 'xlsx' ? '📗' : fileActionModal.file.type === 'docx' ? '📘' : fileActionModal.file.type === 'pdf' ? '📕' : fileActionModal.file.type === 'pptx' ? '📙' : '📄'}</span>
                <div>
                  <strong>{fileActionModal.file.name}</strong>
                  <span className="se-fa-modal-file-path">{fileActionModal.file.fullPath}</span>
                </div>
              </div>

              {fileActionModal.type === 'apply-label' && (
                <>
                  <p>Apply a sensitivity label to this file. The label controls encryption, access permissions, and visual markings. {fileActionModal.file.mipLabel ? `Currently labeled: ${fileActionModal.file.mipLabel}.` : 'This file has no label.'}</p>
                  <div className="se-fa-modal-field">
                    <label>Select sensitivity label</label>
                    <div className="se-fa-modal-options">
                      {['Public', 'General', 'Confidential', 'Highly Confidential', 'Restricted'].map(l => (
                        <button key={l} className={`se-fa-modal-opt ${fileActionModal.file.mipLabel === l ? 'se-fa-modal-opt-current' : ''}`}>
                          {l} {fileActionModal.file.mipLabel === l && <span className="se-fa-opt-badge">current</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  {fileActionModal.file.category && fileActionModal.file.category !== 'Unknown' && (
                    <div className="se-fa-modal-suggestion">
                      💡 Suggested label based on category: <strong>{fileActionModal.file.category}_LABEL</strong>
                    </div>
                  )}
                </>
              )}

              {fileActionModal.type === 'ai-classify' && (
                <>
                  <p>Run AI-native classification on this file using LLM-powered Smart SITs and semantic classifiers. This will analyze the file content and recommend the most accurate sensitivity label.</p>
                  <div className="se-fa-modal-steps">
                    <div className="se-fa-step"><span className="se-fa-step-n">1</span><div><strong>Content Analysis</strong><br/>AI graders analyze document content, structure, and context</div></div>
                    <div className="se-fa-step"><span className="se-fa-step-n">2</span><div><strong>SIT Detection</strong><br/>Scan for sensitive information types (SSN, credit cards, etc.)</div></div>
                    <div className="se-fa-step"><span className="se-fa-step-n">3</span><div><strong>Label Recommendation</strong><br/>High-confidence label recommendation based on classification results</div></div>
                  </div>
                  <div className="se-fa-modal-info">
                    <div className="se-fa-info-item"><span>📄 File</span><strong>{fileActionModal.file.name}</strong></div>
                    <div className="se-fa-info-item"><span>🏷️ Current label</span><strong>{fileActionModal.file.mipLabel || 'None'}</strong></div>
                    <div className="se-fa-info-item"><span>📂 Category</span><strong>{fileActionModal.file.category || 'Unknown'}</strong></div>
                  </div>
                </>
              )}

              {fileActionModal.type === 'restrict-access' && (
                <>
                  <p>Restrict access permissions on this file. Currently {fileActionModal.file.permissionedUsers} users have access, but only {fileActionModal.file.accessedUsers30d} accessed it in the last 30 days.</p>
                  <div className="se-fa-modal-field">
                    <label>Restrict to</label>
                    <div className="se-fa-modal-options">
                      <button className="se-fa-modal-opt">Owner only ({fileActionModal.file.owner})</button>
                      <button className="se-fa-modal-opt">Active users only ({fileActionModal.file.accessedUsers30d} users)</button>
                      <button className="se-fa-modal-opt">Specific people (choose)</button>
                      <button className="se-fa-modal-opt">Remove all "Everyone" links</button>
                    </div>
                  </div>
                  <div className="se-fa-modal-info">
                    <div className="se-fa-info-item"><span>👥 Permissioned</span><strong>{fileActionModal.file.permissionedUsers}</strong></div>
                    <div className="se-fa-info-item"><span>📊 Active (30d)</span><strong>{fileActionModal.file.accessedUsers30d}</strong></div>
                    <div className="se-fa-info-item"><span>🔓 Exposure</span><strong>{fileActionModal.file.exposure}</strong></div>
                  </div>
                </>
              )}

              {fileActionModal.type === 'revoke-external' && (
                <>
                  <p>Immediately revoke all external sharing links and permissions on this file. This will remove access for anyone outside your organization.</p>
                  <div className="se-fa-modal-field">
                    <label>Actions to take</label>
                    <div className="se-fa-modal-options">
                      <button className="se-fa-modal-opt se-fa-modal-opt-active">Revoke all external sharing links</button>
                      <button className="se-fa-modal-opt se-fa-modal-opt-active">Remove guest user permissions</button>
                      <button className="se-fa-modal-opt">Block future external sharing on this file</button>
                    </div>
                  </div>
                  <div className="se-fa-modal-warning">
                    ⚠️ External users will lose access immediately. This action cannot be undone automatically.
                  </div>
                </>
              )}

              {fileActionModal.type === 'retention-label' && (
                <>
                  <p>Apply a retention label to this file using Purview Data Lifecycle Management (DLM). This determines how long the file is kept and what happens when the retention period expires. {fileActionModal.file.isROT ? 'This file has not been accessed in over a year and is a candidate for retention.' : ''}</p>
                  <div className="se-fa-modal-field">
                    <label>Retention action</label>
                    <div className="se-fa-modal-options">
                      <button className="se-fa-modal-opt">Delete after review period (30 days)</button>
                      <button className="se-fa-modal-opt">Move to archive</button>
                      <button className="se-fa-modal-opt">Apply "5-year retention" label</button>
                      <button className="se-fa-modal-opt">Apply "Regulatory hold" label</button>
                    </div>
                  </div>
                  <div className="se-fa-modal-info">
                    <div className="se-fa-info-item"><span>📅 Created</span><strong>{fileActionModal.file.createdDate}</strong></div>
                    <div className="se-fa-info-item"><span>📅 Last accessed</span><strong>{fileActionModal.file.lastAccessed}</strong></div>
                    <div className="se-fa-info-item"><span>👤 Owner</span><strong>{fileActionModal.file.owner}</strong></div>
                  </div>
                </>
              )}

              {fileActionModal.type === 'flag-review' && (
                <>
                  <p>Flag this file for review by the site owner or a designated reviewer. They will receive a notification to review the file and decide on the appropriate action (keep, archive, or delete).</p>
                  <div className="se-fa-modal-field">
                    <label>Send review request to</label>
                    <div className="se-fa-modal-options">
                      <button className="se-fa-modal-opt se-fa-modal-opt-active">Site owner</button>
                      <button className="se-fa-modal-opt">File owner ({fileActionModal.file.owner})</button>
                      <button className="se-fa-modal-opt">Compliance team</button>
                    </div>
                  </div>
                  <div className="se-fa-modal-field">
                    <label>Review reason</label>
                    <div className="se-fa-modal-options">
                      <button className="se-fa-modal-opt se-fa-modal-opt-active">ROT content — not accessed in 1+ year</button>
                      <button className="se-fa-modal-opt">Suspected sensitive content</button>
                      <button className="se-fa-modal-opt">Overshared — needs permission review</button>
                      <button className="se-fa-modal-opt">Duplicate or redundant content</button>
                    </div>
                  </div>
                </>
              )}

              <div className="se-fa-modal-actions">
                <button className="se-fa-modal-apply" onClick={() => setFileActionModal(null)}>
                  {fileActionModal.type === 'apply-label' && 'Apply Label'}
                  {fileActionModal.type === 'ai-classify' && 'Start Classification'}
                  {fileActionModal.type === 'restrict-access' && 'Apply Restrictions'}
                  {fileActionModal.type === 'revoke-external' && 'Revoke Access'}
                  {fileActionModal.type === 'retention-label' && 'Apply Retention'}
                  {fileActionModal.type === 'flag-review' && 'Send for Review'}
                </button>
                <button className="se-fa-modal-cancel" onClick={() => setFileActionModal(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ─── overlay & container ─── */
        .se-overlay{position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:20px}
        .se-container{background:#0f172a;border-radius:12px;width:100%;max-width:1600px;margin:auto;display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(255,255,255,0.06);box-shadow:0 25px 60px rgba(0,0,0,0.5);height:92vh;max-height:92vh}

        /* ─── header ─── */
        .se-header{display:flex;justify-content:space-between;align-items:flex-start;padding:14px 20px;background:linear-gradient(135deg,#1e293b,#0f172a);border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0}
        .se-header-left{display:flex;flex-direction:column;gap:6px}
        .se-header-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
        .se-site-badge{font-size:15px;font-weight:700;color:#f1f5f9}
        .se-site-url{font-size:11px;color:#38bdf8;text-decoration:none}
        .se-site-url:hover{text-decoration:underline}
        .se-header-meta{font-size:10px;color:#64748b;background:rgba(255,255,255,0.04);padding:2px 8px;border-radius:4px}
        .se-header-risks{display:flex;gap:16px;margin-top:4px}
        .se-risk-trio{display:inline-flex;align-items:center;gap:5px}
        .se-risk-trio-label{font-size:10px;color:#94a3b8;white-space:nowrap}
        .se-risk-trio-bar{width:60px;height:6px;background:#1e293b;border-radius:3px;display:inline-block;position:relative;overflow:hidden}
        .se-risk-trio-bar>span{position:absolute;left:0;top:0;height:100%;border-radius:3px}
        .se-risk-trio-val{font-size:10px;font-weight:600;min-width:28px}
        .se-close{background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;padding:4px 8px;border-radius:6px}
        .se-close:hover{background:rgba(255,255,255,0.08);color:#f1f5f9}

        /* ─── folder navigator ─── */
        .se-folder-nav{flex-shrink:0;border-bottom:1px solid rgba(255,255,255,0.06);background:rgba(15,23,42,0.6)}
        .se-nav-breadcrumb{padding:8px 16px;font-size:11px;display:flex;align-items:center;gap:4px;border-bottom:1px solid rgba(255,255,255,0.04);flex-wrap:wrap}
        .se-nav-bc-item{color:#94a3b8;white-space:nowrap}
        .se-nav-bc-link{cursor:pointer;color:#38bdf8}.se-nav-bc-link:hover{text-decoration:underline}
        .se-nav-bc-sep{color:#334155}
        .se-folder-list{display:flex;flex-wrap:wrap;gap:4px;padding:8px 12px;max-height:120px;overflow-y:auto}
        .se-folder-item{display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:7px;cursor:pointer;transition:all .12s;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.04);min-width:180px;flex:0 0 auto}
        .se-folder-item:hover{background:rgba(56,189,248,0.06);border-color:rgba(56,189,248,0.15)}
        .se-folder-item-active{background:rgba(56,189,248,0.1);border-color:rgba(56,189,248,0.3)}
        .se-folder-back{color:#64748b;min-width:60px}
        .se-folder-item-icon{font-size:14px;flex-shrink:0}
        .se-folder-item-info{display:flex;flex-direction:column;gap:1px;min-width:0}
        .se-folder-item-name{font-size:11px;font-weight:600;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .se-folder-item-count{font-size:9px;color:#64748b}
        .se-folder-item-arrow{font-size:12px;color:#475569;margin-left:auto}

        /* ─── breadcrumb bar ─── */
        .se-breadcrumb-bar{flex-shrink:0;padding:6px 20px;font-size:11px;color:#94a3b8;background:rgba(30,41,59,0.5);border-bottom:1px solid rgba(255,255,255,0.06)}

        /* ─── no folder prompt ─── */
        .se-no-folder{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#475569;gap:8px;padding:60px 0}
        .se-no-folder-icon{font-size:40px;opacity:0.4}
        .se-no-folder p{font-size:13px}

        /* ─── folder header + mitigation bar ─── */
        .se-folder-header{flex-shrink:0;padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.06);background:rgba(30,41,59,0.4)}
        .se-folder-info{display:flex;align-items:center;gap:12px;margin-bottom:6px}
        .se-folder-name{font-size:13px;font-weight:700;color:#e2e8f0}
        .se-folder-count{font-size:10px;color:#64748b;background:rgba(255,255,255,0.06);padding:1px 6px;border-radius:8px}
        .se-folder-mit{display:flex;gap:6px;flex-wrap:wrap}
        .se-fm-group{display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:6px;background:rgba(255,255,255,0.02);border-left:3px solid}
        .se-fm-group-label{font-size:9px;font-weight:700;color:#94a3b8;white-space:nowrap}
        .se-fm-btns{display:flex;gap:3px}
        .se-fm-btn{font-size:9px;padding:3px 8px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);color:#a0a0b8;cursor:pointer;font-family:inherit;transition:all .12s;white-space:nowrap}
        .se-fm-btn:hover{background:rgba(99,102,241,0.1);border-color:rgba(99,102,241,0.25);color:#c4b5fd}

        /* ─── file table ─── */
        .se-table-section{flex:1;overflow:hidden;display:flex;flex-direction:column}
        .se-table-wrap{flex:1;overflow:auto}
        .se-table{width:100%;border-collapse:collapse;font-size:11px}
        .se-table thead{position:sticky;top:0;z-index:2}
        .se-table th{background:#1e293b;color:#94a3b8;padding:7px 8px;text-align:left;font-weight:600;font-size:10px;cursor:pointer;white-space:nowrap;border-bottom:1px solid rgba(255,255,255,0.08);user-select:none}
        .se-table th:hover{color:#e2e8f0}
        .se-table td{padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.03);color:#cbd5e1;vertical-align:middle}
        .se-table tbody tr:hover{background:rgba(56,189,248,0.04)}

        /* risk dots */
        .se-risk-dots{display:inline-flex;gap:3px;align-items:center}
        .se-dot{width:9px;height:9px;border-radius:50%;display:inline-block}

        /* file name */
        .se-fname{font-size:11px;color:#e2e8f0;white-space:nowrap}
        .se-fpath{font-size:9px;color:#475569;white-space:nowrap;max-width:220px;overflow:hidden;text-overflow:ellipsis}

        /* exposure badge */
        .se-exp-badge{font-size:9px;padding:2px 6px;border-radius:4px;white-space:nowrap;font-weight:600}

        /* label badge */
        .se-label-badge{font-size:9px;padding:2px 6px;border-radius:4px;background:rgba(168,85,247,0.15);color:#c084fc;font-weight:600}

        /* classification chips */
        .se-class-chip{font-size:8px;padding:1px 5px;border-radius:3px;background:rgba(234,179,8,0.12);color:#fde047;margin-right:3px;white-space:nowrap}
        .se-class-smart{background:rgba(139,92,246,0.15)!important;color:#c4b5fd!important;border:1px solid rgba(139,92,246,0.2)}

        /* category badge */
        .se-cat-badge{font-size:9px;padding:2px 6px;border-radius:4px;background:rgba(99,102,241,0.12);color:#a5b4fc;white-space:nowrap}
        .se-cat-unknown{background:rgba(255,255,255,0.05);color:#64748b}

        /* muted */
        .se-muted{color:#475569}
        .se-date{white-space:nowrap;font-size:10px;color:#64748b}

        /* ─── mitigation modal ─── */
        .dd-mit-overlay{position:fixed;inset:0;z-index:10002;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center}
        .dd-mit-modal{background:#1e293b;border-radius:12px;width:520px;max-height:70vh;display:flex;flex-direction:column;border:1px solid rgba(255,255,255,0.08);box-shadow:0 20px 50px rgba(0,0,0,0.5);overflow:hidden}
        .dd-mit-header{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06)}
        .dd-mit-header h3{font-size:14px;font-weight:600;margin:0}
        .dd-mit-close{background:none;border:1px solid rgba(255,255,255,0.1);color:#6b6b80;width:24px;height:24px;border-radius:6px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .dd-mit-close:hover{background:rgba(255,255,255,0.08);color:white}
        .dd-mit-body{padding:16px 18px;overflow-y:auto}
        .dd-mit-body p, .dd-mit-desc{font-size:12px;color:#a0a0b8;line-height:1.6;margin:0 0 14px}
        .dd-mit-field{margin-bottom:12px}
        .dd-mit-field label{font-size:10px;color:#6b6b80;text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:6px}
        .dd-mit-select{display:flex;flex-direction:column;gap:4px}
        .dd-mit-opt{padding:8px 12px;border-radius:7px;font-size:11px;font-weight:500;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);color:#c0c0d0;cursor:pointer;transition:all .15s;text-align:left;font-family:inherit}
        .dd-mit-opt:hover{background:rgba(99,102,241,0.08);border-color:rgba(99,102,241,0.2)}
        .dd-mit-opt-active{background:rgba(99,102,241,0.1);border-color:rgba(99,102,241,0.3);color:#a5b4fc}
        .dd-mit-info-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:11px;color:#8888a0;border-bottom:1px solid rgba(255,255,255,0.03)}
        .dd-mit-info-row strong{color:#e0e0f0;font-size:12px}
        .dd-mit-steps-compact{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
        .dd-mit-step-c{display:flex;align-items:center;gap:8px;font-size:11px;color:#a0a0b8}
        .dd-mit-step-n{width:20px;height:20px;display:flex;align-items:center;justify-content:center;background:rgba(99,102,241,0.2);color:#a5b4fc;border-radius:50%;font-size:10px;font-weight:700;flex-shrink:0}
        .dd-mit-file-preview{margin-top:10px;padding:8px;background:rgba(255,255,255,0.02);border-radius:6px;border:1px solid rgba(255,255,255,0.04);max-height:120px;overflow-y:auto}
        .dd-mit-file-item{font-size:10px;color:#a0a0b8;padding:3px 0;display:flex;align-items:center;gap:4px}
        .dd-mit-file-suggest{color:#a78bfa;font-size:9px;margin-left:auto}
        .dd-mit-file-more{font-size:9px;color:#6b6b80;padding:4px 0;font-style:italic}
        .dd-mit-actions{display:flex;gap:8px;justify-content:flex-end;padding-top:12px;margin-top:14px;border-top:1px solid rgba(255,255,255,0.06)}
        .dd-mit-apply{padding:8px 18px;border-radius:8px;font-size:12px;font-weight:600;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;color:white;cursor:pointer;font-family:inherit;transition:all .15s}
        .dd-mit-apply:hover{opacity:0.9}
        .dd-mit-cancel{padding:8px 14px;border-radius:8px;font-size:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#a0a0b8;cursor:pointer;font-family:inherit;transition:all .15s}
        .dd-mit-cancel:hover{background:rgba(255,255,255,0.1)}
        .last-scanned { font-size: 10px; color: #4a4a60; display: inline-flex; align-items: center; gap: 4px; }

        /* ─── file narrative panel ─── */
        .se-file-narrative-row td{padding:0!important;border-bottom:1px solid rgba(99,102,241,0.15)!important}
        .se-file-narrative{padding:12px 16px;background:linear-gradient(135deg,rgba(99,102,241,0.04),rgba(139,92,246,0.03));border-left:3px solid rgba(99,102,241,0.3);margin:0 8px;animation:seNarrIn .15s ease}
        @keyframes seNarrIn{from{opacity:0;max-height:0}to{opacity:1;max-height:300px}}
        .se-file-narrative-header{display:flex;align-items:center;gap:5px;margin-bottom:6px}
        .se-file-narrative-icon{font-size:14px}
        .se-file-narrative-label{font-size:9px;font-weight:700;color:#8b5cf6;text-transform:uppercase;letter-spacing:0.5px}
        .se-file-narrative-summary{font-size:11px;color:#a0a0b8;line-height:1.5;margin:0 0 8px}
        .se-file-narrative-events{margin:0 0 8px;padding:0 0 0 16px;list-style:none}
        .se-file-narrative-events li{font-size:10px;color:#8888a0;line-height:1.6;padding:2px 0;position:relative}
        .se-file-narrative-events li::before{content:'•';position:absolute;left:-12px;color:#6366f1}
        .se-file-narrative-link{display:inline-block;font-size:10px;color:#818cf8;text-decoration:none;font-weight:600;transition:color .15s}
        .se-file-narrative-link:hover{color:#a5b4fc;text-decoration:underline}
        .se-file-actions{display:flex;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)}
        .se-fa-group{flex:1;padding:8px 10px;border-radius:7px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04)}
        .se-fa-group-head{display:flex;align-items:center;gap:5px;margin-bottom:6px}
        .se-fa-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
        .se-fa-group-title{font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.3px}
        .se-fa-btns{display:flex;gap:4px;flex-wrap:wrap}
        .se-fa-btn{font-size:9px;padding:4px 8px;border-radius:5px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);color:#a0a0b8;cursor:pointer;font-family:inherit;transition:all .12s;white-space:nowrap}
        .se-fa-btn:hover{background:rgba(99,102,241,0.1);border-color:rgba(99,102,241,0.25);color:#c4b5fd}
        .se-fa-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);z-index:10003;display:flex;align-items:center;justify-content:center;animation:ddFadeIn .15s ease}
        .se-fa-modal{background:#13132a;border:1px solid rgba(99,102,241,0.25);border-radius:14px;width:480px;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.6);animation:ddScaleIn .2s ease}
        .se-fa-modal-header{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06)}
        .se-fa-modal-header h3{font-size:14px;font-weight:600;margin:0}
        .se-fa-modal-close{background:none;border:1px solid rgba(255,255,255,0.1);color:#6b6b80;width:24px;height:24px;border-radius:6px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .se-fa-modal-close:hover{background:rgba(255,255,255,0.08);color:white}
        .se-fa-modal-body{padding:16px 20px}
        .se-fa-modal-body p{font-size:12px;color:#a0a0b8;line-height:1.6;margin:0 0 14px}
        .se-fa-modal-body strong{color:#e0e0f0}
        .se-fa-modal-file{display:flex;gap:10px;align-items:center;padding:10px 12px;margin-bottom:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px}
        .se-fa-modal-file-icon{font-size:22px}
        .se-fa-modal-file strong{display:block;font-size:12px;font-weight:600;color:#e0e0f0}
        .se-fa-modal-file-path{font-size:9px;color:#64748b;display:block;margin-top:2px}
        .se-fa-modal-field{margin-bottom:14px}
        .se-fa-modal-field label{font-size:10px;color:#6b6b80;text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:6px}
        .se-fa-modal-options{display:flex;flex-direction:column;gap:4px}
        .se-fa-modal-opt{padding:8px 12px;border-radius:7px;font-size:11px;font-weight:500;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);color:#c0c0d0;cursor:pointer;transition:all .15s;text-align:left;font-family:inherit}
        .se-fa-modal-opt:hover{background:rgba(99,102,241,0.08);border-color:rgba(99,102,241,0.2)}
        .se-fa-modal-opt-active{background:rgba(99,102,241,0.1);border-color:rgba(99,102,241,0.3);color:#a5b4fc}
        .se-fa-modal-opt-current{border-color:rgba(34,197,94,0.3);color:#86efac}
        .se-fa-opt-badge{font-size:8px;background:rgba(34,197,94,0.15);color:#22c55e;padding:1px 5px;border-radius:3px;margin-left:6px;text-transform:uppercase;font-weight:700}
        .se-fa-modal-suggestion{font-size:11px;color:#a78bfa;padding:8px 12px;background:rgba(139,92,246,0.06);border:1px dashed rgba(139,92,246,0.2);border-radius:7px;margin-bottom:14px}
        .se-fa-modal-warning{font-size:11px;color:#f97316;padding:8px 12px;background:rgba(249,115,22,0.06);border:1px solid rgba(249,115,22,0.15);border-radius:7px;margin-bottom:14px}
        .se-fa-modal-steps{display:flex;flex-direction:column;gap:8px;margin-bottom:14px}
        .se-fa-step{display:flex;gap:10px;align-items:flex-start;padding:8px;background:rgba(255,255,255,0.02);border-radius:7px}
        .se-fa-step-n{width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:rgba(99,102,241,0.2);color:#a5b4fc;border-radius:50%;font-size:11px;font-weight:700;flex-shrink:0}
        .se-fa-step div{font-size:11px;color:#a0a0b8;line-height:1.4}
        .se-fa-step strong{color:#e0e0f0}
        .se-fa-modal-info{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap}
        .se-fa-info-item{flex:1;min-width:100px;text-align:center;padding:8px 6px;background:rgba(255,255,255,0.03);border-radius:7px}
        .se-fa-info-item span{display:block;font-size:9px;color:#6b6b80;margin-bottom:2px}
        .se-fa-info-item strong{font-size:12px;color:#e0e0f0}
        .se-fa-modal-actions{display:flex;gap:8px;justify-content:flex-end;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06)}
        .se-fa-modal-apply{padding:8px 18px;border-radius:8px;font-size:12px;font-weight:600;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;color:white;cursor:pointer;font-family:inherit;transition:all .15s}
        .se-fa-modal-apply:hover{opacity:0.9}
        .se-fa-modal-cancel{padding:8px 14px;border-radius:8px;font-size:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#a0a0b8;cursor:pointer;font-family:inherit;transition:all .15s}
        .se-fa-modal-cancel:hover{background:rgba(255,255,255,0.1)}
      `}</style>
    </>,
    document.body
  );
}
