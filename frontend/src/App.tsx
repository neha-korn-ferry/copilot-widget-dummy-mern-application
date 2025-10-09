import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

type AuthMode = 'cookie' | 'token';

type ViewState = 'signin' | 'dashboard';

interface ParticipantSummary {
  participantId: string;
  participantName: string;
  email: string;
  authenticatedVia: AuthMode;
  expiresAt?: number;
  summary: {
    totalEvents: number;
    attendedSessions: number;
    score: number;
  };
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const TOKEN_STORAGE_KEY = 'participant-demo-token';

const DEFAULT_CREDENTIALS = {
  email: 'neha.tanwar@kornferry.com',
  password: 'Neha@123',
};

const authModeLabels: Record<AuthMode, string> = {
  cookie: 'Session Cookie',
  token: 'Bearer Token',
};

function App() {
  const [view, setView] = useState<ViewState>('signin');
  const [authMode, setAuthMode] = useState<AuthMode>('cookie');
  const [authenticatedVia, setAuthenticatedVia] = useState<AuthMode | null>(null);
  const [email, setEmail] = useState(DEFAULT_CREDENTIALS.email);
  const [password, setPassword] = useState(DEFAULT_CREDENTIALS.password);
  const [token, setToken] = useState<string | null>(null);
  const [summary, setSummary] = useState<ParticipantSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const loadSummary = async (
    mode: AuthMode,
    tokenOverride: string | null,
    options?: { skipSpinner?: boolean; suppressStatus?: boolean }
  ): Promise<boolean> => {
    if (!options?.skipSpinner) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await axios.get<ParticipantSummary>(
        `${API_BASE_URL}/participant-summary`,
        {
          withCredentials: mode === 'cookie',
          headers:
            mode === 'token' && tokenOverride
              ? { Authorization: `Bearer ${tokenOverride}` }
              : undefined,
        }
      );

      setSummary(response.data);
      setAuthenticatedVia(response.data.authenticatedVia);
      if (response.data.authenticatedVia === 'token') {
        setToken(tokenOverride ?? token);
        if (tokenOverride) {
          localStorage.setItem(TOKEN_STORAGE_KEY, tokenOverride);
        }
      } else {
        setToken(null);
      }

      if (!options?.suppressStatus) {
        setStatus(
          `Participant data fetched via ${authModeLabels[response.data.authenticatedVia].toLowerCase()}.`
        );
      }

      return true;
    } catch (err) {
      if (!options?.suppressStatus) {
        setError('Unable to load participant summary. Please try again.');
      }
      return false;
    } finally {
      if (!options?.skipSpinner) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (storedToken) {
        const tokenSuccess = await loadSummary('token', storedToken, {
          skipSpinner: true,
          suppressStatus: true,
        });

        if (tokenSuccess) {
          setView('dashboard');
          setStatus('Session restored using stored bearer token.');
          return;
        }

        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }

      const cookieSuccess = await loadSummary('cookie', null, {
        skipSpinner: true,
        suppressStatus: true,
      });

      if (cookieSuccess) {
        setView('dashboard');
        setStatus('Session restored from active cookie.');
      }
    };

    void bootstrap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      if (authMode === 'cookie') {
        await axios.post(
          `${API_BASE_URL}/auth/sign-in-cookie`,
          { email, password },
          { withCredentials: true }
        );
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setAuthenticatedVia('cookie');
        setStatus('Signed in using a secure session cookie.');
        setView('dashboard');
        await loadSummary('cookie', null, { skipSpinner: true, suppressStatus: true });
      } else {
        const response = await axios.post<{ token: string }>(
          `${API_BASE_URL}/auth/sign-in-token`,
          { email, password }
        );
        const issuedToken = response.data.token;
        setToken(issuedToken);
        localStorage.setItem(TOKEN_STORAGE_KEY, issuedToken);
        setAuthenticatedVia('token');
        setStatus('Bearer token issued and stored securely for this session.');
        setView('dashboard');
        await loadSummary('token', issuedToken, {
          skipSpinner: true,
          suppressStatus: true,
        });
      }
    } catch (err) {
      setError('Sign-in failed. Please verify your credentials.');
      setAuthenticatedVia(null);
      setSummary(null);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!authenticatedVia) {
      setError('Sign in before fetching participant information.');
      return;
    }

    await loadSummary(authenticatedVia, token, { suppressStatus: false });
  };

  const handleSignOut = () => {
    setView('signin');
    setAuthenticatedVia(null);
    setSummary(null);
    setToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setStatus('Signed out locally. Session cookie remains until it expires.');
  };

  return (
    <div className="app-shell">
      <div className='topbar-container'>
        <nav className="topbar">
          <span className="brand">Participant Insights</span>
          {view === 'dashboard' && (
            <button className="secondary" onClick={handleSignOut}>
              Sign out
            </button>
          )}
        </nav>
      </div>

      <main className="content">
        {view === 'signin' ? (
          <div className="">
            <form className="card sign-in-card" onSubmit={handleSignIn}>
              <h1>Sign in</h1>
              <p className="subtitle">
                Choose an authentication method and use the provided demo
                credentials to continue.
              </p>

              <div className="field-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <fieldset className="field-group auth-toggle">
                <legend>Authentication method</legend>
                <div style={{ marginTop: '0.5rem', display: "flex", justifyContent: "space-between" }}>
                  <label className={authMode === 'cookie' ? 'active' : undefined}>
                    <input
                      type="radio"
                      name="authMode"
                      value="cookie"
                      checked={authMode === 'cookie'}
                      onChange={() => setAuthMode('cookie')}
                    />
                    Session cookie
                  </label>
                  <label className={authMode === 'token' ? 'active' : undefined}>
                    <input
                      type="radio"
                      name="authMode"
                      value="token"
                      checked={authMode === 'token'}
                      onChange={() => setAuthMode('token')}
                    />
                    Bearer token
                  </label>
                </div>
              </fieldset>

              <button className="primary" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Access dashboard'}
              </button>

              {error && <p className="feedback error">{error}</p>}
              {status && !error && (
                <p className="feedback success">{status}</p>
              )}
            </form>

          </div>
        ) : (
          <div className="dashboard">
            <header className="dashboard-header">
              <div>
                <h1>Participant overview</h1>
                <p>
                  Authenticated via{' '}
                  <strong>
                    {authenticatedVia
                      ? authModeLabels[authenticatedVia]
                      : '—'}
                  </strong>
                  . Refresh to see the latest data.
                </p>
              </div>
              <div className="dashboard-actions">
                <button
                  className="secondary"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  {loading ? 'Refreshing…' : 'Refresh summary'}
                </button>
                <button className="secondary" onClick={() => setView('signin')}>
                  Switch account
                </button>
              </div>
            </header>

            {error && <p className="feedback error">{error}</p>}
            {status && !error && (
              <p className="feedback success">{status}</p>
            )}

            {summary ? (
              <section className="summary-layout">
                <article className="card summary-card">
                  <h2>{summary.participantName}</h2>
                  <p className="muted">{summary.email}</p>
                  <dl>
                    <div>
                      <dt>Participant ID</dt>
                      <dd>{summary.participantId}</dd>
                    </div>
                    <div>
                      <dt>Authenticated via</dt>
                      <dd>{authModeLabels[summary.authenticatedVia]}</dd>
                    </div>
                    {summary.expiresAt && (
                      <div>
                        <dt>Credential expires</dt>
                        <dd>{new Date(summary.expiresAt).toLocaleString()}</dd>
                      </div>
                    )}
                  </dl>
                </article>

                <article className="card stats-card">
                  <h3>Engagement summary</h3>
                  <ul>
                    <li>
                      <span>Total events</span>
                      <strong>{summary.summary.totalEvents}</strong>
                    </li>
                    <li>
                      <span>Sessions attended</span>
                      <strong>{summary.summary.attendedSessions}</strong>
                    </li>
                    <li>
                      <span>Score</span>
                      <strong>{summary.summary.score}</strong>
                    </li>
                  </ul>
                </article>
              </section>
            ) : (
              <div className="empty-state">
                <h2>No participant data yet</h2>
                <p>Use the refresh button to pull the latest participant summary.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
