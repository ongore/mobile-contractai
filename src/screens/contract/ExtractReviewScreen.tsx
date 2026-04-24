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
import {useAuthStore} from '@/store/authStore';
import {Input} from '@/components/common/Input';
import {colors} from '@/theme/colors';
import {spacing, borderRadius} from '@/theme/spacing';
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
  console.log('[REVIEW] fields param:', JSON.stringify(fields));
  const generate = useGenerateContract();
  const activeContract = useContractStore(s => s.activeContract);
  const setActiveContract = useContractStore(s => s.setActiveContract);
  const currentUser = useAuthStore(s => s.user);

  const [selectedType, setSelectedType] = useState<ContractType>(
    'service_agreement',
  );
  const [showTypePicker, setShowTypePicker] = useState(false);

  // Party 1 is always the logged-in user.
  // Party 2 is whoever the AI extracted — prefer partyTwoName, fall back to
  // partyOneName (the AI sometimes puts the other person in slot 1 when the
  // user refers to themselves as "I" without giving a name).
  const aiParty1 = findFieldValue(fields, ['partyOneName']);
  const aiParty2 = findFieldValue(fields, ['partyTwoName']);
  const party2Default = aiParty2 || aiParty1;

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      party1Name: currentUser?.name ?? '',
      party2Name: party2Default,
      serviceDescription: findFieldValue(fields, ['serviceDescription', 'service', 'description', 'scope', 'work']),
      paymentAmount: findFieldValue(fields, ['paymentAmount', 'payment', 'amount', 'price', 'fee', 'cost', 'rate']),
      startDate: findFieldValue(fields, ['startDate', 'start', 'from', 'begin', 'commencement']),
      endDate: findFieldValue(fields, ['endDate', 'end', 'due', 'deadline', 'completion', 'expiry']),
      deliverables: findFieldValue(fields, ['deliverables', 'deliverable', 'output', 'milestone']),
      terms: findFieldValue(fields, ['terms', 'term', 'condition', 'clause', 'payment_term']),
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
    <View style={{flex: 1, backgroundColor: '#F7F5F2'}}>
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color={'#FF5C28'} />
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
          <Icon name="magic-staff" size={18} color={'#FF5C28'} />
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
              color={'#8C8C8C'}
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
                    <Icon name="check" size={16} color={'#FF5C28'} />
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
    </View>
  );
}

const styles = StyleSheet.create({
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
  content: {
    padding: spacing[5],
    paddingBottom: spacing[4],
    gap: spacing[5],
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    backgroundColor: '#FFF0EB',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(255,92,40,0.25)',
  },
  infoBannerText: {
    flex: 1,
    color: '#FF5C28',
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  fieldGroup: {
    gap: spacing[2],
  },
  fieldLabel: {
    color: '#8C8C8C',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.1,
  },
  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2DED8',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  typeSelectorText: {
    color: '#111111',
    fontSize: fontSize.base,
  },
  typeDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: '#E2DED8',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#F4F2EF',
  },
  typeOptionSelected: {
    backgroundColor: '#FFF0EB',
  },
  typeOptionText: {
    color: '#8C8C8C',
    fontSize: fontSize.base,
  },
  typeOptionTextSelected: {
    color: '#FF5C28',
    fontWeight: fontWeight.semibold,
  },
  formSection: {
    gap: spacing[4],
  },
  sectionTitle: {
    color: '#8C8C8C',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing[1],
  },
  footer: {
    padding: spacing[5],
    borderTopWidth: 1,
    borderTopColor: '#E2DED8',
    backgroundColor: '#F7F5F2',
  },
  generateButton: {
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
  generateButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.1,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
});
