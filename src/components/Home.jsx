import React, { useState } from 'react';
import { MG_LABEL, MG_ORDER, TYPE_LABEL, weekVolume, plannedVolume, fmtDate } from '../lib/format';

export default function Home({ program, sessions, bodyweights, staleDraft, onResumeDraft, onDiscardDraft,
  onOpenDay, onEditProgram, onSaveBodyweight, onOpenBodyweight }){
  const [showBwInput, setShowBwInput] = useState(false);
  const [bwValue, setBwValue] = useState('');
  const lastBw = bodyweights[0];
  const done = weekVolume(sessions);
  const planned = plannedVolume(program);
  const groups = MG_ORDER.filter(g => (done[g]||0) > 0 || (planned[g]||0) > 0);

  function handleSaveBw(){
    const w = parseFloat(String(bwValue).replace(',','.'));
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

      {staleDraft && (
        <div className="card resume-card" style={{cursor:'default'}}>
          <div className="resume-title">Séance non terminée</div>
          <div className="day-sub">{staleDraft.dayTitle} · {fmtDate(staleDraft.savedAt || Date.now())}</div>
          <div className="row" style={{marginTop:12}}>
            <button className="btn btn-primary btn-sm" onClick={onResumeDraft}>Reprendre</button>
            <button className="btn btn-secondary btn-sm" onClick={onDiscardDraft}>Supprimer</button>
          </div>
        </div>
      )}

      <div className="bw-row" onClick={onOpenBodyweight}>
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
              <div style={{fontSize:12,color:'var(--text-dim)'}}>Poids corporel · voir la courbe ›</div>
              <div style={{fontWeight:700,fontSize:16,marginTop:2}}>{lastBw ? `${lastBw.weight} kg` : '—'}</div>
            </div>
            <div className="icon-mini" onClick={(e)=>{ e.stopPropagation(); setShowBwInput(true); }}>+</div>
          </>
        )}
      </div>

      {groups.length>0 && (
        <>
          <div className="section-title">Volume · depuis lundi</div>
          <div className="card" style={{cursor:'default'}}>
            {groups.map(mg=>{
              const d = done[mg]||0, p = planned[mg]||0;
              const pct = p ? Math.min(100, Math.round(d/p*100)) : 100;
              return (
                <div className="vol-row" key={mg}>
                  <div className="vol-label">{MG_LABEL[mg]||mg}</div>
                  <div className="vol-track"><div className="vol-fill" style={{width:`${pct}%`, opacity: p && d>=p ? 1 : 0.75}}/></div>
                  <div className="vol-count">{d}{p?`/${p}`:''}</div>
                </div>
              );
            })}
            <div className="vol-hint">Remis à zéro chaque lundi à 00h00 · objectif = séries prévues au programme</div>
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
