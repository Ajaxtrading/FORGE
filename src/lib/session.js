import { uid, lastSessionFor, num, sameName } from './format';

export const DRAFT_KEY = 'forge_session_draft_v1';
const FRESH_MS = 6 * 3600 * 1000;

export function newSet(prefill){
  return {
    weight: prefill?.weight ?? '', reps: prefill?.reps ?? '', duration: prefill?.duration ?? '',
    difficulty: null, done:false, prefilled: !!prefill
  };
}

export function buildExerciseDraft(e, sessions){
  const type = e.type || 'muscu';
  const base = {
    key: uid(), refId: e.refId || e.id || null, name:e.name, muscleGroup:e.muscleGroup, type,
    targetSets: e.targetSets, targetReps: e.targetReps, sets:[], noteDone:false, note:''
  };
  if (type==='note') return base;
  const last = lastSessionFor(sessions, e.name);
  const count = Math.max(1, parseInt(e.targetSets,10) || 1);
  base.sets = Array.from({length:count}).map((_,i)=>{
    if (!last || !last.sets.length) return newSet();
    const src = last.sets[i] || last.sets[last.sets.length-1];
    return newSet({ weight:src.weight, reps:src.reps, duration:src.duration });
  });
  return base;
}

/** Type / séries / reps d'un exercice : programme d'abord, puis dernière séance, sinon défaut. */
export function exerciseDefaults(name, muscleGroup, program, sessions){
  for (const d of (program?.days||[])){
    for (const e of (d.exercises||[])){
      if (sameName(e.name, name)) return { name:e.name, type:e.type||'muscu', muscleGroup:e.muscleGroup||muscleGroup, targetSets:e.targetSets, targetReps:e.targetReps||'' };
    }
  }
  for (const s of sessions){
    for (const e of (s.exercises||[])){
      if (sameName(e.name, name)){
        return { name:e.name, type:e.type||'muscu', muscleGroup:e.muscleGroup||muscleGroup,
          targetSets: e.targetSets || (e.sets||[]).length || 3, targetReps:e.targetReps||'' };
      }
    }
  }
  const type = muscleGroup==='cardio' ? 'cardio' : (muscleGroup==='mobilite' || muscleGroup==='cou') ? 'note' : 'muscu';
  return { name, type, muscleGroup, targetSets: type==='muscu' ? 3 : 1, targetReps:'' };
}

/** Nouvel exercice complet (séries, reps, historique) pour un ajout ou un remplacement. */
export function exerciseFor(name, muscleGroup, program, sessions, keep){
  const d = exerciseDefaults(name, muscleGroup, program, sessions);
  const ex = buildExerciseDraft({ ...d, refId: keep?.refId || null }, sessions);
  if (keep){ ex.key = keep.key || ex.key; ex.note = keep.note || ''; }
  return ex;
}

export function buildDraft(day, sessions){
  return {
    dayId:day.id, dayTitle:day.title, weekday:day.weekday, startedAt:Date.now(),
    exercises:(day.exercises||[]).map(e=>buildExerciseDraft({...e, refId:e.id}, sessions)),
    mobility:(day.mobility||[]).map(m=>({...m, done:false}))
  };
}

const filled = (v) => v!=='' && v!=null;

/** Ne garde que les séries faites ; supprime les exercices vides. */
export function cleanForSave(draft){
  const exercises = [];
  for (const e of draft.exercises){
    if (e.type==='note'){
      if (e.noteDone || (e.note||'').trim()) exercises.push({ name:e.name, muscleGroup:e.muscleGroup, type:e.type, targetSets:e.targetSets, targetReps:e.targetReps, sets:[], noteDone:!!e.noteDone, note:(e.note||'').trim() });
      continue;
    }
    const sets = (e.sets||[]).filter(s=>{
      if (!s.done) return false;
      if (e.type==='cardio') return true;
      return filled(s.weight) || filled(s.reps) || !!s.difficulty;
    }).map(s=>({ weight:s.weight, reps:s.reps, duration:s.duration, difficulty:s.difficulty }));
    const note = (e.note||'').trim();
    if (!sets.length && !note) continue;
    exercises.push({ name:e.name, muscleGroup:e.muscleGroup, type:e.type, targetSets:e.targetSets, targetReps:e.targetReps, sets, noteDone:false, note });
  }
  return { exercises, mobility: draft.mobility||[] };
}

export function hasAnythingToSave(draft){
  const { exercises } = cleanForSave(draft);
  return exercises.length>0 || (draft.mobility||[]).some(m=>m.done);
}

export function loadDraft(){
  try{
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d && Array.isArray(d.exercises) ? d : null;
  }catch{ return null; }
}
export function persistDraft(draft){
  try{ localStorage.setItem(DRAFT_KEY, JSON.stringify({...draft, savedAt:Date.now()})); }catch{}
}
export function clearDraft(){
  try{ localStorage.removeItem(DRAFT_KEY); }catch{}
}
export function isFreshDraft(d){
  return !!d && Date.now() - (d.savedAt||0) < FRESH_MS;
}
export { num };
