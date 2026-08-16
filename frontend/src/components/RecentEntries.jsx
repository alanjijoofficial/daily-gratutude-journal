import React, { useState } from 'react';
import { Calendar, Edit3, Trash2, BookOpen } from './Icons';

import ConfirmModal from './ConfirmModal';

export default function RecentEntries({
  entries = [],
  onEditEntry,
  onDeleteEntry,
  onOpenAll,
  onSelectDate,
  todayDateStr,
}) {
  const [entryToDelete, setEntryToDelete] = useState(null);

  // Take top 5 recent entries for the main dashboard view
  const recentList = entries.slice(0, 5);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRelativeBadge = (dateStr) => {
    if (dateStr === todayDateStr) return 'Today';
    const today = new Date(todayDateStr + 'T00:00:00');
    const entryDate = new Date(dateStr + 'T00:00:00');
    const diffDays = Math.round((today - entryDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Yesterday';
    return null;
  };

  const confirmDelete = async () => {
    if (entryToDelete) {
      await onDeleteEntry(entryToDelete.id);
      setEntryToDelete(null);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="recent-entries-header">
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Recent Gratitude</h3>
          <p style={{ fontSize: '0.85rem' }}>Past moments you appreciated</p>
        </div>

        {entries.length > 5 && (
          <button
            type="button"
            className="btn-entry-action"
            onClick={onOpenAll}
            style={{ fontWeight: 600, color: 'var(--primary)' }}
          >
            <BookOpen size={15} />
            <span>View All ({entries.length})</span>
          </button>
        )}
      </div>

      {recentList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🌱</div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 500 }}>Your journal is waiting</h4>
          <p style={{ maxWidth: '300px', fontSize: '0.9rem' }}>
            You haven't written any reflections yet. Pick a day on the calendar or start with today.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: '0.5rem', padding: '0.5rem 1.1rem', fontSize: '0.88rem' }}
            onClick={() => onSelectDate(todayDateStr)}
          >
            Start Today's Reflection
          </button>
        </div>
      ) : (
        <div className="entries-list">
          {recentList.map((entry) => {
            const relBadge = getRelativeBadge(entry.date);
            return (
              <div key={entry.id} className="entry-card">
                <div className="entry-card-top">
                  <div className="entry-date-badge">
                    <Calendar size={14} />
                    <span>{formatDate(entry.date)}</span>
                    {relBadge && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 700,
                        }}
                      >
                        {relBadge}
                      </span>
                    )}
                  </div>

                  <div className="entry-card-actions">
                    <button
                      type="button"
                      className="btn-entry-action"
                      onClick={() => onEditEntry(entry)}
                      title="Edit this reflection"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="btn-entry-action delete"
                      onClick={() => setEntryToDelete(entry)}
                      title="Delete this reflection"
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
            );
          })}

        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(entryToDelete)}
        title="Delete Gratitude Entry?"
        message={`Are you sure you want to delete your reflection for ${formatDate(entryToDelete?.date)}?`}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setEntryToDelete(null)}
      />
    </div>
  );
}
