import React from 'react';
import { exerciseHistory, fmtDate } from '../lib/format';
import LineChart from './LineChart.jsx';

export default function ProgressDetail({ name, sessions, onBack }){
  const pts = exerciseHistory(sessions, name);
  const best = pts.reduce((m,p)=> p.y>m ? p.y : m, 0);
  return (
    <>
      <div className="back-row">
        <div className="icon-btn" onClick={onBack}>←</div>
        <div>
          <div className="back-title" style={{fontSize:19}}>{name}</div>
          <div className="back-sub">Série la plus lourde par séance</div>
        </div>
      </div>
      <div className="card" style={{cursor:'default',marginTop:14}}>
        <LineChart points={pts} unit=" kg" />
      </div>
      {pts.length>0 && (
        <div className="stat-grid">
          <div className="stat"><div className="stat-v">{best} kg</div><div className="stat-l">Record</div></div>
          <div className="stat"><div className="stat-v">{pts.length}</div><div className="stat-l">Séances</div></div>
          <div className="stat"><div className="stat-v">{pts[pts.length-1].y} kg</div><div className="stat-l">Dernière</div></div>
        </div>
      )}
      <div className="section-title">Détail</div>
      {pts.slice().reverse().map((p,i)=>(
        <div className="hist-card" key={i} style={{cursor:'default'}}>
          <div className="hist-top">
            <div className="hist-date">{fmtDate(p.date)}</div>
            <div style={{fontWeight:800}}>{p.y} kg × {p.reps||'—'}</div>
          </div>
        </div>
      ))}
    </>
  );
}
