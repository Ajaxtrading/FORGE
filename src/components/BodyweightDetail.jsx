import React, { useState } from 'react';
import { fmtDate, movingAverage, num } from '../lib/format';
import LineChart from './LineChart.jsx';
import ConfirmSheet from './ConfirmSheet.jsx';

export default function BodyweightDetail({ bodyweights, onBack, onSave, onDelete }){
  const [value, setValue] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const pts = bodyweights.map(b=>({ x:new Date(b.date).getTime(), y:Number(b.weight), date:b.date })).filter(p=>!isNaN(p.y)).sort((a,b)=>a.x-b.x);
  const avg = pts.length>2 ? movingAverage(pts, 7) : null;
  const cur = pts.length ? pts[pts.length-1].y : null;
  const monthAgo = Date.now() - 30*86400000;
  const ref = pts.find(p=>p.x>=monthAgo) || pts[0];
  const delta = cur!==null && ref ? cur - ref.y : null;

  function add(){
    const w = num(value);
    if (!w) return;
    onSave(w);
    setValue('');
  }

  return (
    <>
      <div className="back-row">
        <div className="icon-btn" onClick={onBack}>←</div>
        <div>
          <div className="back-title">Poids corporel</div>
          <div className="back-sub">{avg ? 'Courbe + moyenne mobile 7 pesées' : 'Courbe'}</div>
        </div>
      </div>

      <div className="card" style={{cursor:'default',marginTop:14}}>
        <LineChart points={pts} line2={avg} unit=" kg" />
      </div>

      {pts.length>0 && (
        <div className="stat-grid">
          <div className="stat"><div className="stat-v">{cur} kg</div><div className="stat-l">Actuel</div></div>
          <div className="stat"><div className="stat-v">{delta===null?'—':`${delta>0?'+':''}${Math.round(delta*10)/10}`}</div><div className="stat-l">~30 jours</div></div>
          <div className="stat"><div className="stat-v">{Math.min(...pts.map(p=>p.y))}</div><div className="stat-l">Min</div></div>
        </div>
      )}

      <div className="section-title">Ajouter une pesée</div>
      <div className="row">
        <input className="text-input" type="number" step="0.1" inputMode="decimal" placeholder="ex : 82.5"
          value={value} onChange={(e)=>setValue(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') add(); }} />
        <button className="btn btn-primary btn-sm" onClick={add}>OK</button>
      </div>

      <div className="section-title">Historique</div>
      {bodyweights.map(b=>(
        <div className="hist-card" key={b.id} style={{cursor:'default'}}>
          <div className="hist-top">
            <div className="hist-date">{fmtDate(b.date)}</div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{fontWeight:800}}>{b.weight} kg</div>
              <div className="icon-mini" onClick={()=>setToDelete(b)}>✕</div>
            </div>
          </div>
        </div>
      ))}

      {toDelete && (
        <ConfirmSheet title="Supprimer cette pesée ?" message={`${toDelete.weight} kg — ${fmtDate(toDelete.date)}`}
          confirmLabel="Supprimer" onCancel={()=>setToDelete(null)}
          onConfirm={()=>{ onDelete(toDelete.id); setToDelete(null); }} />
      )}
    </>
  );
}
