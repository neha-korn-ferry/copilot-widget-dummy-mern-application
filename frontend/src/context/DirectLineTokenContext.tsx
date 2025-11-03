import React, { createContext, useContext, useCallback } from 'react';
import apiClient from '../services/api.service';
import { API_ENDPOINTS } from '../constants';
import { BotTokenResponse } from '../types';

interface DirectLineTokenContextValue {
  getTokenAndMeta: () => Promise<BotTokenResponse | null>;
}

const DirectLineTokenContext = createContext<DirectLineTokenContextValue | undefined>(undefined);

interface DirectLineTokenProviderProps {
  children: React.ReactNode;
}

export const DirectLineTokenProvider: React.FC<DirectLineTokenProviderProps> = ({ children }) => {
  const getTokenAndMeta = useCallback(async (): Promise<BotTokenResponse | null> => {
    try {
      const res = await apiClient.get<BotTokenResponse>(API_ENDPOINTS.BOT_TOKEN, {
        withCredentials: true,
      });

      if (!res.data.token) {
        throw new Error('No token in response');
      }

      return res.data;
    } catch (err) {
      console.error('Failed to fetch token:', err);
      return null;
    }
  }, []);

  return (
    <DirectLineTokenContext.Provider value={{ getTokenAndMeta }}>
      {children}
    </DirectLineTokenContext.Provider>
  );
};

export const useDirectLineToken = (): DirectLineTokenContextValue => {
  const context = useContext(DirectLineTokenContext);
  if (!context) {
    throw new Error('useDirectLineToken must be used within DirectLineTokenProvider');
  }
  return context;
};

