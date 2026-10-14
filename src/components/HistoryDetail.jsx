import React, { useState } from 'react';
import { MG_LABEL, DIFFS, DIFF_COLOR, fmtDate } from '../lib/format';
import ConfirmSheet from './ConfirmSheet.jsx';

export default function HistoryDetail({ session, onBack, onUpdate, onDelete }){
  const [editing, setEditing] = useState(false);
  const [exs, setExs] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);
  if (!session) return <div className="empty">Introuvable</div>;

  const list = editing ? exs : (session.exercises||[]);

  function startEdit(){ setExs(JSON.parse(JSON.stringify(session.exercises||[]))); setEditing(true); }
  function setField(ei, si, field, value){
    setExs(prev => prev.map((e,i)=> i!==ei ? e : {...e, sets:e.sets.map((s,j)=> j!==si ? s : {...s, [field]: value})}));
  }
  function removeSet(ei, si){
    setExs(prev => prev.map((e,i)=> i!==ei ? e : {...e, sets:e.sets.filter((_,j)=>j!==si)}));
  }
  function removeExercise(ei){ setExs(prev => prev.filter((_,i)=>i!==ei)); }
  async function save(){
    await onUpdate(session.id, exs);
    setEditing(false);
  }

  return (
    <>
      <div className="back-row">
        <div className="icon-btn" onClick={editing ? ()=>setEditing(false) : onBack}>{editing ? '✕' : '←'}</div>
        <div style={{flex:1}}>
          <div className="back-title">{session.dayTitle}</div>
          <div className="back-sub">{fmtDate(session.date)}{editing ? ' · modification' : ''}</div>
        </div>
        {!editing && <div className="icon-btn" onClick={startEdit}>✎</div>}
      </div>

      {list.map((e,i)=>(
        <div className="ex-card" key={i} style={{marginTop: i===0?14:0}}>
          <div className="ex-head" style={{marginBottom:6}}>
            <div style={{flex:1}}>
              <div className="mg-tag">{MG_LABEL[e.muscleGroup]||''}</div>
              <div className="ex-name">{e.name}</div>
            </div>
            {editing && <div className="icon-mini" onClick={()=>removeExercise(i)}>✕</div>}
          </div>
          {e.type==='note' ? (
            <div className="ex-target">{e.noteDone ? 'Fait ✓' : 'Non fait'}</div>
          ) : editing ? (
            (e.sets||[]).map((st,j)=>(
              <div key={j}>
                <div className="set-row">
                  <div className="set-idx">{j+1}</div>
                  {e.type==='cardio' ? (
                    <input className="set-input" type="text" placeholder="durée / effort" value={st.duration||''}
                      onFocus={(ev)=>ev.target.select()} onChange={(ev)=>setField(i,j,'duration',ev.target.value)} />
                  ) : (
                    <>
                      <input className="set-input" type="number" inputMode="decimal" placeholder="kg" value={st.weight||''}
                        onFocus={(ev)=>ev.target.select()} onChange={(ev)=>setField(i,j,'weight',ev.target.value)} />
                      <input className="set-input" type="number" inputMode="numeric" placeholder="reps" value={st.reps||''}
                        onFocus={(ev)=>ev.target.select()} onChange={(ev)=>setField(i,j,'reps',ev.target.value)} />
                    </>
                  )}
                  <div className="icon-mini" onClick={()=>removeSet(i,j)}>−</div>
                </div>
                <div className="diff-row" style={{margin:'0 0 10px 28px'}}>
                  {DIFFS.map(d=>{
                    const sel = st.difficulty===d;
                    return <div key={d} className="diff-chip"
                      style={sel ? {background:DIFF_COLOR[d], color:'#0A0A0B', borderColor:DIFF_COLOR[d]} : {}}
                      onClick={()=>setField(i,j,'difficulty', sel?null:d)}>{d}</div>;
                  })}
                </div>
              </div>
            ))
          ) : (
            (e.sets||[]).map((st,j)=>(
              e.type==='cardio' ? (
                <div className="ex-target" key={j}>Round {j+1} — {st.duration||'—'} {st.difficulty?`· ${st.difficulty}`:''}</div>
              ) : (
                <div className="ex-target" key={j}>Série {j+1} — {st.weight||'—'}kg × {st.reps||'—'} {st.difficulty?`· ${st.difficulty}`:''}</div>
              )
            ))
          )}
          {e.note && !editing && <div className="ex-note">📝 {e.note}</div>}
          {editing && e.type!=='note' && (
            <input className="text-input" style={{marginTop:6}} placeholder="Note" value={e.note||''}
              onChange={(ev)=>setExs(prev=>prev.map((x,k)=>k!==i?x:{...x,note:ev.target.value}))} />
          )}
        </div>
      ))}

      {editing ? (
        <button className="btn btn-primary" onClick={save}>Enregistrer les modifications</button>
      ) : (
        <button className="btn btn-danger" style={{marginTop:6}} onClick={()=>setConfirmDel(true)}>Supprimer cette séance</button>
      )}

      {confirmDel && (
        <ConfirmSheet title="Supprimer cette séance ?" message="Elle disparaîtra de l'historique et des courbes. Action définitive."
          confirmLabel="Supprimer" onCancel={()=>setConfirmDel(false)}
          onConfirm={()=>{ setConfirmDel(false); onDelete(session.id); }} />
      )}
    </>
  );
}
