import React from 'react';
import { MG_LABEL, fmtDate } from '../lib/format';

export default function HistoryDetail({ session, onBack }){
  if (!session) return <div className="empty">Introuvable</div>;
  return (
    <>
      <div className="back-row">
        <div className="icon-btn" onClick={onBack}>←</div>
        <div>
          <div className="back-title">{session.dayTitle}</div>
          <div className="back-sub">{fmtDate(session.date)}</div>
        </div>
      </div>
      {(session.exercises||[]).map((e,i)=>(
        <div className="ex-card" key={i}>
          <div className="mg-tag">{MG_LABEL[e.muscleGroup]||''}</div>
          <div className="ex-name">{e.name}</div>
          {e.type==='note' ? (
            <div className="ex-target">{e.noteDone ? 'Fait ✓' : 'Non fait'}</div>
          ) : (
            (e.sets||[]).map((st,j)=>(
              e.type==='cardio' ? (
                <div className="ex-target" key={j}>Round {j+1} — {st.duration||'—'} {st.difficulty?`· ${st.difficulty}`:''}</div>
              ) : (
                <div className="ex-target" key={j}>Série {j+1} — {st.weight||'—'}kg × {st.reps||'—'} {st.difficulty?`· ${st.difficulty}`:''}</div>
              )
            ))
          )}
        </div>
      ))}
    </>
  );
}
