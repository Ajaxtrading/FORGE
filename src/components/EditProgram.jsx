import React from 'react';

export default function EditProgram({ program, setProgram, onSave, onBack, onOpenDay }){
  function renameDay(dayIdx, val){
    setProgram(p=>{
      const days = p.days.slice();
      days[dayIdx] = {...days[dayIdx], title: val};
      return {...p, days};
    });
  }

  return (
    <>
      <div className="back-row">
        <div className="icon-btn" onClick={onBack}>←</div>
        <div>
          <div className="back-title">Modifier le programme</div>
          <div className="back-sub">Titres, exercices, séries</div>
        </div>
      </div>
      {program.days.map((d,i)=>(
        <div className="card" style={{cursor:'default'}} key={d.id}>
          <div className="field-label" style={{marginTop:0}}>{d.weekday}</div>
          <input className="text-input" value={d.title} onChange={(e)=>renameDay(i,e.target.value)} />
          <div style={{marginTop:10}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>onOpenDay(d.id)}>
              Modifier les exercices ({(d.exercises||[]).length})
            </button>
          </div>
        </div>
      ))}
      <button className="btn btn-primary" onClick={()=>onSave(program)}>Enregistrer</button>
    </>
  );
}
