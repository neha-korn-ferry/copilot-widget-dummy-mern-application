import React from 'react';
import './Skeleton.css';

export const SignInSkeleton: React.FC = () => {
  return (
    <div className="card sign-in-card">
      {/* Title skeleton */}
      <div 
        className="skeleton-title skeleton-shimmer" 
        style={{ 
          height: '2rem', 
          width: '120px',
          marginBottom: '0.25rem'
        }}
      ></div>
      
      {/* Subtitle skeleton */}
      <div 
        className="skeleton-text skeleton-shimmer" 
        style={{ 
          height: '1.25rem', 
          width: '85%',
          marginBottom: '1.25rem'
        }}
      ></div>
      
      {/* Email field */}
      <div className="field-group">
        <div 
          className="skeleton-label skeleton-shimmer" 
          style={{ 
            height: '0.85rem', 
            width: '50px',
            marginBottom: '0.4rem'
          }}
        ></div>
        <div 
          className="skeleton-input skeleton-shimmer" 
          style={{ 
            height: '48px',
            width: '100%'
          }}
        ></div>
      </div>

      {/* Password field */}
      <div className="field-group">
        <div 
          className="skeleton-label skeleton-shimmer" 
          style={{ 
            height: '0.85rem', 
            width: '70px',
            marginBottom: '0.4rem'
          }}
        ></div>
        <div 
          className="skeleton-input skeleton-shimmer" 
          style={{ 
            height: '48px',
            width: '100%'
          }}
        ></div>
      </div>

      {/* Auth toggle field */}
      <fieldset className="field-group auth-toggle">
        <div 
          className="skeleton-label skeleton-shimmer" 
          style={{ 
            height: '0.85rem', 
            width: '180px',
            marginBottom: '0.75rem'
          }}
        ></div>
      </fieldset>
        <div style={{ 
          marginTop: '0.5rem',
          display: 'flex',
          gap:"1rem",
          justifyContent: 'space-between'
        }}>
          <div 
            className="skeleton-radio skeleton-shimmer" 
            style={{ 
              flex: '1',
              minWidth: '140px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem 1rem'
            }}
          ></div>
          <div 
            className="skeleton-radio skeleton-shimmer" 
            style={{ 
              flex: '1',
              minWidth: '140px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem 1rem'
            }}
          ></div>
        </div>

      {/* Submit button */}
      <button 
        className="primary skeleton-shimmer" 
        type="button"
        disabled
        style={{ 
          height: '44px',
          width: '100%',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))',
          border: 'none',
          cursor: 'default'
        }}
      ></button>
    </div>
  );
};

