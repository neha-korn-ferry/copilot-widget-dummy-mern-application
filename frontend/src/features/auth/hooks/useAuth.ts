import { useState, useCallback } from 'react';
import apiClient from '../../../services/api.service';
import { TOKEN_STORAGE_KEY, API_ENDPOINTS } from '../../../constants';
import { AuthMode, ParticipantSummary, SignInResponse } from '../../../types';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  const signIn = useCallback(
    async (email: string, password: string, mode: AuthMode): Promise<SignInResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const endpoint = mode === 'cookie' ? API_ENDPOINTS.SIGN_IN_COOKIE : API_ENDPOINTS.SIGN_IN_TOKEN;
        const response = await apiClient.post<SignInResponse>(
          endpoint,
          { email, password },
          { withCredentials: mode === 'cookie' }
        );

        if (mode === 'token' && response.data.token) {
          const issuedToken = response.data.token;
          setToken(issuedToken);
          localStorage.setItem(TOKEN_STORAGE_KEY, issuedToken);
        } else {
          setToken(null);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }

        return response.data;
      } catch (err) {
        const errorMessage = 'Sign-in failed. Please verify your credentials.';
        setError(errorMessage);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    
    try {
      // Call logout endpoint to clear server-side session cookie
      try {
        await apiClient.post(API_ENDPOINTS.SIGN_OUT || '/auth/sign-out', {}, { withCredentials: true });
      } catch (error) {
        // Continue even if logout endpoint fails
        console.error('Logout endpoint error (non-critical):', error);
      }

      // Clear token-based auth
      setToken(null);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSummary = useCallback(
    async (mode: AuthMode, tokenOverride?: string | null): Promise<ParticipantSummary | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<ParticipantSummary>(
          API_ENDPOINTS.PARTICIPANT_SUMMARY,
          {
            withCredentials: mode === 'cookie',
            headers:
              mode === 'token' && (tokenOverride || token)
                ? { Authorization: `Bearer ${tokenOverride || token}` }
                : undefined,
          }
        );

        // Update token if received via token auth
        if (response.data.authenticatedVia === 'token' && (tokenOverride || token)) {
          if (tokenOverride) {
            setToken(tokenOverride);
            localStorage.setItem(TOKEN_STORAGE_KEY, tokenOverride);
          }
        }

        return response.data;
      } catch (err) {
        setError('Unable to load participant summary. Please try again.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return {
    signIn,
    signOut,
    loadSummary,
    loading,
    error,
    token,
    setError,
  };
};

