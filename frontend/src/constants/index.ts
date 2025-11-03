export const TOKEN_STORAGE_KEY = 'participant-demo-token';

export const DEFAULT_CREDENTIALS = {
  email: 'neha.tanwar@kornferry.com',
  password: 'Neha@123',
};

export const AUTH_MODE_LABELS: Record<'cookie' | 'token', string> = {
  cookie: 'Session Cookie',
  token: 'Bearer Token',
} as const;

export const API_ENDPOINTS = {
  SIGN_IN_COOKIE: '/auth/sign-in-cookie',
  SIGN_IN_TOKEN: '/auth/sign-in-token',
  SESSION: '/auth/session',
  SIGN_OUT: '/auth/sign-out',
  PARTICIPANT_SUMMARY: '/participant-summary',
  BOT_TOKEN: '/api/bot-token',
} as const;

