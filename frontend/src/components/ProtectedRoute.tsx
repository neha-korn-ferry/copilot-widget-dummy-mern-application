import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { DashboardSkeleton } from './Skeletons/DashboardSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, loadSummary } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      // Check for token-based auth first
      const storedToken = localStorage.getItem('participant-demo-token');
      
      if (token || storedToken) {
        // Try to validate token by loading summary
        const summaryData = await loadSummary('token', token || storedToken || undefined);
        if (summaryData) {
          setIsAuthenticated(true);
          setIsChecking(false);
          return;
        }
      }

      // If no token or token is invalid, try cookie-based auth
      try {
        const cookieSummary = await loadSummary('cookie');
        if (cookieSummary) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error: any) {
        // Check if it's a 401 (unauthorized) - means not authenticated
        if (error?.response?.status === 401) {
          setIsAuthenticated(false);
        } else {
          // Other errors might be network issues, but we'll treat as not authenticated
          setIsAuthenticated(false);
        }
      } finally {
        setIsChecking(false);
      }
    };

    void checkAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="app-shell">
        <div className="topbar-container">
          <nav className="topbar">
            <span className="brand">Participant Insights</span>
            <div className="skeleton-button skeleton-shimmer" style={{ width: '80px', height: '36px', borderRadius: '4px' }}></div>
          </nav>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated, render protected content
  return <>{children}</>;
};

