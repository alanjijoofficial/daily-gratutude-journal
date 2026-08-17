import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#FAF7F2',
          fontFamily: 'sans-serif',
          color: '#202B24'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🌱</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Daily Gratitude Journal</h2>
          <p style={{ color: '#5C6B61', maxWidth: '400px', marginBottom: '1.5rem' }}>
            {this.state.error?.message || 'An error occurred while loading the application.'}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: '#3D624C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Reset Session & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

