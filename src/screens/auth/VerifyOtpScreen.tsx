import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {PreAuthStackParamList} from '@/navigation/types';
import {useVerifyOtp, useResendOtp, useResendEmailOtp} from '@/hooks/useAuth';
import {extractApiError} from '@/utils/apiError';

const BG     = '#F7F5F2';
const WHITE  = '#FFFFFF';
const INK    = '#111111';
const GRAY   = '#8C8C8C';
const GRAY_L = '#E2DED8';
const ORANGE = '#FF5C28';

type Props = {
  navigation: NativeStackNavigationProp<PreAuthStackParamList, 'VerifyOtp'>;
  route:      RouteProp<PreAuthStackParamList, 'VerifyOtp'>;
};

const OTP_LEN = 6;

export default function VerifyOtpScreen({navigation, route}: Props) {
  const {contact, contactType} = route.params;
  const [otp, setOtp]           = useState<string[]>(Array(OTP_LEN).fill(''));
  const [activeIdx, setActiveIdx] = useState(0);
  const [apiError, setApiError]  = useState('');
  const [resent, setResent]      = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const verifyOtp   = useVerifyOtp();
  const resendEmail = useResendEmailOtp();
  const resendPhone = useResendOtp();
  const resend = contactType === 'email' ? resendEmail : resendPhone;

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const shakeX  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {toValue: 1, duration: 360, useNativeDriver: true}).start();
    setTimeout(() => inputRefs.current[0]?.focus(), 440);
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeX, {toValue: 9,  duration: 55, useNativeDriver: true}),
      Animated.timing(shakeX, {toValue: -9, duration: 55, useNativeDriver: true}),
      Animated.timing(shakeX, {toValue: 6,  duration: 55, useNativeDriver: true}),
      Animated.timing(shakeX, {toValue: -6, duration: 55, useNativeDriver: true}),
      Animated.timing(shakeX, {toValue: 0,  duration: 55, useNativeDriver: true}),
    ]).start();
  };

  const isComplete = otp.every(d => d !== '');
  const displayContact = contactType === 'phone'
    ? contact.replace(/^\+1(\d{3})(\d{3})(\d{4})$/, '+1 ($1) $2-$3')
    : contact;

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '')[0];
    if (!digit) return;
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    setApiError('');
    if (i < OTP_LEN - 1) {
      inputRefs.current[i + 1]?.focus();
      setActiveIdx(i + 1);
    } else if (next.every(d => d !== '')) {
      handleVerifyWithToken(next.join(''));
    }
  };

  const handleKeyPress = (i: number, e: any) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[i]) {
        const n = [...otp]; n[i] = ''; setOtp(n);
      } else if (i > 0) {
        const n = [...otp]; n[i - 1] = ''; setOtp(n);
        inputRefs.current[i - 1]?.focus();
        setActiveIdx(i - 1);
      }
    }
  };

  const handleVerifyWithToken = async (token: string) => {
    setApiError('');
    try {
      const session = await verifyOtp.mutateAsync({contact, token, contactType});
      if (session.isNewUser) {
        navigation.navigate('ProfileSetup');
      }
      // Returning users: RootNavigator switches to MainNavigator automatically.
    } catch (err) {
      setApiError(extractApiError(err, 'Invalid code. Please try again.'));
      setOtp(Array(OTP_LEN).fill(''));
      shake();
      setTimeout(() => { inputRefs.current[0]?.focus(); setActiveIdx(0); }, 120);
    }
  };

  const handleResend = async () => {
    setResent(false);
    try {
      await (resend as {mutateAsync: (c: string) => Promise<unknown>}).mutateAsync(contact);
      setResent(true);
      setOtp(Array(OTP_LEN).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {}
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={s.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.inner}>

            {/* Back */}
            {navigation.canGoBack() && (
              <TouchableOpacity
                style={s.backBtn}
                onPress={() => navigation.goBack()}
                activeOpacity={0.6}
                hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
                <View style={s.backWrap}>
                  <Icon name="chevron-left" size={19} color={INK} />
                </View>
              </TouchableOpacity>
            )}

            <Animated.View style={{opacity: fadeIn, flex: 1}}>
              {/* Wordmark */}
              <View style={s.wordmark}>
                <Image source={require('@/assets/clerra-logo.png')} style={s.logoImg} resizeMode="contain" />
              </View>

              <Text style={s.title}>
                {contactType === 'phone' ? 'Check your\nmessages.' : 'Check your\ninbox.'}
              </Text>
              <Text style={s.sub}>
                6-digit code sent to{' '}
                <Text style={s.contactHighlight}>{displayContact}</Text>
              </Text>

              {/* OTP boxes */}
              <Animated.View style={[s.otpRow, {transform: [{translateX: shakeX}]}]}>
                {otp.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={ref => {inputRefs.current[i] = ref;}}
                    style={[
                      s.otpBox,
                      activeIdx === i && s.otpBoxActive,
                      !!digit && s.otpBoxFilled,
                      !!apiError && s.otpBoxError,
                    ]}
                    value={digit}
                    onChangeText={v => handleChange(i, v)}
                    onKeyPress={e => handleKeyPress(i, e)}
                    onFocus={() => {setActiveIdx(i); setApiError('');}}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    caretHidden
                    selectionColor={ORANGE}
                  />
                ))}
              </Animated.View>

              {!!apiError && (
                <View style={s.statusRow}>
                  <Icon name="alert-circle-outline" size={13} color="#DC2626" />
                  <Text style={s.errorText}>{apiError}</Text>
                </View>
              )}
              {resent && !apiError && (
                <View style={s.statusRow}>
                  <Icon name="check-circle-outline" size={13} color="#16A34A" />
                  <Text style={s.successText}>New code sent!</Text>
                </View>
              )}

              {/* Verify CTA */}
              <TouchableOpacity
                disabled={!isComplete || verifyOtp.isPending}
                onPress={() => handleVerifyWithToken(otp.join(''))}
                activeOpacity={0.88}
                style={[s.btn, (!isComplete || verifyOtp.isPending) && s.btnDisabled]}>
                {verifyOtp.isPending
                  ? <ActivityIndicator color={WHITE} size="small" />
                  : <Text style={s.btnText}>Verify code</Text>}
              </TouchableOpacity>

              {/* Resend */}
              <View style={s.resendRow}>
                <Text style={s.resendLabel}>Didn't receive a code? </Text>
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={resend.isPending}
                  activeOpacity={0.6}>
                  <Text style={s.resendLink}>
                    {resend.isPending ? 'Sending…' : 'Resend'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={s.expiryRow}>
                <Icon name="clock-outline" size={11} color={GRAY_L} />
                <Text style={s.expiryText}>Code expires in 10 minutes</Text>
              </View>
            </Animated.View>

          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: BG},
  safe: {flex: 1},
  kav:  {flex: 1},
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 8,
  },

  backBtn: {marginBottom: 32},
  backWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: WHITE,
    borderWidth: 1, borderColor: GRAY_L,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  wordmark: {alignItems: 'flex-start', marginBottom: 28},
  logoImg: {height: 48, aspectRatio: 711 / 392},

  title: {
    fontSize: 40, fontWeight: '800',
    color: INK, letterSpacing: -1.8,
    lineHeight: 44, marginBottom: 10,
  },
  sub: {
    fontSize: 15, color: GRAY,
    lineHeight: 22, marginBottom: 36,
  },
  contactHighlight: {color: INK, fontWeight: '700'},

  otpRow: {
    flexDirection: 'row', gap: 8,
    marginBottom: 16,
  },
  otpBox: {
    flex: 1, height: 62,
    backgroundColor: WHITE,
    borderWidth: 1.5, borderColor: GRAY_L,
    borderRadius: 14,
    textAlign: 'center',
    color: INK,
    fontSize: 24, fontWeight: '700',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  otpBoxActive: {
    borderColor: ORANGE,
    shadowColor: ORANGE,
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  otpBoxFilled: {
    borderColor: '#DDDAD5',
    backgroundColor: '#FAFAF8',
  },
  otpBoxError: {borderColor: '#DC2626'},

  statusRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 16,
  },
  errorText:   {color: '#DC2626', fontSize: 13},
  successText: {color: '#16A34A', fontSize: 13},

  btn: {
    backgroundColor: ORANGE,
    borderRadius: 99,
    height: 58,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: ORANGE,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  btnDisabled: {opacity: 0.35, shadowOpacity: 0},
  btnText: {
    color: WHITE, fontSize: 17,
    fontWeight: '700', letterSpacing: -0.3,
  },

  resendRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginBottom: 12,
  },
  resendLabel: {color: GRAY, fontSize: 13},
  resendLink:  {color: ORANGE, fontSize: 13, fontWeight: '700'},

  expiryRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5,
  },
  expiryText: {color: GRAY_L, fontSize: 12},
});
