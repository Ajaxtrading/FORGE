import React from 'react';

export default function ConfirmSheet({ title, message, confirmLabel = 'Confirmer', danger = true, onConfirm, onCancel }){
  return (
    <div className="overlay" onClick={(e)=>{ if (e.target===e.currentTarget) onCancel(); }}>
      <div className="sheet">
        <div className="sheet-title">{title}</div>
        {message && <div className="confirm-msg">{message}</div>}
        <div className="row" style={{marginTop:6}}>
          <button className="btn btn-secondary" onClick={onCancel}>Annuler</button>
          <button className={`btn ${danger?'btn-danger':'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
