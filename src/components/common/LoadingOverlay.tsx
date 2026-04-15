import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from 'react-native';
import {colors} from '@/theme/colors';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize} from '@/theme/typography';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

export function LoadingOverlay({
  visible,
  message,
  transparent = false,
}: LoadingOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <View style={[styles.overlay, transparent && styles.overlayTransparent]}>
        <View style={styles.card}>
          <ActivityIndicator color={colors.accent} size="large" />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTransparent: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius['2xl'],
    padding: spacing[8],
    alignItems: 'center',
    gap: spacing[4],
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  message: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    maxWidth: 180,
  },
});
