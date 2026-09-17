import React, { useState } from 'react';
import { MG_LABEL } from '../lib/format';

export default function ExercisePicker({ title, library, onPick, onCustom, onClose, toggle }){
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const results = library.filter(l => l.name.toLowerCase().includes(q)).slice(0,30);

  return (
    <div className="overlay" onClick={(e)=>{ if (e.target===e.currentTarget) onClose(); }}>
      <div className="sheet">
        <div className="sheet-title">
          {title}
          <span className="icon-btn" onClick={onClose}>✕</span>
        </div>
        <input className="search-input" placeholder="Rechercher ou taper un nom personnalisé…"
          value={query} onChange={(e)=>setQuery(e.target.value)} autoFocus />
        {toggle && (
          <div className="toggle-row">
            <div>{toggle.label}</div>
            <div className={`switch ${toggle.value?'on':''}`} onClick={()=>toggle.onChange(!toggle.value)}>
              <div className="switch-dot"/>
            </div>
          </div>
        )}
        <div>
          {results.map((l,i)=>(
            <div className="pick-item" key={i} onClick={()=>onPick(l.name, l.muscleGroup)}>
              <div className="pick-name">{l.name}</div>
              <div className="pick-mg">{MG_LABEL[l.muscleGroup]||''}</div>
            </div>
          ))}
        </div>
        {query.trim() && (
          <button className="btn btn-secondary" style={{marginTop:10}} onClick={()=>onCustom(query.trim())}>
            Utiliser "{query.trim()}"
          </button>
        )}
      </div>
    </div>
  );
}
