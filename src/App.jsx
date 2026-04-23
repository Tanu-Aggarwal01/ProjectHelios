import React, { useState, useCallback } from 'react';
import HomePage from './components/HomePage';
import WorkloadOverview from './components/WorkloadOverview';
import TierView from './components/TierView';
import CategoryView from './components/CategoryView';
import SubcategoryView from './components/SubcategoryView';
import FileGraph from './components/FileGraph';
import TopicGraph from './components/TopicGraph';
import PostureAgentView from './components/PostureAgentView';

const views = { HOME: 'home', WORKLOADS: 'workloads', TIERS: 'tiers', CATEGORIES: 'categories', SUBCATEGORIES: 'subcategories', FILE_GRAPH: 'file-graph', TOPIC_GRAPH: 'topic-graph', POSTURE_AGENT: 'posture-agent', PLACEHOLDER: 'placeholder' };

/* Left-nav items */
const navItems = [
  {
    id: 'posture', label: 'Posture', icon: '🛡️', expandable: true,
    children: [
      { id: 'overview', label: 'Overview', view: views.HOME },
      { id: 'posture-agent', label: 'Posture Agent', view: views.POSTURE_AGENT },
    ],
  },
  { id: 'objectives', label: 'Objectives', icon: '🎯', view: views.PLACEHOLDER },
  { id: 'ai-observability', label: 'AI observability', icon: '🤖', view: views.PLACEHOLDER },
  { id: 'discover', label: 'Discover', icon: '🔍', expandable: true, children: [] },
  { id: 'tasks-actions', label: 'Tasks and actions', icon: '✅', expandable: true, children: [] },
  { id: 'reports', label: 'Reports', icon: '📊', view: views.PLACEHOLDER },
];

export default function App() {
  const [nav, setNav] = useState({ view: views.HOME, workload: null, tier: null, category: null, subcategory: null, file: null, topicLabel: null });
  const [transitioning, setTransitioning] = useState(false);
  const [agentActivating, setAgentActivating] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ posture: true });
  const [activeNavId, setActiveNavId] = useState('overview');
  const [placeholderLabel, setPlaceholderLabel] = useState('');

  const go = useCallback((next) => {
    setTransitioning(true);
    setTimeout(() => {
      setNav(prev => ({ ...prev, ...next }));
      setTimeout(() => setTransitioning(false), 40);
    }, 300);
  }, []);

  const goHome = () => {
    setActiveNavId('overview');
    go({ view: views.HOME, workload: null, tier: null, category: null, subcategory: null, file: null, topicLabel: null });
  };

  const handleNavClick = (item) => {
    if (item.view === views.PLACEHOLDER) {
      setActiveNavId(item.id);
      setPlaceholderLabel(item.label);
      go({ view: views.PLACEHOLDER, workload: null, tier: null, category: null, subcategory: null, file: null, topicLabel: null });
    } else if (item.view === views.HOME) {
      goHome();
    } else if (item.view === views.POSTURE_AGENT) {
      setActiveNavId('posture-agent');
      go({ view: views.POSTURE_AGENT, workload: null, tier: null, category: null, subcategory: null, file: null, topicLabel: null });
    }
  };

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const breadcrumbs = [];
  if (nav.view !== views.HOME && nav.view !== views.POSTURE_AGENT && nav.view !== views.PLACEHOLDER) breadcrumbs.push({ label: 'Home', onClick: goHome });
  if (nav.workload && nav.view !== views.HOME) breadcrumbs.push({ label: 'Microsoft 365', onClick: goHome });
  if (nav.workload && nav.view !== views.HOME && nav.view !== views.TIERS) breadcrumbs.push({ label: nav.workload.name, onClick: () => go({ view: views.TIERS, tier: null, category: null, subcategory: null, file: null, topicLabel: null }) });
  if (nav.tier) breadcrumbs.push({ label: nav.tier.name, onClick: () => go({ view: views.CATEGORIES, category: null, subcategory: null, file: null }) });
  if (nav.category) breadcrumbs.push({ label: nav.category.name, onClick: () => go({ view: views.SUBCATEGORIES, subcategory: null, file: null }) });
  if (nav.subcategory) breadcrumbs.push({ label: nav.subcategory.name });
  if (nav.file) breadcrumbs.push({ label: nav.file.name });

  const selectWorkload = (wl) => {
    setAgentActivating(true);
    setTimeout(() => {
      setAgentActivating(false);
      go({ view: views.TIERS, workload: wl, tier: null, category: null, subcategory: null, file: null, topicLabel: null });
    }, 2200);
  };
  const selectTier       = (tier)   => {
    if (!tier.categorized) return;
    go({ view: views.CATEGORIES, tier, category: null, subcategory: null, file: null });
  };
  const selectCategory   = (cat)    => go({ view: views.SUBCATEGORIES, category: cat, subcategory: null, file: null });
  const selectSubcategory = (sub)   => go({ view: views.SUBCATEGORIES, subcategory: sub });
  const selectFile       = (file)   => go({ view: views.FILE_GRAPH, file });
  const openTopicGraph   = (label)  => go({ view: views.TOPIC_GRAPH, topicLabel: label });
  const goBack           = ()       => {
    if (nav.view === views.POSTURE_AGENT) return goHome();
    if (nav.view === views.PLACEHOLDER) return goHome();
    if (nav.view === views.FILE_GRAPH) return go({ view: views.SUBCATEGORIES, file: null });
    if (nav.view === views.TOPIC_GRAPH) return go({ view: nav.subcategory ? views.SUBCATEGORIES : views.CATEGORIES, topicLabel: null });
    if (nav.view === views.SUBCATEGORIES && nav.subcategory) return go({ view: views.SUBCATEGORIES, subcategory: null });
    if (nav.view === views.SUBCATEGORIES) return go({ view: views.CATEGORIES, category: null, subcategory: null });
    if (nav.view === views.CATEGORIES) return go({ view: views.TIERS, tier: null, category: null, subcategory: null });
    if (nav.view === views.TIERS) return goHome();
    if (nav.view === views.WORKLOADS) return goHome();
  };

  /* Determine which nav IDs relate to current view for highlighting */
  const effectiveNavId = [views.HOME, views.TIERS, views.CATEGORIES, views.SUBCATEGORIES, views.FILE_GRAPH, views.TOPIC_GRAPH, views.WORKLOADS].includes(nav.view)
    ? 'overview'
    : activeNavId;

  let content;
  switch (nav.view) {
    case views.HOME:
      content = <HomePage onSelectWorkload={selectWorkload} />;
      break;
    case views.WORKLOADS:
      content = <WorkloadOverview onSelectWorkload={selectWorkload} />;
      break;
    case views.TIERS:
      content = <TierView onSelectTier={selectTier} />;
      break;
    case views.CATEGORIES:
      content = <CategoryView tier={nav.tier} onSelectCategory={selectCategory} onOpenTopicGraph={openTopicGraph} />;
      break;
    case views.SUBCATEGORIES:
      content = (
        <SubcategoryView
          tier={nav.tier}
          category={nav.category}
          selectedSub={nav.subcategory}
          onSelectSubcategory={selectSubcategory}
        />
      );
      break;
    case views.FILE_GRAPH:
      content = <FileGraph file={nav.file} />;
      break;
    case views.TOPIC_GRAPH:
      content = <TopicGraph categoryId={nav.category?.id} label={nav.topicLabel || nav.category?.name} />;
      break;
    case views.POSTURE_AGENT:
      content = <PostureAgentView />;
      break;
    case views.PLACEHOLDER:
      content = (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 40 }}>🚧</span>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e0e0ff', margin: 0 }}>{placeholderLabel}</h2>
          <p style={{ fontSize: 14, color: '#6a6a80' }}>Coming soon — this section is under development.</p>
        </div>
      );
      break;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="header-logo" onClick={goHome} style={{ cursor: 'pointer' }}>
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="url(#lg)" />
              <path d="M8 8h5v5H8V8zm7 0h5v5h-5V8zm-7 7h5v5H8v-5zm7 3.5a3.5 3.5 0 107 0 3.5 3.5 0 00-7 0z" fill="white" opacity=".9"/>
              <defs><linearGradient id="lg" x1="0" y1="0" x2="28" y2="28"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#8b5cf6"/></linearGradient></defs>
            </svg>
          </div>
          <div className="header-text">
            <h1 onClick={goHome} style={{ cursor: 'pointer' }}>Microsoft Purview</h1>
            <span className="header-badge">Data Security Posture Management</span>
          </div>
          {breadcrumbs.length > 0 && (
            <nav className="breadcrumbs">
              <span className="bc-sep">|</span>
              {breadcrumbs.map((bc, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="bc-sep">›</span>}
                  <span className={`bc-item ${bc.onClick ? 'bc-link' : ''}`} onClick={bc.onClick}>{bc.label}</span>
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>
        <div className="header-right">
          {nav.view !== views.HOME && (
            <button className="back-btn" onClick={goBack}>← Back</button>
          )}
          <span className="header-env">Contoso Ltd.</span>
          <span className="header-status"><span className="status-dot" /> Live</span>
        </div>
      </header>

      {/* Body: Left Nav + Content */}
      <div className="app-body">
        {/* Left Navigation */}
        <aside className="left-nav">
          <div className="left-nav-title">DSPM</div>
          <ul className="left-nav-list">
            {navItems.map(item => (
              <li key={item.id}>
                {item.expandable ? (
                  <>
                    <button
                      className="left-nav-item left-nav-expandable"
                      onClick={() => toggleSection(item.id)}
                    >
                      <span className="left-nav-icon">{item.icon}</span>
                      <span className="left-nav-label">{item.label}</span>
                      <span className={`left-nav-chevron ${expandedSections[item.id] ? 'left-nav-chevron-open' : ''}`}>▸</span>
                    </button>
                    {expandedSections[item.id] && item.children && (
                      <ul className="left-nav-children">
                        {item.children.map(child => (
                          <li key={child.id}>
                            <button
                              className={`left-nav-item left-nav-child ${effectiveNavId === child.id ? 'left-nav-active' : ''}`}
                              onClick={() => handleNavClick(child)}
                            >
                              <span className="left-nav-label">{child.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <button
                    className={`left-nav-item ${effectiveNavId === item.id ? 'left-nav-active' : ''}`}
                    onClick={() => handleNavClick(item)}
                  >
                    <span className="left-nav-icon">{item.icon}</span>
                    <span className="left-nav-label">{item.label}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className={`main-content ${transitioning ? 'v-out' : 'v-in'}`}>
          {content}
        </main>
      </div>

      {/* Agent Activation Overlay */}
      {agentActivating && (
        <div className="agent-overlay">
          <div className="agent-overlay-card">
            <div className="agent-spinner" />
            <h3>✨ Activating Posture Agent</h3>
            <p>Setting up agentic identity and connecting to your SharePoint data estate…</p>
            <div className="agent-steps">
              <div className="agent-step agent-step-done"><span className="agent-step-dot agent-step-dot-done" />Creating agentic identity</div>
              <div className="agent-step agent-step-active"><span className="agent-step-dot agent-step-dot-active" />Connecting to data sources</div>
              <div className="agent-step"><span className="agent-step-dot" />Analyzing estate topology</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .app-container {
          width: 100vw; height: 100vh; overflow: hidden;
          background: linear-gradient(145deg, #07070f 0%, #0d0d20 40%, #151030 100%);
          display: flex; flex-direction: column;
          position: relative;
        }
        .app-container::before {
          content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background: radial-gradient(ellipse at 30% 15%, rgba(99,102,241,0.06) 0%, transparent 50%),
                      radial-gradient(ellipse at 75% 85%, rgba(139,92,246,0.04) 0%, transparent 50%);
        }

        /* Header */
        .app-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 24px; border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.35); backdrop-filter: blur(20px);
          flex-shrink: 0; z-index: 10; position: relative;
        }
        .header-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .header-text h1 { font-size: 15px; font-weight: 600; letter-spacing: -0.3px; white-space: nowrap; }
        .header-badge { font-size: 10px; color: #8b5cf6; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; }
        .header-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .header-env { font-size: 12px; color: #a0a0b8; padding: 4px 12px; background: rgba(255,255,255,0.04); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06); }
        .header-status { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #22c55e; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: pd 2s infinite; }
        @keyframes pd { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(34,197,94,.4)} 50%{opacity:.8;box-shadow:0 0 0 4px rgba(34,197,94,0)} }
        .back-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: #e0e0f0; padding: 6px 14px; border-radius: 7px; cursor: pointer;
          font-size: 12px; font-family: inherit; transition: all .2s;
        }
        .back-btn:hover { background: rgba(255,255,255,0.1); border-color: #8b5cf6; }

        /* Breadcrumbs */
        .breadcrumbs { display: flex; align-items: center; gap: 6px; font-size: 12px; min-width: 0; overflow: hidden; }
        .bc-sep { color: #4a4a60; }
        .bc-home, .bc-link { color: #8b9cff; cursor: pointer; white-space: nowrap; }
        .bc-home:hover, .bc-link:hover { text-decoration: underline; }
        .bc-item { color: #a0a0b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* Body layout: nav + content */
        .app-body {
          display: flex; flex: 1; min-height: 0; position: relative; z-index: 1;
        }

        /* Left Navigation */
        .left-nav {
          width: 220px; flex-shrink: 0; background: rgba(14,14,28,0.85);
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column; overflow-y: auto;
          scrollbar-width: thin; scrollbar-color: #2a2a3a transparent;
        }
        .left-nav-title {
          padding: 16px 18px 10px; font-size: 11px; font-weight: 700;
          letter-spacing: 1.2px; color: #8b5cf6; text-transform: uppercase;
        }
        .left-nav-list {
          list-style: none; margin: 0; padding: 0;
        }
        .left-nav-list li { margin: 0; }
        .left-nav-item {
          display: flex; align-items: center; gap: 10px; width: 100%;
          padding: 9px 18px; border: none; background: none; color: #a0a0b8;
          font-size: 13px; font-family: inherit; cursor: pointer; text-align: left;
          transition: background .15s, color .15s; position: relative;
        }
        .left-nav-item:hover { background: rgba(255,255,255,0.04); color: #d0d0e8; }
        .left-nav-active {
          color: #e0e0ff !important; background: rgba(99,102,241,0.12) !important;
        }
        .left-nav-active::before {
          content: ''; position: absolute; left: 0; top: 6px; bottom: 6px; width: 3px;
          background: #8b5cf6; border-radius: 0 3px 3px 0;
        }
        .left-nav-icon { font-size: 15px; width: 20px; text-align: center; flex-shrink: 0; }
        .left-nav-label { flex: 1; }
        .left-nav-chevron {
          font-size: 10px; color: #5a5a70; transition: transform .2s; flex-shrink: 0;
        }
        .left-nav-chevron-open { transform: rotate(90deg); }
        .left-nav-expandable { font-weight: 500; }
        .left-nav-children {
          list-style: none; margin: 0; padding: 0;
        }
        .left-nav-child { padding-left: 48px !important; font-size: 12.5px; }

        /* Main Content */
        .main-content {
          flex: 1; min-width: 0; min-height: 0; overflow: hidden;
          transition: opacity .3s ease, transform .3s ease;
        }
        .v-out { opacity: 0; transform: scale(.98); }
        .v-in { opacity: 1; transform: scale(1); }

        /* Agent Activation Overlay */
        .agent-overlay {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(7,7,15,0.85); backdrop-filter: blur(16px);
          display: flex; align-items: center; justify-content: center;
          animation: agentFadeIn 0.3s ease;
        }
        @keyframes agentFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .agent-overlay-card {
          text-align: center; padding: 40px 48px; border-radius: 20px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(99,102,241,0.25);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.1);
          animation: agentCardIn 0.4s ease;
        }
        @keyframes agentCardIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .agent-spinner {
          width: 40px; height: 40px; margin: 0 auto 16px;
          border: 3px solid rgba(99,102,241,0.2); border-top-color: #8b5cf6;
          border-radius: 50%; animation: agentSpin 0.8s linear infinite;
        }
        @keyframes agentSpin { to { transform: rotate(360deg); } }
        .agent-overlay-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 6px; color: #e0e0ff; }
        .agent-overlay-card p { font-size: 13px; color: #8888a0; margin-bottom: 20px; }
        .agent-steps { display: flex; flex-direction: column; gap: 8px; text-align: left; }
        .agent-step { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #4a4a60; }
        .agent-step-done { color: #22c55e; }
        .agent-step-active { color: #a5b4fc; }
        .agent-step-dot { width: 8px; height: 8px; border-radius: 50%; background: #2a2a3a; flex-shrink: 0; }
        .agent-step-dot-done { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.4); }
        .agent-step-dot-active { background: #8b5cf6; box-shadow: 0 0 6px rgba(139,92,246,0.4); animation: pd 1.5s infinite; }
      `}</style>
    </div>
  );
}
