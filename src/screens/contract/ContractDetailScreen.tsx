import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import {MainStackParamList} from '@/navigation/types';
import {useContract} from '@/hooks/useContracts';
import {useCreateSigningLink} from '@/hooks/useContracts';
import {Badge} from '@/components/common/Badge';
import {StatusTimeline} from '@/components/contract/StatusTimeline';
import {formatDate, formatContractType} from '@/utils/format';
import {colors} from '@/theme/colors';
import {spacing, borderRadius, shadow} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';
import {ContractStatus} from '@/types/contract';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ContractDetail'>;
  route: RouteProp<MainStackParamList, 'ContractDetail'>;
};

export default function ContractDetailScreen({navigation, route}: Props) {
  const {contractId} = route.params;
  const {data: contract, isLoading} = useContract(contractId, true); // enable polling
  const resendLink = useCreateSigningLink();
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = async () => {
    if (contract?.signingLink) {
      await Clipboard.setStringAsync(contract.signingLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleResendLink = () => {
    if (!contract?.otherPartyEmail) {
      Alert.alert(
        'No Email on File',
        "We don't have the other party's email. Please create a new signing link.",
      );
      return;
    }

    Alert.alert(
      'Resend Link',
      `Resend signing link to ${contract.otherPartyEmail}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Resend',
          onPress: async () => {
            try {
              await resendLink.mutateAsync({
                id: contractId,
                otherPartyEmail: contract.otherPartyEmail!,
                otherPartyName: contract.otherPartyName,
              });
              Alert.alert('Sent!', 'The signing link has been resent.');
            } catch {
              Alert.alert('Error', 'Failed to resend. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleViewPdf = () => {
    if (contract?.pdfUrl) {
      navigation.navigate('ContractPreview', {
        contractId,
        pdfUrl: contract.pdfUrl,
      });
    }
  };

  if (isLoading && !contract) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.loadingText}>Loading contract...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!contract) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Contract
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Title card */}
        <View style={styles.titleCard}>
          <View style={styles.titleRow}>
            <Text style={styles.contractTitle} numberOfLines={2}>
              {contract.title}
            </Text>
            <Badge status={contract.status} />
          </View>
          <Text style={styles.contractType}>
            {formatContractType(contract.type)}
          </Text>
          <Text style={styles.contractDate}>
            Created {formatDate(contract.createdAt)}
          </Text>
        </View>

        {/* Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Timeline</Text>
          <StatusTimeline currentStatus={contract.status} />
        </View>

        {/* Parties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parties</Text>
          <View style={styles.partiesCard}>
            <View style={styles.party}>
              <View style={styles.partyAvatar}>
                <Icon name="account" size={16} color={colors.accent} />
              </View>
              <View style={styles.partyInfo}>
                <Text style={styles.partyRole}>Party 1 (You)</Text>
                <Text style={styles.partyValue}>
                  {contract.extractedFields.find(f => f.key === 'party1Name')
                    ?.value ?? 'Not specified'}
                </Text>
              </View>
              {contract.mySignature && (
                <Icon name="check-circle" size={16} color={colors.success} />
              )}
            </View>

            <View style={styles.partyDivider} />

            <View style={styles.party}>
              <View style={[styles.partyAvatar, {backgroundColor: '#FFFBEB'}]}>
                <Icon name="account-outline" size={16} color={colors.warning} />
              </View>
              <View style={styles.partyInfo}>
                <Text style={styles.partyRole}>
                  Party 2{contract.otherPartyName ? ` (${contract.otherPartyName})` : ''}
                </Text>
                <Text style={styles.partyValue}>
                  {contract.otherPartyEmail ??
                    contract.extractedFields.find(f => f.key === 'party2Name')
                      ?.value ??
                    'Not specified'}
                </Text>
              </View>
              {contract.otherPartySignature ? (
                <Icon name="check-circle" size={16} color={colors.success} />
              ) : (
                <Icon
                  name="clock-outline"
                  size={16}
                  color={colors.warning}
                />
              )}
            </View>
          </View>
        </View>

        {/* PDF Preview */}
        {contract.pdfUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document</Text>
            <TouchableOpacity
              style={styles.pdfCard}
              onPress={handleViewPdf}
              activeOpacity={0.85}>
              <View style={styles.pdfIcon}>
                <Icon name="file-pdf-box" size={28} color={colors.danger} />
              </View>
              <View style={styles.pdfInfo}>
                <Text style={styles.pdfName}>Contract.pdf</Text>
                <Text style={styles.pdfSub}>Tap to preview</Text>
              </View>
              <Icon
                name="chevron-right"
                size={20}
                color={colors.border.default}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Signing link */}
        {contract.signingLink && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Signing Link</Text>
            <View style={styles.linkCard}>
              <View style={styles.linkBox}>
                <Text style={styles.linkText} numberOfLines={2}>
                  {contract.signingLink}
                </Text>
              </View>
              <View style={styles.linkActions}>
                <TouchableOpacity
                  style={styles.linkAction}
                  onPress={handleCopyLink}>
                  <Icon
                    name={copiedLink ? 'check' : 'content-copy'}
                    size={16}
                    color={copiedLink ? colors.success : colors.accent}
                  />
                  <Text
                    style={[
                      styles.linkActionText,
                      copiedLink && {color: colors.success},
                    ]}>
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.linkDivider} />
                <TouchableOpacity
                  style={styles.linkAction}
                  onPress={handleResendLink}
                  disabled={resendLink.isPending}>
                  <Icon name="email-send-outline" size={16} color={colors.accent} />
                  <Text style={styles.linkActionText}>
                    {resendLink.isPending ? 'Sending...' : 'Resend'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {(['sent', 'viewed'].includes(contract.status as ContractStatus)) && (
              <View style={styles.pollingIndicator}>
                <ActivityIndicator
                  color={colors.accent}
                  size="small"
                  style={{marginRight: 6}}
                />
                <Text style={styles.pollingText}>
                  Checking for signature updates...
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Download button */}
        {contract.pdfUrl && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleViewPdf}
            activeOpacity={0.9}>
            <Icon name="download" size={18} color={colors.accent} />
            <Text style={styles.downloadButtonText}>Download PDF</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
  },
  loadingText: {
    color: colors.muted,
    fontSize: fontSize.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    padding: spacing[5],
    gap: spacing[5],
    paddingBottom: spacing[8],
  },
  titleCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    gap: spacing[2],
    ...shadow.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  contractTitle: {
    flex: 1,
    color: colors.primary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  contractType: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  contractDate: {
    color: colors.muted,
    fontSize: fontSize.xs,
  },
  section: {
    gap: spacing[3],
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  partiesCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    ...shadow.sm,
  },
  party: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  partyDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[1],
  },
  partyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyInfo: {
    flex: 1,
  },
  partyRole: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
  },
  partyValue: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  pdfCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    ...shadow.sm,
  },
  pdfIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfInfo: {
    flex: 1,
  },
  pdfName: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  pdfSub: {
    color: colors.muted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  linkCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    gap: spacing[3],
    ...shadow.sm,
  },
  linkBox: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  linkText: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
  linkActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
  },
  linkActionText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  linkDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border.default,
  },
  pollingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[1],
  },
  pollingText: {
    color: colors.muted,
    fontSize: fontSize.xs,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    backgroundColor: colors.accentLight,
  },
  downloadButtonText: {
    color: colors.accent,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});

