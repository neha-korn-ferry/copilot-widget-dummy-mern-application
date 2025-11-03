import React from 'react';
import './Skeleton.css';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          {/* Main title - matches h1 */}
          <h1 
            className="skeleton-shimmer" 
            style={{ 
              height: '2rem', 
              width: '280px',
              margin: 0,
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '0.5rem'
            }}
          ></h1>
          {/* Subtitle - matches p */}
          <p 
            className="skeleton-shimmer" 
            style={{ 
              height: '1.125rem', 
              width: '380px',
              margin: 0,
              background: 'rgba(30, 41, 59, 0.4)',
              borderRadius: '0.375rem'
            }}
          ></p>
        </div>
        <div className="dashboard-actions">
          <button 
            className="secondary skeleton-shimmer" 
            type="button"
            disabled
            style={{ 
              width: '150px', 
              height: '44px',
              background: 'rgba(148, 163, 184, 0.15)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              cursor: 'default',
              color: 'transparent'
            }}
          ></button>
          <button 
            className="secondary skeleton-shimmer" 
            type="button"
            disabled
            style={{ 
              width: '140px', 
              height: '44px',
              background: 'rgba(148, 163, 184, 0.15)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              cursor: 'default',
              color: 'transparent'
            }}
          ></button>
        </div>
      </header>

      <section className="summary-layout">
        {/* Summary Card */}
        <article className="card summary-card">
          {/* Name - matches h2 */}
          <h2 
            className="skeleton-shimmer" 
            style={{ 
              height: '1.75rem', 
              width: '220px',
              margin: 0,
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '0.5rem'
            }}
          ></h2>
          {/* Email - matches p.muted */}
          <p 
            className="muted skeleton-shimmer" 
            style={{ 
              height: '1rem', 
              width: '280px',
              margin: 0,
              background: 'rgba(226, 232, 240, 0.55)',
              borderRadius: '0.375rem'
            }}
          ></p>
          
          {/* Definition list items */}
          <dl>
            <div>
              <dt 
                className="skeleton-shimmer" 
                style={{ 
                  height: '0.8rem', 
                  width: '130px',
                  margin: 0,
                  background: 'rgba(226, 232, 240, 0.55)',
                  borderRadius: '0.25rem'
                }}
              ></dt>
              <dd 
                className="skeleton-shimmer" 
                style={{ 
                  height: '1.1rem', 
                  width: '180px',
                  margin: '0.25rem 0 0',
                  background: 'rgba(30, 41, 59, 0.6)',
                  borderRadius: '0.375rem'
                }}
              ></dd>
            </div>
            <div>
              <dt 
                className="skeleton-shimmer" 
                style={{ 
                  height: '0.8rem', 
                  width: '150px',
                  margin: 0,
                  background: 'rgba(226, 232, 240, 0.55)',
                  borderRadius: '0.25rem'
                }}
              ></dt>
              <dd 
                className="skeleton-shimmer" 
                style={{ 
                  height: '1.1rem', 
                  width: '140px',
                  margin: '0.25rem 0 0',
                  background: 'rgba(30, 41, 59, 0.6)',
                  borderRadius: '0.375rem'
                }}
              ></dd>
            </div>
            <div>
              <dt 
                className="skeleton-shimmer" 
                style={{ 
                  height: '0.8rem', 
                  width: '140px',
                  margin: 0,
                  background: 'rgba(226, 232, 240, 0.55)',
                  borderRadius: '0.25rem'
                }}
              ></dt>
              <dd 
                className="skeleton-shimmer" 
                style={{ 
                  height: '1.1rem', 
                  width: '200px',
                  margin: '0.25rem 0 0',
                  background: 'rgba(30, 41, 59, 0.6)',
                  borderRadius: '0.375rem'
                }}
              ></dd>
            </div>
          </dl>
        </article>

        {/* Stats Card */}
        <article className="card stats-card">
          {/* Stats title - matches h3 */}
          <h3 
            className="skeleton-shimmer" 
            style={{ 
              height: '1.5rem', 
              width: '200px',
              margin: 0,
              background: 'rgba(30, 41, 59, 0.6)',
              borderRadius: '0.5rem'
            }}
          ></h3>
          <ul>
            {[1, 2, 3].map((item) => (
              <li key={item}>
                <span 
                  className="skeleton-shimmer" 
                  style={{ 
                    width: '140px', 
                    height: '1rem',
                    display: 'inline-block',
                    background: 'rgba(226, 232, 240, 0.7)',
                    borderRadius: '0.375rem'
                  }}
                ></span>
                <strong 
                  className="skeleton-shimmer" 
                  style={{ 
                    width: '50px', 
                    height: '1.5rem',
                    display: 'inline-block',
                    background: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '0.5rem'
                  }}
                ></strong>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
};

