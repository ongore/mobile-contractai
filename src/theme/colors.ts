export const colors = {
  // Brand
  primary: '#1A1A2E',
  accent: '#4F46E5',
  surface: '#F8F9FF',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  muted: '#6B7280',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Accent shades
  accentLight: '#EEF2FF',
  accentMid: '#818CF8',
  accentDark: '#3730A3',

  // Semantic tokens
  text: {
    primary: '#1A1A2E',
    secondary: '#4B5563',
    muted: '#9CA3AF',
    inverse: '#FFFFFF',
    accent: '#4F46E5',
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FF',
    tertiary: '#F3F4F6',
    inverse: '#1A1A2E',
    accent: '#EEF2FF',
  },
  border: {
    light: '#E5E7EB',
    default: '#D1D5DB',
    strong: '#9CA3AF',
    accent: '#4F46E5',
    focus: '#4F46E5',
  },
  status: {
    draft: '#6B7280',
    draftBg: '#F3F4F6',
    generated: '#2563EB',
    generatedBg: '#EFF6FF',
    signedByMe: '#4F46E5',
    signedByMeBg: '#EEF2FF',
    sent: '#D97706',
    sentBg: '#FFFBEB',
    viewed: '#D97706',
    viewedBg: '#FFFBEB',
    signedByOther: '#059669',
    signedByOtherBg: '#ECFDF5',
    completed: '#059669',
    completedBg: '#ECFDF5',
  },
} as const;

export type Colors = typeof colors;
