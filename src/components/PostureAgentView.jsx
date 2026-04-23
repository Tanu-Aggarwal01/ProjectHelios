import React, { useState, useMemo, useCallback } from 'react';
import { getTenantSites, formatNumber } from '../data/mockData';
import ManageSitesModal from './ManageSitesModal';

const labelColors = {
  'Highly Confidential': '#ef4444',
  'Confidential': '#f97316',
  'General': '#3b82f6',
  'Public': '#22c55e',
  'Internal Only': '#eab308',
  'Non-Business': '#6b7280',
};

const exposureColors = {
  'External': '#ef4444',
  'Org-wide': '#f97316',
  'Internal': '#3b82f6',
  'Private': '#22c55e',
};

export default function PostureAgentView() {
  const allSites = useMemo(() => getTenantSites(), []);
  const recommendedSites = useMemo(
    () => [...allSites].sort((a, b) => b.sensitiveItems - a.sensitiveItems).slice(0, 8),
    [allSites]
  );

  const [watchlists, setWatchlists] = useState([
    { id: 'wl-exec', icon: '👔', name: 'Executive Sites', siteCount: 14, cadence: 'Weekly', risks: { unlabeled: 35, overexposed: 22, rot: 18 } },
    { id: 'wl-legal', icon: '⚖️', name: 'Legal & Compliance', siteCount: 8, cadence: 'Daily', risks: { unlabeled: 12, overexposed: 45, rot: 8 } },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingWatchlistSites, setPendingWatchlistSites] = useState(null);
  const [watchlistName, setWatchlistName] = useState('');
  const [watchlistCadence, setWatchlistCadence] = useState('Weekly');

  const [showManualModal, setShowManualModal] = useState(false);
  const [manualSelection, setManualSelection] = useState(null);

  const handleCreateWatchlistConfirm = useCallback((siteIds) => {
    setPendingWatchlistSites(siteIds);
    setShowCreateModal(false);
    setWatchlistName('');
    setWatchlistCadence('Weekly');
  }, []);

  const finalizeWatchlist = useCallback(() => {
    if (!watchlistName.trim() || !pendingWatchlistSites) return;
    const newWl = {
      id: `wl-${Date.now()}`,
      icon: '📋',
      name: watchlistName.trim(),
      siteCount: pendingWatchlistSites.size || pendingWatchlistSites.length || 0,
      cadence: watchlistCadence,
      risks: { unlabeled: Math.floor(Math.random() * 40), overexposed: Math.floor(Math.random() * 30), rot: Math.floor(Math.random() * 20) },
    };
    setWatchlists(prev => [...prev, newWl]);
    setPendingWatchlistSites(null);
  }, [watchlistName, watchlistCadence, pendingWatchlistSites]);

  const removeWatchlist = useCallback((id) => {
    setWatchlists(prev => prev.filter(w => w.id !== id));
  }, []);

  const handleManualConfirm = useCallback((siteIds) => {
    setManualSelection(siteIds);
    setShowManualModal(false);
  }, []);

  return (
    <div className="pav-root">
      {/* Header */}
      <div className="pav-header">
        <h2 className="pav-title">Posture Agent</h2>
        <div className="pav-status-banner">
          <span className="pav-status-dot" />
          <span className="pav-status-text">✨ Posture Agent is active</span>
          <span className="pav-status-sub">— Analyzing your SharePoint data estate</span>
        </div>
      </div>

      {/* Section A: Agent-Recommended Sites */}
      <section className="pav-section">
        <h3 className="pav-section-title">Agent-recommended sites based on risk signals</h3>
        <div className="pav-site-grid">
          {recommendedSites.map(site => (
            <div key={site.id} className="pav-site-card">
              <div className="pav-site-name">{site.name}</div>
              <div className="pav-site-badges">
                <span className="pav-badge" style={{ background: `${labelColors[site.sensitivityLabel] || '#6b7280'}22`, color: labelColors[site.sensitivityLabel] || '#6b7280', border: `1px solid ${labelColors[site.sensitivityLabel] || '#6b7280'}44` }}>
                  {site.sensitivityLabel}
                </span>
                <span className="pav-badge" style={{ background: `${exposureColors[site.exposure] || '#6b7280'}22`, color: exposureColors[site.exposure] || '#6b7280', border: `1px solid ${exposureColors[site.exposure] || '#6b7280'}44` }}>
                  {site.exposure}
                </span>
              </div>
              <div className="pav-site-stats">
                <span>🔒 {formatNumber(site.sensitiveItems)} sensitive</span>
                <span>📄 {formatNumber(site.totalItems)} total</span>
              </div>
              <button className="pav-run-btn">Run Analysis</button>
            </div>
          ))}
        </div>
      </section>

      {/* Section B: Watchlists */}
      <section className="pav-section">
        <div className="pav-section-header">
          <h3 className="pav-section-title">Watchlists — Admin-curated site groups with custom scan cadence</h3>
          <button className="pav-create-btn" onClick={() => setShowCreateModal(true)}>+ Create Watchlist</button>
        </div>
        <div className="pav-watchlist-grid">
          {watchlists.map(wl => (
            <div key={wl.id} className="pav-wl-card">
              <div className="pav-wl-top">
                <span className="pav-wl-icon">{wl.icon}</span>
                <div className="pav-wl-info">
                  <div className="pav-wl-name">{wl.name}</div>
                  <div className="pav-wl-meta">{wl.siteCount} sites · <span className="pav-cadence-badge">{wl.cadence} scan</span></div>
                </div>
              </div>
              <div className="pav-wl-risks">
                <div className="pav-risk-row">
                  <span className="pav-risk-label">Unlabeled</span>
                  <div className="pav-risk-bar"><div className="pav-risk-fill" style={{ width: `${wl.risks.unlabeled}%`, background: '#eab308' }} /></div>
                  <span className="pav-risk-val">{wl.risks.unlabeled}%</span>
                </div>
                <div className="pav-risk-row">
                  <span className="pav-risk-label">Overexposed</span>
                  <div className="pav-risk-bar"><div className="pav-risk-fill" style={{ width: `${wl.risks.overexposed}%`, background: '#ef4444' }} /></div>
                  <span className="pav-risk-val">{wl.risks.overexposed}%</span>
                </div>
                <div className="pav-risk-row">
                  <span className="pav-risk-label">ROT</span>
                  <div className="pav-risk-bar"><div className="pav-risk-fill" style={{ width: `${wl.risks.rot}%`, background: '#f97316' }} /></div>
                  <span className="pav-risk-val">{wl.risks.rot}%</span>
                </div>
              </div>
              <div className="pav-wl-actions">
                <button className="pav-wl-action-btn">Explore</button>
                <button className="pav-wl-action-btn">Edit</button>
                <button className="pav-wl-action-btn pav-wl-remove" onClick={() => removeWatchlist(wl.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section C: Manual Site Selection */}
      <section className="pav-section">
        <h3 className="pav-section-title">Manual Site Selection</h3>
        <button className="pav-manual-btn" onClick={() => setShowManualModal(true)}>📋 Select sites for analysis</button>
        {manualSelection && (
          <div className="pav-manual-banner">
            <span>✅ {manualSelection.size || 0} sites selected for analysis</span>
            <button className="pav-run-btn">Run Analysis</button>
          </div>
        )}
      </section>

      {/* Modals */}
      {showCreateModal && (
        <ManageSitesModal onClose={() => setShowCreateModal(false)} onConfirm={handleCreateWatchlistConfirm} />
      )}
      {pendingWatchlistSites && (
        <div className="pav-name-overlay">
          <div className="pav-name-dialog">
            <h3>Name Your Watchlist</h3>
            <input
              className="pav-name-input"
              placeholder="Watchlist name…"
              value={watchlistName}
              onChange={e => setWatchlistName(e.target.value)}
              autoFocus
            />
            <div className="pav-cadence-row">
              <label>Scan cadence:</label>
              {['Daily', 'Weekly', 'Monthly', 'On-demand'].map(c => (
                <button
                  key={c}
                  className={`pav-cadence-opt ${watchlistCadence === c ? 'pav-cadence-active' : ''}`}
                  onClick={() => setWatchlistCadence(c)}
                >{c}</button>
              ))}
            </div>
            <div className="pav-name-actions">
              <button className="pav-cancel-btn" onClick={() => setPendingWatchlistSites(null)}>Cancel</button>
              <button className="pav-confirm-btn" disabled={!watchlistName.trim()} onClick={finalizeWatchlist}>Create Watchlist</button>
            </div>
          </div>
        </div>
      )}
      {showManualModal && (
        <ManageSitesModal onClose={() => setShowManualModal(false)} onConfirm={handleManualConfirm} />
      )}

      <style>{`
        .pav-root {
          padding: 28px 36px; overflow-y: auto; height: 100%;
          scrollbar-width: thin; scrollbar-color: #2a2a3a transparent;
        }
        .pav-header { margin-bottom: 28px; }
        .pav-title { font-size: 22px; font-weight: 700; color: #e0e0ff; margin: 0 0 10px; }
        .pav-status-banner {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2);
          padding: 8px 18px; border-radius: 10px;
        }
        .pav-status-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
          box-shadow: 0 0 8px rgba(34,197,94,0.5); animation: pavPulse 2s infinite;
        }
        @keyframes pavPulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .pav-status-text { font-size: 13px; font-weight: 600; color: #22c55e; }
        .pav-status-sub { font-size: 12px; color: #8888a0; }

        .pav-section { margin-bottom: 32px; }
        .pav-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
        .pav-section-title { font-size: 14px; font-weight: 600; color: #c0c0d8; margin: 0 0 14px; }

        /* Site Grid */
        .pav-site-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .pav-site-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 16px; transition: border-color .2s;
        }
        .pav-site-card:hover { border-color: rgba(139,92,246,0.3); }
        .pav-site-name { font-size: 14px; font-weight: 600; color: #e0e0f0; margin-bottom: 8px; }
        .pav-site-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .pav-badge {
          font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 6px;
          letter-spacing: 0.3px; white-space: nowrap;
        }
        .pav-site-stats { display: flex; gap: 16px; font-size: 12px; color: #8888a0; margin-bottom: 12px; }
        .pav-run-btn {
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2));
          border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc;
          padding: 6px 16px; border-radius: 8px; cursor: pointer; font-size: 12px;
          font-family: inherit; font-weight: 600; transition: all .2s;
        }
        .pav-run-btn:hover { background: linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.35)); border-color: #8b5cf6; }

        /* Create Watchlist button */
        .pav-create-btn {
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15));
          border: 1px solid rgba(99,102,241,0.25); color: #a5b4fc;
          padding: 7px 18px; border-radius: 8px; cursor: pointer; font-size: 12px;
          font-family: inherit; font-weight: 600; transition: all .2s;
        }
        .pav-create-btn:hover { background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3)); border-color: #8b5cf6; }

        /* Watchlist Grid */
        .pav-watchlist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .pav-wl-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; padding: 16px; transition: border-color .2s;
        }
        .pav-wl-card:hover { border-color: rgba(139,92,246,0.3); }
        .pav-wl-top { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .pav-wl-icon { font-size: 24px; }
        .pav-wl-name { font-size: 14px; font-weight: 600; color: #e0e0f0; }
        .pav-wl-meta { font-size: 12px; color: #8888a0; margin-top: 2px; }
        .pav-cadence-badge {
          background: rgba(99,102,241,0.15); color: #a5b4fc;
          padding: 1px 7px; border-radius: 4px; font-size: 11px; font-weight: 500;
        }
        .pav-wl-risks { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
        .pav-risk-row { display: flex; align-items: center; gap: 8px; }
        .pav-risk-label { font-size: 11px; color: #7a7a90; width: 80px; flex-shrink: 0; }
        .pav-risk-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
        .pav-risk-fill { height: 100%; border-radius: 3px; transition: width .3s; }
        .pav-risk-val { font-size: 11px; color: #a0a0b8; width: 32px; text-align: right; }
        .pav-wl-actions { display: flex; gap: 6px; }
        .pav-wl-action-btn {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #a0a0b8; padding: 5px 12px; border-radius: 6px; cursor: pointer;
          font-size: 11px; font-family: inherit; transition: all .2s;
        }
        .pav-wl-action-btn:hover { background: rgba(255,255,255,0.08); color: #e0e0f0; }
        .pav-wl-remove:hover { border-color: #ef4444; color: #ef4444; }

        /* Manual */
        .pav-manual-btn {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #a5b4fc; padding: 10px 20px; border-radius: 10px; cursor: pointer;
          font-size: 13px; font-family: inherit; font-weight: 500; transition: all .2s;
        }
        .pav-manual-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(99,102,241,0.3); }
        .pav-manual-banner {
          display: inline-flex; align-items: center; gap: 14px; margin-top: 12px;
          background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2);
          padding: 10px 18px; border-radius: 10px; font-size: 13px; color: #22c55e;
        }

        /* Name dialog overlay */
        .pav-name-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(7,7,15,0.8); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
        }
        .pav-name-dialog {
          background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; padding: 28px 32px; width: 420px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }
        .pav-name-dialog h3 { font-size: 16px; font-weight: 700; color: #e0e0ff; margin: 0 0 16px; }
        .pav-name-input {
          width: 100%; padding: 10px 14px; border-radius: 8px; font-size: 14px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: #e0e0f0; outline: none; font-family: inherit; margin-bottom: 16px; box-sizing: border-box;
        }
        .pav-name-input:focus { border-color: #8b5cf6; }
        .pav-cadence-row { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .pav-cadence-row label { font-size: 13px; color: #a0a0b8; margin-right: 4px; }
        .pav-cadence-opt {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #a0a0b8; padding: 5px 12px; border-radius: 6px; cursor: pointer;
          font-size: 12px; font-family: inherit; transition: all .2s;
        }
        .pav-cadence-opt:hover { background: rgba(255,255,255,0.08); }
        .pav-cadence-active { background: rgba(99,102,241,0.2); border-color: #6366f1; color: #a5b4fc; }
        .pav-name-actions { display: flex; justify-content: flex-end; gap: 10px; }
        .pav-cancel-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: #a0a0b8; padding: 8px 18px; border-radius: 8px; cursor: pointer;
          font-size: 13px; font-family: inherit;
        }
        .pav-confirm-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none;
          color: white; padding: 8px 18px; border-radius: 8px; cursor: pointer;
          font-size: 13px; font-family: inherit; font-weight: 600;
        }
        .pav-confirm-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
