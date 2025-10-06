export interface DemoUser {
  id: string;
  name: string;
  email: string;
}

export type AuthMethod = "token" | "cookie";

export interface AuthContext {
  user: DemoUser;
  method: AuthMethod;
  token?: string;
  sessionId?: string;
  expiresAt?: number;
}

