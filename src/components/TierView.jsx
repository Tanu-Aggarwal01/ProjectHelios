import React, { useState } from 'react';
import { tiers, tierSummary, formatNumber, readinessColor, lastScannedLabel } from '../data/mockData';
import ManageSitesModal from './ManageSitesModal';

const phaseLabel = (p) => p === 3 ? '✓ Phase 3 — Full Categorization' : p === 2 ? '⏳ Phase 2 — Sampling' : 'Phase 1 — Metadata Only';
const phaseColor = (p) => p === 3 ? '#22c55e' : p === 2 ? '#eab308' : '#6b6b80';
const scoreColor = (s) => s >= 70 ? '#ef4444' : s >= 50 ? '#f97316' : s >= 30 ? '#eab308' : '#22c55e';

export default function TierView({ onSelectTier }) {
  const [hovered, setHovered] = useState(null);
  const [triggeringTier, setTriggeringTier] = useState(null);
  const [showManageSites, setShowManageSites] = useState(false);
  const [managedSites, setManagedSites] = useState(null);

  const handleTierClick = (tier) => {
    if (tier.categorized) {
      onSelectTier(tier);
    }
  };

  const handleTriggerCategorization = (e, tier) => {
    e.stopPropagation();
    setTriggeringTier(tier.id);
    setTimeout(() => setTriggeringTier(null), 2000);
  };

  return (
    <div className="tier-view">
      <div className="tier-top">
        <div className="tier-intro">
          <h2>Your Digital Estate — SharePoint</h2>
          <div className="tier-agent-banner">
            <span className="tier-agent-dot" />
            <span className="tier-agent-text">✨ Posture Agent is active</span>
            <span className="tier-agent-sub">Agentic identity enabled — analyzing your SharePoint data estate</span>
            <button className="tier-manage-btn" onClick={() => setShowManageSites(true)}>📋 Manage Sites</button>
          </div>
          {managedSites && (
            <div className="tier-managed-banner">
              <span>✅ {managedSites.length} sites manually selected for assessment</span>
              <button className="tier-managed-edit" onClick={() => setShowManageSites(true)}>Edit</button>
              <button className="tier-managed-clear" onClick={() => setManagedSites(null)}>Clear</button>
            </div>
          )}
          <p>We've identified <strong>{tierSummary.totalSites.toLocaleString()}</strong> SharePoint sites and grouped them into <strong>{tiers.length} tiers</strong> based on <strong>Sensitivity × Exposure</strong> — prioritizing sites where critical data meets broad access.</p>
          <span className="last-scanned">🔄 Last scanned: {lastScannedLabel}</span>
        </div>
        <div className="tier-stats">
          <div className="ts"><span className="ts-val">{tierSummary.totalSites.toLocaleString()}</span><span className="ts-lbl">SharePoint Sites</span></div>
          <div className="ts"><span className="ts-val">{formatNumber(tierSummary.totalDocs)}</span><span className="ts-lbl">Total Documents</span></div>
          <div className="ts"><span className="ts-val">{tiers.filter(t => t.phase === 3).length}</span><span className="ts-lbl">In Phase 3</span></div>
        </div>
      </div>

      <div className="tier-body">
        <div className="tier-list">
          {tiers.map((tier, i) => {
            const isHovered = hovered === tier.id;
            const isTriggering = triggeringTier === tier.id;
            const riskScore = Math.round(
              0.30 * tier.sensitivityScore +
              0.25 * tier.exposureScore +
              0.20 * tier.activityRiskScore +
              0.15 * tier.userRiskScore +
              0.10 * tier.hygieneRiskScore
            );

            return (
              <div
                key={tier.id}
                className={`tier-block ${isHovered ? 'tier-block-hovered' : ''} ${tier.categorized ? 'tier-categorized' : 'tier-uncategorized'}`}
                style={{
                  '--tier-color': tier.color,
                  '--tier-gradient-start': tier.gradient[0],
                  '--tier-gradient-end': tier.gradient[1],
                  animationDelay: `${i * 80}ms`,
                }}
                onMouseEnter={() => setHovered(tier.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleTierClick(tier)}
              >
                {/* Left color accent */}
                <div className="tier-accent" />

                {/* Main content */}
                <div className="tier-content">
                  <div className="tier-header">
                    <div className="tier-name-row">
                      <span className="tier-name">{tier.name}</span>
                      <span className="tier-label" style={{ background: tier.color + '22', color: tier.color }}>{tier.label}</span>
                      <span className="tier-phase-badge" style={{ background: phaseColor(tier.phase) + '18', color: phaseColor(tier.phase) }}>{phaseLabel(tier.phase)}</span>
                      {tier.categorized && <span className="tier-status-badge tier-status-ready">✓ Categorized</span>}
                    </div>
                    <p className="tier-desc">{tier.description}</p>
                  </div>

                  <div className="tier-metrics">
                    {/* Primary: Sensitivity × Exposure scores */}
                    <div className="tier-score-group">
                      <div className="tier-score">
                        <div className="ts-bar-wrap"><div className="ts-bar" style={{ width: `${tier.sensitivityScore}%`, background: scoreColor(tier.sensitivityScore) }} /></div>
                        <span className="ts-score-val" style={{ color: scoreColor(tier.sensitivityScore) }}>{tier.sensitivityScore}</span>
                        <span className="tm-lbl">🔒 Sensitivity</span>
                      </div>
                      <div className="tier-score">
                        <div className="ts-bar-wrap"><div className="ts-bar" style={{ width: `${tier.exposureScore}%`, background: scoreColor(tier.exposureScore) }} /></div>
                        <span className="ts-score-val" style={{ color: scoreColor(tier.exposureScore) }}>{tier.exposureScore}</span>
                        <span className="tm-lbl">🌐 Exposure</span>
                      </div>
                      <div className="tier-score tier-risk-score">
                        <span className="ts-risk-val" style={{ color: tier.color }}>{riskScore}</span>
                        <span className="tm-lbl">⚡ Risk</span>
                      </div>
                    </div>

                    <div className="tier-metric-sep" />

                    {/* Secondary: Volume */}
                    <div className="tier-metric">
                      <span className="tm-val">{tier.sites.toLocaleString()}</span>
                      <span className="tm-lbl">Sites</span>
                    </div>
                    <div className="tier-metric">
                      <span className="tm-val">{formatNumber(tier.totalDocs)}</span>
                      <span className="tm-lbl">Documents</span>
                    </div>

                    <div className="tier-metric-sep" />

                    {/* Posture risks */}
                    <div className="tier-readiness">
                      <div className="tr-item">
                        <div className="tr-bar-w"><div className="tr-bar" style={{ width: `${tier.classificationRisk}%`, background: readinessColor(tier.classificationRisk) }} /></div>
                        <span className="tr-val" style={{ color: readinessColor(tier.classificationRisk) }}>{tier.classificationRisk}%</span>
                        <span className="tr-lbl">Unlabeled</span>
                      </div>
                      <div className="tr-item">
                        <div className="tr-bar-w"><div className="tr-bar" style={{ width: `${tier.exposureRisk}%`, background: readinessColor(tier.exposureRisk) }} /></div>
                        <span className="tr-val" style={{ color: readinessColor(tier.exposureRisk) }}>{tier.exposureRisk}%</span>
                        <span className="tr-lbl">Overexposed</span>
                      </div>
                      <div className="tr-item">
                        <div className="tr-bar-w"><div className="tr-bar" style={{ width: `${tier.governanceRisk}%`, background: readinessColor(tier.governanceRisk) }} /></div>
                        <span className="tr-val" style={{ color: readinessColor(tier.governanceRisk) }}>{tier.governanceRisk}%</span>
                        <span className="tr-lbl">ROT</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right action area */}
                <div className="tier-action">
                  {tier.categorized ? (
                    <button className="tier-explore-btn" onClick={() => onSelectTier(tier)}>
                      Explore Categories →
                    </button>
                  ) : (
                    <button
                      className={`tier-trigger-btn ${isTriggering ? 'triggering' : ''}`}
                      onClick={(e) => handleTriggerCategorization(e, tier)}
                      disabled={isTriggering}
                    >
                      {isTriggering ? (
                        <><span className="trigger-spinner" /> Running…</>
                      ) : (
                        <>✨ Run Categorization with Posture Agent</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Side panel — summary */}
        <div className="tier-side">
          <div className="tier-panel">
            <h4>🎯 Tiering Model</h4>
            <p className="panel-note" style={{ marginBottom: 10 }}>Sites ranked by a <strong style={{ color: '#c8c8e0' }}>5-dimension composite score</strong> aligned with the posture spec.</p>
            <div className="model-axes">
              <div className="model-axis"><span className="model-axis-icon">🔒</span><span className="model-axis-name">Sensitive Data</span><span className="model-axis-wt">30%</span></div>
              <div className="model-axis"><span className="model-axis-icon">🌐</span><span className="model-axis-name">Exposure</span><span className="model-axis-wt">25%</span></div>
              <div className="model-axis"><span className="model-axis-icon">📈</span><span className="model-axis-name">Activity Risk</span><span className="model-axis-wt">20%</span></div>
              <div className="model-axis"><span className="model-axis-icon">👤</span><span className="model-axis-name">User Risk</span><span className="model-axis-wt">15%</span></div>
              <div className="model-axis"><span className="model-axis-icon">🧹</span><span className="model-axis-name">Hygiene</span><span className="model-axis-wt">10%</span></div>
            </div>
          </div>

          <div className="tier-panel">
            <h4>📋 Pipeline Status</h4>
            <div className="coverage-summary">
              <div className="cov-item cov-done">
                <span className="cov-count">{tiers.filter(t => t.phase === 3).length}</span>
                <span className="cov-label">Phase 3</span>
              </div>
              <div className="cov-item cov-sampling">
                <span className="cov-count">{tiers.filter(t => t.phase === 2).length}</span>
                <span className="cov-label">Phase 2</span>
              </div>
              <div className="cov-item cov-pending">
                <span className="cov-count">{tiers.filter(t => t.phase === 1).length}</span>
                <span className="cov-label">Phase 1</span>
              </div>
            </div>
            <p className="panel-note">Tier 1 has been fully categorized by the Posture Agent. Tier 2 is queued for Phase 3. Trigger categorization on remaining tiers.</p>
          </div>

          <div className="tier-panel">
            <h4>📊 Risk Distribution</h4>
            {tiers.map(t => {
              const risk = Math.round(
                0.30 * t.sensitivityScore + 0.25 * t.exposureScore +
                0.20 * t.activityRiskScore + 0.15 * t.userRiskScore + 0.10 * t.hygieneRiskScore
              );
              return (
                <div key={t.id} className="dist-row">
                  <span className="dist-dot" style={{ background: t.color }} />
                  <span className="dist-name">{t.name.split('—')[0].trim()}</span>
                  <div className="dist-bar-wrap">
                    <div className="dist-bar" style={{ width: `${risk}%`, background: t.color }} />
                  </div>
                  <span className="dist-pct">{risk}</span>
                </div>
              );
            })}
          </div>

          <div className="tier-panel">
            <h4>🔍 Top Signals</h4>
            {hovered != null ? (
              <div className="top-sites-list">
                {tiers.find(t => t.id === hovered)?.topSignals.map((s, i) => (
                  <span key={i} className="top-site-chip">{s}</span>
                ))}
              </div>
            ) : (
              <p className="panel-hint">Hover a tier to see top scoring signals</p>
            )}
          </div>
        </div>
      </div>

      {showManageSites && (
        <ManageSitesModal
          onClose={() => setShowManageSites(false)}
          onConfirm={(siteIds) => {
            setManagedSites(siteIds);
            setShowManageSites(false);
          }}
        />
      )}

      <style>{`
        .tier-view { height: 100%; display: flex; flex-direction: column; padding: 20px 28px 16px; overflow: hidden; }
        .tier-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-shrink: 0; }
        .tier-intro h2 { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 4px; }
        .tier-intro p { font-size: 13px; color: #a0a0b8; max-width: 560px; line-height: 1.5; }
        .tier-intro strong { color: #c8c8e0; }

        .tier-agent-banner {
          display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
          padding: 8px 14px; border-radius: 8px;
          background: linear-gradient(135deg, rgba(34,197,94,0.08), rgba(99,102,241,0.06));
          border: 1px solid rgba(34,197,94,0.2);
        }
        .tier-agent-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
          box-shadow: 0 0 8px rgba(34,197,94,0.5); flex-shrink: 0;
          animation: pd 2s infinite;
        }
        .tier-agent-text { font-size: 12px; font-weight: 700; color: #86efac; }
        .tier-agent-sub { font-size: 11px; color: #6b6b80; margin-left: 4px; flex: 1; }
        .tier-manage-btn {
          font-size: 11px; font-weight: 600; color: #a5b4fc; background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.25); border-radius: 6px; padding: 5px 12px;
          cursor: pointer; font-family: inherit; transition: all .15s; white-space: nowrap;
        }
        .tier-manage-btn:hover { background: rgba(99,102,241,0.2); color: white; }

        .tier-managed-banner {
          display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
          padding: 7px 14px; border-radius: 8px;
          background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2);
          font-size: 12px; color: #a5b4fc;
        }
        .tier-managed-edit, .tier-managed-clear {
          font-size: 10px; background: none; border: 1px solid rgba(255,255,255,0.1);
          color: #8888a0; border-radius: 4px; padding: 2px 8px; cursor: pointer;
          font-family: inherit; transition: all .15s;
        }
        .tier-managed-edit:hover { color: #a5b4fc; border-color: rgba(99,102,241,0.3); }
        .tier-managed-clear:hover { color: #ef4444; border-color: rgba(239,68,68,0.3); }
        .tier-stats { display: flex; gap: 20px; }
        .ts { text-align: center; padding: 8px 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; }
        .ts-val { display: block; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
        .ts-lbl { font-size: 10px; color: #6b6b80; text-transform: uppercase; letter-spacing: 0.5px; }

        .tier-body { flex: 1; display: flex; gap: 20px; min-height: 0; overflow: hidden; }
        .tier-list { flex: 1; display: flex; flex-direction: column; gap: 8px; overflow-y: auto; min-width: 0; padding-right: 4px; }

        /* Tier blocks */
        .tier-block {
          display: flex; align-items: stretch; border-radius: 12px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.25s ease; position: relative; overflow: hidden;
          animation: tier-slide-in 0.5s ease both;
        }
        @keyframes tier-slide-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tier-block-hovered {
          background: rgba(255,255,255,0.05);
          border-color: var(--tier-color);
          box-shadow: 0 4px 24px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.03);
        }
        .tier-categorized { cursor: pointer; }
        .tier-uncategorized { cursor: default; }

        .tier-accent {
          width: 4px; flex-shrink: 0;
          background: linear-gradient(180deg, var(--tier-gradient-start), var(--tier-gradient-end));
          border-radius: 12px 0 0 12px;
        }

        .tier-content { flex: 1; padding: 14px 16px; min-width: 0; }
        .tier-header { margin-bottom: 8px; }
        .tier-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 3px; }
        .tier-name { font-size: 14px; font-weight: 700; letter-spacing: -0.3px; }
        .tier-label { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.3px; }
        .tier-desc { font-size: 11px; color: #8888a0; line-height: 1.4; }

        .tier-status-badge { font-size: 10px; padding: 2px 8px; border-radius: 6px; font-weight: 600; }
        .tier-status-ready { background: rgba(34,197,94,0.12); color: #22c55e; }
        .tier-phase-badge { font-size: 9px; padding: 2px 8px; border-radius: 6px; font-weight: 600; }

        .tier-metrics { display: flex; align-items: center; gap: 14px; }
        .tier-score-group { display: flex; gap: 10px; align-items: center; }
        .tier-score { display: flex; flex-direction: column; align-items: center; min-width: 80px; }
        .ts-bar-wrap { width: 100%; height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; margin-bottom: 2px; }
        .ts-bar { height: 100%; border-radius: 3px; transition: width 0.8s ease; }
        .ts-score-val { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
        .tier-risk-score { min-width: 50px; }
        .ts-risk-val { font-size: 22px; font-weight: 900; letter-spacing: -1px; }
        .tier-metric-sep { width: 1px; height: 32px; background: rgba(255,255,255,0.06); flex-shrink: 0; }
        .tier-metric { display: flex; flex-direction: column; align-items: center; min-width: 60px; }
        .tm-val { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; }
        .tm-lbl { font-size: 9px; color: #6b6b80; text-transform: uppercase; letter-spacing: 0.3px; }

        .tier-readiness { display: flex; gap: 10px; margin-left: 8px; padding-left: 12px; border-left: 1px solid rgba(255,255,255,0.06); }
        .tr-item { display: flex; flex-direction: column; align-items: center; min-width: 65px; }
        .tr-bar-w { width: 100%; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; margin-bottom: 2px; }
        .tr-bar { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
        .tr-val { font-size: 12px; font-weight: 700; }
        .tr-lbl { font-size: 8px; color: #6b6b80; text-transform: uppercase; letter-spacing: 0.3px; }

        /* Action buttons */
        .tier-action { display: flex; align-items: center; padding: 0 16px; flex-shrink: 0; }
        .tier-explore-btn {
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15));
          border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc;
          padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; font-family: inherit; white-space: nowrap;
        }
        .tier-explore-btn:hover { background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25)); border-color: #8b5cf6; color: white; }

        .tier-trigger-btn {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          color: #a0a0b8; padding: 8px 16px; border-radius: 8px; font-size: 12px;
          font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: inherit; white-space: nowrap;
          display: flex; align-items: center; gap: 6px;
        }
        .tier-trigger-btn:hover:not(:disabled) { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); color: #c8c8e0; }
        .tier-trigger-btn:disabled { opacity: 0.7; cursor: default; }
        .tier-trigger-btn.triggering { color: #8b5cf6; border-color: rgba(139,92,246,0.3); }

        .trigger-spinner {
          display: inline-block; width: 12px; height: 12px;
          border: 2px solid rgba(139,92,246,0.3); border-top-color: #8b5cf6;
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Side panel */
        .tier-side { width: 280px; flex-shrink: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
        .tier-panel { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px; }
        .tier-panel h4 { font-size: 12px; font-weight: 600; margin-bottom: 10px; }

        .coverage-summary { display: flex; gap: 10px; margin-bottom: 10px; }
        .cov-item { flex: 1; text-align: center; padding: 10px 8px; border-radius: 8px; }
        .cov-done { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.15); }
        .cov-sampling { background: rgba(234,179,8,0.08); border: 1px solid rgba(234,179,8,0.15); }
        .cov-pending { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }
        .cov-count { display: block; font-size: 22px; font-weight: 700; }
        .cov-done .cov-count { color: #22c55e; }
        .cov-sampling .cov-count { color: #eab308; }
        .cov-pending .cov-count { color: #6b6b80; }
        .cov-label { font-size: 9px; color: #6b6b80; text-transform: uppercase; letter-spacing: 0.3px; }
        .panel-note { font-size: 11px; color: #6b6b80; line-height: 1.5; }

        .dist-row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
        .dist-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .dist-name { font-size: 10px; color: #a0a0b8; width: 45px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dist-bar-wrap { flex: 1; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
        .dist-bar { height: 100%; border-radius: 2px; transition: width 0.8s ease; }
        .dist-pct { font-size: 10px; color: #6b6b80; width: 36px; text-align: right; }

        .top-sites-list { display: flex; flex-wrap: wrap; gap: 4px; }
        .top-site-chip { font-size: 10px; padding: 3px 8px; background: rgba(99,102,241,0.1); border-radius: 4px; color: #b0b0d0; }
        .panel-hint { font-size: 11px; color: #4a4a60; font-style: italic; }
        .last-scanned { font-size: 10px; color: #4a4a60; display: inline-flex; align-items: center; gap: 4px; }

        /* Model axes panel */
        .model-axes { display: flex; flex-direction: column; gap: 6px; }
        .model-axis { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; background: rgba(255,255,255,0.03); }
        .model-axis-icon { font-size: 14px; }
        .model-axis-name { font-size: 11px; font-weight: 700; color: #c8c8e0; flex: 1; }
        .model-axis-wt { font-size: 10px; font-weight: 700; color: #6366f1; }
        .model-axis-desc { font-size: 9px; color: #6b6b80; }
      `}</style>
    </div>
  );
}
