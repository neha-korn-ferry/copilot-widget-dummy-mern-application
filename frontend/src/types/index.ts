export type AuthMode = 'cookie' | 'token';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ParticipantSummary {
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

export interface SignInResponse {
  message: string;
  token?: string;
  user: User;
  session?: {
    id: string;
    expiresAt: number;
  };
}

export interface BotTokenResponse {
  token: string;
  conversationId?: string;
  meta?: Record<string, unknown>;
  expires_in?: number;
}

