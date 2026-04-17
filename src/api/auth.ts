import apiClient from './client';
import {
  AuthSession, User,
  SendEmailOtpPayload, SendEmailOtpResponse, VerifyEmailOtpPayload,
  SendOtpPayload, SendOtpResponse, VerifyOtpPayload,
  ContactType,
} from '@/types/auth';

export const authApi = {
  // ─── Email OTP (active) ─────────────────────────────────────────────────────

  /**
   * Send a one-time code to the given email address.
   */
  sendEmailOtp: async (email: string): Promise<SendEmailOtpResponse> => {
    const payload: SendEmailOtpPayload = {email};
    const {data} = await apiClient.post<SendEmailOtpResponse>('/auth/send-otp', payload);
    return data;
  },

  // ─── Phone OTP (preserved — uncomment sendOtp usage in hooks to re-enable) ──

  /**
   * Send a one-time SMS code to the given phone number (E.164 format).
   */
  sendOtp: async (phone: string): Promise<SendOtpResponse> => {
    const payload: SendOtpPayload = {phone};
    const {data} = await apiClient.post<SendOtpResponse>('/auth/send-otp', payload);
    return data;
  },

  // ─── Generic verify (works for both email and phone) ────────────────────────

  /**
   * Verify the OTP token and return a full auth session.
   * isNewUser indicates whether this is the user's first sign-in.
   */
  verifyOtp: async (contact: string, token: string, contactType: ContactType): Promise<AuthSession> => {
    const payload = contactType === 'email'
      ? {email: contact, token} as VerifyEmailOtpPayload
      : {phone: contact, token} as VerifyOtpPayload;
    const {data} = await apiClient.post<AuthSession>('/auth/verify-otp', payload);
    return data;
  },

  /**
   * Sync user profile (name, etc.) after sign-in. Requires auth token.
   */
  syncProfile: async (name: string): Promise<User> => {
    const {data} = await apiClient.post<User>('/auth/sync', {name});
    return data;
  },

  /**
   * Return the current authenticated user's profile.
   */
  getMe: async (): Promise<User> => {
    const {data} = await apiClient.get<User>('/auth/me');
    return data;
  },

  /**
   * Sign out (client-side only — no server session to invalidate).
   */
  signOut: async (): Promise<void> => {
    await apiClient.post('/auth/sign-out');
  },

  /**
   * Permanently delete the current user's account.
   */
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/auth/delete-account');
  },
};
