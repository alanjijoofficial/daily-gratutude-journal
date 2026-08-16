import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEntries, createEntry, updateEntry, deleteEntry } from '../services/entries';
import Navbar from '../components/Navbar';
import TodayCard from '../components/TodayCard';
import CalendarView from '../components/CalendarView';
import RecentEntries from '../components/RecentEntries';
import JournalEditor from '../components/JournalEditor';
import AllEntriesModal from '../components/AllEntriesModal';
import Toast from '../components/Toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [fetchError, setFetchError] = useState('');

  // Modals and Active Selection
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [isAllEntriesOpen, setIsAllEntriesOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // Compute Today's Date string in YYYY-MM-DD local format
  const todayDateStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Fetch all user entries
  const loadEntries = useCallback(async () => {
    setFetchError('');
    try {
      const data = await getEntries();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching journal entries:', err);
      setFetchError(err.message || 'Failed to load your journal. Please try refreshing.');
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Find today's entry
  const todayEntry = useMemo(() => {
    return entries.find((e) => e.date === todayDateStr) || null;
  }, [entries, todayDateStr]);

  // Find entry for currently selected date in editor
  const selectedDateEntry = useMemo(() => {
    if (!selectedDateStr) return null;
    return entries.find((e) => e.date === selectedDateStr) || null;
  }, [entries, selectedDateStr]);

  const handleOpenEditorForDate = (dateStr) => {
    setSelectedDateStr(dateStr || todayDateStr);
    setIsEditorOpen(true);
  };

  const handleEditEntry = (entry) => {
    setSelectedDateStr(entry.date);
    setIsEditorOpen(true);
  };

  const handleSaveEntry = async ({ id, title, date, content }) => {
    // If id exists or an entry for this date already exists, perform update
    const existingForDate = entries.find((e) => e.date === date);
    const targetId = id || existingForDate?.id;

    if (targetId) {
      const updated = await updateEntry(targetId, { title, date, content });
      setEntries((prev) =>
        prev.map((item) => (item.id === targetId ? updated : item))
      );
      showToast('✓ Your changes have been saved.');
    } else {
      const created = await createEntry({ title, date, content });
      // Add to list and sort by date descending
      setEntries((prev) =>
        [created, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date))
      );
      showToast('✓ Your gratitude has been saved.');
    }

    setIsEditorOpen(false);
  };


  const handleDeleteEntry = async (id) => {
    await deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    showToast('Entry deleted.', 'success');

    if (isEditorOpen && selectedDateEntry?.id === id) {
      setIsEditorOpen(false);
    }
  };

  const scrollToCalendar = () => {
    const el = document.getElementById('calendar-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const displayName = user?.first_name || user?.username || 'Friend';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        onOpenAllEntries={() => setIsAllEntriesOpen(true)}
        onScrollToCalendar={scrollToCalendar}
      />

      <main className="app-container">
        {/* Welcome Header */}
        <section className="hero-section">
          <h1 className="hero-title">Good day, {displayName} 🌱</h1>
          <p className="hero-subtitle">
            Take a quiet moment to appreciate something in your life today.
          </p>
        </section>

        {/* Global Fetch Error Banner */}
        {fetchError && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <span>{fetchError}</span>
            <button
              onClick={loadEntries}
              className="btn-link"
              style={{ marginLeft: 'auto', color: 'var(--error)' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Today's Hero Card */}
        <TodayCard
          todayEntry={todayEntry}
          todayDateStr={todayDateStr}
          onOpenEditor={handleOpenEditorForDate}
        />

        {/* Main Interactive Grid: Calendar & Recent Entries */}
        <div className="dashboard-grid">
          <CalendarView
            entries={entries}
            selectedDate={selectedDateStr}
            todayDateStr={todayDateStr}
            onSelectDate={handleOpenEditorForDate}
          />

          <RecentEntries
            entries={entries}
            todayDateStr={todayDateStr}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            onOpenAll={() => setIsAllEntriesOpen(true)}
            onSelectDate={handleOpenEditorForDate}
          />
        </div>
      </main>

      {/* Editor Modal */}
      <JournalEditor
        isOpen={isEditorOpen}
        dateStr={selectedDateStr}
        existingEntry={selectedDateEntry}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
        onClose={() => setIsEditorOpen(false)}
      />

      {/* View All Past Entries Modal */}
      <AllEntriesModal
        isOpen={isAllEntriesOpen}
        entries={entries}
        onClose={() => setIsAllEntriesOpen(false)}
        onEditEntry={handleEditEntry}
        onDeleteEntry={handleDeleteEntry}
      />

      {/* Toast feedback */}
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
