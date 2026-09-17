import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import Home from './components/Home.jsx';
import DayView from './components/DayView.jsx';
import SessionView from './components/SessionView.jsx';
import History from './components/History.jsx';
import HistoryDetail from './components/HistoryDetail.jsx';
import EditProgram from './components/EditProgram.jsx';
import EditDay from './components/EditDay.jsx';
import TabBar from './components/TabBar.jsx';
import Toast from './components/Toast.jsx';

export default function App(){
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [program, setProgram] = useState({days:[]});
  const [library, setLibrary] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [bodyweights, setBodyweights] = useState([]);

  const [view, setView] = useState('home');
  const [dayId, setDayId] = useState(null);
  const [editDayId, setEditDayId] = useState(null);
  const [historyId, setHistoryId] = useState(null);
  const [sessionDraft, setSessionDraft] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg)=>{
    setToast(msg);
    setTimeout(()=>setToast(null), 1800);
  },[]);

  const go = useCallback((v, params={})=>{
    setView(v);
    if ('dayId' in params) setDayId(params.dayId);
    if ('editDayId' in params) setEditDayId(params.editDayId);
    if ('historyId' in params) setHistoryId(params.historyId);
    window.scrollTo(0,0);
  },[]);

  useEffect(()=>{
    let cancelled = false;
    async function load(){
      try{
        const [progRes, libRes, sessRes, bwRes] = await Promise.all([
          supabase.from('program').select('*').eq('id','default').maybeSingle(),
          supabase.from('exercise_library').select('*').eq('id','default').maybeSingle(),
          supabase.from('sessions').select('*').order('date',{ascending:false}).limit(60),
          supabase.from('bodyweight').select('*').order('date',{ascending:false}).limit(10),
        ]);
        if (cancelled) return;
        if (progRes.error) throw progRes.error;
        if (sessRes.error) throw sessRes.error;
        setProgram(progRes.data ? {days: progRes.data.days} : {days:[]});
        setLibrary(libRes.data ? (libRes.data.items||[]) : []);
        setSessions((sessRes.data||[]).map(r=>({
          id:r.id, date:r.date, dayId:r.day_id, dayTitle:r.day_title, weekday:r.weekday,
          exercises:r.exercises||[], mobility:r.mobility||[]
        })));
        setBodyweights((bwRes.data||[]).map(r=>({id:r.id, date:r.date, weight:r.weight})));
        setLoading(false);
      }catch(err){
        if (cancelled) return;
        setErrorMsg(err.message || 'Erreur de chargement inconnue.');
        setLoading(false);
      }
    }
    load();
    return ()=>{ cancelled = true; };
  },[]);

  async function saveProgram(next){
    setProgram(next);
    try{
      const { error } = await supabase.from('program').update({days: next.days, updated_at: new Date().toISOString()}).eq('id','default');
      if (error) throw error;
      showToast('Programme enregistré ✅');
    }catch(err){
      showToast("Erreur d'enregistrement : " + (err.message||''));
    }
  }

  async function finishSession(draft){
    const cleanEx = draft.exercises.map(e=>({
      name:e.name, muscleGroup:e.muscleGroup, type:e.type, targetSets:e.targetSets, targetReps:e.targetReps,
      sets:(e.sets||[]).filter(s=> s.weight!=='' || s.reps!=='' || s.duration!=='' || s.difficulty),
      noteDone:e.noteDone
    }));
    const row = {
      date: new Date().toISOString(), day_id: draft.dayId, day_title: draft.dayTitle, weekday: draft.weekday,
      exercises: cleanEx, mobility: draft.mobility
    };
    try{
      const { data, error } = await supabase.from('sessions').insert(row).select().single();
      if (error) throw error;
      setSessions(s => [{
        id:data.id, date:data.date, dayId:data.day_id, dayTitle:data.day_title, weekday:data.weekday,
        exercises:data.exercises, mobility:data.mobility
      }, ...s]);
      showToast('Séance enregistrée ✅');
    }catch(err){
      showToast('Erreur d\u2019enregistrement : ' + (err.message||''));
    }
    setSessionDraft(null);
    go('home',{});
  }

  async function saveBodyweight(weight){
    try{
      const { data, error } = await supabase.from('bodyweight').insert({date:new Date().toISOString(), weight}).select().single();
      if (error) throw error;
      setBodyweights(b => [{id:data.id, date:data.date, weight:data.weight}, ...b]);
    }catch(err){
      showToast("Erreur : " + (err.message||''));
    }
  }

  if (loading){
    return <div className="loading">Chargement…</div>;
  }
  if (errorMsg){
    return (
      <div className="loading">
        <div>Impossible de charger tes données : {errorMsg}</div>
        <button className="btn btn-secondary btn-sm" style={{width:'auto'}} onClick={()=>window.location.reload()}>Recharger</button>
      </div>
    );
  }

  return (
    <>
      {view==='home' && (
        <Home program={program} sessions={sessions} bodyweights={bodyweights}
          onOpenDay={(id)=>go('day',{dayId:id})} onEditProgram={()=>go('editProgram',{})}
          onSaveBodyweight={saveBodyweight} />
      )}
      {view==='day' && (
        <DayView day={program.days.find(d=>d.id===dayId)} onBack={()=>go('home',{})}
          onStartSession={(day)=>{
            const exercises=(day.exercises||[]).map(e=>({
              refId:e.id, name:e.name, muscleGroup:e.muscleGroup, type:e.type,
              targetSets:e.targetSets, targetReps:e.targetReps,
              sets: e.type==='note' ? [] : Array.from({length:e.targetSets||1}).map(()=>({weight:'',reps:'',duration:'',difficulty:null})),
              noteDone:false
            }));
            const mobility=(day.mobility||[]).map(m=>({...m,done:false}));
            setSessionDraft({dayId:day.id, dayTitle:day.title, weekday:day.weekday, exercises, mobility});
            go('session',{});
          }} />
      )}
      {view==='session' && sessionDraft && (
        <SessionView draft={sessionDraft} setDraft={setSessionDraft} sessions={sessions} library={library}
          program={program} saveProgram={saveProgram}
          onCancel={()=>{ setSessionDraft(null); go('home',{}); }}
          onFinish={()=>finishSession(sessionDraft)} />
      )}
      {view==='history' && (
        <History sessions={sessions} onOpenDetail={(id)=>go('historyDetail',{historyId:id})} />
      )}
      {view==='historyDetail' && (
        <HistoryDetail session={sessions.find(s=>s.id===historyId)} onBack={()=>go('history',{})} />
      )}
      {view==='editProgram' && (
        <EditProgram program={program} setProgram={setProgram} onSave={saveProgram}
          onBack={()=>go('home',{})} onOpenDay={(id)=>go('editDay',{editDayId:id})} />
      )}
      {view==='editDay' && (
        <EditDay program={program} setProgram={setProgram} dayId={editDayId} library={library}
          onBack={()=>go('editProgram',{})} onSave={saveProgram} />
      )}
      <TabBar view={view} onHome={()=>go('home',{})} onHistory={()=>go('history',{})} />
      <Toast message={toast} />
    </>
  );
}
