import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {colors} from '@/theme/colors';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
  illustration?: React.ReactNode;
}

export function EmptyState({icon, title, subtitle, ctaLabel, onCta, illustration}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {illustration ?? (
        icon && (
          <View style={styles.iconContainer}>
            <Icon name={icon} size={36} color={colors.accentMid} />
          </View>
        )
      )}

      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {ctaLabel && onCta && (
        <TouchableOpacity style={styles.ctaButton} onPress={onCta} activeOpacity={0.88}>
          <Icon name="plus" size={16} color={colors.white} />
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[12],
    gap: spacing[4],
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(59,130,246,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  title: {
    color: '#FFFFFF',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: 'rgba(235,235,245,0.45)',
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: '#3B82F6',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[3] + 2,
    paddingHorizontal: spacing[6],
    marginTop: spacing[2],
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
