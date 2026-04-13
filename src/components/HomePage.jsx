import React, { useState } from 'react';
import { tiers, tierSummary, formatNumber, readinessColor, lastScannedLabel } from '../data/mockData';

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

export default function HomePage({ onNavigateToTiers }) {
  const [selectedPlatform, setSelectedPlatform] = useState('Microsoft 365');
  const [protectionModal, setProtectionModal] = useState(null);

  const tier1 = tiers[0];

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

      {/* ── Data Source Pills ── */}
      <section className="hp-pills-section">
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
      </section>

      {/* ── Main Content Area ── */}
      {selectedPlatform === 'Microsoft 365' ? (
        <>
          {/* ── Unified Hero: Get Your Data Estate Ready for AI ── */}
          <section className="hp-hero-card">
            <div className="hp-hero-card-top">
              <h3 className="hp-hero-card-title">🚀 Get Your Data Estate Ready for AI</h3>
              <p className="hp-hero-card-desc">
                Drive data readiness and protection together. Prioritize what matters most based on activity and categories, while detecting and blocking active risks — all from day one.
              </p>
              <span className="last-scanned">🔄 Last scanned: {lastScannedLabel}</span>
            </div>

            <div className="hp-two-lanes">
              {/* Lane 1: Understand & Remediate */}
              <div className="hp-lane">
                <div className="hp-lane-header">
                  <span className="hp-lane-icon">🎯</span>
                  <div>
                    <h4>Understand & Remediate</h4>
                    <span className="hp-lane-agent-badge">✨ Data Security Posture Agent</span>
                  </div>
                </div>
                <p className="hp-lane-desc">Your data estate organized by activity tiers and AI-derived categories — so you fix what matters first.</p>

                <div className="hp-lane-metrics">
                  <div className="hp-lane-stat">
                    <span className="hp-lane-stat-val">{tierSummary.totalSites.toLocaleString()}</span>
                    <span className="hp-lane-stat-lbl">Sites</span>
                  </div>
                  <div className="hp-lane-stat">
                    <span className="hp-lane-stat-val">{formatNumber(tierSummary.totalDocs)}</span>
                    <span className="hp-lane-stat-lbl">Documents</span>
                  </div>
                  <div className="hp-lane-stat">
                    <span className="hp-lane-stat-val">{formatNumber(tierSummary.totalMonthlyActivity)}</span>
                    <span className="hp-lane-stat-lbl">Activity/mo</span>
                  </div>
                </div>

                <div className="hp-lane-risks">
                  <div className="hp-lane-risk-row">
                    <span className="hp-lane-risk-icon">🏷️</span>
                    <span className="hp-lane-risk-label">Unlabeled</span>
                    <div className="hp-lane-risk-bar"><div style={{ width: `${tier1.classificationRisk}%`, background: readinessColor(tier1.classificationRisk) }} /></div>
                    <span className="hp-lane-risk-val" style={{ color: readinessColor(tier1.classificationRisk) }}>{tier1.classificationRisk}%</span>
                  </div>
                  <div className="hp-lane-risk-row">
                    <span className="hp-lane-risk-icon">🔓</span>
                    <span className="hp-lane-risk-label">Overexposed</span>
                    <div className="hp-lane-risk-bar"><div style={{ width: `${tier1.exposureRisk}%`, background: readinessColor(tier1.exposureRisk) }} /></div>
                    <span className="hp-lane-risk-val" style={{ color: readinessColor(tier1.exposureRisk) }}>{tier1.exposureRisk}%</span>
                  </div>
                  <div className="hp-lane-risk-row">
                    <span className="hp-lane-risk-icon">🗑️</span>
                    <span className="hp-lane-risk-label">ROT</span>
                    <div className="hp-lane-risk-bar"><div style={{ width: `${tier1.governanceRisk}%`, background: readinessColor(tier1.governanceRisk) }} /></div>
                    <span className="hp-lane-risk-val" style={{ color: readinessColor(tier1.governanceRisk) }}>{tier1.governanceRisk}%</span>
                  </div>
                </div>

                <div className="hp-ai-class-callout" onClick={() => setProtectionModal('ai-classification')}>
                  <div className="hp-ai-class-header">
                    <span className="hp-ai-class-badge">✨ NEW</span>
                    <span className="hp-ai-class-title">AI-Native Classification</span>
                    <span className="hp-lc-arrow" style={{marginLeft:'auto'}}>→</span>
                  </div>
                  <div className="hp-lane-risk-row hp-ai-class-row">
                    <span className="hp-lane-risk-icon">🎯</span>
                    <span className="hp-lane-risk-label">AI-Classified</span>
                    <div className="hp-lane-risk-bar"><div style={{ width: '43%', background: '#8b5cf6' }} /></div>
                    <span className="hp-lane-risk-val" style={{ color: '#8b5cf6' }}>43%</span>
                  </div>
                  <p className="hp-ai-class-note">of labeled content uses high-accuracy classification</p>
                </div>

                <button className="hp-lane-cta" onClick={onNavigateToTiers}>
                  Explore Your Data Estate →
                </button>
              </div>

              {/* Lane 2: Detect & Protect */}
              <div className="hp-lane">
                <div className="hp-lane-header">
                  <span className="hp-lane-icon">🛡️</span>
                  <h4>Detect & Protect</h4>
                </div>
                <p className="hp-lane-desc">Start managing active risks today - these controls get stronger as you improve your data hygiene with labeling, right-sizing permissions and removing ROT.</p>

                <div className="hp-lane-controls">
                  <div className="hp-lc-card" onClick={() => setProtectionModal('copilot-dlp')}>
                    <div className="hp-lc-card-top">
                      <span className="hp-lc-icon">🔒</span>
                      <strong>Prevent sensitive data from being processed by AI</strong>
                      <span className="hp-lc-arrow">→</span>
                    </div>
                    <div className="hp-lc-chips">
                      <div className="hp-lc-chip hp-lc-chip-on"><span className="hp-lc-dot hp-lc-dot-on" /><span className="hp-lc-chip-label">Label inheritance</span></div>
                      <div className="hp-lc-chip hp-lc-chip-on"><span className="hp-lc-dot hp-lc-dot-on" /><span className="hp-lc-chip-label">DLP Policies active</span></div>
                    </div>
                  </div>
                  <div className="hp-lc-card" onClick={() => setProtectionModal('inline-dlp')}>
                    <div className="hp-lc-card-top">
                      <span className="hp-lc-icon">🛡️</span>
                      <strong>Prevent sensitive data from being shared with or by AI</strong>
                      <span className="hp-lc-arrow">→</span>
                    </div>
                    <div className="hp-lc-chips">
                      <div className="hp-lc-chip hp-lc-chip-on"><span className="hp-lc-dot hp-lc-dot-on" /><span className="hp-lc-chip-label">DLP prompt protection</span></div>
                      <div className="hp-lc-chip hp-lc-chip-off"><span className="hp-lc-dot hp-lc-dot-off" /><span className="hp-lc-chip-label">DLP response protection</span></div>
                    </div>
                  </div>
                  <div className="hp-lc-card" onClick={() => setProtectionModal('irm')}>
                    <div className="hp-lc-card-top">
                      <span className="hp-lc-icon">🔍</span>
                      <strong>Detect risky AI usage from insiders</strong>
                      <span className="hp-lc-arrow">→</span>
                    </div>
                    <div className="hp-lc-chips">
                      <div className="hp-lc-chip hp-lc-chip-on"><span className="hp-lc-dot hp-lc-dot-on" /><span className="hp-lc-chip-label">IRM Detection active</span></div>
                      <div className="hp-lc-chip hp-lc-chip-off"><span className="hp-lc-dot hp-lc-dot-off" /><span className="hp-lc-chip-label">Adaptive Protection enabled</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Posture Metrics */}
          <section className="hp-section">
            <h3 className="hp-section-title">Key posture metrics</h3>
            <p className="hp-section-sub">Review key data security posture metrics for your organization's data sources from the last 30 days.</p>
            <div className="hp-posture-cards">
              {[
                { top: 'Data discovery', mid: 'Classified data', val: '50%', trend: '↗ +2% in 30 days' },
                { top: 'Data protection', mid: 'Activities protected', val: '62%', trend: '↗ +24% in 30 days' },
                { top: 'Data investigation', mid: 'Alerts triaged', val: '61%', trend: '↗ +1% in 30 days' },
              ].map((c) => (
                <div className="hp-posture-card" key={c.top}>
                  <span className="hp-pc-top">{c.top}</span>
                  <span className="hp-pc-mid">{c.mid}</span>
                  <span className="hp-pc-val">{c.val}</span>
                  <span className="hp-pc-trend">{c.trend}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Top Objectives */}
          <section className="hp-section">
            <h3 className="hp-section-title">Top objectives to address security risks</h3>
            <p className="hp-section-sub">Focusing on these objectives helps you monitor key areas of your data security posture to prevent risks to sensitive data.</p>
            <div className="hp-obj-cards">
              <div className="hp-obj-card">
                <span className="hp-obj-tag">Data protection | Microsoft 365 Copilot</span>
                <h4 className="hp-obj-title">Secure your data to deploy Microsoft 365 Copilot</h4>
                <div className="hp-obj-stat">
                  <span className="hp-obj-stat-label">Classified data</span>
                  <span className="hp-obj-stat-val">50%</span>
                </div>
                <span className="hp-obj-trend hp-trend-up">↗ +2% in 30 days</span>
                <div className="hp-obj-actions">
                  <button className="hp-btn-primary">View remediation plan</button>
                  <button className="hp-btn-secondary">Review objective</button>
                </div>
              </div>
              <div className="hp-obj-card">
                <span className="hp-obj-tag">Data exfiltration</span>
                <h4 className="hp-obj-title">Prevent exfiltration to risky destinations</h4>
                <div className="hp-obj-stat">
                  <span className="hp-obj-stat-label">Files with sensitive data exfiltrated</span>
                  <span className="hp-obj-stat-val">900</span>
                </div>
                <span className="hp-obj-trend hp-trend-down">↘ -4% in 30 days</span>
                <div className="hp-obj-actions">
                  <button className="hp-btn-primary">View completed actions</button>
                  <button className="hp-btn-secondary">Review objective</button>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="hp-coming-soon">
          <div className="hp-cs-inner">
            <span className="hp-cs-icon">🚧</span>
            <h3>{selectedPlatform}</h3>
            <p>Coming soon — data posture insights for {selectedPlatform} are not yet available.</p>
          </div>
        </section>
      )}

      {/* Protection Detail Modals */}
      {protectionModal && (
        <div className="hp-modal-overlay" onClick={() => setProtectionModal(null)}>
          <div className="hp-modal" onClick={e => e.stopPropagation()}>
            <div className="hp-modal-header">
              <h3>
                {protectionModal === 'copilot-dlp' && '🔒 Copilot DLP Controls'}
                {protectionModal === 'inline-dlp' && '🛡️ Inline DLP for AI'}
                {protectionModal === 'irm' && '🔍 Risky AI Usage Detection'}
                {protectionModal === 'ai-classification' && '🎯 AI-Native Classification'}
              </h3>
              <button className="hp-modal-close" onClick={() => setProtectionModal(null)}>✕</button>
            </div>
            <div className="hp-modal-body">
              {protectionModal === 'copilot-dlp' && (
                <>
                  <p>Copilot DLP controls prevent Microsoft 365 Copilot from processing, summarizing, or generating responses using sensitive data. These controls are powered by <strong>sensitivity labels</strong> — the more content you label, the broader your protection.</p>
                  <div className="hp-modal-status-list">
                    <div className="hp-modal-status">
                      <span className="hp-lc-dot hp-lc-dot-on" />
                      <div>
                        <strong>Label inheritance</strong>
                        <p>Copilot automatically inherits sensitivity labels from source content. This is on by default when you have at least one sensitivity label published in your tenant.</p>
                      </div>
                    </div>
                    <div className="hp-modal-status">
                      <span className="hp-lc-dot hp-lc-dot-on" />
                      <div>
                        <strong>DLP Policies active</strong>
                        <p>You have DLP policies configured to restrict Copilot from processing content with specific sensitivity labels. Content matching these labels will be excluded from Copilot responses.</p>
                      </div>
                    </div>
                  </div>
                  <div className="hp-modal-actions">
                    <a className="hp-modal-btn-primary" href="https://www.microsoft.com" target="_blank" rel="noopener noreferrer">Manage Copilot DLP policies →</a>
                    <a className="hp-modal-btn-secondary" href="https://www.microsoft.com" target="_blank" rel="noopener noreferrer">Learn more</a>
                  </div>
                </>
              )}
              {protectionModal === 'inline-dlp' && (
                <>
                  <p>Inline DLP for AI prevents sensitive information from being shared in prompts to AI or included in AI-generated responses. These controls are powered by <strong>Sensitive Information Types (SITs)</strong> — the more high-accuracy SITs you deploy, the more precise your detection.</p>
                  <div className="hp-modal-status-list">
                    <div className="hp-modal-status">
                      <span className="hp-lc-dot hp-lc-dot-on" />
                      <div>
                        <strong>DLP prompt protection</strong>
                        <p>Active policies detect and block sensitive information in user prompts before they reach AI services. At least one DLP policy is configured with SIT-based conditions for prompt scanning.</p>
                      </div>
                    </div>
                    <div className="hp-modal-status hp-modal-status-off">
                      <span className="hp-lc-dot hp-lc-dot-off" />
                      <div>
                        <strong>DLP response protection</strong>
                        <p>Not yet configured. Enable this to scan AI-generated responses for sensitive data before they are returned to users. This prevents AI from surfacing sensitive content in its answers.</p>
                      </div>
                    </div>
                  </div>
                  <div className="hp-modal-actions">
                    <a className="hp-modal-btn-primary" href="https://www.microsoft.com" target="_blank" rel="noopener noreferrer">Configure response protection →</a>
                    <a className="hp-modal-btn-secondary" href="https://www.microsoft.com" target="_blank" rel="noopener noreferrer">Learn more</a>
                  </div>
                </>
              )}
              {protectionModal === 'irm' && (
                <>
                  <p>Insider Risk Management detects risky AI usage patterns — such as users exfiltrating data through AI, using AI to access sensitive content they shouldn't, or unusual volumes of AI interactions. Detection improves with both <strong>labels</strong> and <strong>high-accuracy SITs</strong>.</p>
                  <div className="hp-modal-status-list">
                    <div className="hp-modal-status">
                      <span className="hp-lc-dot hp-lc-dot-on" />
                      <div>
                        <strong>IRM Detection active</strong>
                        <p>At least one Insider Risk Management policy is active using the Risky AI Usage policy template. This monitors user interactions with AI tools for anomalous or potentially malicious behavior.</p>
                      </div>
                    </div>
                    <div className="hp-modal-status hp-modal-status-off">
                      <span className="hp-lc-dot hp-lc-dot-off" />
                      <div>
                        <strong>Adaptive Protection enabled</strong>
                        <p>Not yet enabled. Adaptive Protection dynamically adjusts DLP policy enforcement based on a user's insider risk level — automatically tightening controls for higher-risk users.</p>
                      </div>
                    </div>
                  </div>
                  <div className="hp-modal-actions">
                    <a className="hp-modal-btn-primary" href="https://www.microsoft.com" target="_blank" rel="noopener noreferrer">Enable Adaptive Protection →</a>
                    <a className="hp-modal-btn-secondary" href="https://www.microsoft.com" target="_blank" rel="noopener noreferrer">Learn more</a>
                  </div>
                </>
              )}
              {protectionModal === 'ai-classification' && (
                <>
                  <p>AI-Native Classification uses <strong>LLM-powered Smart SITs</strong>, semantic classifiers, and AI graders to classify your content with dramatically higher accuracy than traditional pattern-matching rules. This is the foundation that makes all your protections more precise.</p>
                  <div className="hp-modal-stats-row">
                    <div className="hp-modal-stat-card">
                      <span className="hp-modal-stat-val">42</span>
                      <span className="hp-modal-stat-lbl">Active SITs</span>
                    </div>
                    <div className="hp-modal-stat-card">
                      <span className="hp-modal-stat-val">18</span>
                      <span className="hp-modal-stat-lbl">AI-graded (high accuracy)</span>
                    </div>
                    <div className="hp-modal-stat-card">
                      <span className="hp-modal-stat-val">24</span>
                      <span className="hp-modal-stat-lbl">Legacy (need upgrading)</span>
                    </div>
                  </div>
                  <div className="hp-modal-status-list">
                    <div className="hp-modal-status">
                      <span className="hp-lc-dot hp-lc-dot-on" />
                      <div>
                        <strong>Smart SITs available</strong>
                        <p>LLM-powered classifiers that understand content in context — not just pattern matching, but semantic understanding of documents, data relationships, and sensitivity.</p>
                      </div>
                    </div>
                    <div className="hp-modal-status">
                      <span className="hp-lc-dot hp-lc-dot-on" />
                      <div>
                        <strong>Trainable classifiers</strong>
                        <p>Custom AI models trained on your organization's unique data types for domain-specific classification that legacy SITs can't match.</p>
                      </div>
                    </div>
                  </div>
                  <div className="hp-modal-actions">
                    <a className="hp-modal-btn-primary" href="https://www.microsoft.com" target="_blank" rel="noopener noreferrer">Manage AI-native classifiers →</a>
                    <a className="hp-modal-btn-secondary" href="https://www.microsoft.com" target="_blank" rel="noopener noreferrer">Learn more</a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .home-page {
          height: 100%; overflow-y: auto; padding: 32px 40px 60px;
        }

        /* Hero */
        .hp-hero { max-width: 800px; margin-bottom: 28px; }
        .hp-hero-title {
          font-size: 28px; font-weight: 800; letter-spacing: -0.8px; margin-bottom: 10px;
          background: linear-gradient(135deg, #e0e0ff 0%, #a5b4fc 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hp-hero-desc { font-size: 14px; color: #a0a0b8; line-height: 1.7; margin-bottom: 8px; }
        .hp-learn-more {
          font-size: 13px; color: #818cf8; text-decoration: none; font-weight: 600;
          transition: color .2s;
        }
        .hp-learn-more:hover { color: #a5b4fc; text-decoration: underline; }

        /* Pills */
        .hp-pills-section {
          display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px;
        }
        .hp-pill-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .hp-pill-label { font-size: 11px; color: #6b6b80; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; min-width: 150px; }
        .hp-pill-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .hp-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #c0c0d8; cursor: pointer; transition: all .2s; font-family: inherit;
        }
        .hp-pill:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.15); }
        .hp-pill-active {
          background: rgba(99,102,241,0.12); border-color: #6366f1; color: #e0e0ff;
          box-shadow: 0 0 12px rgba(99,102,241,0.15);
        }
        .hp-pill-icon { display: flex; align-items: center; }

        /* Unified Hero Card */
        .hp-hero-card {
          position: relative; margin-bottom: 32px; border-radius: 16px; padding: 2px;
          background: linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.25), rgba(59,130,246,0.2));
        }
        .hp-hero-card-top {
          background: rgba(13,13,32,0.92); border-radius: 14px 14px 0 0; padding: 24px 28px 16px;
        }
        .hp-hero-card-title { font-size: 20px; font-weight: 700; letter-spacing: -0.4px; margin: 0 0 6px; }
        .hp-hero-card-desc { font-size: 13px; color: #a0a0b8; line-height: 1.6; margin: 0 0 8px; max-width: 750px; }

        .hp-two-lanes {
          display: flex; gap: 2px; background: rgba(99,102,241,0.08);
        }
        .hp-lane {
          flex: 1; background: rgba(13,13,32,0.92); padding: 20px 24px;
          display: flex; flex-direction: column;
        }
        .hp-lane:first-child { border-radius: 0 0 0 14px; }
        .hp-lane:last-child { border-radius: 0 0 14px 0; }

        .hp-lane-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .hp-lane-icon { font-size: 18px; }
        .hp-lane-header h4 { font-size: 15px; font-weight: 700; margin: 0; color: #e0e0ff; }
        .hp-lane-agent-badge{font-size:9px;font-weight:700;color:#8b5cf6;text-transform:uppercase;letter-spacing:0.4px}
        .hp-lane-desc { font-size: 12px; color: #8888a0; line-height: 1.5; margin: 0 0 14px; }

        /* Lane 1: metrics + risk bars */
        .hp-lane-metrics { display: flex; gap: 10px; margin-bottom: 14px; }
        .hp-lane-stat {
          flex: 1; text-align: center; padding: 10px 6px; border-radius: 8px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
        }
        .hp-lane-stat-val { display: block; font-size: 18px; font-weight: 800; color: #e0e0ff; letter-spacing: -0.5px; }
        .hp-lane-stat-lbl { font-size: 9px; color: #6b6b80; text-transform: uppercase; letter-spacing: 0.4px; }

        .hp-lane-risks { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .hp-lane-risk-row { display: flex; align-items: center; gap: 8px; }
        .hp-lane-risk-icon { font-size: 13px; width: 18px; text-align: center; }
        .hp-lane-risk-label { font-size: 11px; color: #8888a0; width: 80px; }
        .hp-lane-risk-bar {
          flex: 1; height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden;
        }
        .hp-lane-risk-bar > div { height: 100%; border-radius: 3px; transition: width 0.8s ease; }
        .hp-lane-risk-val { font-size: 12px; font-weight: 700; width: 36px; text-align: right; }

        /* AI-Native Classification callout */
        .hp-ai-class-callout {
          margin-top: 12px; padding: 10px 12px; border-radius: 8px;
          background: rgba(139,92,246,0.04);
          border: 1px dashed rgba(139,92,246,0.2);
          cursor: pointer; transition: all .15s;
        }
        .hp-ai-class-callout:hover {
          background: rgba(139,92,246,0.08); border-color: rgba(139,92,246,0.35);
        }
        .hp-ai-class-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
        .hp-ai-class-badge {
          font-size: 8px; font-weight: 700; color: #a78bfa;
          background: rgba(139,92,246,0.15); padding: 2px 6px; border-radius: 4px;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .hp-ai-class-title { font-size: 11px; font-weight: 600; color: #c4b5fd; }
        .hp-ai-class-row { margin-bottom: 2px; }
        .hp-ai-class-note {
          font-size: 9px; color: #6b6b80; margin: 0; padding-left: 26px; font-style: italic;
        }

        /* Lane 2: control cards with status chips */
        .hp-lane-controls { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; flex: 1; }
        .hp-lc-card {
          padding: 12px 14px; border-radius: 10px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          transition: all .15s; cursor: pointer;
        }
        .hp-lc-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(99,102,241,0.15); }
        .hp-lc-card-top { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
        .hp-lc-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
        .hp-lc-card-top strong { flex: 1; font-size: 12px; font-weight: 600; color: #e0e0ff; line-height: 1.3; }
        .hp-lc-arrow {
          font-size: 13px; color: #6366f1; flex-shrink: 0; font-weight: 600;
          text-decoration: none; transition: color .15s;
        }
        .hp-lc-arrow:hover { color: #a5b4fc; }

        .hp-lc-chips { display: flex; gap: 6px; }
        .hp-lc-chip {
          flex: 1; display: flex; align-items: center; gap: 6px;
          padding: 6px 10px; border-radius: 7px; border: 1px solid;
        }
        .hp-lc-chip-on {
          background: rgba(34,197,94,0.06); border-color: rgba(34,197,94,0.15);
        }
        .hp-lc-chip-off {
          background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.06);
        }
        .hp-lc-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .hp-lc-dot-on { background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.5); }
        .hp-lc-dot-off { background: #475569; }
        .hp-lc-chip-label { font-size: 10px; font-weight: 600; line-height: 1.2; }
        .hp-lc-chip-on .hp-lc-chip-label { color: #86efac; }
        .hp-lc-chip-off .hp-lc-chip-label { color: #64748b; }

        /* CTA buttons */
        .hp-lane-cta {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none; color: white; padding: 10px 20px; border-radius: 8px;
          font-size: 13px; font-weight: 700; cursor: pointer; font-family: inherit;
          transition: all .2s; text-align: center; margin-top: auto;
          box-shadow: 0 4px 16px rgba(99,102,241,0.25);
        }
        .hp-lane-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(99,102,241,0.4); }

        /* Sections */
        .hp-section { margin-bottom: 32px; }
        .hp-section-title { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; margin-bottom: 4px; }
        .hp-section-sub { font-size: 13px; color: #8888a0; margin-bottom: 16px; line-height: 1.5; }

        /* Posture metric cards */
        .hp-posture-cards { display: flex; gap: 16px; flex-wrap: wrap; }
        .hp-posture-card {
          flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 4px;
          padding: 20px; border-radius: 12px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(8px);
        }
        .hp-pc-top { font-size: 11px; color: #6b6b80; text-transform: uppercase; letter-spacing: 0.5px; }
        .hp-pc-mid { font-size: 14px; color: #c0c0d8; font-weight: 500; }
        .hp-pc-val { font-size: 32px; font-weight: 800; letter-spacing: -1px; color: #e0e0ff; margin: 4px 0; }
        .hp-pc-trend { font-size: 12px; color: #22c55e; font-weight: 600; }

        /* Objective cards */
        .hp-obj-cards { display: flex; gap: 16px; flex-wrap: wrap; }
        .hp-obj-card {
          flex: 1; min-width: 280px; display: flex; flex-direction: column; gap: 8px;
          padding: 22px; border-radius: 12px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(8px);
        }
        .hp-obj-tag {
          font-size: 10px; color: #818cf8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;
        }
        .hp-obj-title { font-size: 15px; font-weight: 700; letter-spacing: -0.2px; margin: 0; color: #e0e0ff; }
        .hp-obj-stat { display: flex; align-items: baseline; gap: 8px; }
        .hp-obj-stat-label { font-size: 12px; color: #8888a0; }
        .hp-obj-stat-val { font-size: 22px; font-weight: 800; color: #e0e0ff; }
        .hp-obj-trend { font-size: 12px; font-weight: 600; }
        .hp-trend-up { color: #22c55e; }
        .hp-trend-down { color: #22c55e; }
        .hp-obj-actions { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
        .hp-btn-primary {
          padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2));
          border: 1px solid rgba(99,102,241,0.35); color: #a5b4fc;
          cursor: pointer; font-family: inherit; transition: all .2s;
        }
        .hp-btn-primary:hover { background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3)); color: white; }
        .hp-btn-secondary {
          padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 500;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #a0a0b8; cursor: pointer; font-family: inherit; transition: all .2s;
        }
        .hp-btn-secondary:hover { background: rgba(255,255,255,0.08); color: #e0e0ff; }

        /* Coming soon */
        .hp-coming-soon {
          display: flex; justify-content: center; align-items: center;
          padding: 60px 20px; margin-top: 12px;
        }
        .hp-cs-inner {
          text-align: center; padding: 40px 48px; border-radius: 16px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
        }
        .hp-cs-icon { font-size: 36px; display: block; margin-bottom: 12px; }
        .hp-cs-inner h3 { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
        .hp-cs-inner p { font-size: 13px; color: #6b6b80; }
        .last-scanned { font-size: 10px; color: #4a4a60; display: inline-flex; align-items: center; gap: 4px; }

        /* Protection modals */
        .hp-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
          z-index: 1000; display: flex; align-items: center; justify-content: center;
          animation: hpModalIn .15s ease;
        }
        @keyframes hpModalIn { from{opacity:0} to{opacity:1} }
        .hp-modal {
          background: #13132a; border: 1px solid rgba(99,102,241,0.25); border-radius: 16px;
          width: 520px; max-height: 80vh; overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          animation: hpModalScale .2s ease;
        }
        @keyframes hpModalScale { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
        .hp-modal-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 18px 22px; border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .hp-modal-header h3 { font-size: 15px; font-weight: 600; margin: 0; }
        .hp-modal-close {
          background: none; border: 1px solid rgba(255,255,255,0.1); color: #6b6b80;
          width: 26px; height: 26px; border-radius: 7px; cursor: pointer; font-size: 13px;
          display: flex; align-items: center; justify-content: center; transition: all .15s;
        }
        .hp-modal-close:hover { background: rgba(255,255,255,0.08); color: white; }
        .hp-modal-body { padding: 20px 22px; }
        .hp-modal-body > p { font-size: 13px; color: #a0a0b8; line-height: 1.6; margin: 0 0 16px; }
        .hp-modal-body > p strong { color: #e0e0ff; }
        .hp-modal-status-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
        .hp-modal-stats-row {
          display: flex; gap: 8px; margin-bottom: 16px;
        }
        .hp-modal-stat-card {
          flex: 1; text-align: center; padding: 12px 8px; border-radius: 8px;
          background: rgba(139,92,246,0.06); border: 1px solid rgba(139,92,246,0.12);
        }
        .hp-modal-stat-val {
          display: block; font-size: 22px; font-weight: 800; color: #c4b5fd; letter-spacing: -0.5px;
        }
        .hp-modal-stat-lbl {
          font-size: 9px; color: #8888a0; text-transform: uppercase; letter-spacing: 0.3px; line-height: 1.3;
        }
        .hp-modal-status {
          display: flex; gap: 12px; align-items: flex-start;
          padding: 12px 14px; border-radius: 10px;
          background: rgba(34,197,94,0.04); border: 1px solid rgba(34,197,94,0.1);
        }
        .hp-modal-status-off {
          background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.06);
        }
        .hp-modal-status .hp-lc-dot { margin-top: 4px; }
        .hp-modal-status strong { display: block; font-size: 12px; font-weight: 600; color: #e0e0ff; margin-bottom: 4px; }
        .hp-modal-status p { font-size: 11px; color: #8888a0; line-height: 1.5; margin: 0; }
        .hp-modal-status-off strong { color: #94a3b8; }
        .hp-modal-actions { display: flex; gap: 10px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.06); }
        .hp-modal-btn-primary {
          padding: 9px 18px; border-radius: 8px; font-size: 12px; font-weight: 600;
          background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;
          text-decoration: none; transition: all .15s;
        }
        .hp-modal-btn-primary:hover { opacity: 0.9; }
        .hp-modal-btn-secondary {
          padding: 9px 16px; border-radius: 8px; font-size: 12px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: #a0a0b8; text-decoration: none; transition: all .15s;
        }
        .hp-modal-btn-secondary:hover { background: rgba(255,255,255,0.1); color: #e0e0ff; }
      `}</style>
    </div>
  );
}
