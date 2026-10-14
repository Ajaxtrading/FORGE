import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from './supabaseClient';
import Home from './components/Home.jsx';
import DayView from './components/DayView.jsx';
import SessionView from './components/SessionView.jsx';
import History from './components/History.jsx';
import HistoryDetail from './components/HistoryDetail.jsx';
import ProgressList from './components/ProgressList.jsx';
import ProgressDetail from './components/ProgressDetail.jsx';
import BodyweightDetail from './components/BodyweightDetail.jsx';
import EditProgram from './components/EditProgram.jsx';
import EditDay from './components/EditDay.jsx';
import TabBar from './components/TabBar.jsx';
import Toast from './components/Toast.jsx';
import { buildDraft, cleanForSave, loadDraft, persistDraft, clearDraft, isFreshDraft } from './lib/session';

const mapSession = (r) => ({
  id:r.id, date:r.date, dayId:r.day_id, dayTitle:r.day_title, weekday:r.weekday,
  exercises:r.exercises||[], mobility:r.mobility||[]
});

export default function App(){
  const initialDraft = useRef(loadDraft()).current;
  const resumeNow = isFreshDraft(initialDraft);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [program, setProgram] = useState({days:[]});
  const [library, setLibrary] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [bodyweights, setBodyweights] = useState([]);

  const [view, setView] = useState(resumeNow ? 'session' : 'home');
  const [dayId, setDayId] = useState(null);
  const [editDayId, setEditDayId] = useState(null);
  const [historyId, setHistoryId] = useState(null);
  const [progressName, setProgressName] = useState(null);
  const [sessionDraft, setSessionDraft] = useState(resumeNow ? initialDraft : null);
  const [staleDraft, setStaleDraft] = useState(!resumeNow ? initialDraft : null);
  const [finishing, setFinishing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg)=>{
    setToast(msg);
    setTimeout(()=>setToast(null), 2000);
  },[]);

  const go = useCallback((v, params={})=>{
    setView(v);
    if ('dayId' in params) setDayId(params.dayId);
    if ('editDayId' in params) setEditDayId(params.editDayId);
    if ('historyId' in params) setHistoryId(params.historyId);
    if ('progressName' in params) setProgressName(params.progressName);
    window.scrollTo(0,0);
  },[]);

  // Sauvegarde auto de la séance en cours (survit à un rechargement / fermeture)
  useEffect(()=>{
    if (sessionDraft) persistDraft(sessionDraft);
  },[sessionDraft]);

  useEffect(()=>{
    let cancelled = false;
    async function load(){
      try{
        const [progRes, libRes, sessRes, bwRes] = await Promise.all([
          supabase.from('program').select('*').eq('id','default').maybeSingle(),
          supabase.from('exercise_library').select('*').eq('id','default').maybeSingle(),
          supabase.from('sessions').select('*').order('date',{ascending:false}).limit(500),
          supabase.from('bodyweight').select('*').order('date',{ascending:false}).limit(400),
        ]);
        if (cancelled) return;
        if (progRes.error) throw progRes.error;
        if (sessRes.error) throw sessRes.error;
        setProgram(progRes.data ? {days: progRes.data.days} : {days:[]});
        setLibrary(libRes.data ? (libRes.data.items||[]) : []);
        setSessions((sessRes.data||[]).map(mapSession));
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

  function dropDraft(){
    clearDraft();
    setSessionDraft(null);
    setStaleDraft(null);
  }

  async function finishSession(draft){
    if (finishing) return;
    const { exercises, mobility } = cleanForSave(draft);
    const row = {
      date: new Date().toISOString(), day_id: draft.dayId, day_title: draft.dayTitle, weekday: draft.weekday,
      exercises, mobility
    };
    setFinishing(true);
    try{
      const { data, error } = await supabase.from('sessions').insert(row).select().single();
      if (error) throw error;
      setSessions(s => [mapSession(data), ...s]);
      dropDraft();
      showToast('Séance enregistrée ✅');
      go('home',{});
    }catch(err){
      // la séance reste en brouillon : rien n'est perdu
      showToast('Erreur, séance conservée : ' + (err.message||''));
    }
    setFinishing(false);
  }

  async function updateSession(id, exercises){
    try{
      const { error } = await supabase.from('sessions').update({exercises}).eq('id',id);
      if (error) throw error;
      setSessions(s => s.map(x => x.id===id ? {...x, exercises} : x));
      showToast('Séance modifiée ✅');
    }catch(err){
      showToast('Erreur : ' + (err.message||''));
    }
  }

  async function deleteSession(id){
    try{
      const { error } = await supabase.from('sessions').delete().eq('id',id);
      if (error) throw error;
      setSessions(s => s.filter(x => x.id!==id));
      showToast('Séance supprimée');
      go('history',{});
    }catch(err){
      showToast('Erreur : ' + (err.message||''));
    }
  }

  async function saveBodyweight(weight){
    try{
      const { data, error } = await supabase.from('bodyweight').insert({date:new Date().toISOString(), weight}).select().single();
      if (error) throw error;
      setBodyweights(b => [{id:data.id, date:data.date, weight:data.weight}, ...b]);
      showToast('Pesée enregistrée ✅');
    }catch(err){
      showToast("Erreur : " + (err.message||''));
    }
  }

  async function deleteBodyweight(id){
    try{
      const { error } = await supabase.from('bodyweight').delete().eq('id',id);
      if (error) throw error;
      setBodyweights(b => b.filter(x=>x.id!==id));
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
          staleDraft={staleDraft}
          onResumeDraft={()=>{ setSessionDraft(staleDraft); setStaleDraft(null); go('session',{}); }}
          onDiscardDraft={dropDraft}
          onOpenDay={(id)=>go('day',{dayId:id})} onEditProgram={()=>go('editProgram',{})}
          onSaveBodyweight={saveBodyweight} onOpenBodyweight={()=>go('bodyweight',{})} />
      )}
      {view==='day' && (
        <DayView day={program.days.find(d=>d.id===dayId)} onBack={()=>go('home',{})}
          onStartSession={(day)=>{
            setStaleDraft(null);
            setSessionDraft(buildDraft(day, sessions));
            go('session',{});
          }} />
      )}
      {view==='session' && sessionDraft && (
        <SessionView draft={sessionDraft} setDraft={setSessionDraft} sessions={sessions} library={library}
          program={program} saveProgram={saveProgram} finishing={finishing}
          onCancel={()=>{ dropDraft(); go('home',{}); }}
          onFinish={()=>finishSession(sessionDraft)} />
      )}
      {view==='progress' && (
        <ProgressList sessions={sessions} program={program} bodyweights={bodyweights}
          onOpen={(name)=>go('progressDetail',{progressName:name})} onBodyweight={()=>go('bodyweight',{})} />
      )}
      {view==='progressDetail' && (
        <ProgressDetail name={progressName} sessions={sessions} onBack={()=>go('progress',{})}
          onUpdateSession={updateSession} />
      )}
      {view==='bodyweight' && (
        <BodyweightDetail bodyweights={bodyweights} onBack={()=>go('progress',{})}
          onSave={saveBodyweight} onDelete={deleteBodyweight} />
      )}
      {view==='history' && (
        <History sessions={sessions} onOpenDetail={(id)=>go('historyDetail',{historyId:id})} />
      )}
      {view==='historyDetail' && (
        <HistoryDetail session={sessions.find(s=>s.id===historyId)} onBack={()=>go('history',{})}
          onUpdate={updateSession} onDelete={deleteSession} />
      )}
      {view==='editProgram' && (
        <EditProgram program={program} setProgram={setProgram} onSave={saveProgram}
          onBack={()=>go('home',{})} onOpenDay={(id)=>go('editDay',{editDayId:id})} />
      )}
      {view==='editDay' && (
        <EditDay program={program} setProgram={setProgram} dayId={editDayId} library={library}
          onBack={()=>go('editProgram',{})} onSave={saveProgram} />
      )}
      <TabBar view={view} onHome={()=>go('home',{})} onProgress={()=>go('progress',{})} onHistory={()=>go('history',{})} />
      <Toast message={toast} />
    </>
  );
}
