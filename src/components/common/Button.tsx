import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View,
} from 'react-native';
import {colors} from '@/theme/colors';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  label,
  style,
  textStyle,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyles: ViewStyle[] = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style ?? {},
  ];

  const labelStyles: TextStyle[] = [
    styles.label,
    styles[`label_${variant}`],
    styles[`labelSize_${size}`],
    textStyle ?? {},
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      disabled={isDisabled}
      activeOpacity={0.85}
      {...rest}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' || variant === 'secondary' ? colors.white : colors.accentMid}
        />
      ) : (
        <View style={styles.inner}>
          {leftIcon != null && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={labelStyles}>{label}</Text>
          {rightIcon != null && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: spacing[2],
  },
  iconRight: {
    marginLeft: spacing[2],
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },

  // Variants
  variant_primary: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  variant_secondary: {
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },

  // Sizes
  size_sm: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
  },
  size_md: {
    paddingVertical: spacing[3] + 2,
    paddingHorizontal: spacing[5],
  },
  size_lg: {
    paddingVertical: spacing[4] + 2,
    paddingHorizontal: spacing[6],
  },

  // Labels
  label: {
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.1,
  },
  label_primary: {
    color: colors.white,
  },
  label_secondary: {
    color: colors.text.primary,
  },
  label_outline: {
    color: '#3B82F6',
  },
  label_ghost: {
    color: '#3B82F6',
  },
  label_danger: {
    color: colors.white,
  },

  // Label sizes
  labelSize_sm: {
    fontSize: fontSize.sm,
  },
  labelSize_md: {
    fontSize: fontSize.base,
  },
  labelSize_lg: {
    fontSize: fontSize.lg,
  },
});
