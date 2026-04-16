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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {OnboardingStackParamList} from '@/navigation/types';
import {useVerifyOtp, useResendOtp} from '@/hooks/useAuth';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'OnboardingStep2'>;
  route: RouteProp<OnboardingStackParamList, 'OnboardingStep2'>;
};

const OTP_LEN = 6;

export default function VerifyOtpScreen({navigation, route}: Props) {
  const {email} = route.params;
  const [otp, setOtp] = useState<string[]>(Array(OTP_LEN).fill(''));
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const verifyOtp = useVerifyOtp();
  const resend    = useResendOtp();

  const isComplete = otp.every(d => d !== '');

  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 400);
  }, []);

  const handleChange = (i: number, val: string) => {
    const digits = val.replace(/\D/g, '');
    if (!digits) return;
    const first = digits[0];
    const next = [...otp];
    next[i] = first;
    setOtp(next);
    if (i < OTP_LEN - 1) {
      inputRefs.current[i + 1]?.focus();
      setActiveIdx(i + 1);
    }
  };

  const handleKeyPress = (i: number, e: any) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[i]) {
        const next = [...otp]; next[i] = ''; setOtp(next);
      } else if (i > 0) {
        const next = [...otp]; next[i - 1] = ''; setOtp(next);
        inputRefs.current[i - 1]?.focus();
        setActiveIdx(i - 1);
      }
    }
  };

  const handleVerify = async () => {
    const token = otp.join('');
    try {
      await verifyOtp.mutateAsync({email, token});
    } catch {}
  };

  const handleResend = async () => {
    try { await resend.mutateAsync({email}); } catch {}
  };

  return (
    <LinearGradient
      colors={['#0D2247', '#020617', '#150D38']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={s.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.inner}>

            {/* Back */}
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.65}>
              <View style={s.backIconWrap}>
                <Icon name="chevron-left" size={18} color="rgba(235,235,245,0.70)" />
              </View>
            </TouchableOpacity>

            {/* Email icon */}
            <View style={s.emailIconWrap}>
              <LinearGradient
                colors={['#3B82F6', '#3B82F6']}
                start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                style={s.emailIconGrad}>
                <Icon name="email-outline" size={24} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={s.title}>Check your email</Text>
            <Text style={s.sub}>
              We sent a 6-digit code to{'\n'}
              <Text style={s.emailText}>{email}</Text>
            </Text>

            {/* OTP boxes */}
            <View style={s.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={ref => {inputRefs.current[i] = ref;}}
                  style={[
                    s.otpBox,
                    activeIdx === i && s.otpBoxActive,
                    !!digit && s.otpBoxFilled,
                  ]}
                  value={digit}
                  onChangeText={v => handleChange(i, v)}
                  onKeyPress={e => handleKeyPress(i, e)}
                  onFocus={() => setActiveIdx(i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  caretHidden
                  selectionColor="#3B82F6"
                />
              ))}
            </View>

            {/* Verify button */}
            <TouchableOpacity
              disabled={!isComplete || verifyOtp.isPending}
              onPress={handleVerify}
              activeOpacity={0.85}
              style={[s.btnWrap, (!isComplete || verifyOtp.isPending) && s.btnDisabled]}>
              <LinearGradient
                colors={['#3B82F6', '#3B82F6']}
                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                style={s.btn}>
                {verifyOtp.isPending
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.btnText}>Verify Code</Text>}
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend */}
            <View style={s.resendRow}>
              <Text style={s.resendLabel}>Didn't receive a code? </Text>
              <TouchableOpacity onPress={handleResend} disabled={resend.isPending} activeOpacity={0.65}>
                <Text style={s.resendLink}>
                  {resend.isPending ? 'Sending…' : 'Resend'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={s.noteRow}>
              <Icon name="clock-outline" size={11} color="rgba(235,235,245,0.25)" />
              <Text style={s.noteText}>Code expires in 10 minutes</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const BOX = 44;

const s = StyleSheet.create({
  root: {flex: 1},
  safe: {flex: 1},
  kav: {flex: 1},
  inner: {
    flex: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[3],
  },

  backBtn: {marginBottom: spacing[6]},
  backIconWrap: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  emailIconWrap: {alignSelf: 'flex-start', marginBottom: spacing[5]},
  emailIconGrad: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },

  title: {
    color: '#FFFFFF',
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -1.2,
    marginBottom: spacing[3],
  },
  sub: {
    color: 'rgba(235,235,245,0.50)',
    fontSize: fontSize.sm,
    lineHeight: 22,
    marginBottom: spacing[8],
  },
  emailText: {color: '#3B82F6', fontWeight: fontWeight.semibold},

  // OTP
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[2],
    marginBottom: spacing[7],
  },
  otpBox: {
    flex: 1, height: 56,
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.lg,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  otpBoxActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  otpBoxFilled: {
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: '#1E293B',
  },

  // CTA
  btnWrap: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing[5],
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  btnDisabled: {opacity: 0.42, shadowOpacity: 0},
  btn: {
    paddingVertical: spacing[4] + 2,
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF', fontSize: fontSize.base,
    fontWeight: fontWeight.bold, letterSpacing: -0.2,
  },

  resendRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing[4],
  },
  resendLabel: {color: 'rgba(235,235,245,0.45)', fontSize: fontSize.sm},
  resendLink: {
    color: '#3B82F6', fontSize: fontSize.sm, fontWeight: fontWeight.semibold,
  },

  noteRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 5,
  },
  noteText: {color: 'rgba(235,235,245,0.25)', fontSize: 11},
});
