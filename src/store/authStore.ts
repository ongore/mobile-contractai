import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User, AuthSession} from '@/types/auth';

interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  setAuth: (session: AuthSession) => void;
  clearAuth: () => void;
  setHasSeenOnboarding: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      session: null,
      isAuthenticated: false,
      hasSeenOnboarding: false,
      setAuth: (session: AuthSession) =>
        set({
          user: session.user,
          session,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        }),
      setHasSeenOnboarding: (value: boolean) =>
        set({hasSeenOnboarding: value}),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
    },
  ),
);
