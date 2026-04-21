import React, { useState } from 'react';
import { workloads, workloadSummary, formatNumber, readinessColor, lastScannedLabel } from '../data/mockData';

const platformData = [
  {
    group: 'Protected by Purview:',
    items: [
      { id: 'Microsoft 365', iconType: 'ms365' },
      { id: 'Microsoft Fabric', iconType: 'text', iconChar: '◆', iconColor: '#f97316' },
      { id: 'Foundry', iconType: 'text', iconChar: '⬡', iconColor: '#60a5fa' },
      { id: 'Databricks', iconType: 'text', iconChar: '🔶' },
      { id: 'Snowflake', iconType: 'text', iconChar: '❄️' },
      { id: 'ServiceNow', iconType: 'text', iconChar: '◉', iconColor: '#22c55e' },
      { id: 'SAP', iconType: 'text', iconChar: '◈', iconColor: '#60a5fa' },
    ],
  },
  {
    group: 'Protected by Partners:',
    items: [
      { id: 'Salesforce', iconType: 'text', iconChar: '☁️', iconColor: '#60a5fa' },
      { id: 'GCP', iconType: 'text', iconChar: '◐' },
    ],
  },
];

function PlatformIcon({ item }) {
  if (item.iconType === 'ms365') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16">
        <rect x="1" y="1" width="6" height="6" fill="#f25022"/>
        <rect x="9" y="1" width="6" height="6" fill="#7fba00"/>
        <rect x="1" y="9" width="6" height="6" fill="#00a4ef"/>
        <rect x="9" y="9" width="6" height="6" fill="#ffb900"/>
      </svg>
    );
  }
  return <span style={{ color: item.iconColor, fontSize: 13 }}>{item.iconChar}</span>;
}

export default function HomePage({ onSelectWorkload }) {
  const [selectedPlatform, setSelectedPlatform] = useState('Microsoft 365');

  const total = workloadSummary.totalItems;
  const sorted = [...workloads].sort((a, b) => b.totalItems - a.totalItems);

  return (
    <div className="home-page">
      {/* ── Hero Section ── */}
      <section className="hp-hero">
        <h2 className="hp-hero-title">Data Security Posture Management</h2>
        <p className="hp-hero-desc">
          Use Data Security Posture Management (DSPM) to discover and secure all your sensitive data in Microsoft 365, Fabric, Foundry and non-Microsoft data sources, including Databricks, Snowflake, SAP, ServiceNow, Salesforce and Google Cloud.
        </p>
        <a className="hp-learn-more" href="https://www.microsoft.com" target="_blank" rel="noopener noreferrer">
          Learn more ↗
        </a>
      </section>

      {/* ── Data Snapshot Section ── */}
      <section className="hp-snapshot">
        <div className="hp-snapshot-header">
          <h3 className="hp-snapshot-title">📊 Data Snapshot</h3>
          <span className="last-scanned">🔄 Last scanned: {lastScannedLabel}</span>
        </div>

        {/* Platform Pills */}
        <div className="hp-pills-section">
          {platformData.map((group) => (
            <div className="hp-pill-group" key={group.group}>
              <span className="hp-pill-label">{group.group}</span>
              <div className="hp-pill-row">
                {group.items.map((p) => (
                  <button
                    key={p.id}
                    className={`hp-pill ${selectedPlatform === p.id ? 'hp-pill-active' : ''}`}
                    onClick={() => setSelectedPlatform(p.id)}
                  >
                    <span className="hp-pill-icon"><PlatformIcon item={p} /></span>
                    {p.id}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── M365 Workload Data Estate ── */}
        {selectedPlatform === 'Microsoft 365' ? (
          <div className="hp-estate">
            {/* Summary stats */}
            <div className="hp-estate-stats">
              <div className="hp-est-stat">
                <span className="hp-est-val">{formatNumber(total)}</span>
                <span className="hp-est-lbl">Total Items</span>
              </div>
              <div className="hp-est-stat">
                <span className="hp-est-val" style={{ color: readinessColor(Math.round(workloadSummary.totalUnlabeled / total * 100)) }}>
                  {formatNumber(workloadSummary.totalUnlabeled)}
                </span>
                <span className="hp-est-lbl">Unlabeled</span>
              </div>
              <div className="hp-est-stat">
                <span className="hp-est-val" style={{ color: readinessColor(Math.round(workloadSummary.totalOverExposed / total * 100)) }}>
                  {formatNumber(workloadSummary.totalOverExposed)}
                </span>
                <span className="hp-est-lbl">OverExposed</span>
              </div>
              <div className="hp-est-stat">
                <span className="hp-est-val" style={{ color: '#eab308' }}>
                  {formatNumber(workloadSummary.totalStale)}
                </span>
                <span className="hp-est-lbl">Stale Data</span>
              </div>
            </div>

            {/* Workload treemap */}
            <div className="hp-treemap">
              {sorted.map((wl, i) => {
                const pct = (wl.totalItems / total) * 100;
                return (
                  <div
                    key={wl.id}
                    className={`hp-wl-block ${wl.explorable ? 'hp-wl-explorable' : ''}`}
                    style={{
                      '--wl-color': wl.color,
                      '--wl-grad-start': wl.gradient[0],
                      '--wl-grad-end': wl.gradient[1],
                      flex: `${pct} 0 0%`,
                      animationDelay: `${i * 80}ms`,
                    }}
                    onClick={() => wl.explorable && onSelectWorkload(wl)}
                  >
                    <div className="hp-wl-accent" />
                    <div className="hp-wl-body">
                      <div className="hp-wl-top">
                        <span className="hp-wl-icon">{wl.icon}</span>
                        <div className="hp-wl-title-wrap">
                          <span className="hp-wl-name">{wl.name}</span>
                          <span className="hp-wl-desc">{wl.description}</span>
                        </div>
                        <span className="hp-wl-pct">{pct.toFixed(0)}%</span>
                      </div>

                      <div className="hp-wl-metrics">
                        <div className="hp-wl-m hp-wl-m-total">
                          <span className="hp-wl-m-val">{formatNumber(wl.totalItems)}</span>
                          <span className="hp-wl-m-lbl">Total Items</span>
                        </div>
                        <div className="hp-wl-divider" />
                        <div className="hp-wl-m">
                          <div className="hp-wl-bar-wrap"><div className="hp-wl-bar" style={{ width: `${wl.unlabeledPct}%`, background: readinessColor(wl.unlabeledPct) }} /></div>
                          <span className="hp-wl-m-val" style={{ color: readinessColor(wl.unlabeledPct) }}>{formatNumber(wl.unlabeled)}</span>
                          <span className="hp-wl-m-pct" style={{ color: readinessColor(wl.unlabeledPct) }}>{wl.unlabeledPct}%</span>
                          <span className="hp-wl-m-lbl">🏷️ Unlabeled</span>
                        </div>
                        <div className="hp-wl-m">
                          <div className="hp-wl-bar-wrap"><div className="hp-wl-bar" style={{ width: `${wl.overExposedPct}%`, background: readinessColor(wl.overExposedPct) }} /></div>
                          <span className="hp-wl-m-val" style={{ color: readinessColor(wl.overExposedPct) }}>{formatNumber(wl.overExposed)}</span>
                          <span className="hp-wl-m-pct" style={{ color: readinessColor(wl.overExposedPct) }}>{wl.overExposedPct}%</span>
                          <span className="hp-wl-m-lbl">🔓 OverExposed</span>
                        </div>
                        <div className="hp-wl-m">
                          <div className="hp-wl-bar-wrap"><div className="hp-wl-bar" style={{ width: `${wl.stalePct}%`, background: '#eab308' }} /></div>
                          <span className="hp-wl-m-val" style={{ color: '#eab308' }}>{formatNumber(wl.staleData)}</span>
                          <span className="hp-wl-m-pct" style={{ color: '#eab308' }}>{wl.stalePct}%</span>
                          <span className="hp-wl-m-lbl">🗑️ Stale</span>
                        </div>
                      </div>

                      <div className="hp-wl-footer">
                        {wl.explorable ? (
                          <button className="hp-wl-explore-btn">Explore {wl.name} →</button>
                        ) : (
                          <span className="hp-wl-coming">Coming soon</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="hp-coming-soon">
            <div className="hp-cs-inner">
              <span className="hp-cs-icon">🚧</span>
              <h3>{selectedPlatform}</h3>
              <p>Coming soon — data posture insights for {selectedPlatform} are not yet available.</p>
            </div>
          </div>
        )}
      </section>

      <style>{`
        .home-page { height: 100%; overflow-y: auto; padding: 24px 32px 48px; }

        /* Hero */
        .hp-hero { max-width: 800px; margin-bottom: 24px; }
        .hp-hero-title {
          font-size: 26px; font-weight: 800; letter-spacing: -0.8px; margin-bottom: 8px;
          background: linear-gradient(135deg, #e0e0ff 0%, #a5b4fc 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hp-hero-desc { font-size: 13px; color: #a0a0b8; line-height: 1.7; margin-bottom: 6px; }
        .hp-learn-more { font-size: 13px; color: #818cf8; text-decoration: none; font-weight: 600; transition: color .2s; }
        .hp-learn-more:hover { color: #a5b4fc; text-decoration: underline; }

        /* Data Snapshot */
        .hp-snapshot {
          border-radius: 16px; padding: 22px 24px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
        }
        .hp-snapshot-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .hp-snapshot-title { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; margin: 0; }
        .last-scanned { font-size: 10px; color: #4a4a60; display: inline-flex; align-items: center; gap: 4px; }

        /* Pills */
        .hp-pills-section { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .hp-pill-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .hp-pill-label { font-size: 11px; color: #6b6b80; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; min-width: 140px; }
        .hp-pill-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .hp-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #c0c0d8; cursor: pointer; transition: all .2s; font-family: inherit;
        }
        .hp-pill:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.15); }
        .hp-pill-active {
          background: rgba(99,102,241,0.12); border-color: #6366f1; color: #e0e0ff;
          box-shadow: 0 0 12px rgba(99,102,241,0.15);
        }
        .hp-pill-icon { display: flex; align-items: center; }

        /* Estate summary stats */
        .hp-estate-stats { display: flex; gap: 14px; margin-bottom: 16px; }
        .hp-est-stat {
          text-align: center; padding: 8px 16px; border-radius: 10px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
        }
        .hp-est-val { display: block; font-size: 18px; font-weight: 700; letter-spacing: -0.5px; }
        .hp-est-lbl { font-size: 10px; color: #6b6b80; text-transform: uppercase; letter-spacing: 0.5px; }

        /* Treemap */
        .hp-treemap { display: flex; flex-wrap: wrap; gap: 10px; }

        .hp-wl-block {
          display: flex; border-radius: 12px; min-width: calc(48% - 5px); min-height: 180px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.3s ease; overflow: hidden; cursor: default;
          animation: hp-wl-in 0.5s ease both;
        }
        @keyframes hp-wl-in {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hp-wl-block:hover {
          background: rgba(255,255,255,0.05);
          border-color: var(--wl-color);
          box-shadow: 0 4px 24px rgba(0,0,0,0.3), 0 0 16px color-mix(in srgb, var(--wl-color) 12%, transparent);
        }
        .hp-wl-explorable { cursor: pointer; }

        .hp-wl-accent {
          width: 4px; flex-shrink: 0;
          background: linear-gradient(180deg, var(--wl-grad-start), var(--wl-grad-end));
          border-radius: 12px 0 0 12px;
        }

        .hp-wl-body { flex: 1; padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }

        .hp-wl-top { display: flex; align-items: flex-start; gap: 10px; }
        .hp-wl-icon { font-size: 22px; line-height: 1; }
        .hp-wl-title-wrap { flex: 1; }
        .hp-wl-name { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; display: block; }
        .hp-wl-desc { font-size: 10px; color: #7a7a90; line-height: 1.4; margin-top: 2px; display: block; }
        .hp-wl-pct { font-size: 22px; font-weight: 800; color: var(--wl-color); opacity: 0.35; letter-spacing: -1px; }

        .hp-wl-metrics { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .hp-wl-m { display: flex; flex-direction: column; align-items: center; min-width: 72px; }
        .hp-wl-m-total { min-width: 80px; }
        .hp-wl-m-val { font-size: 14px; font-weight: 700; letter-spacing: -0.3px; }
        .hp-wl-m-total .hp-wl-m-val { font-size: 18px; color: #e0e0f0; }
        .hp-wl-m-pct { font-size: 10px; font-weight: 600; }
        .hp-wl-m-lbl { font-size: 9px; color: #6b6b80; text-transform: uppercase; letter-spacing: 0.3px; margin-top: 1px; }
        .hp-wl-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.06); flex-shrink: 0; }

        .hp-wl-bar-wrap { width: 100%; height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; margin-bottom: 2px; }
        .hp-wl-bar { height: 100%; border-radius: 2px; transition: width 0.8s ease; }

        .hp-wl-footer { margin-top: auto; }

        .hp-wl-explore-btn {
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15));
          border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc;
          padding: 7px 16px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; font-family: inherit; white-space: nowrap;
        }
        .hp-wl-explore-btn:hover {
          background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25));
          border-color: #8b5cf6; color: white;
        }
        .hp-wl-coming {
          font-size: 11px; color: #4a4a60; font-style: italic;
          padding: 5px 12px; background: rgba(255,255,255,0.03); border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.04); display: inline-block;
        }

        /* Coming soon */
        .hp-coming-soon { display: flex; justify-content: center; align-items: center; padding: 48px 20px; }
        .hp-cs-inner {
          text-align: center; padding: 36px 44px; border-radius: 14px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
        }
        .hp-cs-icon { font-size: 36px; display: block; margin-bottom: 12px; }
        .hp-cs-inner h3 { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .hp-cs-inner p { font-size: 13px; color: #6b6b80; }
      `}</style>
    </div>
  );
}
