import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from './Icons';



export default function CalendarView({
  entries = [],
  selectedDate,
  onSelectDate,
  todayDateStr,
}) {
  // Current calendar viewing month and year
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth(); // 0-indexed

  // Format month name: e.g. "August 2026"
  const monthTitle = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate calendar grid days
  // Month starts on day of week: (0 = Sun, 1 = Mon, ... 6 = Sat)
  // For Monday-first: Mon=0, Tue=1, ..., Sun=6
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const startOffset = (firstDayOfMonth + 6) % 7; // Convert Sun(0) to 6, Mon(1) to 0

  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Create a map of date -> entry for quick lookup
  const entryDateMap = new Map();
  entries.forEach((entry) => {
    if (entry.date) {
      entryDateMap.set(entry.date, entry);
    }
  });

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    if (onSelectDate) {
      onSelectDate(todayDateStr);
    }
  };

  // Helper to format date string YYYY-MM-DD
  const formatDateKey = (day) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="card calendar-card" id="calendar-section">
      <div className="calendar-header">
        <h3 className="calendar-month-title">{monthTitle}</h3>

        <div className="calendar-nav-buttons">
          <button
            type="button"
            className="btn-today-jump"
            onClick={handleJumpToToday}
            title="Jump to current month & today"
          >
            Today
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="calendar-weekdays-grid">
        {weekdays.map((day) => (
          <div key={day} className="calendar-weekday-label">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="calendar-days-grid">
        {/* Leading empty cells */}
        {Array.from({ length: startOffset }).map((_, idx) => (
          <div key={`empty-${idx}`} className="calendar-day-cell empty" />
        ))}

        {/* Month days */}
        {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
          const dayNumber = idx + 1;
          const dateStr = formatDateKey(dayNumber);
          const hasEntry = entryDateMap.has(dateStr);
          const isToday = dateStr === todayDateStr;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              type="button"
              className={`calendar-day-cell ${hasEntry ? 'has-entry' : ''} ${
                isToday ? 'is-today' : ''
              } ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onSelectDate(dateStr)}
              title={
                hasEntry
                  ? `Entry exists for ${dateStr} - Click to view/edit`
                  : `No entry for ${dateStr} - Click to write gratitude`
              }
              aria-label={`Select date ${dateStr}${hasEntry ? ' (has entry)' : ''}`}
            >
              <span className="calendar-day-number">{dayNumber}</span>
              {hasEntry && <span className="calendar-entry-dot" />}
            </button>
          );
        })}
      </div>

      {/* Calendar Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot entry" />
          <span>Gratitude written</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot today" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}
