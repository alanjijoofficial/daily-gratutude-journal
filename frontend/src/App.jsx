import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { Sprout } from './components/Icons';


function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [showSkip, setShowSkip] = useState(false);

  // Show skip button if loading takes more than 3 seconds
  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowSkip(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading && !showSkip) {
    return (
      <div className="auth-wrapper" style={{ flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 1.8s infinite',
        }}>
          <Sprout size={28} />
        </div>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--primary)' }}>
          Opening your journal...
        </p>
      </div>
    );
  }


  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginPage onNavigateToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterPage onNavigateToLogin={() => setAuthView('login')} />
    );
  }

  return <DashboardPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
