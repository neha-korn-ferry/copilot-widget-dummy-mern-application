import { FormEvent } from 'react';
import { AuthMode } from '../../../types';
import { DEFAULT_CREDENTIALS, AUTH_MODE_LABELS } from '../../../constants';

interface SignInFormProps {
  email: string;
  password: string;
  authMode: AuthMode;
  loading: boolean;
  error: string | null;
  status: string | null;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onAuthModeChange: (mode: AuthMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  email,
  password,
  authMode,
  loading,
  error,
  status,
  onEmailChange,
  onPasswordChange,
  onAuthModeChange,
  onSubmit,
}) => {
  return (
    <form className="card sign-in-card" onSubmit={onSubmit}>
      <h1>Sign in</h1>
      <p className="subtitle">
        Choose an authentication method and use the provided demo credentials to continue.
      </p>

      <div className="field-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          required
          aria-required="true"
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
          onChange={(event) => onPasswordChange(event.target.value)}
          required
          aria-required="true"
        />
      </div>

      <fieldset className="field-group auth-toggle">
        <legend>Authentication method</legend>
        <div
          style={{
            marginTop: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <label className={authMode === 'cookie' ? 'active' : undefined}>
            <input
              type="radio"
              name="authMode"
              value="cookie"
              checked={authMode === 'cookie'}
              onChange={() => onAuthModeChange('cookie')}
              aria-label="Session cookie authentication"
            />
            Session cookie
          </label>
          <label className={authMode === 'token' ? 'active' : undefined}>
            <input
              type="radio"
              name="authMode"
              value="token"
              checked={authMode === 'token'}
              onChange={() => onAuthModeChange('token')}
              aria-label="Bearer token authentication"
            />
            Bearer token
          </label>
        </div>
      </fieldset>

      <button className="primary" type="submit" disabled={loading}>
        {loading ? 'Signing in…' : 'Access dashboard'}
      </button>

      {error && (
        <p className="feedback error" role="alert">
          {error}
        </p>
      )}
      {status && !error && (
        <p className="feedback success" role="status">
          {status}
        </p>
      )}
    </form>
  );
};

