import React from 'react';
import { MG_LABEL } from '../lib/format';

export default function DayView({ day, onBack, onStartSession }){
  if (!day) return <div className="empty">Introuvable</div>;

  return (
    <>
      <div className="back-row">
        <div className="icon-btn" onClick={onBack}>←</div>
        <div>
          <div className="back-title">{day.title}</div>
          <div className="back-sub">{day.weekday}</div>
        </div>
      </div>

      {day.mobility && day.mobility.length>0 && (
        <div className="mobility-list">
          <div className="mobility-title">Mobilité pré-séance</div>
          {day.mobility.map(m=>(
            <div className="mob-item" key={m.id}>
              <div className="mob-check">•</div>
              <div>
                <div className="mob-name">{m.name}</div>
                <div className="mob-detail">{m.detail||''}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {day.type==='repos' ? (
        <div className="empty">Jour de repos. Profites-en 🙌</div>
      ) : (
        <>
          {(day.exercises||[]).map(e=>(
            <div className="ex-card" key={e.id}>
              <div className="mg-tag">{MG_LABEL[e.muscleGroup]||''}</div>
              <div className="ex-name">{e.name}</div>
              <div className="ex-target">{e.type==='note' ? '—' : `Objectif : ${e.targetSets} x ${e.targetReps}`}</div>
            </div>
          ))}
          <div style={{marginTop:8}}>
            <button className="btn btn-primary" onClick={()=>onStartSession(day)}>Démarrer la séance</button>
          </div>
        </>
      )}
    </>
  );
}
