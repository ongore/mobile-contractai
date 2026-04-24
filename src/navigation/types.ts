import type {NavigatorScreenParams} from '@react-navigation/native';
import type {InputMethod, ExtractedField} from '@/types/contract';

// ─── Root ────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  /** Pre-auth: onboarding slides + phone entry + OTP + profile setup */
  PreAuthStack: NavigatorScreenParams<PreAuthStackParamList>;
  /** Main app after authentication */
  MainStack: NavigatorScreenParams<MainStackParamList>;
};

// ─── Pre-Auth (Onboarding + Auth merged) ─────────────────────────────────────

export type PreAuthStackParamList = {
  /** 3-slide feature walkthrough — skipped for returning users */
  Onboarding: undefined;
  /** Email entry — entry point for returning users */
  EmailEntry: undefined;
  /** 6-digit OTP verification — contact is email or phone (E.164) */
  VerifyOtp: {contact: string; contactType: 'email' | 'phone'};
  /** Name / profile setup for brand-new users */
  ProfileSetup: undefined;
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
  Paywall: undefined;
  Settings: undefined;
};

// ─── Home Tabs ────────────────────────────────────────────────────────────────

export type HomeTabsParamList = {
  Contracts: undefined;
  Account:   undefined;
};
