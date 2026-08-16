import { Sprout, LogOut, BookOpen, Calendar as CalendarIcon, User } from './Icons';

import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenAllEntries, onScrollToCalendar }) {
  const { user, logout } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.first_name || user?.username || 'Friend';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a href="#dashboard" className="brand">
          <div className="brand-icon">
            <Sprout size={20} />
          </div>
          <span>Daily Gratitude</span>
        </a>

        <div className="nav-actions">
          {onScrollToCalendar && (
            <button
              onClick={onScrollToCalendar}
              className="btn-entry-action"
              style={{ display: 'none', md: 'inline-flex' }}
              title="Jump to Calendar"
            >
              <CalendarIcon size={16} />
              <span>Calendar</span>
            </button>
          )}

          {onOpenAllEntries && (
            <button
              onClick={onOpenAllEntries}
              className="btn-entry-action"
              title="View all journal entries"
            >
              <BookOpen size={16} />
              <span>All Entries</span>
            </button>
          )}

          <div className="user-greeting-badge">
            <User size={14} />
            <span>{getGreeting()}, <strong>{displayName}</strong> 🌱</span>
          </div>

          <button
            onClick={logout}
            className="btn-nav-logout"
            title="Log out of your account"
            aria-label="Log out"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
