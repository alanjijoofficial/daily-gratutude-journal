import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, Sparkles, AlertCircle } from './Icons';

import ConfirmModal from './ConfirmModal';

const MAX_CHAR_COUNT = 1000;

export default function JournalEditor({
  isOpen,
  dateStr,
  existingEntry,
  onSave,
  onDelete,
  onClose,
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync content and title when opened or when selected entry changes
  useEffect(() => {
    if (isOpen) {
      setTitle(existingEntry?.title || '');
      setContent(existingEntry?.content || '');
      setErrorMessage('');
      setShowDeleteConfirm(false);
    }
  }, [isOpen, existingEntry, dateStr]);


  // Handle ESC key to close modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !showDeleteConfirm) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showDeleteConfirm, onClose]);

  if (!isOpen) return null;

  // Format date display: e.g. "August 14, 2026"
  const formattedDate = dateStr
    ? new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHAR_COUNT;
  const isEmpty = content.trim().length === 0;
  const isEditing = Boolean(existingEntry?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEmpty) {
      setErrorMessage('Please write at least a few words about what you are grateful for.');
      return;
    }
    if (isOverLimit) {
      setErrorMessage(`Please shorten your reflection to ${MAX_CHAR_COUNT} characters or fewer.`);
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      await onSave({
        id: existingEntry?.id,
        title: title.trim(),
        date: dateStr,
        content: content.trim(),
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save journal entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    setShowDeleteConfirm(false);
    try {
      await onDelete(existingEntry.id);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete entry.');
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-dialog"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="editor-title"
        >
          <div className="modal-header">
            <div>
              <span className="modal-date-tag">{formattedDate}</span>
              <h2 id="editor-title" className="modal-title" style={{ marginTop: '0.2rem' }}>
                What are you grateful for today?
              </h2>
            </div>
            <button
              type="button"
              className="btn-icon"
              onClick={onClose}
              aria-label="Close journal editor"
            >
              <X size={18} />
            </button>
          </div>

          {errorMessage && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="journal-title">
                Title <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>(Optional theme for today)</span>
              </label>
              <input
                id="journal-title"
                type="text"
                className="form-input"
                placeholder="e.g. Morning Sunlight, A Walk in the Park, Quiet Evening..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                disabled={isSaving}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="journal-content">
                Your Gratitude Reflection
              </label>
              <textarea
                id="journal-content"
                className="form-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Take a moment to pause and reflect. Write one paragraph about someone, something, or a simple feeling you appreciate today..."
                rows={6}
                disabled={isSaving}
              />
              <div className="textarea-footer">

                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Sparkles size={14} color="var(--primary)" />
                  <span>One thoughtful paragraph is all it takes</span>
                </span>
                <span style={{
                  fontWeight: 600,
                  color: isOverLimit ? 'var(--error)' : 'var(--text-subtle)'
                }}>
                  {charCount} / {MAX_CHAR_COUNT} characters
                </span>
              </div>
            </div>

            <div className="modal-actions" style={{ justifyContent: isEditing ? 'space-between' : 'flex-end' }}>
              {isEditing && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSaving}
                  title="Delete this journal entry"
                >
                  <Trash2 size={16} />
                  <span>Delete Entry</span>
                </button>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving || isEmpty || isOverLimit}
                >
                  <Check size={16} />
                  <span>{isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Entry'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Gratitude Entry?"
        message={`Are you sure you want to delete your reflection for ${formattedDate}? This cannot be undone.`}
        confirmText="Yes, Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
