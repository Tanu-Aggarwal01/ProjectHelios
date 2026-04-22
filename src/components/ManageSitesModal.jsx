import React, { useState, useMemo } from 'react';
import { getTenantSites } from '../data/mockData';

export default function ManageSitesModal({ onClose, onConfirm }) {
  const allSites = useMemo(() => getTenantSites(), []);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [classifierFilter, setClassifierFilter] = useState('');
  const [labelFilter, setLabelFilter] = useState('');
  const [exposureFilter, setExposureFilter] = useState('');

  const uniqueClassifiers = useMemo(() => [...new Set(allSites.flatMap(s => s.classifiers))].sort(), [allSites]);
  const uniqueLabels = useMemo(() => [...new Set(allSites.map(s => s.sensitivityLabel))].sort(), [allSites]);
  const uniqueExposures = useMemo(() => [...new Set(allSites.map(s => s.exposure))], [allSites]);

  const filtered = useMemo(() => {
    return allSites.filter(s => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (classifierFilter && !s.classifiers.includes(classifierFilter)) return false;
      if (labelFilter && s.sensitivityLabel !== labelFilter) return false;
      if (exposureFilter && s.exposure !== exposureFilter) return false;
      return true;
    });
  }, [allSites, search, classifierFilter, labelFilter, exposureFilter]);

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 100) {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (filtered.every(s => selected.has(s.id))) {
      setSelected(prev => {
        const next = new Set(prev);
        filtered.forEach(s => next.delete(s.id));
        return next;
      });
    } else {
      setSelected(prev => {
        const next = new Set(prev);
        filtered.forEach(s => { if (next.size < 100) next.add(s.id); });
        return next;
      });
    }
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every(s => selected.has(s.id));

  return (
    <div className="ms-overlay" onClick={onClose}>
      <div className="ms-modal" onClick={e => e.stopPropagation()}>
        <div className="ms-header">
          <button className="ms-back" onClick={onClose}>←</button>
          <h3>Manage SharePoint sites</h3>
          <button className="ms-close" onClick={onClose}>✕</button>
        </div>

        <div className="ms-body">
          {/* Filters sidebar */}
          <div className="ms-filters">
            <h4>Filter</h4>

            <label className="ms-filter-label">Classifiers</label>
            <select className="ms-select" value={classifierFilter} onChange={e => setClassifierFilter(e.target.value)}>
              <option value="">Select classifiers</option>
              {uniqueClassifiers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label className="ms-filter-label">Sensitivity labels</label>
            <select className="ms-select" value={labelFilter} onChange={e => setLabelFilter(e.target.value)}>
              <option value="">Select sensitivity labels</option>
              {uniqueLabels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>

            <label className="ms-filter-label">Exposure</label>
            <select className="ms-select" value={exposureFilter} onChange={e => setExposureFilter(e.target.value)}>
              <option value="">All exposure types</option>
              {uniqueExposures.map(e => <option key={e} value={e}>{e}</option>)}
            </select>

            {(classifierFilter || labelFilter || exposureFilter) && (
              <button className="ms-clear-btn" onClick={() => { setClassifierFilter(''); setLabelFilter(''); setExposureFilter(''); }}>
                Clear all filters
              </button>
            )}
          </div>

          {/* Site table */}
          <div className="ms-table-area">
            <div className="ms-search-row">
              <input
                className="ms-search"
                type="text"
                placeholder="🔍 Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <span className="ms-count">{selected.size} selected (max 100)</span>
              <span className="ms-showing">Showing {filtered.length} items</span>
            </div>

            <div className="ms-table-wrap">
              <table className="ms-table">
                <thead>
                  <tr>
                    <th className="ms-th-check"><input type="checkbox" checked={allFilteredSelected} onChange={toggleAll} /></th>
                    <th>Site name</th>
                    <th>Classifications</th>
                    <th>Sensitivity labels</th>
                    <th>Exposure</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(site => (
                    <tr
                      key={site.id}
                      className={`ms-row ${selected.has(site.id) ? 'ms-row-selected' : ''}`}
                      onClick={() => toggle(site.id)}
                    >
                      <td className="ms-td-check">
                        <input type="checkbox" checked={selected.has(site.id)} onChange={() => toggle(site.id)} />
                      </td>
                      <td className="ms-td-name">{site.name}</td>
                      <td className="ms-td-class">{site.classifiers.join(', ')}</td>
                      <td>
                        <span className={`ms-label-badge ms-label-${site.sensitivityLabel.toLowerCase().replace(/\s+/g, '-')}`}>
                          {site.sensitivityLabel}
                        </span>
                      </td>
                      <td>
                        <span className={`ms-exposure-badge ms-exp-${site.exposure === 'Anyone links' ? 'anyone' : site.exposure === 'Org-wide' ? 'org' : site.exposure === 'External users' ? 'external' : 'specific'}`}>
                          {site.exposure}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="ms-footer">
          <button className="ms-confirm-btn" onClick={() => onConfirm([...selected])} disabled={selected.size === 0}>
            Confirm ({selected.size})
          </button>
          <button className="ms-cancel-btn" onClick={onClose}>Cancel</button>
        </div>

        <style>{`
          .ms-overlay {
            position: fixed; inset: 0; z-index: 200;
            background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            animation: msIn .2s ease;
          }
          @keyframes msIn { from { opacity: 0; } to { opacity: 1; } }

          .ms-modal {
            width: 920px; max-width: 95vw; height: 80vh;
            background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px; display: flex; flex-direction: column;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            animation: msScale .2s ease;
          }
          @keyframes msScale { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:scale(1); } }

          .ms-header {
            display: flex; align-items: center; gap: 12px;
            padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
          }
          .ms-header h3 { flex: 1; font-size: 16px; font-weight: 600; margin: 0; }
          .ms-back, .ms-close {
            background: none; border: 1px solid rgba(255,255,255,0.1); color: #a0a0b8;
            width: 28px; height: 28px; border-radius: 6px; cursor: pointer; font-size: 14px;
            display: flex; align-items: center; justify-content: center; transition: all .15s;
          }
          .ms-back:hover, .ms-close:hover { background: rgba(255,255,255,0.08); color: white; }

          .ms-body { flex: 1; display: flex; overflow: hidden; }

          /* Filters */
          .ms-filters {
            width: 200px; padding: 16px; border-right: 1px solid rgba(255,255,255,0.06);
            display: flex; flex-direction: column; gap: 10px; flex-shrink: 0;
          }
          .ms-filters h4 { font-size: 14px; font-weight: 700; margin: 0; }
          .ms-filter-label { font-size: 11px; color: #8888a0; font-weight: 600; }
          .ms-select {
            width: 100%; padding: 7px 10px; border-radius: 6px; font-size: 12px;
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
            color: #c0c0d8; font-family: inherit; cursor: pointer;
          }
          .ms-select:focus { outline: none; border-color: #6366f1; }
          .ms-clear-btn {
            font-size: 11px; color: #818cf8; background: none; border: none;
            cursor: pointer; text-align: left; padding: 4px 0; font-family: inherit;
          }
          .ms-clear-btn:hover { text-decoration: underline; }

          /* Table area */
          .ms-table-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

          .ms-search-row {
            display: flex; align-items: center; gap: 12px; padding: 12px 16px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
          }
          .ms-search {
            flex: 1; padding: 7px 12px; border-radius: 6px; font-size: 12px;
            background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
            color: #e0e0f0; font-family: inherit;
          }
          .ms-search:focus { outline: none; border-color: #6366f1; }
          .ms-search::placeholder { color: #4a4a60; }
          .ms-count { font-size: 11px; color: #818cf8; font-weight: 600; white-space: nowrap; }
          .ms-showing { font-size: 11px; color: #6b6b80; white-space: nowrap; }

          .ms-table-wrap { flex: 1; overflow-y: auto; }
          .ms-table { width: 100%; border-collapse: collapse; font-size: 12px; }
          .ms-table thead { position: sticky; top: 0; z-index: 2; }
          .ms-table th {
            text-align: left; padding: 8px 12px; font-size: 11px; font-weight: 600;
            color: #8888a0; background: #1a1a2e; border-bottom: 1px solid rgba(255,255,255,0.08);
          }
          .ms-th-check { width: 36px; text-align: center; }
          .ms-td-check { width: 36px; text-align: center; }
          .ms-table td { padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.03); }
          .ms-row { cursor: pointer; transition: background .15s; }
          .ms-row:hover { background: rgba(255,255,255,0.04); }
          .ms-row-selected { background: rgba(99,102,241,0.08); }
          .ms-td-name { font-weight: 600; color: #e0e0f0; }
          .ms-td-class { color: #8888a0; font-size: 11px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

          .ms-label-badge {
            font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 600;
          }
          .ms-label-highly-confidential { background: rgba(239,68,68,0.12); color: #ef4444; }
          .ms-label-confidential { background: rgba(249,115,22,0.12); color: #f97316; }
          .ms-label-general { background: rgba(99,102,241,0.12); color: #818cf8; }
          .ms-label-public { background: rgba(34,197,94,0.12); color: #22c55e; }

          .ms-exposure-badge { font-size: 10px; padding: 2px 8px; border-radius: 4px; font-weight: 600; }
          .ms-exp-anyone { background: rgba(239,68,68,0.12); color: #ef4444; }
          .ms-exp-org { background: rgba(249,115,22,0.12); color: #f97316; }
          .ms-exp-external { background: rgba(234,179,8,0.12); color: #eab308; }
          .ms-exp-specific { background: rgba(34,197,94,0.08); color: #22c55e; }

          /* Footer */
          .ms-footer {
            display: flex; gap: 10px; padding: 14px 20px;
            border-top: 1px solid rgba(255,255,255,0.06);
          }
          .ms-confirm-btn {
            padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;
            background: #4a6cf7; border: none; color: white;
            cursor: pointer; font-family: inherit; transition: all .15s;
          }
          .ms-confirm-btn:hover:not(:disabled) { background: #5b7cf8; }
          .ms-confirm-btn:disabled { opacity: 0.4; cursor: default; }
          .ms-cancel-btn {
            padding: 8px 16px; border-radius: 8px; font-size: 13px;
            background: none; border: 1px solid rgba(255,255,255,0.1);
            color: #a0a0b8; cursor: pointer; font-family: inherit; transition: all .15s;
          }
          .ms-cancel-btn:hover { background: rgba(255,255,255,0.05); color: #e0e0f0; }

          /* Checkbox styling */
          .ms-table input[type="checkbox"] {
            accent-color: #6366f1; cursor: pointer;
          }
        `}</style>
      </div>
    </div>
  );
}
