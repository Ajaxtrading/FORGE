import React, { useEffect, useRef, useState } from 'react';
import { MG_LABEL, DIFFS, DIFF_COLOR, findLastForExercise, maxWeightEver, fmtSecs } from '../lib/format';
import ExercisePicker from './ExercisePicker.jsx';

export default function SessionView({ draft, setDraft, sessions, library, program, saveProgram, onCancel, onFinish }){
  const [swapIdx, setSwapIdx] = useState(null);
  const [alsoProgram, setAlsoProgram] = useState(false);
  const [timer, setTimer] = useState(null); // {remaining, total}
  const intervalRef = useRef(null);

  useEffect(()=>{
    if (timer && timer.remaining > 0){
      intervalRef.current = setTimeout(()=>{
        setTimer(t => t ? {...t, remaining: t.remaining-1} : t);
      }, 1000);
      return ()=>clearTimeout(intervalRef.current);
    }
    if (timer && timer.remaining <= 0){
      setTimer(null);
    }
  },[timer]);

  function updateExercise(idx, patch){
    setDraft(d=>{
      const exercises = d.exercises.slice();
      exercises[idx] = {...exercises[idx], ...patch};
      return {...d, exercises};
    });
  }
  function updateSet(exIdx, setIdx, field, value){
    setDraft(d=>{
      const exercises = d.exercises.slice();
      const sets = exercises[exIdx].sets.slice();
      sets[setIdx] = {...sets[setIdx], [field]: value};
      exercises[exIdx] = {...exercises[exIdx], sets};
      return {...d, exercises};
    });
  }
  function addSet(exIdx){
    setDraft(d=>{
      const exercises = d.exercises.slice();
      exercises[exIdx] = {...exercises[exIdx], sets:[...exercises[exIdx].sets, {weight:'',reps:'',duration:'',difficulty:null}]};
      return {...d, exercises};
    });
  }
  function removeSet(exIdx, setIdx){
    setDraft(d=>{
      const exercises = d.exercises.slice();
      exercises[exIdx] = {...exercises[exIdx], sets: exercises[exIdx].sets.filter((_,i)=>i!==setIdx)};
      return {...d, exercises};
    });
  }
  function toggleMobility(idx){
    setDraft(d=>{
      const mobility = d.mobility.slice();
      mobility[idx] = {...mobility[idx], done: !mobility[idx].done};
      return {...d, mobility};
    });
  }

  function doSwap(name, muscleGroup){
    updateExercise(swapIdx, {name, muscleGroup});
    if (alsoProgram){
      const day = program.days.find(dd=>dd.id===draft.dayId);
      const ex = draft.exercises[swapIdx];
      if (day && ex.refId){
        const nextDays = program.days.map(dd=>{
          if (dd.id !== draft.dayId) return dd;
          return {...dd, exercises: dd.exercises.map(pe=> pe.id===ex.refId ? {...pe, name, muscleGroup} : pe)};
        });
        saveProgram({...program, days: nextDays});
      }
    }
    setSwapIdx(null); setAlsoProgram(false);
  }

  function handleCancel(){
    if (window.confirm('Abandonner cette séance ? Rien ne sera enregistré.')) onCancel();
  }

  return (
    <>
      <div className="back-row">
        <div className="icon-btn" onClick={handleCancel}>✕</div>
        <div>
          <div className="back-title">{draft.dayTitle}</div>
          <div className="back-sub">En cours</div>
        </div>
      </div>

      {draft.mobility && draft.mobility.length>0 && (
        <div className="mobility-list">
          <div className="mobility-title">Mobilité pré-séance</div>
          {draft.mobility.map((m,i)=>(
            <div className="mob-item" key={m.id} style={{cursor:'pointer'}} onClick={()=>toggleMobility(i)}>
              <div className={`mob-check ${m.done?'done':''}`}>{m.done?'✓':''}</div>
              <div>
                <div className="mob-name">{m.name}</div>
                <div className="mob-detail">{m.detail||''}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {draft.exercises.map((e, exIdx)=>{
        const last = findLastForExercise(sessions, e.name);
        const maxW = maxWeightEver(sessions, e.name);
        return (
          <div className="ex-card" key={exIdx}>
            <div className="ex-head">
              <div style={{flex:1}}>
                <div className="mg-tag">{MG_LABEL[e.muscleGroup]||''}</div>
                <div className="ex-name">{e.name}</div>
                <div className="ex-target">{e.type==='note' ? 'À faire' : `Objectif : ${e.targetSets} x ${e.targetReps}`}</div>
                {last && <div className="ex-last">Dernière fois : {last.weight}kg × {last.reps}</div>}
              </div>
              <div className="icon-mini" onClick={()=>setSwapIdx(exIdx)}>⇄</div>
            </div>

            {e.type==='note' ? (
              <div className="mob-item" style={{cursor:'pointer'}} onClick={()=>updateExercise(exIdx,{noteDone:!e.noteDone})}>
                <div className={`mob-check ${e.noteDone?'done':''}`}>{e.noteDone?'✓':''}</div>
                <div className="mob-name">Fait</div>
              </div>
            ) : (
              <>
                {e.sets.map((s, setIdx)=>{
                  const isPr = e.type==='muscu' && s.weight && parseFloat(s.weight)>=maxW && maxW>0;
                  return (
                    <div key={setIdx}>
                      {e.type==='cardio' ? (
                        <div className="set-row">
                          <div className="set-idx">{setIdx+1}</div>
                          <input className="set-input" style={{flex:2}} type="text" placeholder="durée / effort"
                            value={s.duration} onChange={(ev)=>updateSet(exIdx,setIdx,'duration',ev.target.value)} />
                          <div className="icon-mini" onClick={()=>removeSet(exIdx,setIdx)}>−</div>
                        </div>
                      ) : (
                        <div className="set-row">
                          <div className="set-idx">{setIdx+1}{isPr && <span className="pr-tag">PR</span>}</div>
                          <div style={{flex:1}}>
                            <input className="set-input" type="number" inputMode="decimal" placeholder="kg"
                              value={s.weight} onChange={(ev)=>updateSet(exIdx,setIdx,'weight',ev.target.value)} />
                          </div>
                          <div style={{flex:1}}>
                            <input className="set-input" type="number" inputMode="numeric" placeholder="reps"
                              value={s.reps} onChange={(ev)=>updateSet(exIdx,setIdx,'reps',ev.target.value)} />
                          </div>
                          <div className="icon-mini" onClick={()=>removeSet(exIdx,setIdx)}>−</div>
                        </div>
                      )}
                      <div className="diff-row" style={{margin:'0 0 10px 28px'}}>
                        {DIFFS.map(d=>{
                          const sel = s.difficulty===d;
                          return (
                            <div key={d} className="diff-chip"
                              style={sel ? {background:DIFF_COLOR[d], color:'#0A0A0B', borderColor:DIFF_COLOR[d]} : {}}
                              onClick={()=>updateSet(exIdx,setIdx,'difficulty',d)}>{d}</div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <button className="btn btn-ghost btn-sm" onClick={()=>addSet(exIdx)}>+ Ajouter une série</button>
                <div style={{marginTop:8}}>
                  <button className="btn btn-secondary btn-sm" onClick={()=>setTimer({remaining:90,total:90})}>⏱ Repos 90s</button>
                </div>
              </>
            )}
          </div>
        );
      })}

      <button className="btn btn-primary" style={{marginTop:4}} onClick={onFinish}>Terminer la séance</button>

      {timer && (
        <div className="timer-bar">
          ⏱ <span>{fmtSecs(timer.remaining)}</span>
          <button onClick={()=>setTimer(null)}>Stop</button>
        </div>
      )}

      {swapIdx!==null && (
        <ExercisePicker
          title="Remplacer l'exercice"
          library={library}
          onPick={(name,mg)=>doSwap(name,mg)}
          onCustom={(name)=>doSwap(name,'autre')}
          onClose={()=>{ setSwapIdx(null); setAlsoProgram(false); }}
          toggle={{ label: 'Aussi dans le programme', value: alsoProgram, onChange: setAlsoProgram }}
        />
      )}
    </>
  );
}
