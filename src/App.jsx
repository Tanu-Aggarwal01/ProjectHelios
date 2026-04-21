import React, { useState, useCallback } from 'react';
import HomePage from './components/HomePage';
import WorkloadOverview from './components/WorkloadOverview';
import TierView from './components/TierView';
import CategoryView from './components/CategoryView';
import SubcategoryView from './components/SubcategoryView';
import FileGraph from './components/FileGraph';
import TopicGraph from './components/TopicGraph';

const views = { HOME: 'home', WORKLOADS: 'workloads', TIERS: 'tiers', CATEGORIES: 'categories', SUBCATEGORIES: 'subcategories', FILE_GRAPH: 'file-graph', TOPIC_GRAPH: 'topic-graph' };

export default function App() {
  const [nav, setNav] = useState({ view: views.HOME, workload: null, tier: null, category: null, subcategory: null, file: null, topicLabel: null });
  const [transitioning, setTransitioning] = useState(false);

  const go = useCallback((next) => {
    setTransitioning(true);
    setTimeout(() => {
      setNav(prev => ({ ...prev, ...next }));
      setTimeout(() => setTransitioning(false), 40);
    }, 300);
  }, []);

  const goHome           = ()       => go({ view: views.HOME, workload: null, tier: null, category: null, subcategory: null, file: null, topicLabel: null });

  const breadcrumbs = [];
  if (nav.view !== views.HOME) breadcrumbs.push({ label: 'Home', onClick: goHome });
  if (nav.workload && nav.view !== views.HOME) breadcrumbs.push({ label: 'Microsoft 365', onClick: goHome });
  if (nav.workload && nav.view !== views.HOME && nav.view !== views.TIERS) breadcrumbs.push({ label: nav.workload.name, onClick: () => go({ view: views.TIERS, tier: null, category: null, subcategory: null, file: null, topicLabel: null }) });
  if (nav.tier) breadcrumbs.push({ label: nav.tier.name, onClick: () => go({ view: views.CATEGORIES, category: null, subcategory: null, file: null }) });
  if (nav.category) breadcrumbs.push({ label: nav.category.name, onClick: () => go({ view: views.SUBCATEGORIES, subcategory: null, file: null }) });
  if (nav.subcategory) breadcrumbs.push({ label: nav.subcategory.name });
  if (nav.file) breadcrumbs.push({ label: nav.file.name });

  const selectWorkload   = (wl)     => go({ view: views.TIERS, workload: wl, tier: null, category: null, subcategory: null, file: null, topicLabel: null });
  const selectTier       = (tier)   => {
    if (!tier.categorized) return;
    go({ view: views.CATEGORIES, tier, category: null, subcategory: null, file: null });
  };
  const selectCategory   = (cat)    => go({ view: views.SUBCATEGORIES, category: cat, subcategory: null, file: null });
  const selectSubcategory = (sub)   => go({ view: views.SUBCATEGORIES, subcategory: sub });
  const selectFile       = (file)   => go({ view: views.FILE_GRAPH, file });
  const openTopicGraph   = (label)  => go({ view: views.TOPIC_GRAPH, topicLabel: label });
  const goBack           = ()       => {
    if (nav.view === views.FILE_GRAPH) return go({ view: views.SUBCATEGORIES, file: null });
    if (nav.view === views.TOPIC_GRAPH) return go({ view: nav.subcategory ? views.SUBCATEGORIES : views.CATEGORIES, topicLabel: null });
    if (nav.view === views.SUBCATEGORIES && nav.subcategory) return go({ view: views.SUBCATEGORIES, subcategory: null });
    if (nav.view === views.SUBCATEGORIES) return go({ view: views.CATEGORIES, category: null, subcategory: null });
    if (nav.view === views.CATEGORIES) return go({ view: views.TIERS, tier: null, category: null, subcategory: null });
    if (nav.view === views.TIERS) return goHome();
    if (nav.view === views.WORKLOADS) return goHome();
  };

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
          {breadcrumbs.length > 0 && nav.view !== views.HOME && (
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

      <div className={`view-wrapper ${transitioning ? 'v-out' : 'v-in'}`}>
        {content}
      </div>

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

        /* View Transitions */
        .view-wrapper { flex: 1; min-height: 0; position: relative; z-index: 1; transition: opacity .3s ease, transform .3s ease; }
        .v-out { opacity: 0; transform: scale(.98); }
        .v-in { opacity: 1; transform: scale(1); }
      `}</style>
    </div>
  );
}
