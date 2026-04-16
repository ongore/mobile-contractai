import type {NavigatorScreenParams} from '@react-navigation/native';
import type {InputMethod, ExtractedField, ContractType} from '@/types/contract';

// ─── Root ────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  OnboardingStack: NavigatorScreenParams<OnboardingStackParamList>;
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  MainStack: NavigatorScreenParams<MainStackParamList>;
};

// ─── Onboarding ──────────────────────────────────────────────────────────────

export type OnboardingStackParamList = {
  Welcome: undefined;
  OnboardingStep1: undefined;
  OnboardingStep2: undefined;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  SignIn: undefined;
  VerifyOtp: {email: string};
};

// ─── Main ────────────────────────────────────────────────────────────────────

export type MainStackParamList = {
  HomeTabs: NavigatorScreenParams<HomeTabsParamList>;
  InputMethod: {method: InputMethod};
  ExtractReview: {
    fields: ExtractedField[];
    method: InputMethod;
    rawInput?: string;
  };
  ContractPreview: {contractId: string; pdfUrl: string};
  Signature: {contractId: string};
  SendLink: {contractId: string};
  ContractDetail: {contractId: string};
  Settings: undefined;
};

// ─── Home Tabs ────────────────────────────────────────────────────────────────

export type HomeTabsParamList = {
  Contracts: undefined;
  Account:   undefined;
};
