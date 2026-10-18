import React, { useEffect, useRef, useState } from 'react';
import { MG_LABEL, DIFFS, DIFF_COLOR, lastSessionFor, maxWeightEver, formatSet, fmtSecs, fmtDate, num } from '../lib/format';
import { newSet, exerciseFor, hasAnythingToSave } from '../lib/session';
import ExercisePicker from './ExercisePicker.jsx';
import ConfirmSheet from './ConfirmSheet.jsx';

export default function SessionView({ draft, setDraft, sessions, library, program, saveProgram, onCancel, onFinish, finishing }){
  const [swapIdx, setSwapIdx] = useState(null);
  const [adding, setAdding] = useState(false);
  const [alsoProgram, setAlsoProgram] = useState(false);
  const [timer, setTimer] = useState(null); // {remaining,total}
  const [expanded, setExpanded] = useState({});
  const [noteOpen, setNoteOpen] = useState({});
  const [confirm, setConfirm] = useState(null); // {kind, idx}
  const timerRef = useRef(null);

  // Minuteur de repos
  useEffect(()=>{
    if (timer && timer.remaining > 0){
      timerRef.current = setTimeout(()=> setTimer(t => t ? {...t, remaining: t.remaining-1} : t), 1000);
      return ()=>clearTimeout(timerRef.current);
    }
    if (timer && timer.remaining <= 0) setTimer(null);
  },[timer]);

  // Écran allumé pendant la séance
  useEffect(()=>{
    let lock = null, stopped = false;
    async function acquire(){
      try{
        if (!stopped && navigator.wakeLock && document.visibilityState==='visible'){
          lock = await navigator.wakeLock.request('screen');
        }
      }catch{}
    }
    acquire();
    const onVis = ()=>{ if (document.visibilityState==='visible') acquire(); };
    document.addEventListener('visibilitychange', onVis);
    return ()=>{
      stopped = true;
      document.removeEventListener('visibilitychange', onVis);
      try{ lock && lock.release(); }catch{}
    };
  },[]);

  const exKey = (e, i) => e.key || `i${i}`;

  function patchExercise(idx, patch){
    setDraft(d=>{
      const exercises = d.exercises.slice();
      exercises[idx] = {...exercises[idx], ...patch};
      return {...d, exercises};
    });
  }
  function patchSet(exIdx, setIdx, patch){
    setDraft(d=>{
      const exercises = d.exercises.slice();
      const sets = exercises[exIdx].sets.slice();
      sets[setIdx] = {...sets[setIdx], ...patch};
      exercises[exIdx] = {...exercises[exIdx], sets};
      return {...d, exercises};
    });
  }
  // Toute saisie valide la série (et enlève le gris "pré-rempli")
  function editSet(exIdx, setIdx, field, value){
    patchSet(exIdx, setIdx, { [field]: value, done:true, prefilled:false });
  }
  function toggleDone(exIdx, setIdx, s){
    patchSet(exIdx, setIdx, { done: !s.done, prefilled:false });
    if (!s.done) setTimer({remaining:90,total:90});
  }
  function pickDifficulty(exIdx, setIdx, s, d){
    patchSet(exIdx, setIdx, { difficulty: s.difficulty===d ? null : d, done:true, prefilled:false });
  }
  function addSet(exIdx){
    setDraft(d=>{
      const exercises = d.exercises.slice();
      const sets = exercises[exIdx].sets;
      const prev = sets[sets.length-1];
      exercises[exIdx] = {...exercises[exIdx], sets:[...sets, newSet(prev ? {weight:prev.weight, reps:prev.reps, duration:prev.duration} : undefined)]};
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
  function deleteExercise(idx){
    setDraft(d=>({...d, exercises: d.exercises.filter((_,i)=>i!==idx)}));
  }
  function addExercise(name, muscleGroup){
    const ex = exerciseFor(name, muscleGroup, program, sessions);
    setDraft(d=>({...d, exercises:[...d.exercises, ex]}));
    setAdding(false);
  }

  // Remplacement : séries / reps / historique de l'exercice choisi (pas ceux de l'ancien)
  function applySwap(idx, name, muscleGroup, also){
    const old = draft.exercises[idx];
    if (!old) return;
    const ex = exerciseFor(name, muscleGroup, program, sessions, old);
    setDraft(d=>{
      const exercises = d.exercises.slice();
      exercises[idx] = ex;
      return {...d, exercises};
    });
    if (also && old.refId){
      const nextDays = program.days.map(dd=>{
        if (dd.id !== draft.dayId) return dd;
        return {...dd, exercises: dd.exercises.map(pe=> pe.id===old.refId
          ? {...pe, name:ex.name, muscleGroup:ex.muscleGroup, type:ex.type, targetSets:ex.targetSets, targetReps:ex.targetReps} : pe)};
      });
      saveProgram({...program, days: nextDays});
    }
    setExpanded(x=>({...x,[ex.key]:false}));
  }

  function doSwap(name, muscleGroup){
    const idx = swapIdx, also = alsoProgram;
    const old = draft.exercises[idx];
    setSwapIdx(null); setAlsoProgram(false);
    const hasDone = old && ((old.sets||[]).some(s=>s.done) || old.noteDone);
    if (hasDone) setConfirm({kind:'swap', idx, name, muscleGroup, also});
    else applySwap(idx, name, muscleGroup, also);
  }

  function requestCancel(){
    if (hasAnythingToSave(draft)) setConfirm({kind:'cancel'});
    else onCancel();
  }
  function requestFinish(){
    if (!hasAnythingToSave(draft)) setConfirm({kind:'empty'});
    else onFinish();
  }

  return (
    <>
      <div className="back-row">
        <div className="icon-btn" onClick={requestCancel}>✕</div>
        <div>
          <div className="back-title">{draft.dayTitle}</div>
          <div className="back-sub">En cours · sauvegarde auto</div>
        </div>
      </div>

      {draft.mobility && draft.mobility.length>0 && (
        <div className="mobility-list" style={{marginTop:14}}>
          <div className="mobility-title">Mobilité pré-séance</div>
          {draft.mobility.map((m,i)=>(
            <div className="mob-item" key={m.id||i} style={{cursor:'pointer'}} onClick={()=>toggleMobility(i)}>
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
        const k = exKey(e, exIdx);
        const last = lastSessionFor(sessions, e.name);
        const maxW = maxWeightEver(sessions, e.name);
        const open = !!expanded[k];
        const lastSet = last ? last.sets[last.sets.length-1] : null;
        return (
          <div className="ex-card" key={k}>
            <div className="ex-head">
              <div style={{flex:1}}>
                <div className="mg-tag">{MG_LABEL[e.muscleGroup]||''}</div>
                <div className="ex-name">{e.name}</div>
                <div className="ex-target">{e.type==='note' ? 'À faire' : e.targetReps ? `Objectif : ${e.targetSets} x ${e.targetReps}` : 'Exercice ajouté'}</div>
              </div>
              <div className="head-actions">
                <div className="icon-mini" onClick={()=>setSwapIdx(exIdx)} aria-label="Remplacer">⇄</div>
                <div className="icon-mini" onClick={()=>setConfirm({kind:'delete', idx:exIdx})} aria-label="Supprimer">✕</div>
              </div>
            </div>

            {last && e.type!=='note' && (
              <div className="last-box" onClick={()=>setExpanded(x=>({...x,[k]:!x[k]}))}>
                <div className="last-line">
                  <span>Dernière fois ({fmtDate(last.date)}) : {formatSet(lastSet, e.type)}</span>
                  <span className="last-chev">{open?'▴':'▾'}</span>
                </div>
                {open && (
                  <div className="last-detail">
                    {last.sets.map((st,j)=>(
                      <div className="last-set" key={j}>
                        <span>{e.type==='cardio'?'Round':'Série'} {j+1}</span>
                        <span>{formatSet(st, e.type)}</span>
                        <span style={{color: st.difficulty ? DIFF_COLOR[st.difficulty] : 'var(--text-dim2)'}}>{st.difficulty || '—'}</span>
                      </div>
                    ))}
                    {last.note && <div className="ex-note">📝 {last.note}</div>}
                  </div>
                )}
              </div>
            )}

            {e.type==='note' ? (
              <div className="mob-item" style={{cursor:'pointer'}} onClick={()=>patchExercise(exIdx,{noteDone:!e.noteDone})}>
                <div className={`mob-check ${e.noteDone?'done':''}`}>{e.noteDone?'✓':''}</div>
                <div className="mob-name">Fait</div>
              </div>
            ) : (
              <>
                {e.sets.map((s, setIdx)=>{
                  const w = num(s.weight);
                  const isPr = e.type==='muscu' && s.done && !s.prefilled && w!==null && maxW>0 && w>maxW;
                  const cls = `set-input${s.prefilled?' pre':''}`;
                  return (
                    <div key={setIdx} className={`set-block${s.done?' is-done':''}`}>
                      <div className="set-row">
                        <div className="set-idx">{setIdx+1}</div>
                        {e.type==='cardio' ? (
                          <input className={cls} style={{flex:2}} type="text" placeholder="durée / effort" value={s.duration}
                            onFocus={(ev)=>ev.target.select()} onChange={(ev)=>editSet(exIdx,setIdx,'duration',ev.target.value)} />
                        ) : (
                          <>
                            <div style={{flex:1}}>
                              <input className={cls} type="number" inputMode="decimal" placeholder="kg" value={s.weight}
                                onFocus={(ev)=>ev.target.select()} onChange={(ev)=>editSet(exIdx,setIdx,'weight',ev.target.value)} />
                            </div>
                            <div style={{flex:1}}>
                              <input className={cls} type="number" inputMode="numeric" placeholder="reps" value={s.reps}
                                onFocus={(ev)=>ev.target.select()} onChange={(ev)=>editSet(exIdx,setIdx,'reps',ev.target.value)} />
                            </div>
                          </>
                        )}
                        <div className={`set-check${s.done?' on':''}`} onClick={()=>toggleDone(exIdx,setIdx,s)} aria-label="Valider la série">✓</div>
                        <div className="icon-mini" onClick={()=>removeSet(exIdx,setIdx)} aria-label="Retirer la série">−</div>
                      </div>
                      {isPr && <div className="pr-line"><span className="pr-tag">PR</span></div>}
                      <div className="diff-row" style={{margin:'0 0 12px 28px'}}>
                        {DIFFS.map(d=>{
                          const sel = s.difficulty===d;
                          return (
                            <div key={d} className="diff-chip"
                              style={sel ? {background:DIFF_COLOR[d], color:'#0A0A0B', borderColor:DIFF_COLOR[d]} : {}}
                              onClick={()=>pickDifficulty(exIdx,setIdx,s,d)}>{d}</div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <div className="row" style={{marginTop:4}}>
                  <button className="btn btn-ghost btn-sm" style={{flex:1}} onClick={()=>addSet(exIdx)}>+ Série</button>
                  <button className="btn btn-secondary btn-sm" onClick={()=>setNoteOpen(x=>({...x,[k]:!x[k]}))}>📝 Note</button>
                  <button className="btn btn-secondary btn-sm" onClick={()=>setTimer({remaining:90,total:90})}>⏱ 90s</button>
                </div>
                {(noteOpen[k] || e.note) && (
                  <textarea className="note-input" rows={2} placeholder="Note (sensations, réglage machine…)" value={e.note||''}
                    onChange={(ev)=>patchExercise(exIdx,{note:ev.target.value})} />
                )}
              </>
            )}
          </div>
        );
      })}

      <button className="btn btn-secondary" style={{marginBottom:10}} onClick={()=>setAdding(true)}>+ Ajouter un exercice</button>
      <button className="btn btn-primary" disabled={finishing} onClick={requestFinish}>{finishing ? 'Enregistrement…' : 'Terminer la séance'}</button>

      {timer && (
        <div className="timer-bar">
          ⏱ <span>{fmtSecs(timer.remaining)}</span>
          <button onClick={()=>setTimer(t=>t?{...t,remaining:t.remaining+30}:t)}>+30s</button>
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
      {adding && (
        <ExercisePicker
          title="Ajouter un exercice"
          library={library}
          onPick={(name,mg)=>addExercise(name,mg)}
          onCustom={(name)=>addExercise(name,'autre')}
          onClose={()=>setAdding(false)}
        />
      )}

      {confirm?.kind==='cancel' && (
        <ConfirmSheet title="Abandonner la séance ?" message="Les séries validées ne seront pas enregistrées."
          confirmLabel="Abandonner" onCancel={()=>setConfirm(null)} onConfirm={()=>{ setConfirm(null); onCancel(); }} />
      )}
      {confirm?.kind==='empty' && (
        <ConfirmSheet title="Aucune série validée" message="Valide au moins une série avec ✓ (ou en saisissant des valeurs). Quitter sans enregistrer ?"
          confirmLabel="Quitter" onCancel={()=>setConfirm(null)} onConfirm={()=>{ setConfirm(null); onCancel(); }} />
      )}
      {confirm?.kind==='swap' && (
        <ConfirmSheet title="Remplacer l'exercice ?" message="Les séries déjà validées sur l'exercice actuel seront perdues."
          confirmLabel="Remplacer" onCancel={()=>setConfirm(null)}
          onConfirm={()=>{ const c = confirm; setConfirm(null); applySwap(c.idx, c.name, c.muscleGroup, c.also); }} />
      )}
      {confirm?.kind==='delete' && (
        <ConfirmSheet title="Supprimer l'exercice ?" message={draft.exercises[confirm.idx]?.name}
          confirmLabel="Supprimer" onCancel={()=>setConfirm(null)} onConfirm={()=>{ deleteExercise(confirm.idx); setConfirm(null); }} />
      )}
    </>
  );
}
