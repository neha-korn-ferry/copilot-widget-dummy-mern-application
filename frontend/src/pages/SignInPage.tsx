import { FormEvent, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignInForm } from '../features/auth/components/SignInForm';
import { SignInSkeleton } from '../components/Skeletons/SignInSkeleton';
import { useAuth } from '../features/auth/hooks/useAuth';
import { DEFAULT_CREDENTIALS } from '../constants';
import { AuthMode } from '../types';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<AuthMode>('cookie');
  const [email, setEmail] = useState<string>(DEFAULT_CREDENTIALS.email);
  const [password, setPassword] = useState<string>(DEFAULT_CREDENTIALS.password);
  const [status, setStatus] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { signIn, loadSummary, loading, error, setError } = useAuth();

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('participant-demo-token');
      
      if (storedToken) {
        const summaryData = await loadSummary('token', storedToken);
        if (summaryData) {
          navigate('/dashboard', { replace: true });
          return;
        }
      }

      // Try cookie-based auth
      try {
        const cookieSummary = await loadSummary('cookie');
        if (cookieSummary) {
          navigate('/dashboard', { replace: true });
        } else {
          setIsInitialLoad(false);
        }
      } catch (error) {
        // If cookie check fails, user is not authenticated
        setIsInitialLoad(false);
      }
    };

    void checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setStatus(null);

      const result = await signIn(email, password, authMode);
      if (!result) {
        return;
      }

      setStatus(
        authMode === 'cookie'
          ? 'Signed in using a secure session cookie.'
          : 'Bearer token issued and stored securely for this session.'
      );

      // Load summary after sign-in
      await loadSummary(
        authMode,
        authMode === 'token' ? result.token : undefined
      );

      // Navigate to dashboard after successful login
      navigate('/dashboard', { replace: true });
    },
    [email, password, authMode, signIn, loadSummary, setError, navigate]
  );

  if (isInitialLoad) {
    return (
      <>
        <div className="topbar-container">
          <nav className="topbar">
            <span className="brand">Participant Insights</span>
          </nav>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <SignInSkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="topbar-container">
        <nav className="topbar">
          <span className="brand">Participant Insights</span>
        </nav>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <SignInForm
          email={email}
          password={password}
          authMode={authMode}
          loading={loading}
          error={error}
          status={status}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onAuthModeChange={setAuthMode}
          onSubmit={handleSignIn}
        />
      </div>
    </>
  );
};

