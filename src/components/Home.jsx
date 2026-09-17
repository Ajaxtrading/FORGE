import React, { useState } from 'react';
import { MG_LABEL, TYPE_LABEL, weekVolume } from '../lib/format';

export default function Home({ program, sessions, bodyweights, onOpenDay, onEditProgram, onSaveBodyweight }){
  const [showBwInput, setShowBwInput] = useState(false);
  const [bwValue, setBwValue] = useState('');
  const lastBw = bodyweights[0];
  const vol = weekVolume(sessions);
  const maxVol = Math.max(1, ...Object.values(vol));

  function handleSaveBw(){
    const w = parseFloat(bwValue);
    if (!w) return;
    onSaveBodyweight(w);
    setShowBwInput(false);
    setBwValue('');
  }

  return (
    <>
      <div className="topbar">
        <div className="wordmark">FOR<span>GE</span></div>
        <div className="icon-btn" onClick={onEditProgram}>✎</div>
      </div>

      <div className="bw-row" onClick={()=>{ if(!showBwInput) setShowBwInput(true); }}>
        {showBwInput ? (
          <div style={{width:'100%'}} onClick={(e)=>e.stopPropagation()}>
            <div className="field-label" style={{margin:'0 0 8px 0'}}>Poids du jour (kg)</div>
            <div className="row">
              <input className="text-input" type="number" step="0.1" inputMode="decimal" placeholder="ex: 78.5"
                value={bwValue} onChange={(e)=>setBwValue(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==='Enter') handleSaveBw(); }} autoFocus />
              <button className="btn btn-primary btn-sm" onClick={handleSaveBw}>OK</button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div style={{fontSize:12,color:'var(--text-dim)'}}>Poids corporel</div>
              <div style={{fontWeight:700,fontSize:16,marginTop:2}}>{lastBw ? `${lastBw.weight} kg` : '—'}</div>
            </div>
            <div className="icon-mini">+</div>
          </>
        )}
      </div>

      {Object.keys(vol).length>0 && (
        <>
          <div className="section-title">Volume cette semaine</div>
          <div className="card" style={{cursor:'default'}}>
            {Object.keys(vol).map(mg=>(
              <div className="vol-row" key={mg}>
                <div className="vol-label">{MG_LABEL[mg]||mg}</div>
                <div className="vol-track"><div className="vol-fill" style={{width:`${Math.round(vol[mg]/maxVol*100)}%`}}/></div>
                <div className="vol-count">{vol[mg]}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="section-title">Programme</div>
      {!program.days.length && <div className="empty">Aucun programme pour l'instant.</div>}
      {program.days.map(d=>{
        const exCount = (d.exercises||[]).length;
        return (
          <div className="card day-card" key={d.id} onClick={()=>onOpenDay(d.id)}>
            <div className="day-meta">
              <div className="day-weekday">{d.weekday}</div>
              <div className="day-title">{d.title}</div>
              <div className="day-sub">{d.type==='repos' ? 'Repos' : `${exCount} exercices`}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div className={`badge ${d.type||'muscu'}`}>{TYPE_LABEL[d.type]||'Muscu'}</div>
              <div className="chev">›</div>
            </div>
          </div>
        );
      })}
    </>
  );
}
