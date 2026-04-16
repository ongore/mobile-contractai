// Neon Gavel — slate-950 dark + blue/violet gradient system
export const colors = {
  // Brand gradient – blue → violet
  primary:    '#3B82F6',   // blue-500
  secondary:  '#8B5CF6',   // violet-500
  tertiary:   '#D946EF',   // fuchsia-500
  accent:     '#3B82F6',
  accentAlt:  '#8B5CF6',
  accentMid:  '#3B82F6',
  accentLight:'rgba(59,130,246,0.15)',
  accentFg:   '#FFFFFF',

  // System status
  success: '#10B981',   // emerald-500
  warning: '#F59E0B',   // amber-500
  danger:  '#EF4444',   // red-500
  info:    '#3B82F6',

  white: '#FFFFFF',
  black: '#020617',     // slate-950

  // Slate scale
  slate950: '#020617',
  slate900: '#0F172A',
  slate800: '#1E293B',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748B',
  slate400: '#94A3B8',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate50:  '#F8FAFC',

  // Semantic tokens
  text: {
    primary:    '#F8FAFC',
    secondary:  '#94A3B8',
    tertiary:   '#64748B',
    quaternary: 'rgba(255,255,255,0.15)',
    inverse:    '#020617',
    accent:     '#3B82F6',
    success:    '#10B981',
    warning:    '#F59E0B',
    danger:     '#EF4444',
    muted:      '#64748B',
  },
  background: {
    primary:   '#020617',             // slate-950
    secondary: '#0F172A',             // slate-900
    tertiary:  '#1E293B',             // slate-800
    elevated:  'rgba(15, 23, 42, 0.85)', // glass
    inverse:   '#FFFFFF',
    accent:    'rgba(59,130,246,0.10)',
  },
  border: {
    opaque:  '#1E293B',
    light:   'rgba(255,255,255,0.08)',
    subtle:  'rgba(255,255,255,0.05)',
    hair:    'rgba(255,255,255,0.03)',
    accent:  '#3B82F6',
    focus:   '#3B82F6',
    default: 'rgba(255,255,255,0.08)',
  },
  status: {
    draft:           '#8B5CF6',
    draftBg:         'rgba(139,92,246,0.10)',
    generated:       '#3B82F6',
    generatedBg:     'rgba(59,130,246,0.10)',
    signedByMe:      '#3B82F6',
    signedByMeBg:    'rgba(59,130,246,0.10)',
    sent:            '#F59E0B',
    sentBg:          'rgba(245,158,11,0.10)',
    viewed:          '#F59E0B',
    viewedBg:        'rgba(245,158,11,0.10)',
    signedByOther:   '#10B981',
    signedByOtherBg: 'rgba(16,185,129,0.10)',
    completed:       '#10B981',
    completedBg:     'rgba(16,185,129,0.10)',
  },
} as const;

export type Colors = typeof colors;
