import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '@/navigation/types';
import {useSignIn} from '@/hooks/useAuth';
import {validateEmail} from '@/utils/validation';
import {extractApiError} from '@/utils/apiError';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'OnboardingStep1'>;
};

export default function SignInScreen({navigation}: Props) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [focused, setFocused] = useState(false);
  const signIn = useSignIn();

  const canSubmit = email.trim().length > 0 && !signIn.isPending;

  const handleContinue = async () => {
    const trimmed = email.trim();
    if (!trimmed) {setEmailError('Please enter your email.'); return;}
    if (!validateEmail(trimmed)) {setEmailError('Enter a valid email address.'); return;}
    setEmailError('');
    try {
      await signIn.mutateAsync({email: trimmed});
      navigation.navigate('OnboardingStep2', {email: trimmed});
    } catch (err) {
      setEmailError(extractApiError(err, 'Could not send code. Try again.'));
    }
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
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* Back */}
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.65}>
              <View style={s.backIconWrap}>
                <Icon name="chevron-left" size={18} color="rgba(235,235,245,0.70)" />
              </View>
            </TouchableOpacity>

            {/* Logo */}
            <View style={s.logoRow}>
              <LinearGradient
                colors={['#3B82F6', '#3B82F6']}
                start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                style={s.logoGrad}>
                <Text style={s.logoGlyph}>✦</Text>
              </LinearGradient>
            </View>

            {/* Title */}
            <Text style={s.title}>Welcome back</Text>
            <Text style={s.sub}>Enter your email to sign in or create an account.</Text>

            {/* Input */}
            <View style={s.fieldWrap}>
              <Text style={s.label}>Email address</Text>
              <View style={[
                s.inputWrap,
                focused && s.inputFocused,
                !!emailError && s.inputError,
              ]}>
                <View style={s.inputIconWrap}>
                  <Icon name="email-outline" size={16} color={focused ? '#3B82F6' : 'rgba(235,235,245,0.30)'} />
                </View>
                <TextInput
                  style={s.input}
                  value={email}
                  onChangeText={t => {setEmail(t); if (emailError) setEmailError('');}}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(235,235,245,0.20)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  selectionColor="#3B82F6"
                />
              </View>
              {!!emailError && (
                <View style={s.errorRow}>
                  <Icon name="alert-circle-outline" size={12} color="#EF4444" />
                  <Text style={s.errorText}>{emailError}</Text>
                </View>
              )}
            </View>

            {/* CTA */}
            <TouchableOpacity
              disabled={!canSubmit}
              onPress={handleContinue}
              activeOpacity={0.85}
              style={[s.btnWrap, !canSubmit && s.btnDisabled]}>
              <LinearGradient
                colors={['#3B82F6', '#3B82F6']}
                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                style={s.btn}>
                {signIn.isPending
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.btnText}>Continue →</Text>}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer note */}
            <View style={s.secureRow}>
              <Icon name="shield-lock-outline" size={12} color="rgba(235,235,245,0.25)" />
              <Text style={s.secureText}>Secured with end-to-end encryption</Text>
            </View>

            <Text style={s.legalText}>
              By continuing you agree to our{' '}
              <Text style={s.legalLink}>Terms</Text>
              {' '}and{' '}
              <Text style={s.legalLink}>Privacy Policy</Text>.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: {flex: 1},
  safe: {flex: 1},
  kav: {flex: 1},
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[3],
    paddingBottom: spacing[8],
  },

  backBtn: {marginBottom: spacing[6]},
  backIconWrap: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  logoRow: {
    alignSelf: 'flex-start',
    marginBottom: spacing[6],
  },
  logoGrad: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  logoGlyph: {fontSize: 22, color: '#fff'},

  title: {
    color: '#FFFFFF',
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -1.2,
    marginBottom: spacing[2],
  },
  sub: {
    color: 'rgba(235,235,245,0.50)',
    fontSize: fontSize.sm,
    lineHeight: 21,
    marginBottom: spacing[8],
  },

  fieldWrap: {gap: spacing[2], marginBottom: spacing[5]},
  label: {
    color: 'rgba(235,235,245,0.55)',
    fontSize: 12,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    height: 52,
    paddingHorizontal: spacing[4],
    gap: spacing[2],
  },
  inputFocused: {borderColor: '#3B82F6'},
  inputError: {borderColor: '#EF4444'},
  inputIconWrap: {flexShrink: 0},
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    letterSpacing: -0.1,
  },
  errorRow: {flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2},
  errorText: {color: '#EF4444', fontSize: 12},

  btnWrap: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginTop: spacing[2],
    marginBottom: spacing[4],
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  btnDisabled: {opacity: 0.45, shadowOpacity: 0},
  btn: {
    paddingVertical: spacing[4] + 2,
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: {
    color: '#FFFFFF', fontSize: fontSize.base,
    fontWeight: fontWeight.bold, letterSpacing: -0.2,
  },

  secureRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 5,
    marginBottom: spacing[3],
  },
  secureText: {color: 'rgba(235,235,245,0.28)', fontSize: 11},

  legalText: {
    color: 'rgba(235,235,245,0.28)',
    fontSize: 11, textAlign: 'center', lineHeight: 17,
  },
  legalLink: {color: '#3B82F6'},
});
