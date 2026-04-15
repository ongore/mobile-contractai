import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import {MainStackParamList} from '@/navigation/types';
import {ContractType, ExtractedField} from '@/types/contract';
import {useGenerateContract} from '@/hooks/useContracts';
import {useContractStore} from '@/store/contractStore';
import {Input} from '@/components/common/Input';
import {colors} from '@/theme/colors';
import {spacing, borderRadius, shadow} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'ExtractReview'>;
  route: RouteProp<MainStackParamList, 'ExtractReview'>;
};

const CONTRACT_TYPES: {value: ContractType; label: string}[] = [
  {value: 'service_agreement', label: 'Service Agreement'},
  {value: 'freelance_agreement', label: 'Freelance Agreement'},
  {value: 'payment_agreement', label: 'Payment Agreement'},
  {value: 'general_agreement', label: 'General Agreement'},
];

const formSchema = z.object({
  party1Name: z.string().min(1, 'Required'),
  party2Name: z.string().min(1, 'Required'),
  serviceDescription: z.string().min(1, 'Required'),
  paymentAmount: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().min(1, 'Required'),
  deliverables: z.string().optional(),
  terms: z.string().optional(),
  contractType: z.string().min(1, 'Select contract type'),
});

type FormValues = z.infer<typeof formSchema>;

function findFieldValue(fields: ExtractedField[], keys: string[]): string {
  for (const key of keys) {
    const field = fields.find(
      f => f.key.toLowerCase().includes(key.toLowerCase()),
    );
    if (field?.value) {
      return field.value;
    }
  }
  return '';
}

export default function ExtractReviewScreen({navigation, route}: Props) {
  const {fields} = route.params;
  const generate = useGenerateContract();
  const activeContract = useContractStore(s => s.activeContract);
  const setActiveContract = useContractStore(s => s.setActiveContract);

  const [selectedType, setSelectedType] = useState<ContractType>(
    'service_agreement',
  );
  const [showTypePicker, setShowTypePicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      party1Name: findFieldValue(fields, ['party1', 'party_1', 'client', 'employer', 'buyer']),
      party2Name: findFieldValue(fields, ['party2', 'party_2', 'contractor', 'freelancer', 'seller', 'vendor']),
      serviceDescription: findFieldValue(fields, ['service', 'description', 'scope', 'work']),
      paymentAmount: findFieldValue(fields, ['payment', 'amount', 'price', 'fee', 'cost', 'rate']),
      startDate: findFieldValue(fields, ['start', 'from', 'begin', 'commencement']),
      endDate: findFieldValue(fields, ['end', 'due', 'deadline', 'completion', 'expiry']),
      deliverables: findFieldValue(fields, ['deliverable', 'output', 'milestone']),
      terms: findFieldValue(fields, ['term', 'condition', 'clause', 'payment_term']),
      contractType: 'service_agreement',
    },
  });

  const onSubmit = async (values: FormValues) => {
    const contractId = activeContract?.id;
    if (!contractId) {
      Alert.alert(
        'Error',
        'No active contract ID found. Please start over.',
        [{text: 'OK'}],
      );
      return;
    }

    const updatedFields: ExtractedField[] = [
      {key: 'party1Name', label: 'Party 1 Name', value: values.party1Name, required: true},
      {key: 'party2Name', label: 'Party 2 Name', value: values.party2Name, required: true},
      {key: 'serviceDescription', label: 'Service Description', value: values.serviceDescription, required: true},
      {key: 'paymentAmount', label: 'Payment Amount', value: values.paymentAmount, required: true},
      {key: 'startDate', label: 'Start Date', value: values.startDate, required: true},
      {key: 'endDate', label: 'End Date', value: values.endDate, required: true},
      {key: 'deliverables', label: 'Deliverables', value: values.deliverables ?? '', required: false},
      {key: 'terms', label: 'Terms', value: values.terms ?? '', required: false},
    ];

    try {
      const result = await generate.mutateAsync({
        id: contractId,
        fields: updatedFields,
        type: selectedType,
      });

      setActiveContract(result.contract);
      navigation.navigate('ContractPreview', {
        contractId: result.contract.id,
        pdfUrl: result.pdfUrl,
      });
    } catch (err: any) {
      Alert.alert(
        'Generation Failed',
        err?.response?.data?.message ||
          'Failed to generate contract. Please try again.',
        [{text: 'OK'}],
      );
    }
  };

  const selectedTypeLabel =
    CONTRACT_TYPES.find(t => t.value === selectedType)?.label ??
    'Select type';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Extracted Data</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Icon name="magic-staff" size={18} color={colors.accent} />
          <Text style={styles.infoBannerText}>
            We extracted these details — edit anything that looks wrong before
            generating.
          </Text>
        </View>

        {/* Contract Type Selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Contract Type</Text>
          <TouchableOpacity
            style={styles.typeSelector}
            onPress={() => setShowTypePicker(!showTypePicker)}>
            <Text style={styles.typeSelectorText}>{selectedTypeLabel}</Text>
            <Icon
              name={showTypePicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.muted}
            />
          </TouchableOpacity>
          {showTypePicker && (
            <View style={styles.typeDropdown}>
              {CONTRACT_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    selectedType === type.value && styles.typeOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedType(type.value);
                    setShowTypePicker(false);
                  }}>
                  <Text
                    style={[
                      styles.typeOptionText,
                      selectedType === type.value &&
                        styles.typeOptionTextSelected,
                    ]}>
                    {type.label}
                  </Text>
                  {selectedType === type.value && (
                    <Icon name="check" size={16} color={colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Parties</Text>

          <Controller
            control={control}
            name="party1Name"
            render={({field: {onChange, value}}) => (
              <Input
                label="Party 1 Name (Client / Employer)"
                value={value}
                onChangeText={onChange}
                placeholder="e.g. Acme Corp"
                error={errors.party1Name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="party2Name"
            render={({field: {onChange, value}}) => (
              <Input
                label="Party 2 Name (Contractor / Freelancer)"
                value={value}
                onChangeText={onChange}
                placeholder="e.g. Jane Smith"
                error={errors.party2Name?.message}
              />
            )}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Agreement Details</Text>

          <Controller
            control={control}
            name="serviceDescription"
            render={({field: {onChange, value}}) => (
              <Input
                label="Service Description"
                value={value}
                onChangeText={onChange}
                placeholder="Describe the service or work to be performed"
                multiline
                error={errors.serviceDescription?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="paymentAmount"
            render={({field: {onChange, value}}) => (
              <Input
                label="Payment Amount"
                value={value}
                onChangeText={onChange}
                placeholder="e.g. $2,500 USD"
                error={errors.paymentAmount?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="deliverables"
            render={({field: {onChange, value}}) => (
              <Input
                label="Deliverables (optional)"
                value={value ?? ''}
                onChangeText={onChange}
                placeholder="List the expected outputs or deliverables"
                multiline
              />
            )}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Timeline</Text>

          <Controller
            control={control}
            name="startDate"
            render={({field: {onChange, value}}) => (
              <Input
                label="Start Date"
                value={value}
                onChangeText={onChange}
                placeholder="e.g. April 20, 2026"
                error={errors.startDate?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="endDate"
            render={({field: {onChange, value}}) => (
              <Input
                label="End Date / Deadline"
                value={value}
                onChangeText={onChange}
                placeholder="e.g. May 15, 2026"
                error={errors.endDate?.message}
              />
            )}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Terms (optional)</Text>

          <Controller
            control={control}
            name="terms"
            render={({field: {onChange, value}}) => (
              <Input
                label="Payment Terms & Conditions"
                value={value ?? ''}
                onChangeText={onChange}
                placeholder="e.g. Net 30 payment, revisions included, etc."
                multiline
              />
            )}
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.generateButton,
            generate.isPending && styles.generateButtonDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={generate.isPending}
          activeOpacity={0.9}>
          {generate.isPending ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.white} size="small" />
              <Text style={styles.generateButtonText}>Generating...</Text>
            </View>
          ) : (
            <>
              <Icon name="file-document-edit" size={20} color={colors.white} />
              <Text style={styles.generateButtonText}>Generate Contract</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
    paddingBottom: spacing[4],
    gap: spacing[5],
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    backgroundColor: colors.accentLight,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
  },
  infoBannerText: {
    flex: 1,
    color: colors.accentDark,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  fieldGroup: {
    gap: spacing[2],
  },
  fieldLabel: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  typeSelectorText: {
    color: colors.text.primary,
    fontSize: fontSize.base,
  },
  typeDropdown: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
    ...shadow.md,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  typeOptionSelected: {
    backgroundColor: colors.accentLight,
  },
  typeOptionText: {
    color: colors.text.primary,
    fontSize: fontSize.base,
  },
  typeOptionTextSelected: {
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },
  formSection: {
    gap: spacing[4],
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    marginBottom: spacing[1],
  },
  footer: {
    padding: spacing[5],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
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
  generateButtonDisabled: {
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
    gap: spacing[3],
  },
});
