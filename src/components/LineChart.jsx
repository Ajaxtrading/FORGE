import React, { useState } from 'react';
import { fmtDateShort } from '../lib/format';

const W = 320, H = 190, PL = 34, PR = 12, PT = 16, PB = 26;

export default function LineChart({ points, line2, unit = '', decimals = 1 }){
  const [sel, setSel] = useState(null);
  if (!points.length) return <div className="empty">Pas encore de données.</div>;

  const all = points.concat(line2 || []);
  let minY = Math.min(...all.map(p=>p.y)), maxY = Math.max(...all.map(p=>p.y));
  if (minY === maxY){ minY -= 1; maxY += 1; }
  const padY = (maxY - minY) * 0.12; minY -= padY; maxY += padY;
  const minX = points[0].x, maxX = points[points.length-1].x;
  const spanX = Math.max(1, maxX - minX);
  const sx = (x) => points.length===1 ? (PL + (W-PL-PR)/2) : PL + ((x-minX)/spanX) * (W-PL-PR);
  const sy = (y) => PT + (1 - (y-minY)/(maxY-minY)) * (H-PT-PB);
  const path = (pts) => pts.map((p,i)=>`${i?'L':'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
  const fmt = (v) => Number(v).toFixed(decimals).replace(/\.0+$/,'');

  const ticks = [0,1,2].map(i => minY + (maxY-minY) * (i/2));
  const active = sel!==null && points[sel] ? points[sel] : points[points.length-1];

  function onTap(ev){
    const r = ev.currentTarget.getBoundingClientRect();
    const px = ((ev.clientX - r.left) / r.width) * W;
    let best = 0, bd = Infinity;
    points.forEach((p,i)=>{ const d = Math.abs(sx(p.x)-px); if (d<bd){ bd=d; best=i; } });
    setSel(best);
  }

  return (
    <div className="chart">
      <div className="chart-readout">
        <span className="chart-val">{fmt(active.y)}{unit}</span>
        <span className="chart-sub">{active.reps ? `× ${active.reps} · ` : ''}{fmtDateShort(active.date || active.x)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" onClick={onTap} role="img" aria-label="Courbe d'évolution">
        {ticks.map((t,i)=>(
          <g key={i}>
            <line x1={PL} x2={W-PR} y1={sy(t)} y2={sy(t)} stroke="rgba(255,255,255,0.07)" />
            <text x={PL-6} y={sy(t)+3} textAnchor="end" fontSize="9" fill="#6C6C72">{fmt(t)}</text>
          </g>
        ))}
        {line2 && line2.length>1 && <path d={path(line2)} fill="none" stroke="#9A9AA1" strokeWidth="1.5" strokeDasharray="4 3" />}
        {points.length>1 && <path d={path(points)} fill="none" stroke="#C6FF3D" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
        {points.map((p,i)=>(
          <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={p===active?5.5:3.2} fill={p===active?'#C6FF3D':'#0A0A0B'} stroke="#C6FF3D" strokeWidth="2" />
        ))}
        <text x={PL} y={H-8} fontSize="9" fill="#6C6C72">{fmtDateShort(points[0].x)}</text>
        {points.length>1 && <text x={W-PR} y={H-8} fontSize="9" fill="#6C6C72" textAnchor="end">{fmtDateShort(points[points.length-1].x)}</text>}
      </svg>
    </div>
  );
}
