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
}

const STATUS_CONFIG: Record<ContractStatus, StatusConfig> = {
  draft: {
    label: 'Draft',
    color: colors.status.draft,
    backgroundColor: colors.status.draftBg,
  },
  generated: {
    label: 'Generated',
    color: colors.status.generated,
    backgroundColor: colors.status.generatedBg,
  },
  signed_by_me: {
    label: 'Signed',
    color: colors.status.signedByMe,
    backgroundColor: colors.status.signedByMeBg,
  },
  sent: {
    label: 'Sent',
    color: colors.status.sent,
    backgroundColor: colors.status.sentBg,
  },
  viewed: {
    label: 'Viewed',
    color: colors.status.viewed,
    backgroundColor: colors.status.viewedBg,
  },
  signed_by_other: {
    label: 'Signed ✓',
    color: colors.status.signedByOther,
    backgroundColor: colors.status.signedByOtherBg,
  },
  completed: {
    label: 'Completed',
    color: colors.status.completed,
    backgroundColor: colors.status.completedBg,
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
    <View
      style={[
        styles.badge,
        {backgroundColor: config.backgroundColor},
        size === 'sm' && styles.badgeSm,
      ]}>
      {showDot && (
        <View
          style={[
            styles.dot,
            {backgroundColor: config.color},
            size === 'sm' && styles.dotSm,
          ]}
        />
      )}
      <Text
        style={[
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
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotSm: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
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
