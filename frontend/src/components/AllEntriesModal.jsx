import React, { useState } from 'react';
import { X, Search, Calendar, Edit3, Trash2, BookOpen } from './Icons';

import ConfirmModal from './ConfirmModal';

export default function AllEntriesModal({
  isOpen,
  entries = [],
  onClose,
  onEditEntry,
  onDeleteEntry,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [entryToDelete, setEntryToDelete] = useState(null);

  if (!isOpen) return null;

  const filteredEntries = entries.filter((entry) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (entry.title && entry.title.toLowerCase().includes(term)) ||
      (entry.content && entry.content.toLowerCase().includes(term)) ||
      (entry.date && entry.date.includes(term))
    );
  });


  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleConfirmDelete = async () => {
    if (entryToDelete) {
      await onDeleteEntry(entryToDelete.id);
      setEntryToDelete(null);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-dialog"
          style={{ maxWidth: '720px' }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-header">
            <div>
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={22} color="var(--primary)" />
                <span>All Gratitude Reflections</span>
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                {entries.length} total {entries.length === 1 ? 'entry' : 'entries'} in your private journal
              </p>
            </div>
            <button onClick={onClose} className="btn-icon" aria-label="Close all entries view">
              <X size={18} />
            </button>
          </div>

          <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-subtle)',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search past memories and gratitudes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '55vh', overflowY: 'auto' }}>
            {filteredEntries.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p>No reflections found matching "{searchTerm}".</p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div key={entry.id} className="entry-card">
                  <div className="entry-card-top">
                    <div className="entry-date-badge">
                      <Calendar size={14} />
                      <span>{formatDate(entry.date)}</span>
                    </div>

                    <div className="entry-card-actions">
                      <button
                        type="button"
                        className="btn-entry-action"
                        onClick={() => {
                          onClose();
                          onEditEntry(entry);
                        }}
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className="btn-entry-action delete"
                        onClick={() => setEntryToDelete(entry)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="entry-card-content">
                    {entry.title && (
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.05rem', fontFamily: 'var(--font-serif)', marginBottom: '0.3rem' }}>
                        {entry.title}
                      </div>
                    )}
                    <p style={{ color: 'var(--text-main)', margin: 0 }}>{entry.content}</p>
                  </div>
                </div>
              ))

            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(entryToDelete)}
        title="Delete Gratitude Entry?"
        message={`Are you sure you want to delete your reflection for ${formatDate(entryToDelete?.date)}?`}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setEntryToDelete(null)}
      />
    </>
  );
}
