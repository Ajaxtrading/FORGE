import React, { useState } from 'react';
import { exerciseHistory, fmtDate, formatSet, sameName, DIFF_COLOR } from '../lib/format';
import LineChart from './LineChart.jsx';
import ConfirmSheet from './ConfirmSheet.jsx';

/** Toutes les séances contenant cet exercice, avec l'index exact de chaque série. */
function entriesFor(sessions, name){
  const out = [];
  for (const s of sessions){
    (s.exercises||[]).forEach((e, ei)=>{
      if (!sameName(e.name, name) || e.type==='cardio' || e.type==='note') return;
      if (!(e.sets||[]).length) return;
      out.push({ session:s, ei, sets:e.sets });
    });
  }
  return out; // sessions déjà triées du plus récent au plus ancien
}

export default function ProgressDetail({ name, sessions, onBack, onUpdateSession }){
  const [open, setOpen] = useState({});
  const [toDelete, setToDelete] = useState(null); // {session, ei, si}
  const pts = exerciseHistory(sessions, name);
  const best = pts.reduce((m,p)=> p.y>m ? p.y : m, 0);
  const entries = entriesFor(sessions, name);

  async function confirmDelete(){
    const { session, ei, si } = toDelete;
    setToDelete(null);
    const exercises = (session.exercises||[]).map((e,i)=> i!==ei ? e : {...e, sets:e.sets.filter((_,j)=>j!==si)})
      .filter(e => e.type==='note' || (e.sets||[]).length || (e.note||'').trim());
    await onUpdateSession(session.id, exercises);
  }

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

      <div className="section-title">Détail · tape une séance pour corriger</div>
      {entries.map(({session, ei, sets})=>{
        const k = `${session.id}-${ei}`;
        const isOpen = !!open[k];
        const heaviest = sets.reduce((m,st)=>{ const w = parseFloat(st.weight); return !isNaN(w) && w>m ? w : m; }, 0);
        return (
          <div className="hist-card" key={k} onClick={()=>setOpen(o=>({...o,[k]:!o[k]}))}>
            <div className="hist-top">
              <div className="hist-date">{fmtDate(session.date)}</div>
              <div style={{fontWeight:800}}>{heaviest ? `${heaviest} kg` : '—'} <span className="last-chev">{isOpen?'▴':'▾'}</span></div>
            </div>
            {isOpen && (
              <div className="last-detail" onClick={(ev)=>ev.stopPropagation()}>
                {sets.map((st,si)=>(
                  <div className="prog-set" key={si}>
                    <span className="prog-idx">Série {si+1}</span>
                    <span style={{fontWeight:700}}>{formatSet(st,'muscu')}</span>
                    <span style={{fontSize:12,fontWeight:700,color: st.difficulty ? DIFF_COLOR[st.difficulty] : 'var(--text-dim2)'}}>{st.difficulty||''}</span>
                    <div className="icon-mini" onClick={()=>setToDelete({session, ei, si})} aria-label="Supprimer la série">✕</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {toDelete && (
        <ConfirmSheet title="Supprimer cette série ?"
          message={`${name} — ${fmtDate(toDelete.session.date)} — série ${toDelete.si+1} : ${formatSet(toDelete.session.exercises[toDelete.ei].sets[toDelete.si],'muscu')}. Action définitive.`}
          confirmLabel="Supprimer" onCancel={()=>setToDelete(null)} onConfirm={confirmDelete} />
      )}
    </>
  );
}
