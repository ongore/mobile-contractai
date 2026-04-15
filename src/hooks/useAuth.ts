import {useMutation} from '@tanstack/react-query';
import {authApi} from '@/api/auth';
import {useAuthStore} from '@/store/authStore';
import {AuthSession} from '@/types/auth';

/**
 * Mutation to send an OTP to the user's email.
 */
export function useSignIn() {
  return useMutation({
    mutationFn: (email: string) => authApi.sendOtp(email),
  });
}

/**
 * Mutation to verify an OTP and establish a session.
 */
export function useVerifyOtp() {
  const setAuth = useAuthStore(s => s.setAuth);

  return useMutation({
    mutationFn: ({email, otp}: {email: string; otp: string}) =>
      authApi.verifyOtp(email, otp),
    onSuccess: (session: AuthSession) => {
      setAuth(session);
    },
  });
}

/**
 * Mutation to sign the user out and clear local state.
 */
export function useSignOut() {
  const clearAuth = useAuthStore(s => s.clearAuth);

  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      clearAuth();
    },
    onError: () => {
      // Clear local state even if server-side sign out fails
      clearAuth();
    },
  });
}

/**
 * Mutation to delete the user's account and clear local state.
 */
export function useDeleteAccount() {
  const clearAuth = useAuthStore(s => s.clearAuth);

  return useMutation({
    mutationFn: () => authApi.deleteAccount(),
    onSuccess: () => {
      clearAuth();
    },
  });
}
