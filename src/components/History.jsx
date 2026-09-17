import React from 'react';
import { fmtDate } from '../lib/format';

export default function History({ sessions, onOpenDetail }){
  return (
    <>
      <div className="topbar">
        <div className="wordmark">FOR<span>GE</span></div>
        <div></div>
      </div>
      <div className="section-title">Historique</div>
      {!sessions.length && <div className="empty">Aucune séance enregistrée pour l'instant.</div>}
      {sessions.map(s=>{
        const setCount = (s.exercises||[]).reduce((a,e)=>a+(e.sets||[]).length,0);
        return (
          <div className="hist-card" key={s.id} onClick={()=>onOpenDetail(s.id)}>
            <div className="hist-top">
              <div className="hist-date">{fmtDate(s.date)}</div>
              <div className="badge">{setCount} séries</div>
            </div>
            <div className="hist-title">{s.dayTitle}</div>
          </div>
        );
      })}
    </>
  );
}
