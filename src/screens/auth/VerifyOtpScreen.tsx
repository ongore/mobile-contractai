import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {AuthStackParamList} from '@/navigation/types';
import {useVerifyOtp, useSignIn} from '@/hooks/useAuth';
import {getApiErrorMessage} from '@/utils/apiError';
import {colors} from '@/theme/colors';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'VerifyOtp'>;
  route: RouteProp<AuthStackParamList, 'VerifyOtp'>;
};

const OTP_LENGTH = 6;

export default function VerifyOtpScreen({navigation, route}: Props) {
  const {email} = route.params;
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const verifyOtp = useVerifyOtp();
  const resend = useSignIn();

  const otpString = otp.join('');

  useEffect(() => {
    if (otpString.length === OTP_LENGTH && !otp.includes('')) {
      handleVerify();
    }
  }, [otpString]);

  const handleKeyPress = (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < OTP_LENGTH - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      return;
    }

    try {
      await verifyOtp.mutateAsync({email, otp: code});
      // Auth store updated in hook — RootNavigator will switch to MainStack
    } catch (err: unknown) {
      Alert.alert(
        'Invalid Code',
        getApiErrorMessage(
          err,
          'The code you entered is incorrect or has expired.',
        ),
        [{text: 'OK'}],
      );
      setOtp(new Array(OTP_LENGTH).fill(''));
      setActiveIndex(0);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      await resend.mutateAsync(email);
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    } catch (err: unknown) {
      Alert.alert(
        'Error',
        getApiErrorMessage(err, 'Failed to resend code. Please try again.'),
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Envelope icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📧</Text>
          </View>

          <Text style={styles.heading}>Check your email</Text>
          <Text style={styles.subheading}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>

          {/* OTP boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpBox,
                  activeIndex === index && styles.otpBoxActive,
                  digit ? styles.otpBoxFilled : null,
                ]}
                value={digit}
                onChangeText={val => handleChange(index, val)}
                onKeyPress={e => handleKeyPress(index, e)}
                onFocus={() => setActiveIndex(index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                caretHidden
              />
            ))}
          </View>

          {/* Verify button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (otpString.length !== OTP_LENGTH || verifyOtp.isPending) &&
                styles.verifyButtonDisabled,
            ]}
            onPress={handleVerify}
            disabled={otpString.length !== OTP_LENGTH || verifyOtp.isPending}
            activeOpacity={0.85}>
            {verifyOtp.isPending ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Code</Text>
            )}
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't get a code? </Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={resend.isPending}>
              <Text style={styles.resendLink}>
                {resend.isPending ? 'Sending...' : 'Resend'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing[2],
    marginBottom: spacing[6],
  },
  backText: {
    color: colors.accent,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
    alignSelf: 'center',
  },
  icon: {
    fontSize: 32,
  },
  heading: {
    color: colors.text.primary,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  subheading: {
    color: colors.text.secondary,
    fontSize: fontSize.base,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  emailHighlight: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[3],
    marginBottom: spacing[8],
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    textAlign: 'center',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
  },
  otpBoxActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  otpBoxFilled: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  verifyButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: spacing[5],
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  resendLink: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
