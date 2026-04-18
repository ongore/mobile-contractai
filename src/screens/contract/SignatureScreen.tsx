import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import SignatureCanvas, {SignatureViewRef} from 'react-native-signature-canvas';
import {MainStackParamList} from '@/navigation/types';
import {useSaveSignature} from '@/hooks/useContracts';
import {colors} from '@/theme/colors';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Signature'>;
  route: RouteProp<MainStackParamList, 'Signature'>;
};

export default function SignatureScreen({navigation, route}: Props) {
  const {contractId} = route.params;
  const signatureRef = useRef<SignatureViewRef>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const saveSignature = useSaveSignature();

  const handleSignatureBegin = () => {
    setHasSignature(true);
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setHasSignature(false);
  };

  const handleConfirm = () => {
    signatureRef.current?.readSignature();
  };

  const handleSignatureOK = async (signature: string) => {
    if (!signature) {
      Alert.alert('Empty Signature', 'Please draw your signature before confirming.');
      return;
    }
    const base64 = signature.split('base64,').pop() ?? signature;
    try {
      await saveSignature.mutateAsync({id: contractId, signatureBase64: base64});
      // Use replace so the modal is dismissed and SendLink takes its place in the stack
      navigation.replace('SendLink', {contractId});
    } catch (err: any) {
      Alert.alert(
        'Signature Failed',
        err?.response?.data?.message || 'Failed to save signature. Please try again.',
        [{text: 'OK'}],
      );
    }
  };

  const webStyle = `
    .m-signature-pad {
      box-shadow: none;
      border: none;
      margin: 0;
      background: #ffffff;
    }
    .m-signature-pad--body {
      border: none;
      background: #ffffff;
    }
    .m-signature-pad--footer {
      display: none;
    }
    body, html {
      background-color: #ffffff;
      height: 100%;
      margin: 0;
    }
    canvas {
      border-radius: 0;
    }
  `;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={'#F7F5F2'} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="close" size={20} color={'#8C8C8C'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign Contract</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Instructions */}
          <View style={styles.instructions}>
            <View style={styles.instructionIcon}>
              <Icon name="draw" size={20} color="#FF5C28" />
            </View>
            <View style={styles.instructionText}>
              <Text style={styles.instructionTitle}>Draw your signature</Text>
              <Text style={styles.instructionSub}>
                Sign in the box below using your finger. Your signature will be
                applied to the contract.
              </Text>
            </View>
          </View>

          {/* Signature pad */}
          <View style={styles.signatureWrapper}>
            <View style={styles.signatureLabel}>
              <Icon name="draw-pen" size={12} color={'#8C8C8C'} />
              <Text style={styles.signatureLabelText}>Sign here</Text>
            </View>
            <SignatureCanvas
              ref={signatureRef}
              onOK={handleSignatureOK}
              onBegin={handleSignatureBegin}
              onEmpty={() => setHasSignature(false)}
              webStyle={webStyle}
              backgroundColor="#ffffff"
              penColor="#1a1a1a"
              style={styles.signatureCanvas}
              descriptionText=""
              clearText=""
              confirmText=""
              autoClear={false}
            />
            <View style={styles.signatureLine}>
              <View style={styles.signatureLineBar} />
              <Text style={styles.signatureLineLabel}>x</Text>
            </View>
          </View>

          {/* Legal note */}
          <View style={styles.legalNote}>
            <Icon name="shield-check-outline" size={13} color={'#8C8C8C'} />
            <Text style={styles.legalNoteText}>
              By confirming, you agree this signature is legally binding under applicable
              e-signature laws.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            disabled={saveSignature.isPending}>
            <Icon name="eraser" size={16} color={'#8C8C8C'} />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!hasSignature || saveSignature.isPending) && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!hasSignature || saveSignature.isPending}
            activeOpacity={0.88}>
            {saveSignature.isPending ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.white} size="small" />
                <Text style={styles.confirmButtonText}>Saving...</Text>
              </View>
            ) : (
              <>
                <Icon name="check-circle" size={17} color={colors.white} />
                <Text style={styles.confirmButtonText}>Confirm Signature</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DED8',
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
    gap: spacing[5],
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  instructionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFF0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    flex: 1,
  },
  instructionTitle: {
    color: '#111111',
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  instructionSub: {
    color: '#8C8C8C',
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  signatureWrapper: {
    flex: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(255,92,40,0.4)',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    position: 'relative',
    minHeight: 220,
  },
  signatureLabel: {
    position: 'absolute',
    top: spacing[3],
    left: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    zIndex: 10,
  },
  signatureLabelText: {
    color: 'rgba(100,100,120,0.6)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  signatureCanvas: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  signatureLine: {
    position: 'absolute',
    bottom: spacing[8],
    left: spacing[6],
    right: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  signatureLineBar: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(100,100,120,0.25)',
  },
  signatureLineLabel: {
    color: 'rgba(100,100,120,0.5)',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  legalNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  legalNoteText: {
    flex: 1,
    color: '#8C8C8C',
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing[3],
    padding: spacing[5],
    borderTopWidth: 1,
    borderTopColor: '#E2DED8',
    backgroundColor: '#F7F5F2',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DED8',
  },
  clearButtonText: {
    color: '#8C8C8C',
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  confirmButton: {
    flex: 1,
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
    shadowRadius: 14,
    elevation: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.1,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
});
