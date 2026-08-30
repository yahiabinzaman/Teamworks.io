import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ColorLab Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0c0e12',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#161922',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '32px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛠️</div>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
              ColorLab Workspace Notice
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
              An unexpected display issue occurred. Click the button below to reload with clean cache.
            </p>
            {this.state.error && (
              <pre style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(244,63,94,0.3)',
                color: '#fb7185',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '11px',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '20px'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              style={{
                backgroundColor: '#0071e3',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '13px',
                padding: '10px 24px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              🔄 Reset Cache & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
