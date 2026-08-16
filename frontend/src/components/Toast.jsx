import React from 'react';
import { CheckCircle2, AlertCircle, X } from './Icons';


export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  return (
    <div className="toast-container">
      <div className={`toast ${type}`}>
        {type === 'success' ? (
          <CheckCircle2 size={18} />
        ) : (
          <AlertCircle size={18} />
        )}
        <span style={{ flex: 1 }}>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close notification"
            style={{ color: 'inherit', display: 'flex', opacity: 0.8 }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
