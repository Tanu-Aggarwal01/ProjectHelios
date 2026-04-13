import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { generateTopicGraph } from '../data/mockData';

const deptColors = { Finance:'#f59e0b', HR:'#ec4899', Legal:'#8b5cf6', Engineering:'#3b82f6', Sales:'#22c55e', Marketing:'#f97316', Product:'#06b6d4', IT:'#64748b', 'R&D':'#a855f7', Executive:'#ef4444' };

export default function TopicGraph({ categoryId, label }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [selected, setSelected] = useState(null);

  const graphData = generateTopicGraph(categoryId, label);

  useEffect(() => {
    if (!containerRef.current || !graphData) return;
    const W = containerRef.current.clientWidth;
    const H = containerRef.current.clientHeight;
    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');
    const gf = defs.append('filter').attr('id','tglow2').attr('x','-80%').attr('y','-80%').attr('width','260%').attr('height','260%');
    gf.append('feGaussianBlur').attr('stdDeviation',8).attr('result','b');
    const m = gf.append('feMerge'); m.append('feMergeNode').attr('in','b'); m.append('feMergeNode').attr('in','SourceGraphic');

    const rg = defs.append('radialGradient').attr('id','tc-grad').attr('cx','40%').attr('cy','40%');
    rg.append('stop').attr('offset','0%').attr('stop-color','#818cf8').attr('stop-opacity',0.9);
    rg.append('stop').attr('offset','100%').attr('stop-color','#4f46e5').attr('stop-opacity',0.6);

    ['accessed-by','located-in','activity'].forEach(type => {
      const color = type==='accessed-by'?'#3b82f6':type==='located-in'?'#14b8a6':'#f59e0b';
      defs.append('marker').attr('id',`ta-${type}`).attr('viewBox','0 0 10 6').attr('refX',10).attr('refY',3)
        .attr('markerWidth',7).attr('markerHeight',4).attr('orient','auto')
        .append('path').attr('d','M0,0 L10,3 L0,6 Z').attr('fill',color).attr('opacity',0.5);
    });

    const g = svg.append('g');
    svg.call(d3.zoom().scaleExtent([0.3,3]).on('zoom', e => g.attr('transform', e.transform)));
    svg.call(d3.zoom().transform, d3.zoomIdentity.translate(W/2, H/2).scale(0.85));

    const nodes = graphData.nodes.map(n => ({
      ...n,
      x: n.type==='topic' ? 0 : (Math.random()-0.5)*350,
      y: n.type==='topic' ? 0 : (Math.random()-0.5)*350,
      fx: n.type==='topic' ? 0 : undefined,
      fy: n.type==='topic' ? 0 : undefined,
    }));
    const links = graphData.links.map(l => ({ ...l }));

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d=>d.id).distance(180).strength(0.4))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('collision', d3.forceCollide().radius(d=>d.size+15))
      .force('radial', d3.forceRadial(d=>d.type==='topic'?0:220, 0, 0).strength(0.25))
      .alpha(1).alphaDecay(0.02);

    const linkPaths = g.append('g').selectAll('path').data(links).join('path')
      .attr('fill','none')
      .attr('stroke', d => d.type==='accessed-by'?'#3b82f6':d.type==='located-in'?'#14b8a6':'#f59e0b')
      .attr('stroke-width', d => 1+(d.strength||0.5)*3)
      .attr('stroke-opacity', 0.2)
      .attr('marker-end', d => `url(#ta-${d.type})`);

    // Particles
    const pG = g.append('g');
    links.forEach(link => {
      if (Math.random()>0.4) return;
      const p = pG.append('circle').attr('r',2)
        .attr('fill', link.type==='accessed-by'?'#60a5fa':link.type==='located-in'?'#2dd4bf':'#fbbf24').attr('opacity',0);
      function anim() {
        if (!svgRef.current) return;
        const s = typeof link.source==='object'?link.source:nodes.find(n=>n.id===link.source);
        const t = typeof link.target==='object'?link.target:nodes.find(n=>n.id===link.target);
        if (!s||!t) return;
        p.attr('cx',s.x).attr('cy',s.y).attr('opacity',0.7)
          .transition().duration(2000+Math.random()*1500).ease(d3.easeLinear)
          .attr('cx',t.x).attr('cy',t.y).attr('opacity',0)
          .on('end', ()=>setTimeout(anim, 1000+Math.random()*3000));
      }
      setTimeout(anim, Math.random()*2500);
    });

    // Nodes
    const nodeGs = g.append('g').selectAll('g').data(nodes).join('g')
      .style('cursor','pointer')
      .call(d3.drag()
        .on('start',(e,d)=>{if(!e.active)sim.alphaTarget(0.2).restart();d.fx=d.x;d.fy=d.y;})
        .on('drag',(e,d)=>{d.fx=e.x;d.fy=e.y;})
        .on('end',(e,d)=>{if(!e.active)sim.alphaTarget(0);if(d.type!=='topic'){d.fx=null;d.fy=null;}})
      );

    nodeGs.each(function(d) {
      const el = d3.select(this);
      if (d.type==='topic') {
        el.append('circle').attr('r',d.size+15).attr('fill','#6366f1').attr('opacity',0.05).attr('filter','url(#tglow2)');
        el.append('circle').attr('r',d.size+5).attr('fill','none').attr('stroke','#6366f1').attr('stroke-width',1.5).attr('stroke-dasharray','5,4').attr('opacity',0.3);
        el.append('circle').attr('r',d.size).attr('fill','url(#tc-grad)').attr('stroke','#6366f1').attr('stroke-width',2.5);
        el.append('text').attr('text-anchor','middle').attr('dy','-0.1em').attr('font-size',26).text('📂');
        el.append('text').attr('text-anchor','middle').attr('dy','1.5em').attr('font-size',11).attr('font-weight',700).attr('fill','white')
          .text(d.label.length > 24 ? d.label.slice(0,22)+'…' : d.label);
      } else if (d.type==='user-group') {
        const col = d.isAnomaly ? '#ef4444' : (deptColors[d.department]||'#6366f1');
        if (d.isAnomaly) el.append('circle').attr('r',d.size+5).attr('fill','none').attr('stroke','#ef4444').attr('stroke-width',2).attr('stroke-dasharray','4,3').attr('opacity',0.6);
        el.append('circle').attr('r',d.size).attr('fill',col).attr('fill-opacity',0.2).attr('stroke',col).attr('stroke-width',1.5);
        el.append('text').attr('text-anchor','middle').attr('dy','0.15em').attr('font-size',Math.max(d.size*0.55,14)).text('👥');
        el.append('text').attr('text-anchor','middle').attr('dy',d.size+13).attr('font-size',9).attr('font-weight',600).attr('fill','white').text(d.label);
        el.append('text').attr('text-anchor','middle').attr('dy',d.size+24).attr('font-size',8).attr('fill',d.isAnomaly?'#ef4444':'#a0a0b8')
          .text(`${d.userCount} users${d.isAnomaly?' ⚠️ anomaly':''}`);
      } else if (d.type==='site') {
        const s = d.size;
        el.append('path').attr('d',`M0,${-s} L${s},0 L0,${s} L${-s},0 Z`)
          .attr('fill','#14b8a6').attr('fill-opacity',0.2).attr('stroke','#14b8a6').attr('stroke-width',1.5);
        el.append('text').attr('text-anchor','middle').attr('dy','0.35em').attr('font-size',Math.max(s*0.5,12)).text('📁');
        el.append('text').attr('text-anchor','middle').attr('dy',s+13).attr('font-size',9).attr('font-weight',500).attr('fill','white').text(d.label.length>16?d.label.slice(0,14)+'…':d.label);
        el.append('text').attr('text-anchor','middle').attr('dy',s+24).attr('font-size',8).attr('fill','#a0a0b8').text(`${d.docCount?.toLocaleString()||''} docs`);
      } else if (d.type==='activity') {
        const s = d.size;
        const hex = d3.range(6).map(i=>{const a=(Math.PI/3)*i-Math.PI/6;return[s*Math.cos(a),s*Math.sin(a)];});
        el.append('polygon').attr('points',hex.map(p=>p.join(',')).join(' '))
          .attr('fill','#f59e0b').attr('fill-opacity',0.15).attr('stroke','#f59e0b').attr('stroke-width',1.5);
        el.append('text').attr('text-anchor','middle').attr('dy','0.35em').attr('font-size',Math.max(s*0.5,12)).text('⚡');
        el.append('text').attr('text-anchor','middle').attr('dy',s+13).attr('font-size',9).attr('font-weight',500).attr('fill','white').text(d.label);
        const tc = d.trend==='up'?'#ef4444':d.trend==='down'?'#22c55e':'#a0a0b8';
        const ti = d.trend==='up'?'↑':d.trend==='down'?'↓':'→';
        el.append('text').attr('text-anchor','middle').attr('dy',s+24).attr('font-size',8).attr('fill',tc).text(`${d.count?.toLocaleString()||''} ${ti}`);
      }
    });

    nodeGs.on('click', (_,d) => setSelected(d));
    nodeGs.on('mouseenter', function(_,d) {
      if (d.type==='topic') return;
      d3.select(this).transition().duration(150).attr('transform',`translate(${d.x},${d.y}) scale(1.12)`);
      linkPaths.attr('stroke-opacity', l => (l.source.id===d.id||l.target.id===d.id) ? 0.5 : 0.06);
    }).on('mouseleave', function(_,d) {
      d3.select(this).transition().duration(150).attr('transform',`translate(${d.x},${d.y}) scale(1)`);
      linkPaths.attr('stroke-opacity', 0.2);
    });

    sim.on('tick', () => {
      linkPaths.attr('d', d => {
        const dx=d.target.x-d.source.x, dy=d.target.y-d.source.y;
        const dr=Math.sqrt(dx*dx+dy*dy)*1.5;
        return `M${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });
      nodeGs.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => { sim.stop(); svg.selectAll('*').remove(); };
  }, [categoryId, label]);

  return (
    <div className="tg-view">
      <div className="tg-header">
        <h2>🔗 Topic Graph — {label}</h2>
        <p>Showing who accesses this topic, where it's located, and document activity patterns</p>
      </div>
      <div className="tg-body" ref={containerRef}>
        <svg ref={svgRef} />
        <div className="tg-legend">
          <div className="tgl-t">Nodes</div>
          <div className="tgl-i"><span className="tgl-d" style={{background:'#6366f1'}} />Topic</div>
          <div className="tgl-i"><span className="tgl-d" style={{background:'#3b82f6'}} />Users</div>
          <div className="tgl-i"><span className="tgl-d" style={{background:'#14b8a6'}} />Sites</div>
          <div className="tgl-i"><span className="tgl-d" style={{background:'#f59e0b'}} />Activity</div>
          <div className="tgl-s" />
          <div className="tgl-t">Links</div>
          <div className="tgl-i"><span className="tgl-l" style={{background:'#3b82f6'}} />Access</div>
          <div className="tgl-i"><span className="tgl-l" style={{background:'#14b8a6'}} />Location</div>
          <div className="tgl-i"><span className="tgl-l" style={{background:'#f59e0b'}} />Activity</div>
          <div className="tgl-s" />
          <div className="tgl-i"><span className="tgl-r" />Anomaly</div>
        </div>
      </div>
      {selected && selected.type !== 'topic' && (
        <div className="tg-detail">
          <div className="tgd-h"><h3>{selected.label}</h3><button onClick={()=>setSelected(null)}>×</button></div>
          <div className="tgd-type">{selected.type}</div>
          <div className="tgd-rows">
            {selected.type==='user-group' && <>
              <div className="tgd-r"><span>Department</span><span style={{color:deptColors[selected.department]}}>{selected.department}</span></div>
              <div className="tgd-r"><span>Users</span><span>{selected.userCount}</span></div>
              {selected.isAnomaly && <div className="tgd-alert">⚠️ Anomalous access pattern detected</div>}
            </>}
            {selected.type==='site' && <div className="tgd-r"><span>Documents</span><span>{selected.docCount?.toLocaleString()}</span></div>}
            {selected.type==='activity' && <>
              <div className="tgd-r"><span>Events</span><span>{selected.count?.toLocaleString()}</span></div>
              <div className="tgd-r"><span>Trend</span><span style={{color:selected.trend==='up'?'#ef4444':selected.trend==='down'?'#22c55e':'#a0a0b8'}}>
                {selected.trend==='up'?'↑ Increasing':selected.trend==='down'?'↓ Decreasing':'→ Stable'}
              </span></div>
            </>}
          </div>
        </div>
      )}
      <style>{`
        .tg-view { height:100%; display:flex; flex-direction:column; overflow:hidden; }
        .tg-header { padding:14px 24px; flex-shrink:0; border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(0,0,0,0.2); }
        .tg-header h2 { font-size:16px; font-weight:600; }
        .tg-header p { font-size:12px; color:#a0a0b8; }
        .tg-body { flex:1; position:relative; }
        .tg-body svg { width:100%; height:100%; }

        .tg-legend { position:absolute; bottom:14px; left:14px; background:rgba(12,12,25,0.9); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 12px; }
        .tgl-t { font-size:9px; text-transform:uppercase; letter-spacing:.5px; color:#6b6b80; margin-bottom:3px; font-weight:600; }
        .tgl-i { display:flex; align-items:center; gap:6px; font-size:10px; color:#a0a0b8; padding:1px 0; }
        .tgl-d { width:10px; height:10px; border-radius:50%; }
        .tgl-l { width:16px; height:3px; border-radius:2px; }
        .tgl-r { width:10px; height:10px; border:2px dashed #ef4444; border-radius:50%; }
        .tgl-s { height:1px; background:rgba(255,255,255,0.06); margin:4px 0; }

        .tg-detail { position:absolute; top:60px; right:16px; width:270px; background:rgba(12,12,25,0.95); backdrop-filter:blur(20px); border:1px solid rgba(99,102,241,0.2); border-radius:12px; padding:14px; z-index:10; box-shadow:0 8px 32px rgba(0,0,0,0.4); animation:tgd-in .2s ease; }
        @keyframes tgd-in { from{opacity:0;transform:translateX(15px)} to{opacity:1;transform:translateX(0)} }
        .tgd-h { display:flex; justify-content:space-between; align-items:center; }
        .tgd-h h3 { font-size:13px; font-weight:600; }
        .tgd-h button { background:none; border:none; color:#6b6b80; font-size:18px; cursor:pointer; }
        .tgd-type { font-size:9px; text-transform:uppercase; letter-spacing:.5px; color:#8b5cf6; margin-bottom:8px; }
        .tgd-rows { display:flex; flex-direction:column; gap:6px; }
        .tgd-r { display:flex; justify-content:space-between; font-size:11px; padding:4px 8px; background:rgba(255,255,255,0.03); border-radius:6px; }
        .tgd-r span:first-child { color:#6b6b80; }
        .tgd-r span:last-child { font-weight:600; }
        .tgd-alert { padding:6px 8px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); border-radius:6px; font-size:10px; color:#fca5a5; }
      `}</style>
    </div>
  );
}
