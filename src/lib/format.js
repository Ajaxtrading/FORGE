export const MG_LABEL = {
  pecs:'Pecs', dos:'Dos', epaules:'Épaules', jambes:'Jambes', bras:'Bras',
  abdos:'Abdos/Core', cardio:'Cardio', cou:'Cou', mobilite:'Mobilité', autre:'Autre'
};
export const MG_ORDER = ['pecs','dos','epaules','bras','jambes','abdos','cou','cardio','mobilite','autre'];
export const DIFFS = ['Facile','Modéré','Dur','Échec'];
export const DIFF_COLOR = { 'Facile':'var(--easy)', 'Modéré':'var(--mod)', 'Dur':'var(--hard)', 'Échec':'var(--fail)' };
export const TYPE_LABEL = { muscu:'Muscu', boxe:'Boxe', repos:'Repos' };

export function uid(){ return 'x' + Math.random().toString(36).slice(2,10); }

const DAYS = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];

export function fmtDate(iso){
  const d = new Date(iso);
  return `${DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}`;
}
export function fmtDateShort(iso){
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth()+1}`;
}

export function fmtSecs(s){
  if (s < 0) s = 0;
  const m = Math.floor(s/60), sec = s%60;
  return `${m}:${sec<10?'0':''}${sec}`;
}

export function daysAgo(iso){
  return (Date.now() - new Date(iso).getTime()) / 86400000;
}

export function normName(n){
  return String(n||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
}
export function sameName(a,b){ return normName(a)===normName(b); }

export function num(v){
  const n = parseFloat(String(v ?? '').replace(',','.'));
  return isNaN(n) ? null : n;
}

/** Lundi 00:00 (heure locale) de la semaine contenant `now`. */
export function startOfWeek(now = new Date()){
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

const hasData = (st) => (st.weight!=='' && st.weight!=null) || (st.reps!=='' && st.reps!=null);

/** Séries muscu faites depuis lundi 00:00, par groupe musculaire. */
export function weekVolume(sessions, now = new Date()){
  const start = startOfWeek(now).getTime();
  const vol = {};
  for (const s of sessions){
    if (new Date(s.date).getTime() < start) continue;
    for (const e of (s.exercises||[])){
      if (e.type !== 'muscu') continue;
      const n = (e.sets||[]).filter(hasData).length;
      if (!n) continue;
      vol[e.muscleGroup] = (vol[e.muscleGroup]||0) + n;
    }
  }
  return vol;
}

/** Séries muscu prévues par semaine dans le programme, par groupe musculaire. */
export function plannedVolume(program){
  const vol = {};
  for (const d of (program?.days||[])){
    for (const e of (d.exercises||[])){
      if (e.type !== 'muscu') continue;
      vol[e.muscleGroup] = (vol[e.muscleGroup]||0) + (parseInt(e.targetSets,10)||0);
    }
  }
  return vol;
}

/** Dernière séance contenant des données pour cet exercice. */
export function lastSessionFor(sessions, name){
  for (const s of sessions){
    const ex = (s.exercises||[]).find(e => sameName(e.name,name) &&
      (e.sets||[]).some(st => hasData(st) || (st.duration!=='' && st.duration!=null)));
    if (ex) return { date:s.date, sets:ex.sets, note:ex.note||'', type:ex.type };
  }
  return null;
}

export function maxWeightEver(sessions, name){
  let max = 0;
  for (const s of sessions){
    for (const e of (s.exercises||[])){
      if (!sameName(e.name,name)) continue;
      for (const st of (e.sets||[])){
        const w = num(st.weight);
        if (w!==null && w>max) max=w;
      }
    }
  }
  return max;
}

export function formatSet(st, type){
  if (type==='cardio') return st.duration || '—';
  const w = st.weight!=='' && st.weight!=null ? `${st.weight}kg` : '—';
  const r = st.reps!=='' && st.reps!=null ? st.reps : '—';
  return `${w} × ${r}`;
}

/** Série la plus lourde par séance, ordre chronologique. */
export function exerciseHistory(sessions, name){
  const pts = [];
  for (const s of sessions){
    let best = null;
    for (const e of (s.exercises||[])){
      if (!sameName(e.name,name) || e.type==='cardio' || e.type==='note') continue;
      for (const st of (e.sets||[])){
        const w = num(st.weight);
        if (w===null) continue;
        const r = num(st.reps) || 0;
        if (!best || w>best.y || (w===best.y && r>best.reps)) best = { x:new Date(s.date).getTime(), y:w, reps:r, date:s.date };
      }
    }
    if (best) pts.push(best);
  }
  return pts.sort((a,b)=>a.x-b.x);
}

/** Exercices muscu du programme ou de l'historique, avec leur progression. */
export function muscuExerciseList(sessions, program){
  const meta = new Map(); // clé normalisée -> {name, mg}
  const add = (e) => {
    if (e.type!=='muscu') return;
    const k = normName(e.name);
    if (!meta.has(k)) meta.set(k, { name:e.name, mg:e.muscleGroup });
  };
  for (const d of (program?.days||[])) for (const e of (d.exercises||[])) add(e);
  for (const s of sessions) for (const e of (s.exercises||[])) add(e);
  const out = [];
  for (const { name, mg } of meta.values()){
    const pts = exerciseHistory(sessions, name);
    if (!pts.length) continue;
    out.push({ name, muscleGroup:mg, points:pts, last:pts[pts.length-1], first:pts[0] });
  }
  out.sort((a,b)=>{
    const ia = MG_ORDER.indexOf(a.muscleGroup), ib = MG_ORDER.indexOf(b.muscleGroup);
    return (ia<0?99:ia)-(ib<0?99:ib) || a.name.localeCompare(b.name,'fr');
  });
  return out;
}

export function movingAverage(points, n = 7){
  return points.map((p,i)=>{
    const slice = points.slice(Math.max(0,i-n+1), i+1);
    return { x:p.x, y: slice.reduce((a,q)=>a+q.y,0)/slice.length };
  });
}
