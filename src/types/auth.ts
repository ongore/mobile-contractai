export interface User {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

// ─── Email auth (active) ──────────────────────────────────────────────────────

export interface SendEmailOtpPayload {
  email: string;
}

export interface SendEmailOtpResponse {
  message: string;
  email: string;
}

export interface VerifyEmailOtpPayload {
  email: string;
  token: string;
}

// ─── Phone auth (preserved — swap back in PreAuthNavigator to re-enable) ──────

export interface SendOtpPayload {
  phone: string;
}

export interface SendOtpResponse {
  message: string;
  phone: string;
}

export interface VerifyOtpPayload {
  phone: string;
  token: string;
}

// ─── Generic (used by shared VerifyOtpScreen) ─────────────────────────────────

export type ContactType = 'email' | 'phone';
