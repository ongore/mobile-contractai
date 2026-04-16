import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ContractStatus} from '@/types/contract';
import {colors} from '@/theme/colors';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

interface StatusConfig {
  label: string;
  color: string;
  backgroundColor: string;
  dotColor: string;
}

const STATUS_CONFIG: Record<ContractStatus, StatusConfig> = {
  draft: {
    label: 'Draft',
    color: '#8B5CF6',
    backgroundColor: 'transparent',
    dotColor: '#8B5CF6',
  },
  generated: {
    label: 'Generated',
    color: '#3B82F6',
    backgroundColor: 'transparent',
    dotColor: '#3B82F6',
  },
  signed_by_me: {
    label: 'Signed',
    color: '#3B82F6',
    backgroundColor: 'transparent',
    dotColor: '#3B82F6',
  },
  sent: {
    label: 'Sent',
    color: '#F59E0B',
    backgroundColor: 'transparent',
    dotColor: '#F59E0B',
  },
  viewed: {
    label: 'Viewed',
    color: '#F59E0B',
    backgroundColor: 'transparent',
    dotColor: '#F59E0B',
  },
  signed_by_other: {
    label: 'Signed ✓',
    color: '#10B981',
    backgroundColor: 'transparent',
    dotColor: '#10B981',
  },
  completed: {
    label: 'Complete',
    color: '#10B981',
    backgroundColor: 'transparent',
    dotColor: '#10B981',
  },
};

interface BadgeProps {
  status: ContractStatus;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export function Badge({status, size = 'md', showDot = true}: BadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View style={[
      styles.badge,
      {backgroundColor: config.backgroundColor, borderColor: `${config.color}40`},
      size === 'sm' && styles.badgeSm,
    ]}>
      {showDot && (
        <View style={[
          styles.dot,
          {backgroundColor: config.dotColor},
          size === 'sm' && styles.dotSm,
        ]} />
      )}
      <Text style={[
        styles.label,
        {color: config.color},
        size === 'sm' && styles.labelSm,
      ]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[2] + 2,
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotSm: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
  labelSm: {
    fontSize: 10,
  },
});
