import React, { createContext, useContext } from 'react';

const DirectLineTokenContext = createContext();

export const DirectLineTokenProvider = ({ children }) => {
  // This function now returns both the conversation token and any meta we want
  // Backend should return: { token, conversationId, meta: { appToken, sessionId, ... } }
  const getTokenAndMeta = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/bot-token', {
        credentials: 'include', // send cookie
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Failed to get token: ${res.status} ${body}`);
      }
      const data = await res.json();
      // Expect data = { token: '...', conversationId: '...', meta: { appToken: 'abc', ... } }
      if (!data.token) throw new Error('No token in response');
      return data;
    } catch (err) {
      console.error('Failed to fetch token:', err);
      return null;
    }
  };

  return (
    <DirectLineTokenContext.Provider value={{ getTokenAndMeta }}>
      {children}
    </DirectLineTokenContext.Provider>
  );
};

export const useDirectLineToken = () => useContext(DirectLineTokenContext);
