import React from 'react';
import { MG_LABEL, muscuExerciseList } from '../lib/format';

export default function ProgressList({ sessions, program, bodyweights, onOpen, onBodyweight }){
  const list = muscuExerciseList(sessions, program);
  const lastBw = bodyweights[0];
  let lastGroup = null;
  return (
    <>
      <div className="topbar">
        <div className="wordmark">FOR<span>GE</span></div>
        <div></div>
      </div>

      <div className="section-title">Corps</div>
      <div className="card day-card" onClick={onBodyweight}>
        <div className="day-meta">
          <div className="day-title">Poids corporel</div>
          <div className="day-sub">{lastBw ? `${lastBw.weight} kg` : 'Aucune pesée'}</div>
        </div>
        <div className="chev">›</div>
      </div>

      <div className="section-title">Exercices muscu</div>
      {!list.length && <div className="empty">Les courbes apparaîtront après ta première séance enregistrée avec des charges.</div>}
      {list.map(it=>{
        const head = it.muscleGroup !== lastGroup;
        lastGroup = it.muscleGroup;
        const delta = it.last.y - it.first.y;
        return (
          <React.Fragment key={it.name}>
            {head && <div className="group-label">{MG_LABEL[it.muscleGroup]||'Autre'}</div>}
            <div className="card day-card" onClick={()=>onOpen(it.name)}>
              <div className="day-meta">
                <div className="day-title" style={{fontSize:15}}>{it.name}</div>
                <div className="day-sub">{it.points.length} séance{it.points.length>1?'s':''}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{textAlign:'right'}}>
                  <div style={{fontWeight:800}}>{it.last.y} kg</div>
                  {it.points.length>1 && (
                    <div style={{fontSize:12,fontWeight:700,color: delta>0?'var(--easy)':delta<0?'var(--fail)':'var(--text-dim2)'}}>
                      {delta>0?'+':''}{Math.round(delta*10)/10} kg
                    </div>
                  )}
                </div>
                <div className="chev">›</div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
}
