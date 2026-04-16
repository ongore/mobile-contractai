import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {Contract} from '@/types/contract';
import {formatDate, formatContractType} from '@/utils/format';
import {spacing} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

interface ContractCardProps {
  contract: Contract;
  onPress: () => void;
}

// Glass card style
const GLASS = {
  backgroundColor: 'rgba(15, 23, 42, 0.80)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
} as const;

type TK = 'service_agreement' | 'freelance_agreement' | 'payment_agreement' | 'general_agreement';
const CFG: Record<TK, {icon: string; color: string}> = {
  service_agreement:   {icon: 'briefcase-outline',     color: '#3B82F6'},
  freelance_agreement: {icon: 'laptop',                color: '#8B5CF6'},
  payment_agreement:   {icon: 'currency-usd',          color: '#10B981'},
  general_agreement:   {icon: 'file-document-outline', color: '#D946EF'},
};
const DEFAULT = CFG.general_agreement;

const STATUS_BADGE: Record<string, {label: string; color: string}> = {
  draft:           {label: 'Draft',     color: '#8B5CF6'},
  generated:       {label: 'Generated', color: '#3B82F6'},
  signed_by_me:    {label: 'Signed',    color: '#3B82F6'},
  sent:            {label: 'Sent',      color: '#F59E0B'},
  viewed:          {label: 'Viewed',    color: '#F59E0B'},
  signed_by_other: {label: 'Signed ✓', color: '#10B981'},
  completed:       {label: 'Complete',  color: '#10B981'},
};

export function ContractCard({contract, onPress}: ContractCardProps) {
  const typeLabel = formatContractType(contract.type);
  const dateLabel = formatDate(contract.createdAt);
  const cfg       = CFG[contract.type as TK] ?? DEFAULT;
  const badge     = STATUS_BADGE[contract.status] ?? {label: contract.status, color: '#94A3B8'};

  return (
    <TouchableOpacity
      style={[s.card, GLASS]}
      onPress={onPress}
      activeOpacity={0.65}
      accessibilityRole="button">

      {/* Icon – dark box with colored icon, hover effect from HTML */}
      <View style={[s.iconBox, {borderColor: `${cfg.color}22`}]}>
        <Icon name={cfg.icon} size={20} color={cfg.color} />
      </View>

      {/* Body */}
      <View style={s.body}>
        <Text style={s.title} numberOfLines={1}>{contract.title}</Text>
        <View style={s.meta}>
          <Text style={s.metaText}>{typeLabel}</Text>
          <Text style={s.metaDot}>·</Text>
          <Text style={s.metaText}>{dateLabel}</Text>
        </View>
      </View>

      {/* Outlined pill badge — matches HTML design */}
      <View style={[s.badge, {borderColor: `${badge.color}40`}]}>
        <Text style={[s.badgeText, {color: badge.color}]}>{badge.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginHorizontal: spacing[5],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderRadius: 20,
    marginVertical: 3,
  },
  iconBox: {
    width: 46, height: 46,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  body: {flex: 1, gap: 4},
  title: {
    color: '#F8FAFC',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.15,
  },
  meta: {flexDirection: 'row', alignItems: 'center', gap: 5},
  metaText: {color: '#475569', fontSize: 11, fontWeight: fontWeight.medium},
  metaDot: {color: '#334155', fontSize: 11},
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
