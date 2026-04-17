import {useMutation} from '@tanstack/react-query';
import {authApi} from '@/api/auth';
import {useAuthStore} from '@/store/authStore';
import {AuthSession, ContactType} from '@/types/auth';

// ─── Email OTP (active) ──────────────────────────────────────────────────────

/**
 * Send an OTP to an email address.
 */
export function useSendEmailOtp() {
  return useMutation({
    mutationFn: (email: string) => authApi.sendEmailOtp(email),
  });
}

/**
 * Resend the OTP to the same email address.
 */
export function useResendEmailOtp() {
  return useMutation({
    mutationFn: (email: string) => authApi.sendEmailOtp(email),
  });
}

// ─── Phone OTP (preserved) ───────────────────────────────────────────────────

/**
 * Send an OTP to a phone number (E.164 format).
 */
export function useSendOtp() {
  return useMutation({
    mutationFn: (phone: string) => authApi.sendOtp(phone),
  });
}

/**
 * Resend the OTP to the same phone number.
 */
export function useResendOtp() {
  return useMutation({
    mutationFn: (phone: string) => authApi.sendOtp(phone),
  });
}

// ─── Generic verify (used by shared VerifyOtpScreen) ────────────────────────

/**
 * Verify OTP and establish a session.
 * Works for both email and phone — pass contactType to distinguish.
 */
export function useVerifyOtp() {
  const setAuth = useAuthStore(s => s.setAuth);

  return useMutation({
    mutationFn: ({contact, token, contactType}: {contact: string; token: string; contactType: ContactType}) =>
      authApi.verifyOtp(contact, token, contactType),
    onSuccess: (session: AuthSession) => {
      setAuth(session);
    },
  });
}

/**
 * Complete profile setup (name) for a new user.
 * Marks needsProfileSetup as false in the store.
 */
export function useCompleteProfile() {
  const setProfileComplete = useAuthStore(s => s.setProfileComplete);

  return useMutation({
    mutationFn: (name: string) => authApi.syncProfile(name),
    onSuccess: (_user, name) => {
      setProfileComplete(name);
    },
  });
}

/**
 * Sign out and clear local auth state.
 */
export function useSignOut() {
  const clearAuth = useAuthStore(s => s.clearAuth);

  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => clearAuth(),
    onError:   () => clearAuth(), // Clear locally even if server fails
  });
}

/**
 * Delete account and clear local auth state.
 */
export function useDeleteAccount() {
  const clearAuth = useAuthStore(s => s.clearAuth);

  return useMutation({
    mutationFn: () => authApi.deleteAccount(),
    onSuccess: () => clearAuth(),
  });
}
