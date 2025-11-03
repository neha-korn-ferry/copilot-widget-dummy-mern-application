import { AuthMode, ParticipantSummary } from '../../../types';
import { AUTH_MODE_LABELS } from '../../../constants';

interface ParticipantDashboardProps {
  summary: ParticipantSummary | null;
  authenticatedVia: AuthMode | null;
  loading: boolean;
  error: string | null;
  status: string | null;
  onRefresh: () => void;
  onSwitchAccount: () => void;
}

export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  summary,
  authenticatedVia,
  loading,
  error,
  status,
  onRefresh,
  onSwitchAccount,
}) => {
  const authModeLabel = authenticatedVia ? AUTH_MODE_LABELS[authenticatedVia] : '—';

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Participant overview</h1>
          <p>
            Authenticated via <strong>{authModeLabel}</strong>. Refresh to see the latest data.
          </p>
        </div>
        <div className="dashboard-actions">
          <button
            className="secondary"
            onClick={onRefresh}
            disabled={loading}
            type="button"
          >
            {loading ? 'Refreshing…' : 'Refresh summary'}
          </button>
          <button className="secondary" onClick={onSwitchAccount} type="button">
            Switch account
          </button>
        </div>
      </header>

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
                <dd>{AUTH_MODE_LABELS[summary.authenticatedVia]}</dd>
              </div>
              {summary.expiresAt && (
                <div>
                  <dt>Credential expires</dt>
                  <dd>
                    <time dateTime={new Date(summary.expiresAt).toISOString()}>
                      {new Date(summary.expiresAt).toLocaleString()}
                    </time>
                  </dd>
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
  );
};

