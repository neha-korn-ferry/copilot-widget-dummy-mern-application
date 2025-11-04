import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParticipantDashboard } from '../features/participant/components/ParticipantDashboard';
import { DashboardSkeleton } from '../components/Skeletons/DashboardSkeleton';
import { SignInSkeleton } from '../components/Skeletons/SignInSkeleton';
import { useAuth } from '../features/auth/hooks/useAuth';
import { AuthMode, ParticipantSummary } from '../types';
import {CopilotChat }from '../features/chat/components/CopilotChat';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [authenticatedVia, setAuthenticatedVia] = useState<AuthMode | null>(null);
  const [summary, setSummary] = useState<ParticipantSummary | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { signOut, loadSummary, loading, error, token, setError } = useAuth();

  // Load summary on mount
  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem('participant-demo-token');

      if (storedToken) {
        const summaryData = await loadSummary('token', storedToken);
        if (summaryData) {
          setAuthenticatedVia(summaryData.authenticatedVia);
          setSummary(summaryData);
            setIsInitialLoad(false);
          setStatus('Session restored using stored bearer token.');
          return;
        }
      }

      // Try cookie-based auth
      const cookieSummary = await loadSummary('cookie');
      if (cookieSummary) {
        setAuthenticatedVia(cookieSummary.authenticatedVia);
        setSummary(cookieSummary);
        setStatus('Session restored from active cookie.');
      } else {
        // No valid session, redirect to sign in
        navigate('/', { replace: true });
      }
      setIsInitialLoad(false);
    };

    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!authenticatedVia) {
      setError('Sign in before fetching participant information.');
      return;
    }

    const summaryData = await loadSummary(authenticatedVia, token);
    if (summaryData) {
      setSummary(summaryData);
      setStatus(
        `Participant data fetched via ${authenticatedVia === 'cookie' ? 'session cookie' : 'bearer token'}.`
      );
    }
  }, [authenticatedVia, token, loadSummary, setError]);

  const handleSignOut = useCallback(async () => {
    // Clear all auth state
    await signOut();
    setAuthenticatedVia(null);
    setSummary(null);
    setStatus(null);
    navigate('/', { replace: true });
  }, [signOut, navigate]);

  if (isInitialLoad) {
    return (
      <>
        <div className="topbar-container">
          <nav className="topbar">
            <span className="brand">Participant Insights</span>
            <div className="skeleton-button skeleton-shimmer" style={{ width: '80px', height: '36px', borderRadius: '4px' }}></div>
          </nav>
        </div>
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <div className="topbar-container">
        <nav className="topbar">
          <span className="brand">Participant Insights</span>
          <button className="secondary" onClick={handleSignOut} type="button">
            Sign out
          </button>
        </nav>
      </div>
      <ParticipantDashboard
        summary={summary}
        authenticatedVia={authenticatedVia}
        loading={loading}
        error={error}
        status={status}
        onRefresh={handleRefresh}
        onSwitchAccount={() => navigate('/', { replace: true })}
      />
      <div style={{ position: 'fixed', bottom: 20, right: 20 }}>
        <CopilotChat userId="dev-user-1" />
      </div>
    </>
  );
};

