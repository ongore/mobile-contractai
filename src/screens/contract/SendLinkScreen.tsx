import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  StatusBar,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {MainStackParamList} from '@/navigation/types';
import {useCreateSigningLink} from '@/hooks/useContracts';
import {colors} from '@/theme/colors';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'SendLink'>;
  route: RouteProp<MainStackParamList, 'SendLink'>;
};

export default function SendLinkScreen({navigation, route}: Props) {
  const {contractId} = route.params;
  const createLink = useCreateSigningLink();
  const [signingLink, setSigningLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate the signing link as soon as the screen mounts
  useEffect(() => {
    generateLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateLink = async () => {
    setError(null);
    try {
      const result = await createLink.mutateAsync({id: contractId});
      setSigningLink(result.signingLink);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Could not generate a signing link. Please try again.',
      );
    }
  };

  const handleCopy = async () => {
    if (signingLink) {
      await Clipboard.setStringAsync(signingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    if (signingLink) {
      try {
        await Share.share({
          message: `Please review and sign this contract: ${signingLink}`,
          title: 'Sign Contract',
        });
      } catch {
        // User dismissed share sheet
      }
    }
  };

  const handleViewContract = () => {
    navigation.navigate('ContractDetail', {contractId});
  };

  const renderBody = () => {
    // Loading state
    if (createLink.isPending) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.loadingText}>Generating your signing link…</Text>
        </View>
      );
    }

    // Error state
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconWrap}>
            <Icon name="alert-circle-outline" size={40} color={colors.danger} />
          </View>
          <Text style={styles.errorTitle}>Link Generation Failed</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={generateLink}>
            <Icon name="refresh" size={16} color={colors.white} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Success state
    if (signingLink) {
      return (
        <View style={styles.successContent}>
          {/* Success badge */}
          <View style={styles.successBadge}>
            <View style={styles.successIcon}>
              <Icon name="check-circle" size={32} color={colors.success} />
            </View>
            <View style={styles.successText}>
              <Text style={styles.successTitle}>Contract Signed!</Text>
              <Text style={styles.successSubtitle}>
                Share the link below with the other party to collect their signature.
              </Text>
            </View>
          </View>

          {/* Link card */}
          <View style={styles.linkCard}>
            <Text style={styles.linkLabel}>Signing Link</Text>
            <View style={styles.linkBox}>
              <Text style={styles.linkText} numberOfLines={3}>
                {signingLink}
              </Text>
            </View>

            {/* Copy / Share row */}
            <View style={styles.linkActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleCopy} activeOpacity={0.8}>
                <Icon
                  name={copied ? 'check' : 'content-copy'}
                  size={18}
                  color={copied ? colors.success : colors.white}
                />
                <Text style={[styles.actionButtonText, copied && styles.actionButtonTextCopied]}>
                  {copied ? 'Copied!' : 'Copy Link'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.shareButton]}
                onPress={handleShare}
                activeOpacity={0.8}>
                <Icon name="share-variant" size={18} color={'#FF5C28'} />
                <Text style={[styles.actionButtonText, {color: '#FF5C28'}]}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* What happens next */}
          <View style={styles.nextSteps}>
            <Text style={styles.nextStepsTitle}>What happens next?</Text>
            {(
              [
                {icon: 'send-outline', text: 'Send the link to the other party via any app'},
                {icon: 'draw', text: 'They review and sign the contract in their browser'},
                {icon: 'bell-ring-outline', text: "You'll be notified when they sign"},
              ] as const
            ).map((step, i) => (
              <View key={i} style={styles.nextStep}>
                <View style={styles.nextStepIcon}>
                  <Icon name={step.icon} size={15} color={'#FF5C28'} />
                </View>
                <Text style={styles.nextStepText}>{step.text}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F5F2" />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color={'#FF5C28'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share Contract</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Body */}
        <View style={styles.body}>{renderBody()}</View>

        {/* Footer — only shown once link is ready */}
        {signingLink && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => navigation.navigate('HomeTabs', {screen: 'Contracts'})}
              activeOpacity={0.8}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={handleViewContract}
              activeOpacity={0.9}>
              <Text style={styles.viewButtonText}>View Contract</Text>
              <Icon name="arrow-right" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED8',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF0EB',
    borderWidth: 1,
    borderColor: '#FF5C28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#111111',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 36,
  },
  body: {
    flex: 1,
    padding: spacing[5],
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
  },
  loadingText: {
    color: '#8C8C8C',
    fontSize: fontSize.base,
  },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
    paddingHorizontal: spacing[4],
  },
  errorIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    color: '#111111',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },
  errorSubtitle: {
    color: '#8C8C8C',
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: '#FF5C28',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
  },
  retryButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },

  // Success
  successContent: {
    gap: spacing[5],
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  successIcon: {
    marginTop: 2,
  },
  successText: {
    flex: 1,
  },
  successTitle: {
    color: '#34D399',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  successSubtitle: {
    color: '#8C8C8C',
    fontSize: fontSize.sm,
    lineHeight: 18,
  },

  // Link card
  linkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    gap: spacing[3],
    borderWidth: 1,
    borderColor: '#E2DED8',
  },
  linkLabel: {
    color: '#8C8C8C',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.1,
  },
  linkBox: {
    backgroundColor: '#F7F5F2',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: '#E2DED8',
  },
  linkText: {
    color: '#8C8C8C',
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  linkActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: '#FF5C28',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[3],
  },
  shareButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FF5C28',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  actionButtonTextCopied: {
    color: '#FFFFFF',
  },

  // Next steps
  nextSteps: {
    gap: spacing[3],
  },
  nextStepsTitle: {
    color: '#8C8C8C',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  nextStepIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepText: {
    flex: 1,
    color: '#8C8C8C',
    fontSize: fontSize.sm,
    lineHeight: 18,
  },

  // Footer
  footer: {
    padding: spacing[5],
    gap: spacing[3],
    borderTopWidth: 1,
    borderTopColor: '#E2DED8',
    backgroundColor: '#F7F5F2',
  },
  doneButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[3] + 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2DED8',
  },
  doneButtonText: {
    color: '#8C8C8C',
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: '#FF5C28',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[4] + 2,
    shadowColor: '#FF5C28',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  viewButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.1,
  },
});
