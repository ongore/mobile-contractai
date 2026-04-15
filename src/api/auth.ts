import apiClient from './client';
import {
  AuthSession,
  User,
  SendOtpPayload,
  SendOtpResponse,
  VerifyOtpPayload,
} from '@/types/auth';

export const authApi = {
  /**
   * Send a one-time password to the given email address.
   */
  sendOtp: async (email: string): Promise<SendOtpResponse> => {
    const payload: SendOtpPayload = {email};
    const {data} = await apiClient.post<SendOtpResponse>(
      '/auth/send-otp',
      payload,
    );
    return data;
  },

  /**
   * Verify the OTP and return a full auth session.
   */
  verifyOtp: async (email: string, otp: string): Promise<AuthSession> => {
    const payload: VerifyOtpPayload = {email, otp};
    const {data} = await apiClient.post<AuthSession>(
      '/auth/verify-otp',
      payload,
    );
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
   * Sign out the current user (invalidate server-side session).
   */
  signOut: async (): Promise<void> => {
    await apiClient.post('/auth/sign-out');
  },

  /**
   * Delete the current user's account permanently.
   */
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/auth/delete-account');
  },
};
