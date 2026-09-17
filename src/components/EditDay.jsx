import React, { useState } from 'react';
import { MG_LABEL, uid } from '../lib/format';
import ExercisePicker from './ExercisePicker.jsx';

export default function EditDay({ program, setProgram, dayId, library, onBack, onSave }){
  const [showAdd, setShowAdd] = useState(false);
  const dayIdx = program.days.findIndex(d=>d.id===dayId);
  const day = program.days[dayIdx];
  if (!day) return <div className="empty">Introuvable</div>;

  function updateEx(exIdx, field, val){
    setProgram(p=>{
      const days = p.days.slice();
      const exercises = days[dayIdx].exercises.slice();
      exercises[exIdx] = {...exercises[exIdx], [field]: val};
      days[dayIdx] = {...days[dayIdx], exercises};
      return {...p, days};
    });
  }
  function removeEx(exIdx){
    setProgram(p=>{
      const days = p.days.slice();
      days[dayIdx] = {...days[dayIdx], exercises: days[dayIdx].exercises.filter((_,i)=>i!==exIdx)};
      return {...p, days};
    });
  }
  function moveEx(exIdx, dir){
    setProgram(p=>{
      const days = p.days.slice();
      const exercises = days[dayIdx].exercises.slice();
      const j = exIdx + dir;
      if (j<0 || j>=exercises.length) return p;
      [exercises[exIdx], exercises[j]] = [exercises[j], exercises[exIdx]];
      days[dayIdx] = {...days[dayIdx], exercises};
      return {...p, days};
    });
  }
  function addEx(name, mg){
    setProgram(p=>{
      const days = p.days.slice();
      const type = mg==='cardio' ? 'cardio' : (mg==='cou' ? 'note' : 'muscu');
      days[dayIdx] = {...days[dayIdx], exercises: [...days[dayIdx].exercises, {id:uid(), name, muscleGroup:mg, type, targetSets:3, targetReps:'10'}]};
      return {...p, days};
    });
    setShowAdd(false);
  }

  return (
    <>
      <div className="back-row">
        <div className="icon-btn" onClick={onBack}>←</div>
        <div>
          <div className="back-title">{day.title}</div>
          <div className="back-sub">{day.weekday}</div>
        </div>
      </div>

      {(day.exercises||[]).map((e,exIdx)=>(
        <div className="edit-ex-row" key={e.id}>
          <div className="edit-ex-top">
            <input className="text-input" style={{fontWeight:700}} value={e.name}
              onChange={(ev)=>updateEx(exIdx,'name',ev.target.value)} />
          </div>
          <div className="mini-grid">
            <select className="select-input" value={e.muscleGroup} onChange={(ev)=>updateEx(exIdx,'muscleGroup',ev.target.value)}>
              {Object.keys(MG_LABEL).map(mg=><option value={mg} key={mg}>{MG_LABEL[mg]}</option>)}
            </select>
            <select className="select-input" value={e.type} onChange={(ev)=>updateEx(exIdx,'type',ev.target.value)}>
              <option value="muscu">Muscu (poids)</option>
              <option value="cardio">Cardio (temps)</option>
              <option value="note">Note (case à cocher)</option>
            </select>
          </div>
          <div className="mini-grid">
            <input className="text-input" type="number" placeholder="Séries" value={e.targetSets||''}
              onChange={(ev)=>updateEx(exIdx,'targetSets', parseInt(ev.target.value)||0)} />
            <input className="text-input" placeholder="Reps (ex: 8-10)" value={e.targetReps||''}
              onChange={(ev)=>updateEx(exIdx,'targetReps', ev.target.value)} />
          </div>
          <div className="row" style={{marginTop:10}}>
            <button className="btn btn-secondary btn-sm" onClick={()=>moveEx(exIdx,-1)}>↑</button>
            <button className="btn btn-secondary btn-sm" onClick={()=>moveEx(exIdx,1)}>↓</button>
            <button className="btn btn-danger btn-sm" style={{flex:1}} onClick={()=>removeEx(exIdx)}>Supprimer</button>
          </div>
        </div>
      ))}

      <button className="btn btn-ghost" onClick={()=>setShowAdd(true)}>+ Ajouter un exercice</button>
      <div style={{height:10}} />
      <button className="btn btn-primary" onClick={()=>onSave(program)}>Enregistrer</button>

      {showAdd && (
        <ExercisePicker
          title="Ajouter un exercice"
          library={library}
          onPick={(name,mg)=>addEx(name,mg)}
          onCustom={(name)=>addEx(name,'autre')}
          onClose={()=>setShowAdd(false)}
        />
      )}
    </>
  );
}
