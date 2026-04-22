import React, { useState } from 'react';
import { workloads, workloadSummary, formatNumber, readinessColor } from '../data/mockData';

export default function WorkloadOverview({ onSelectWorkload }) {
  const [hovered, setHovered] = useState(null);

  const total = workloadSummary.totalItems;

  // Build treemap layout: 2×2 grid with proportional sizing
  const sorted = [...workloads].sort((a, b) => b.totalItems - a.totalItems);

  return (
    <div className="wl-view">
      <div className="wl-top">
        <div className="wl-intro">
          <h2>Microsoft 365 — Data Estate</h2>
          <p>
            Your M365 data estate contains <strong>{formatNumber(total)}</strong> items across{' '}
            <strong>{workloads.length} workloads</strong>. Explore each workload to understand its security posture.
          </p>
        </div>
        <div className="wl-stats">
          <div className="wl-ts">
            <span className="wl-ts-val">{formatNumber(total)}</span>
            <span className="wl-ts-lbl">Total Items</span>
          </div>
          <div className="wl-ts">
            <span className="wl-ts-val" style={{ color: readinessColor(Math.round(workloadSummary.totalUnlabeled / total * 100)) }}>
              {formatNumber(workloadSummary.totalUnlabeled)}
            </span>
            <span className="wl-ts-lbl">Unlabeled</span>
          </div>
          <div className="wl-ts">
            <span className="wl-ts-val" style={{ color: readinessColor(Math.round(workloadSummary.totalOverExposed / total * 100)) }}>
              {formatNumber(workloadSummary.totalOverExposed)}
            </span>
            <span className="wl-ts-lbl">OverExposed</span>
          </div>
          <div className="wl-ts">
            <span className="wl-ts-val" style={{ color: '#eab308' }}>
              {formatNumber(workloadSummary.totalROT)}
            </span>
            <span className="wl-ts-lbl">ROT</span>
          </div>
        </div>
      </div>

      {/* Treemap */}
      <div className="wl-treemap">
        {sorted.map((wl, i) => {
          const pct = (wl.totalItems / total) * 100;
          const isHovered = hovered === wl.id;

          return (
            <div
              key={wl.id}
              className={`wl-block ${isHovered ? 'wl-block-hovered' : ''} ${wl.explorable ? 'wl-explorable' : ''}`}
              style={{
                '--wl-color': wl.color,
                '--wl-gradient-start': wl.gradient[0],
                '--wl-gradient-end': wl.gradient[1],
                flex: `${pct} 0 0%`,
                animationDelay: `${i * 100}ms`,
              }}
              onMouseEnter={() => setHovered(wl.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => wl.explorable && onSelectWorkload(wl)}
            >
              <div className="wl-block-accent" />
              <div className="wl-block-content">
                <div className="wl-block-header">
                  <span className="wl-block-icon">{wl.icon}</span>
                  <div className="wl-block-title-group">
                    <span className="wl-block-name">{wl.name}</span>
                    <span className="wl-block-desc">{wl.description}</span>
                  </div>
                  <span className="wl-block-pct">{pct.toFixed(0)}%</span>
                </div>

                <div className="wl-block-metrics">
                  <div className="wl-metric wl-metric-total">
                    <span className="wl-metric-val">{formatNumber(wl.totalItems)}</span>
                    <span className="wl-metric-lbl">Total Items</span>
                  </div>
                  <div className="wl-metric-divider" />
                  <div className="wl-metric">
                    <div className="wl-metric-bar-wrap">
                      <div className="wl-metric-bar" style={{ width: `${wl.unlabeledPct}%`, background: readinessColor(wl.unlabeledPct) }} />
                    </div>
                    <span className="wl-metric-val" style={{ color: readinessColor(wl.unlabeledPct) }}>{formatNumber(wl.unlabeled)}</span>
                    <span className="wl-metric-pct" style={{ color: readinessColor(wl.unlabeledPct) }}>{wl.unlabeledPct}%</span>
                    <span className="wl-metric-lbl">🏷️ Unlabeled</span>
                  </div>
                  <div className="wl-metric">
                    <div className="wl-metric-bar-wrap">
                      <div className="wl-metric-bar" style={{ width: `${wl.overExposedPct}%`, background: readinessColor(wl.overExposedPct) }} />
                    </div>
                    <span className="wl-metric-val" style={{ color: readinessColor(wl.overExposedPct) }}>{formatNumber(wl.overExposed)}</span>
                    <span className="wl-metric-pct" style={{ color: readinessColor(wl.overExposedPct) }}>{wl.overExposedPct}%</span>
                    <span className="wl-metric-lbl">🔓 OverExposed</span>
                  </div>
                  <div className="wl-metric">
                    <div className="wl-metric-bar-wrap">
                      <div className="wl-metric-bar" style={{ width: `${wl.stalePct}%`, background: '#eab308' }} />
                    </div>
                    <span className="wl-metric-val" style={{ color: '#eab308' }}>{formatNumber(wl.staleData)}</span>
                    <span className="wl-metric-pct" style={{ color: '#eab308' }}>{wl.stalePct}%</span>
                    <span className="wl-metric-lbl">🗑️ ROT</span>
                  </div>
                </div>

                <div className="wl-block-footer">
                  {wl.explorable ? (
                    <button className="wl-explore-btn">✨ Explore {wl.name} with Posture Agent →</button>
                  ) : (
                    <span className="wl-coming-soon">Coming soon</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .wl-view { height: 100%; display: flex; flex-direction: column; padding: 20px 28px 16px; overflow: hidden; }

        .wl-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; flex-shrink: 0; }
        .wl-intro h2 { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 4px; }
        .wl-intro p { font-size: 13px; color: #a0a0b8; max-width: 560px; line-height: 1.5; }
        .wl-intro strong { color: #c8c8e0; }

        .wl-stats { display: flex; gap: 16px; }
        .wl-ts { text-align: center; padding: 8px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; }
        .wl-ts-val { display: block; font-size: 18px; font-weight: 700; letter-spacing: -0.5px; }
        .wl-ts-lbl { font-size: 10px; color: #6b6b80; text-transform: uppercase; letter-spacing: 0.5px; }

        /* Treemap grid */
        .wl-treemap {
          flex: 1; display: flex; flex-wrap: wrap; gap: 10px;
          min-height: 0; overflow-y: auto; align-content: flex-start;
        }

        .wl-block {
          display: flex; border-radius: 14px; min-width: calc(50% - 10px); min-height: 200px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.3s ease; position: relative; overflow: hidden;
          animation: wl-slide-in 0.5s ease both; cursor: default;
        }
        @keyframes wl-slide-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .wl-block-hovered {
          background: rgba(255,255,255,0.05);
          border-color: var(--wl-color);
          box-shadow: 0 4px 30px rgba(0,0,0,0.4), 0 0 20px color-mix(in srgb, var(--wl-color) 15%, transparent);
        }
        .wl-explorable { cursor: pointer; }

        .wl-block-accent {
          width: 5px; flex-shrink: 0;
          background: linear-gradient(180deg, var(--wl-gradient-start), var(--wl-gradient-end));
          border-radius: 14px 0 0 14px;
        }

        .wl-block-content { flex: 1; padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }

        .wl-block-header { display: flex; align-items: flex-start; gap: 10px; }
        .wl-block-icon { font-size: 24px; line-height: 1; }
        .wl-block-title-group { flex: 1; }
        .wl-block-name { font-size: 17px; font-weight: 700; letter-spacing: -0.3px; display: block; }
        .wl-block-desc { font-size: 11px; color: #7a7a90; line-height: 1.4; margin-top: 2px; display: block; }
        .wl-block-pct {
          font-size: 24px; font-weight: 800; color: var(--wl-color); opacity: 0.4;
          letter-spacing: -1px; line-height: 1;
        }

        .wl-block-metrics { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .wl-metric { display: flex; flex-direction: column; align-items: center; min-width: 80px; }
        .wl-metric-total { min-width: 90px; }
        .wl-metric-val { font-size: 16px; font-weight: 700; letter-spacing: -0.3px; }
        .wl-metric-total .wl-metric-val { font-size: 20px; color: #e0e0f0; }
        .wl-metric-pct { font-size: 11px; font-weight: 600; }
        .wl-metric-lbl { font-size: 9px; color: #6b6b80; text-transform: uppercase; letter-spacing: 0.3px; margin-top: 1px; }
        .wl-metric-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.06); flex-shrink: 0; }

        .wl-metric-bar-wrap { width: 100%; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; margin-bottom: 3px; }
        .wl-metric-bar { height: 100%; border-radius: 2px; transition: width 0.8s ease; }

        .wl-block-footer { margin-top: auto; }

        .wl-explore-btn {
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15));
          border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc;
          padding: 8px 18px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; font-family: inherit; white-space: nowrap;
        }
        .wl-explore-btn:hover {
          background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25));
          border-color: #8b5cf6; color: white;
        }

        .wl-coming-soon {
          font-size: 11px; color: #4a4a60; font-style: italic;
          padding: 6px 14px; background: rgba(255,255,255,0.03); border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.04); display: inline-block;
        }
      `}</style>
    </div>
  );
}
