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
import {PreAuthStackParamList} from '@/navigation/types';
import {useSendOtp} from '@/hooks/useAuth';
import {formatPhoneDisplay, validatePhoneDigits, toE164} from '@/utils/validation';
import {extractApiError} from '@/utils/apiError';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<PreAuthStackParamList, 'PhoneEntry'>;
};

export default function PhoneEntryScreen({navigation}: Props) {
  const [digits, setDigits]     = useState('');   // raw 10 digits
  const [error, setError]       = useState('');
  const [focused, setFocused]   = useState(false);
  const inputRef = useRef<TextInput>(null);
  const sendOtp  = useSendOtp();

  const displayValue = formatPhoneDisplay(digits);
  const isValid      = validatePhoneDigits(digits);
  const canSubmit    = isValid && !sendOtp.isPending;

  const handleChangeText = (text: string) => {
    // Strip everything except digits, max 10
    const raw = text.replace(/\D/g, '').slice(0, 10);
    setDigits(raw);
    if (error) setError('');
  };

  const handleContinue = async () => {
    if (!isValid) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    const phone = toE164(digits); // +1XXXXXXXXXX
    try {
      await sendOtp.mutateAsync(phone);
      navigation.navigate('VerifyOtp', {contact: phone, contactType: 'phone'});
    } catch (err) {
      setError(extractApiError(err, 'Could not send code. Please try again.'));
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
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={s.logoGrad}>
              <Text style={s.logoGlyph}>✦</Text>
            </LinearGradient>

            {/* Title */}
            <Text style={s.title}>Your phone{'\n'}number</Text>
            <Text style={s.sub}>
              We'll send a verification code to confirm it's you.
            </Text>

            {/* Phone input */}
            <View style={s.fieldWrap}>
              <Text style={s.label}>Phone number</Text>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => inputRef.current?.focus()}
                style={[
                  s.inputRow,
                  focused && s.inputFocused,
                  !!error && s.inputError,
                ]}>
                {/* Country code badge */}
                <View style={s.countryCode}>
                  <Text style={s.flagEmoji}>🇺🇸</Text>
                  <Text style={s.countryCodeText}>+1</Text>
                  <View style={s.divider} />
                </View>

                {/* Hidden real input — we format display ourselves */}
                <TextInput
                  ref={inputRef}
                  style={s.hiddenInput}
                  value={digits}
                  onChangeText={handleChangeText}
                  keyboardType="phone-pad"
                  maxLength={10}
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  selectionColor="#3B82F6"
                  caretHidden
                />

                {/* Formatted display */}
                <Text style={[s.displayText, !digits && s.placeholder]}>
                  {digits ? displayValue : '(555) 555-5555'}
                </Text>

                {/* Clear button */}
                {digits.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {setDigits(''); setError('');}}
                    hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
                    activeOpacity={0.6}>
                    <Icon name="close-circle" size={17} color="#334155" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {!!error && (
                <View style={s.errorRow}>
                  <Icon name="alert-circle-outline" size={12} color="#EF4444" />
                  <Text style={s.errorText}>{error}</Text>
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
                colors={['#3B82F6', '#6366F1']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={s.btn}>
                {sendOtp.isPending
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.btnText}>Send Code →</Text>}
              </LinearGradient>
            </TouchableOpacity>

            {/* Secure note */}
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
  kav:  {flex: 1},
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

  logoGrad: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing[6],
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
  logoGlyph: {fontSize: 22, color: '#fff'},

  title: {
    color: '#FFFFFF',
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -1.2, lineHeight: 36,
    marginBottom: spacing[3],
  },
  sub: {
    color: 'rgba(235,235,245,0.50)',
    fontSize: fontSize.sm, lineHeight: 21,
    marginBottom: spacing[8],
  },

  fieldWrap: {gap: spacing[2], marginBottom: spacing[5]},
  label: {
    color: 'rgba(235,235,245,0.55)',
    fontSize: 12, fontWeight: fontWeight.semibold,
    letterSpacing: 0.6, textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderRadius: borderRadius.xl,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    height: 56, paddingHorizontal: spacing[4],
  },
  inputFocused: {borderColor: '#3B82F6'},
  inputError:   {borderColor: '#EF4444'},

  countryCode: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 2,
  },
  flagEmoji:       {fontSize: 16},
  countryCodeText: {color: '#94A3B8', fontSize: fontSize.sm, fontWeight: fontWeight.semibold},
  divider: {
    width: 1, height: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 8,
  },

  // Hidden input sits on top of display text
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: '100%', height: '100%',
  },
  displayText: {
    flex: 1, color: '#FFFFFF',
    fontSize: fontSize.base, fontWeight: fontWeight.medium, letterSpacing: 0.5,
  },
  placeholder: {color: 'rgba(235,235,245,0.20)'},

  errorRow: {flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2},
  errorText: {color: '#EF4444', fontSize: 12},

  btnWrap: {
    borderRadius: borderRadius.xl, overflow: 'hidden',
    marginTop: spacing[2], marginBottom: spacing[4],
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  btnDisabled: {opacity: 0.45, shadowOpacity: 0},
  btn: {paddingVertical: spacing[4] + 2, alignItems: 'center', justifyContent: 'center'},
  btnText: {color: '#FFFFFF', fontSize: fontSize.base, fontWeight: fontWeight.bold, letterSpacing: -0.2},

  secureRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, marginBottom: spacing[3],
  },
  secureText: {color: 'rgba(235,235,245,0.28)', fontSize: 11},

  legalText: {
    color: 'rgba(235,235,245,0.28)',
    fontSize: 11, textAlign: 'center', lineHeight: 17,
  },
  legalLink: {color: '#3B82F6'},
});
