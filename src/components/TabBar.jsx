import React from 'react';

export default function TabBar({ view, onHome, onHistory }){
  if (view==='session' || view==='editDay') return null;
  const homeActive = view==='home' || view==='day' || view==='editProgram';
  const histActive = view==='history' || view==='historyDetail';
  return (
    <div className="tabbar">
      <div className="tabbar-inner">
        <div className={`tab ${homeActive?'active':''}`} onClick={onHome}>Programme</div>
        <div className={`tab ${histActive?'active':''}`} onClick={onHistory}>Historique</div>
      </div>
    </div>
  );
}
