import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {User, AuthSession} from '@/types/auth';

interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  hasSeenOnboarding: boolean;
  /** True after verifyOtp when the user is brand-new — stays true until profile setup completes. */
  needsProfileSetup: boolean;

  setAuth: (session: AuthSession) => void;
  setProfileComplete: (name: string) => void;
  updateUser: (updates: Partial<User>) => void;
  clearAuth: () => void;
  setHasSeenOnboarding: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user:               null,
      session:            null,
      isAuthenticated:    false,
      hasSeenOnboarding:  false,
      needsProfileSetup:  false,

      setAuth: (session: AuthSession) =>
        set({
          user:              session.user,
          session,
          isAuthenticated:   true,
          needsProfileSetup: session.isNewUser,
        }),

      setProfileComplete: (name: string) =>
        set(state => ({
          needsProfileSetup: false,
          user: state.user ? { ...state.user, name } : state.user,
        })),

      updateUser: (updates: Partial<User>) =>
        set(state => ({
          user: state.user ? { ...state.user, ...updates } : state.user,
        })),

      clearAuth: () =>
        set({
          user:              null,
          session:           null,
          isAuthenticated:   false,
          needsProfileSetup: false,
        }),

      setHasSeenOnboarding: (value: boolean) =>
        set({hasSeenOnboarding: value}),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persisted: any, version: number) => {
        if (version === 0) {
          return {...persisted, hasSeenOnboarding: false};
        }
        return persisted;
      },
      partialize: state => ({
        user:              state.user,
        session:           state.session,
        isAuthenticated:   state.isAuthenticated,
        hasSeenOnboarding: state.hasSeenOnboarding,
        needsProfileSetup: state.needsProfileSetup,
      }),
    },
  ),
);
