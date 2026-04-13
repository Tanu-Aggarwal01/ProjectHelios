import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { generateFileGraph, riskColor, riskLabel } from '../data/mockData';

const deptColors = { Finance:'#f59e0b', HR:'#ec4899', Legal:'#8b5cf6', Engineering:'#3b82f6', Sales:'#22c55e', Marketing:'#f97316', Product:'#06b6d4', IT:'#64748b', 'R&D':'#a855f7', Executive:'#ef4444' };

export default function FileGraph({ file }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [selected, setSelected] = useState(null);

  const graphData = generateFileGraph(file);

  useEffect(() => {
    if (!containerRef.current || !graphData) return;
    const W = containerRef.current.clientWidth;
    const H = containerRef.current.clientHeight;
    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');
    // Glow
    const gf = defs.append('filter').attr('id','fglow').attr('x','-80%').attr('y','-80%').attr('width','260%').attr('height','260%');
    gf.append('feGaussianBlur').attr('stdDeviation',8).attr('result','b');
    const m = gf.append('feMerge'); m.append('feMergeNode').attr('in','b'); m.append('feMergeNode').attr('in','SourceGraphic');

    // Grad
    const rg = defs.append('radialGradient').attr('id','file-center-grad').attr('cx','40%').attr('cy','40%');
    rg.append('stop').attr('offset','0%').attr('stop-color','#818cf8').attr('stop-opacity',0.9);
    rg.append('stop').attr('offset','100%').attr('stop-color','#4f46e5').attr('stop-opacity',0.6);

    // Arrow markers
    ['access','located-in','activity'].forEach(type => {
      const color = type === 'access' ? '#60a5fa' : type === 'located-in' ? '#2dd4bf' : '#fbbf24';
      defs.append('marker').attr('id',`fa-${type}`).attr('viewBox','0 0 10 6').attr('refX',10).attr('refY',3)
        .attr('markerWidth',7).attr('markerHeight',4).attr('orient','auto')
        .append('path').attr('d','M0,0 L10,3 L0,6 Z').attr('fill',color).attr('opacity',0.5);
    });

    const g = svg.append('g');
    svg.call(d3.zoom().scaleExtent([0.3,3]).on('zoom', e => g.attr('transform', e.transform)));
    svg.call(d3.zoom().transform, d3.zoomIdentity.translate(W/2, H/2).scale(0.9));

    const nodes = graphData.nodes.map(n => ({
      ...n,
      x: n.type === 'file' ? 0 : (Math.random()-0.5)*300,
      y: n.type === 'file' ? 0 : (Math.random()-0.5)*300,
      fx: n.type === 'file' ? 0 : undefined,
      fy: n.type === 'file' ? 0 : undefined,
    }));
    const links = graphData.links.map(l => ({ ...l }));

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(150).strength(0.5))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('collision', d3.forceCollide().radius(d => d.size + 12))
      .force('radial', d3.forceRadial(d => d.type === 'file' ? 0 : 180, 0, 0).strength(0.2))
      .alpha(1).alphaDecay(0.025);

    // Links
    const linkPaths = g.append('g').selectAll('path').data(links).join('path')
      .attr('fill','none')
      .attr('stroke', d => d.type === 'access' ? (d.isOverPermissioned ? '#ef4444' : '#60a5fa') : d.type === 'located-in' ? '#2dd4bf' : '#fbbf24')
      .attr('stroke-width', d => d.isOverPermissioned ? 2.5 : 1.5)
      .attr('stroke-opacity', d => d.isOverPermissioned ? 0.5 : 0.2)
      .attr('stroke-dasharray', d => d.isOverPermissioned ? '6,3' : 'none')
      .attr('marker-end', d => `url(#fa-${d.type})`);

    // Particles
    const particleG = g.append('g');
    links.forEach(link => {
      const p = particleG.append('circle').attr('r',2)
        .attr('fill', link.type === 'access' ? '#60a5fa' : link.type === 'located-in' ? '#2dd4bf' : '#fbbf24')
        .attr('opacity',0);
      function animate() {
        if (!svgRef.current) return;
        const src = typeof link.source === 'object' ? link.source : nodes.find(n => n.id === link.source);
        const tgt = typeof link.target === 'object' ? link.target : nodes.find(n => n.id === link.target);
        if (!src || !tgt) return;
        p.attr('cx',src.x).attr('cy',src.y).attr('opacity',0.7)
          .transition().duration(1800+Math.random()*1500).ease(d3.easeLinear)
          .attr('cx',tgt.x).attr('cy',tgt.y).attr('opacity',0)
          .on('end', () => setTimeout(animate, 1000+Math.random()*3000));
      }
      setTimeout(animate, Math.random()*2500);
    });

    // Node groups
    const nodeGs = g.append('g').selectAll('g').data(nodes).join('g')
      .style('cursor','pointer')
      .call(d3.drag()
        .on('start', (e,d) => { if (!e.active) sim.alphaTarget(0.2).restart(); d.fx=d.x; d.fy=d.y; })
        .on('drag', (e,d) => { d.fx=e.x; d.fy=e.y; })
        .on('end', (e,d) => { if (!e.active) sim.alphaTarget(0); if (d.type !== 'file'){d.fx=null;d.fy=null;} })
      );

    nodeGs.each(function(d) {
      const el = d3.select(this);
      if (d.type === 'file') {
        el.append('circle').attr('r',d.size+12).attr('fill','#6366f1').attr('opacity',0.06).attr('filter','url(#fglow)');
        el.append('circle').attr('r',d.size).attr('fill','url(#file-center-grad)').attr('stroke','#6366f1').attr('stroke-width',2);
        el.append('text').attr('text-anchor','middle').attr('dy','-0.2em').attr('font-size',24).text('📄');
        el.append('text').attr('text-anchor','middle').attr('dy','1.4em').attr('font-size',10).attr('font-weight',600).attr('fill','white')
          .text(d.label.length > 22 ? d.label.slice(0,20)+'…' : d.label);
        if (d.mipLabel) {
          el.append('text').attr('text-anchor','middle').attr('dy','2.8em').attr('font-size',9).attr('fill','#c4b5fd')
            .text(`🏷️ ${d.mipLabel}`);
        }
      } else if (d.type === 'user') {
        const col = d.isOverPermissioned ? '#ef4444' : (deptColors[d.department] || '#6366f1');
        if (d.isOverPermissioned) {
          el.append('circle').attr('r',d.size+6).attr('fill','none').attr('stroke','#ef4444').attr('stroke-width',2).attr('stroke-dasharray','4,3').attr('opacity',0.7);
        }
        el.append('circle').attr('r',d.size).attr('fill',col).attr('fill-opacity',0.2).attr('stroke',col).attr('stroke-width',1.5);
        el.append('text').attr('text-anchor','middle').attr('dy','0.15em').attr('font-size',16).text('👤');
        el.append('text').attr('text-anchor','middle').attr('dy',d.size+13).attr('font-size',9).attr('font-weight',500).attr('fill','white').text(d.label);
        el.append('text').attr('text-anchor','middle').attr('dy',d.size+24).attr('font-size',8)
          .attr('fill', d.isOverPermissioned ? '#ef4444' : '#a0a0b8')
          .text(`${d.role} · ${d.department}${d.isOverPermissioned ? ' ⚠️' : ''}`);
      } else if (d.type === 'site') {
        const s = d.size;
        el.append('path').attr('d',`M0,${-s} L${s},0 L0,${s} L${-s},0 Z`)
          .attr('fill','#14b8a6').attr('fill-opacity',0.2).attr('stroke','#14b8a6').attr('stroke-width',1.5);
        el.append('text').attr('text-anchor','middle').attr('dy','0.35em').attr('font-size',14).text('📁');
        el.append('text').attr('text-anchor','middle').attr('dy',s+13).attr('font-size',9).attr('font-weight',500).attr('fill','white').text(d.label);
      } else if (d.type === 'activity') {
        const s = d.size;
        const hex = d3.range(6).map(i => { const a = (Math.PI/3)*i - Math.PI/6; return [s*Math.cos(a), s*Math.sin(a)]; });
        el.append('polygon').attr('points', hex.map(p=>p.join(',')).join(' '))
          .attr('fill','#f59e0b').attr('fill-opacity',0.15).attr('stroke','#f59e0b').attr('stroke-width',1.5);
        el.append('text').attr('text-anchor','middle').attr('dy','0.35em').attr('font-size',13).text('⚡');
        el.append('text').attr('text-anchor','middle').attr('dy',s+13).attr('font-size',9).attr('font-weight',500).attr('fill','white').text(d.label);
        el.append('text').attr('text-anchor','middle').attr('dy',s+24).attr('font-size',8).attr('fill','#a0a0b8').text(`${d.daysAgo}d ago · ${d.who}`);
      }
    });

    nodeGs.on('click', (_, d) => setSelected(d));
    nodeGs.on('mouseenter', function(_, d) {
      if (d.type === 'file') return;
      d3.select(this).transition().duration(150).attr('transform', `translate(${d.x},${d.y}) scale(1.12)`);
      linkPaths.attr('stroke-opacity', l => (l.source.id===d.id||l.target.id===d.id) ? 0.55 : 0.08);
    }).on('mouseleave', function(_, d) {
      d3.select(this).transition().duration(150).attr('transform', `translate(${d.x},${d.y}) scale(1)`);
      linkPaths.attr('stroke-opacity', l => l.isOverPermissioned ? 0.5 : 0.2);
    });

    sim.on('tick', () => {
      linkPaths.attr('d', d => {
        const dx=d.target.x-d.source.x, dy=d.target.y-d.source.y;
        const dr = Math.sqrt(dx*dx+dy*dy)*1.4;
        return `M${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });
      nodeGs.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => { sim.stop(); svg.selectAll('*').remove(); };
  }, [file]);

  const overPerms = graphData.nodes.filter(n => n.isOverPermissioned);

  return (
    <div className="fg-view">
      <div className="fg-info">
        <div className="fg-file-info">
          <span className="fg-file-icon">📄</span>
          <div>
            <h2>{file.name}</h2>
            <div className="fg-meta">
              <span>📁 {file.site}</span>
              <span>📅 {file.lastModified}</span>
              <span>📏 {file.size}</span>
              <span style={{ color: riskColor(file.riskScore) }}>Risk: {file.riskScore}</span>
              {file.mipLabel && <span className="fg-label">🏷️ {file.mipLabel}</span>}
              {file.aiAccessed && <span className="fg-ai">🤖 AI Accessed</span>}
              {!file.dlpProtected && <span className="fg-nodlp">🚫 No DLP</span>}
            </div>
          </div>
        </div>
        {overPerms.length > 0 && (
          <div className="fg-alert">
            ⚠️ <strong>{overPerms.length} user(s)</strong> appear over-permissioned — {overPerms.map(n => `${n.label} (${n.role})`).join(', ')}
          </div>
        )}
      </div>
      <div className="fg-graph" ref={containerRef}>
        <svg ref={svgRef} />
        {/* Legend */}
        <div className="fg-legend">
          <div className="fgl-title">Legend</div>
          <div className="fgl-item"><span className="fgl-dot" style={{ background:'#6366f1' }} />File</div>
          <div className="fgl-item"><span className="fgl-dot" style={{ background:'#60a5fa' }} />User</div>
          <div className="fgl-item"><span className="fgl-dot" style={{ background:'#14b8a6' }} />Site</div>
          <div className="fgl-item"><span className="fgl-dot" style={{ background:'#f59e0b' }} />Activity</div>
          <div className="fgl-sep" />
          <div className="fgl-item"><span className="fgl-ring" />Over-permissioned</div>
        </div>
      </div>

      {selected && selected.type !== 'file' && (
        <div className="fg-detail">
          <div className="fgd-head"><h3>{selected.label}</h3><button onClick={() => setSelected(null)}>×</button></div>
          <div className="fgd-type">{selected.type}</div>
          <div className="fgd-rows">
            {selected.type === 'user' && <>
              <div className="fgd-r"><span>Department</span><span style={{ color: deptColors[selected.department] }}>{selected.department}</span></div>
              <div className="fgd-r"><span>Role</span><span>{selected.role}</span></div>
              {selected.isOverPermissioned && <div className="fgd-alert">⚠️ Suggested action: Reduce to Viewer or Contributor role</div>}
            </>}
            {selected.type === 'site' && <div className="fgd-r"><span>Site</span><span>{selected.label}</span></div>}
            {selected.type === 'activity' && <>
              <div className="fgd-r"><span>Action</span><span>{selected.label}</span></div>
              <div className="fgd-r"><span>By</span><span>{selected.who}</span></div>
              <div className="fgd-r"><span>When</span><span>{selected.daysAgo} days ago</span></div>
            </>}
          </div>
        </div>
      )}

      <style>{`
        .fg-view { height:100%; display:flex; flex-direction:column; overflow:hidden; }
        .fg-info { padding:12px 24px; flex-shrink:0; display:flex; flex-direction:column; gap:8px; border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.2); }
        .fg-file-info { display:flex; align-items:center; gap:12px; }
        .fg-file-icon { font-size:28px; }
        .fg-file-info h2 { font-size:15px; font-weight:600; }
        .fg-meta { display:flex; gap:12px; font-size:11px; color:#a0a0b8; flex-wrap:wrap; }
        .fg-label { color:#c4b5fd; }
        .fg-ai { color:#f97316; }
        .fg-nodlp { color:#ef4444; }
        .fg-alert { padding:8px 12px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); border-radius:8px; font-size:11px; color:#fca5a5; }
        .fg-graph { flex:1; position:relative; }
        .fg-graph svg { width:100%; height:100%; }

        .fg-legend { position:absolute; bottom:14px; left:14px; background:rgba(12,12,25,0.9); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 12px; }
        .fgl-title { font-size:9px; text-transform:uppercase; letter-spacing:.5px; color:#6b6b80; margin-bottom:4px; font-weight:600; }
        .fgl-item { display:flex; align-items:center; gap:6px; font-size:10px; color:#a0a0b8; padding:1px 0; }
        .fgl-dot { width:10px; height:10px; border-radius:50%; }
        .fgl-ring { width:10px; height:10px; border:2px dashed #ef4444; border-radius:50%; }
        .fgl-sep { height:1px; background:rgba(255,255,255,0.06); margin:4px 0; }

        .fg-detail { position:absolute; top:80px; right:16px; width:280px; background:rgba(12,12,25,0.95); backdrop-filter:blur(20px); border:1px solid rgba(99,102,241,0.2); border-radius:12px; padding:14px; z-index:10; box-shadow:0 8px 32px rgba(0,0,0,0.4); animation:fgd-in .2s ease; }
        @keyframes fgd-in { from{opacity:0;transform:translateX(15px)} to{opacity:1;transform:translateX(0)} }
        .fgd-head { display:flex; justify-content:space-between; align-items:center; }
        .fgd-head h3 { font-size:13px; font-weight:600; }
        .fgd-head button { background:none; border:none; color:#6b6b80; font-size:18px; cursor:pointer; }
        .fgd-type { font-size:9px; text-transform:uppercase; letter-spacing:.5px; color:#8b5cf6; margin-bottom:10px; }
        .fgd-rows { display:flex; flex-direction:column; gap:6px; }
        .fgd-r { display:flex; justify-content:space-between; font-size:11px; padding:4px 8px; background:rgba(255,255,255,0.03); border-radius:6px; }
        .fgd-r span:first-child { color:#6b6b80; }
        .fgd-r span:last-child { font-weight:600; }
        .fgd-alert { padding:6px 8px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); border-radius:6px; font-size:10px; color:#fca5a5; }
      `}</style>
    </div>
  );
}
