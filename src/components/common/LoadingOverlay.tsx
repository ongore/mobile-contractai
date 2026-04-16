import React from 'react';
import {View, Text, ActivityIndicator, StyleSheet, Modal} from 'react-native';
import {colors} from '@/theme/colors';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize} from '@/theme/typography';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
}

export function LoadingOverlay({visible, message, transparent = false}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={[styles.overlay, transparent && styles.overlayTransparent]}>
        <View style={styles.card}>
          <ActivityIndicator color="#3B82F6" size="large" />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTransparent: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  card: {
    backgroundColor: '#0D0D1A',
    borderRadius: borderRadius['2xl'],
    padding: spacing[8],
    alignItems: 'center',
    gap: spacing[4],
    minWidth: 140,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 14,
  },
  message: {
    color: 'rgba(235,235,245,0.45)',
    fontSize: fontSize.sm,
    textAlign: 'center',
    maxWidth: 180,
  },
});
