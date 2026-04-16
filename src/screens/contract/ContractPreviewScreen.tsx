import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {WebView} from 'react-native-webview';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {MainStackParamList} from '@/navigation/types';
import {colors} from '@/theme/colors';
import {spacing, borderRadius, shadow} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ContractPreview'>;
  route: RouteProp<MainStackParamList, 'ContractPreview'>;
};

export default function ContractPreviewScreen({navigation, route}: Props) {
  const {contractId, pdfUrl} = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color={'#FFFFFF'} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Contract Preview</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* PDF Viewer */}
      <View style={styles.pdfContainer}>
        {loadError ? (
          <View style={styles.errorContainer}>
            <Icon name="file-alert-outline" size={48} color={'rgba(235,235,245,0.45)'} />
            <Text style={styles.errorTitle}>Unable to Load PDF</Text>
            <Text style={styles.errorSubtitle}>{loadError}</Text>
          </View>
        ) : (
          <>
            {isLoading && (
              <View style={styles.pdfLoadingOverlay}>
                <ActivityIndicator color={colors.accent} size="large" />
                <Text style={styles.pdfLoadingText}>Loading contract...</Text>
              </View>
            )}
            <WebView
              source={{uri: pdfUrl}}
              style={styles.pdf}
              onLoadEnd={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setLoadError('Failed to load the PDF.');
              }}
              originWhitelist={['*']}
              startInLoadingState={false}
            />
          </>
        )}
      </View>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarInfo}>
          <Icon
            name="file-document-check-outline"
            size={18}
            color={colors.success}
          />
          <Text style={styles.bottomBarText}>
            Review all pages before signing
          </Text>
        </View>
        <TouchableOpacity
          style={styles.signButton}
          onPress={() => navigation.navigate('Signature', {contractId})}
          activeOpacity={0.9}>
          <Icon name="draw" size={18} color={colors.white} />
          <Text style={styles.signButtonText}>Sign Contract</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    backgroundColor: '#020617',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(84,84,88,0.40)',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#BF5AF2',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  headerSpacer: {
    width: 36,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#020617',
  },
  pdf: {
    flex: 1,
    width: '100%',
    backgroundColor: '#020617',
  },
  pdfLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
    gap: spacing[4],
    zIndex: 10,
  },
  pdfLoadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    padding: spacing[8],
  },
  errorTitle: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  errorSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  bottomBar: {
    backgroundColor: '#020617',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: 'rgba(84,84,88,0.40)',
    gap: spacing[3],
  },
  bottomBarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  bottomBarText: {
    color: 'rgba(235,235,245,0.60)',
    fontSize: fontSize.sm,
  },
  signButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    ...shadow.md,
  },
  signButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
