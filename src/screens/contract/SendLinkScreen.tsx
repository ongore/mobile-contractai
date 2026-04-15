import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import {MainStackParamList} from '@/navigation/types';
import {useContract, useCreateSigningLink} from '@/hooks/useContracts';
import {Input} from '@/components/common/Input';
import {colors} from '@/theme/colors';
import {spacing, borderRadius, shadow} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'SendLink'>;
  route: RouteProp<MainStackParamList, 'SendLink'>;
};

const formSchema = z.object({
  otherPartyEmail: z.string().email('Please enter a valid email address'),
  otherPartyName: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SendLinkScreen({navigation, route}: Props) {
  const {contractId} = route.params;
  const {data: contract} = useContract(contractId);
  const createLink = useCreateSigningLink();
  const [signingLink, setSigningLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otherPartyEmail: '',
      otherPartyName: '',
    },
  });

  const handleGenerateLink = async (values: FormValues) => {
    try {
      const result = await createLink.mutateAsync({
        id: contractId,
        otherPartyEmail: values.otherPartyEmail,
        otherPartyName: values.otherPartyName,
      });
      setSigningLink(result.signingLink);
    } catch (err: any) {
      Alert.alert(
        'Failed to Create Link',
        err?.response?.data?.message ||
          'Could not generate a signing link. Please try again.',
        [{text: 'OK'}],
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

  const handleDone = () => {
    navigation.navigate('ContractDetail', {contractId});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send for Signature</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Contract info */}
        {contract && (
          <View style={styles.contractInfo}>
            <View style={styles.contractIcon}>
              <Icon name="file-document-outline" size={20} color={colors.accent} />
            </View>
            <View style={styles.contractInfoText}>
              <Text style={styles.contractTitle} numberOfLines={1}>
                {contract.title}
              </Text>
              <Text style={styles.contractSubtitle}>Ready to be signed</Text>
            </View>
            <View style={styles.contractStatusBadge}>
              <Text style={styles.contractStatusText}>Signed by you</Text>
            </View>
          </View>
        )}

        {!signingLink ? (
          <>
            {/* Form */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Other Party Details</Text>
              <Text style={styles.sectionSubtitle}>
                We'll send a secure signing link to this person.
              </Text>

              <Controller
                control={control}
                name="otherPartyEmail"
                render={({field: {onChange, value}}) => (
                  <Input
                    label="Email Address"
                    value={value}
                    onChangeText={onChange}
                    placeholder="contractor@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.otherPartyEmail?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="otherPartyName"
                render={({field: {onChange, value}}) => (
                  <Input
                    label="Name (optional)"
                    value={value ?? ''}
                    onChangeText={onChange}
                    placeholder="Jane Smith"
                  />
                )}
              />
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={[
                styles.generateButton,
                createLink.isPending && styles.buttonDisabled,
              ]}
              onPress={handleSubmit(handleGenerateLink)}
              disabled={createLink.isPending}
              activeOpacity={0.9}>
              {createLink.isPending ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={colors.white} size="small" />
                  <Text style={styles.generateButtonText}>
                    Generating Link...
                  </Text>
                </View>
              ) : (
                <>
                  <Icon name="link-variant" size={18} color={colors.white} />
                  <Text style={styles.generateButtonText}>
                    Generate Signing Link
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Success state */}
            <View style={styles.successBanner}>
              <Icon name="check-circle" size={28} color={colors.success} />
              <View style={styles.successText}>
                <Text style={styles.successTitle}>Link Created!</Text>
                <Text style={styles.successSubtitle}>
                  Share this link with the other party to collect their
                  signature.
                </Text>
              </View>
            </View>

            {/* Link display */}
            <View style={styles.linkCard}>
              <Text style={styles.linkLabel}>Signing Link</Text>
              <View style={styles.linkBox}>
                <Text style={styles.linkText} numberOfLines={2}>
                  {signingLink}
                </Text>
              </View>
              <View style={styles.linkActions}>
                <TouchableOpacity
                  style={styles.linkAction}
                  onPress={handleCopy}>
                  <Icon
                    name={copied ? 'check' : 'content-copy'}
                    size={18}
                    color={copied ? colors.success : colors.accent}
                  />
                  <Text
                    style={[
                      styles.linkActionText,
                      copied && {color: colors.success},
                    ]}>
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.linkDivider} />
                <TouchableOpacity
                  style={styles.linkAction}
                  onPress={handleShare}>
                  <Icon name="share-variant" size={18} color={colors.accent} />
                  <Text style={styles.linkActionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* What happens next */}
            <View style={styles.nextSteps}>
              <Text style={styles.nextStepsTitle}>What happens next?</Text>
              {(
                [
                  {icon: 'email-send', text: 'The other party receives the link'},
                  {icon: 'draw', text: 'They review and sign the contract'},
                  {icon: 'bell-ring', text: "You'll be notified when they sign"},
                ] as const
              ).map((step, i) => (
                <View key={i} style={styles.nextStep}>
                  <View style={styles.nextStepIcon}>
                    <Icon name={step.icon} size={16} color={colors.accent} />
                  </View>
                  <Text style={styles.nextStepText}>{step.text}</Text>
                </View>
              ))}
            </View>

            {/* Done button */}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleDone}
              activeOpacity={0.9}>
              <Text style={styles.doneButtonText}>View Contract</Text>
              <Icon name="arrow-right" size={18} color={colors.white} />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
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
  contractInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  contractIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contractInfoText: {
    flex: 1,
  },
  contractTitle: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  contractSubtitle: {
    color: colors.muted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  contractStatusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  contractStatusText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: fontWeight.semibold,
  },
  formSection: {
    gap: spacing[4],
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  sectionSubtitle: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
    marginTop: -spacing[2],
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    ...shadow.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    backgroundColor: '#ECFDF5',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successText: {
    flex: 1,
  },
  successTitle: {
    color: colors.success,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    marginBottom: 4,
  },
  successSubtitle: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  linkCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    gap: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  linkLabel: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  linkBox: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  linkText: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontFamily: 'Courier',
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
  nextSteps: {
    gap: spacing[3],
  },
  nextStepsTitle: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  nextStepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepText: {
    flex: 1,
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    ...shadow.md,
  },
  doneButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
