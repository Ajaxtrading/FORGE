export const MG_LABEL = {
  pecs:'Pecs', dos:'Dos', epaules:'Épaules', jambes:'Jambes', bras:'Bras',
  abdos:'Abdos/Core', cardio:'Cardio', cou:'Cou', mobilite:'Mobilité', autre:'Autre'
};
export const DIFFS = ['Facile','Modéré','Dur','Échec'];
export const DIFF_COLOR = { 'Facile':'var(--easy)', 'Modéré':'var(--mod)', 'Dur':'var(--hard)', 'Échec':'var(--fail)' };
export const TYPE_LABEL = { muscu:'Muscu', boxe:'Boxe', repos:'Repos' };

export function uid(){ return 'x' + Math.random().toString(36).slice(2,10); }

export function fmtDate(iso){
  const d = new Date(iso);
  const days = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  return `${days[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}`;
}

export function fmtSecs(s){
  if (s < 0) s = 0;
  const m = Math.floor(s/60), sec = s%60;
  return `${m}:${sec<10?'0':''}${sec}`;
}

export function daysAgo(iso){
  return (Date.now() - new Date(iso).getTime()) / 86400000;
}

export function findLastForExercise(sessions, name){
  for (const s of sessions){
    const ex = (s.exercises||[]).find(e => e.name===name && (e.sets||[]).some(st=>st.weight));
    if (ex){
      const st = ex.sets.filter(x=>x.weight).slice(-1)[0];
      if (st) return st;
    }
  }
  return null;
}

export function maxWeightEver(sessions, name){
  let max = 0;
  for (const s of sessions){
    const ex = (s.exercises||[]).find(e => e.name===name);
    if (ex) for (const st of (ex.sets||[])){
      const w = parseFloat(st.weight);
      if (!isNaN(w) && w>max) max=w;
    }
  }
  return max;
}

export function weekVolume(sessions){
  const vol = {};
  for (const s of sessions){
    if (daysAgo(s.date) > 7) continue;
    for (const e of (s.exercises||[])){
      if (e.type !== 'muscu') continue;
      const n = (e.sets||[]).filter(st => st.weight!=='' || st.reps!=='').length;
      if (!n) continue;
      vol[e.muscleGroup] = (vol[e.muscleGroup]||0) + n;
    }
  }
  return vol;
}
