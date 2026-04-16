import React, {ReactNode} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';
import {colors} from '@/theme/colors';
import {spacing, borderRadius, shadow} from '@/theme/spacing';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevated?: boolean;
  padded?: boolean;
  activeOpacity?: number;
}

export function Card({
  children,
  onPress,
  style,
  elevated = false,
  padded = true,
  activeOpacity = 0.82,
}: CardProps) {
  const cardStyles: ViewStyle[] = [
    styles.card,
    elevated ? styles.elevated : styles.default,
    padded && styles.padded,
    style ?? {},
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={activeOpacity}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  default: {},
  elevated: {
    ...shadow.lg,
  },
  padded: {
    padding: spacing[4],
  },
});
