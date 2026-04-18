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
  StatusBar,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {MainStackParamList} from '@/navigation/types';
import {useContract} from '@/hooks/useContracts';
import {useCreateSigningLink} from '@/hooks/useContracts';
import {Badge} from '@/components/common/Badge';
import {StatusTimeline} from '@/components/contract/StatusTimeline';
import {formatDate, formatContractType} from '@/utils/format';
import {colors} from '@/theme/colors';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';
import {ContractStatus} from '@/types/contract';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ContractDetail'>;
  route: RouteProp<MainStackParamList, 'ContractDetail'>;
};

export default function ContractDetailScreen({navigation, route}: Props) {
  const {contractId} = route.params;
  const {data: contract, isLoading} = useContract(contractId, true);
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
      Alert.alert('No Email on File', "We don't have the other party's email. Please create a new signing link.");
      return;
    }
    Alert.alert('Resend Link', `Resend signing link to ${contract.otherPartyEmail}?`, [
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
    ]);
  };

  const handleViewPdf = () => {
    if (contract?.pdfUrl) {
      navigation.navigate('ContractPreview', {contractId, pdfUrl: contract.pdfUrl});
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!contract?.pdfUrl) return;
    setIsDownloading(true);
    try {
      const fileName = `${contract.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const localUri = FileSystem.cacheDirectory + fileName;

      const {status} = await FileSystem.downloadAsync(contract.pdfUrl, localUri);
      if (status !== 200) {
        throw new Error(`Download failed with status ${status}`);
      }

      // iOS Share Sheet — user can tap "Save to Files" to keep the PDF
      await Share.share(
        {url: localUri, title: fileName},
        {dialogTitle: 'Save or share your contract PDF'},
      );
    } catch {
      Alert.alert('Download Failed', 'Could not download the contract. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading && !contract) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={'#F7F5F2'} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.loadingText}>Loading contract...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!contract) return null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={'#F7F5F2'} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={22} color={colors.accentMid} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Contract</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title card */}
          <View style={styles.titleCard}>
            <View style={styles.titleGlow} />
            <View style={styles.titleRow}>
              <Text style={styles.contractTitle} numberOfLines={2}>{contract.title}</Text>
              <Badge status={contract.status} />
            </View>
            <Text style={styles.contractType}>{formatContractType(contract.type)}</Text>
            <Text style={styles.contractDate}>Created {formatDate(contract.createdAt)}</Text>
          </View>

          {/* Status Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status Timeline</Text>
            <View style={styles.card}>
              <StatusTimeline currentStatus={contract.status} />
            </View>
          </View>

          {/* Parties */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parties</Text>
            <View style={styles.card}>
              <View style={styles.party}>
                <View style={styles.partyAvatar}>
                  <Icon name="account" size={15} color={colors.accentMid} />
                </View>
                <View style={styles.partyInfo}>
                  <Text style={styles.partyRole}>Party 1 (You)</Text>
                  <Text style={styles.partyValue}>
                    {contract.extractedFields.find(f => f.key === 'partyOneName')?.value ?? 'Not specified'}
                  </Text>
                </View>
                {contract.mySignature && (
                  <View style={styles.checkCircle}>
                    <Icon name="check" size={12} color="#34D399" />
                  </View>
                )}
              </View>

              <View style={styles.partyDivider} />

              <View style={styles.party}>
                <View style={[styles.partyAvatar, {backgroundColor: 'rgba(252,211,77,0.1)'}]}>
                  <Icon name="account-outline" size={15} color="#FCD34D" />
                </View>
                <View style={styles.partyInfo}>
                  <Text style={styles.partyRole}>
                    Party 2{contract.otherPartyName ? ` · ${contract.otherPartyName}` : ''}
                  </Text>
                  <Text style={styles.partyValue}>
                    {contract.otherPartyEmail ??
                      contract.extractedFields.find(f => f.key === 'partyTwoName')?.value ??
                      'Not specified'}
                  </Text>
                </View>
                {contract.otherPartySignature ? (
                  <View style={styles.checkCircle}>
                    <Icon name="check" size={12} color="#34D399" />
                  </View>
                ) : (
                  <View style={[styles.checkCircle, {backgroundColor: 'rgba(252,211,77,0.1)', borderColor: 'rgba(252,211,77,0.2)'}]}>
                    <Icon name="clock-outline" size={12} color="#FCD34D" />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* PDF Preview */}
          {contract.pdfUrl && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Document</Text>
              <TouchableOpacity style={styles.pdfCard} onPress={handleViewPdf} activeOpacity={0.8}>
                <View style={styles.pdfIcon}>
                  <Icon name="file-pdf-box" size={26} color="#FCA5A5" />
                </View>
                <View style={styles.pdfInfo}>
                  <Text style={styles.pdfName}>Contract.pdf</Text>
                  <Text style={styles.pdfSub}>Tap to preview</Text>
                </View>
                <Icon name="chevron-right" size={18} color={colors.border.strong} />
              </TouchableOpacity>
            </View>
          )}

          {/* Signing link */}
          {contract.signingLink && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Signing Link</Text>
              <View style={styles.card}>
                <View style={styles.linkBox}>
                  <Text style={styles.linkText} numberOfLines={2}>{contract.signingLink}</Text>
                </View>
                <View style={styles.linkActions}>
                  <TouchableOpacity style={styles.linkAction} onPress={handleCopyLink}>
                    <Icon
                      name={copiedLink ? 'check' : 'content-copy'}
                      size={15}
                      color={copiedLink ? '#34D399' : colors.accentMid}
                    />
                    <Text style={[styles.linkActionText, copiedLink && {color: '#34D399'}]}>
                      {copiedLink ? 'Copied!' : 'Copy Link'}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.linkDivider} />
                  <TouchableOpacity
                    style={styles.linkAction}
                    onPress={handleResendLink}
                    disabled={resendLink.isPending}>
                    <Icon name="email-send-outline" size={15} color={colors.accentMid} />
                    <Text style={styles.linkActionText}>
                      {resendLink.isPending ? 'Sending...' : 'Resend'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {(['signed_by_me', 'sent', 'viewed'].includes(contract.status as ContractStatus)) && (
                <View style={styles.pollingIndicator}>
                  <ActivityIndicator color={colors.accent} size="small" style={{marginRight: 6}} />
                  <Text style={styles.pollingText}>Checking for signature updates...</Text>
                </View>
              )}
            </View>
          )}

          {/* Download */}
          {contract.pdfUrl && (
            <TouchableOpacity
              style={[styles.downloadButton, isDownloading && {opacity: 0.5}]}
              onPress={handleDownloadPdf}
              disabled={isDownloading}
              activeOpacity={0.88}>
              {isDownloading ? (
                <>
                  <ActivityIndicator size="small" color={colors.accentMid} />
                  <Text style={styles.downloadButtonText}>Downloading...</Text>
                </>
              ) : (
                <>
                  <Icon name="download" size={16} color={colors.accentMid} />
                  <Text style={styles.downloadButtonText}>Download PDF</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
  },
  loadingText: {
    color: '#8C8C8C',
    fontSize: fontSize.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    backgroundColor: '#F7F5F2',
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED8',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(167,139,250,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -2,
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
  content: {
    padding: spacing[5],
    gap: spacing[5],
    paddingBottom: spacing[10],
  },
  titleCard: {
    backgroundColor: 'rgba(124,58,237,0.08)',
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    gap: spacing[2],
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.2)',
    overflow: 'hidden',
  },
  titleGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(124,58,237,0.15)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  contractTitle: {
    flex: 1,
    color: '#111111',
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  contractType: {
    color: '#8C8C8C',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  contractDate: {
    color: '#8C8C8C',
    fontSize: fontSize.xs,
  },
  section: {
    gap: spacing[3],
  },
  sectionTitle: {
    color: '#8C8C8C',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: spacing[1],
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: '#E2DED8',
  },
  party: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[2],
  },
  partyDivider: {
    height: 1,
    backgroundColor: '#E2DED8',
    marginVertical: spacing[1],
  },
  partyAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyInfo: {
    flex: 1,
  },
  partyRole: {
    color: '#8C8C8C',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
  },
  partyValue: {
    color: '#111111',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(52,211,153,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: '#E2DED8',
  },
  pdfIcon: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfInfo: {
    flex: 1,
  },
  pdfName: {
    color: '#111111',
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.1,
  },
  pdfSub: {
    color: '#8C8C8C',
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  linkBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: '#E2DED8',
    marginBottom: spacing[3],
  },
  linkText: {
    color: colors.accentMid,
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
    color: colors.accentMid,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  linkDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#E2DED8',
  },
  pollingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[1],
    marginTop: spacing[1],
  },
  pollingText: {
    color: '#8C8C8C',
    fontSize: fontSize.xs,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderWidth: 1.5,
    borderColor: 'rgba(124,58,237,0.3)',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[4],
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  downloadButtonText: {
    color: colors.accentMid,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
