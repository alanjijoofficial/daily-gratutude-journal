import React from 'react';
import { PenLine, CheckCircle2, Sparkles, BookOpen } from './Icons';


export default function TodayCard({ todayEntry, todayDateStr, onOpenEditor }) {
  // Format today's date nicely: e.g. "Friday, August 14, 2026"
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const hasTodayEntry = Boolean(todayEntry);

  return (
    <div className="today-card">
      <div className="today-card-header">
        <div>
          <span className={`today-badge ${hasTodayEntry ? 'completed' : 'pending'}`}>
            {hasTodayEntry ? (
              <>
                <CheckCircle2 size={13} />
                <span>Today's Gratitude Complete</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Daily Reflection</span>
              </>
            )}
          </span>
          <h2 className="today-date-text">{formattedToday}</h2>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onOpenEditor(todayDateStr)}
        >
          {hasTodayEntry ? (
            <>
              <BookOpen size={16} />
              <span>View / Edit Today's Entry</span>
            </>
          ) : (
            <>
              <PenLine size={16} />
              <span>Write Today's Entry</span>
            </>
          )}
        </button>
      </div>

      <div className="today-card-body">
        {hasTodayEntry ? (
          <div>
            <p style={{ marginBottom: '0.65rem', fontSize: '0.92rem' }}>
              You've already taken a moment to reflect today. Here is what you wrote:
            </p>
            <div className="today-preview-quote">
              {todayEntry.title && (
                <div style={{ fontWeight: 600, fontStyle: 'normal', color: 'var(--primary)', marginBottom: '0.35rem', fontSize: '1.05rem', fontFamily: 'var(--font-serif)' }}>
                  {todayEntry.title}
                </div>
              )}
              <span>"{todayEntry.content}"</span>
            </div>
          </div>
        ) : (

          <p>
            Take a peaceful breath and reflect on one thing you appreciate today. Writing a single paragraph fosters mindfulness and presence.
          </p>
        )}
      </div>
    </div>
  );
}
