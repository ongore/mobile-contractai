import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import {Contract} from '@/types/contract';
import {Badge} from '@/components/common/Badge';
import {formatDate, formatContractType} from '@/utils/format';
import {colors} from '@/theme/colors';
import {spacing, borderRadius, shadow} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

interface ContractCardProps {
  contract: Contract;
  onPress: () => void;
}

export function ContractCard({contract, onPress}: ContractCardProps) {
  const typeLabel = formatContractType(contract.type);
  const dateLabel = formatDate(contract.createdAt);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}>
      {/* Left accent bar */}
      <View style={styles.accentBar} />

      <View style={styles.body}>
        {/* Top row */}
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={2}>
            {contract.title}
          </Text>
          <Icon name="chevron-right" size={18} color={colors.border.default} />
        </View>

        {/* Type label */}
        <Text style={styles.type}>{typeLabel}</Text>

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <Badge status={contract.status} size="sm" />
          <View style={styles.dateRow}>
            <Icon name="calendar-outline" size={12} color={colors.muted} />
            <Text style={styles.date}>{dateLabel}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadow.sm,
  },
  accentBar: {
    width: 4,
    backgroundColor: colors.accent,
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
  },
  body: {
    flex: 1,
    padding: spacing[4],
    gap: spacing[2],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  title: {
    flex: 1,
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: 20,
  },
  type: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[1],
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  date: {
    color: colors.muted,
    fontSize: fontSize.xs,
  },
});
