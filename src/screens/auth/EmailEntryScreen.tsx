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
  ScrollView,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PreAuthStackParamList} from '@/navigation/types';
import {useSendOtp} from '@/hooks/useAuth';
import {validatePhoneDigits, stripPhoneFormatting, formatPhoneDisplay, toE164} from '@/utils/validation';
import {extractApiError} from '@/utils/apiError';

const BG     = '#F7F5F2';
const WHITE  = '#FFFFFF';
const INK    = '#111111';
const GRAY   = '#8C8C8C';
const GRAY_L = '#E2DED8';
const ORANGE = '#FF5C28';

type Props = {
  navigation: NativeStackNavigationProp<PreAuthStackParamList, 'EmailEntry'>;
};

export default function EmailEntryScreen({navigation}: Props) {
  const [digits, setDigits]   = useState('');
  const [error, setError]     = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const sendOtp  = useSendOtp();

  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  {toValue: 1, duration: 380, useNativeDriver: true}),
      Animated.timing(slideUp, {toValue: 0, duration: 380, useNativeDriver: true}),
    ]).start();
    setTimeout(() => inputRef.current?.focus(), 480);
  }, []);

  const isValid   = validatePhoneDigits(digits);
  const canSubmit = isValid && !sendOtp.isPending;

  const handleChangeText = (text: string) => {
    const raw = stripPhoneFormatting(text).slice(0, 10);
    setDigits(raw);
    if (error) setError('');
  };

  const handleContinue = async () => {
    if (!isValid) { setError('Enter a valid 10-digit US phone number.'); return; }
    const phone = toE164(digits);
    try {
      await sendOtp.mutateAsync(phone);
      navigation.navigate('VerifyOtp', {contact: phone, contactType: 'phone'});
    } catch (err) {
      setError(extractApiError(err, 'Could not send code. Please try again.'));
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={s.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={s.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <TouchableOpacity
              style={s.backBtn}
              onPress={() => navigation.navigate('Onboarding')}
              activeOpacity={0.6}
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
              <View style={s.backWrap}>
                <Icon name="chevron-left" size={19} color={INK} />
              </View>
            </TouchableOpacity>

            <Animated.View style={{opacity: fadeIn, transform: [{translateY: slideUp}]}}>
              <View style={s.wordmark}>
                <Image source={require('@/assets/clerra-logo.png')} style={s.logoImg} resizeMode="contain" />
              </View>

              <Text style={s.title}>Enter your{'\n'}phone number.</Text>
              <Text style={s.sub}>We'll send a one-time code via SMS — no password needed.</Text>

              <View style={s.fieldBlock}>
                <View style={[
                  s.inputWrap,
                  focused && s.inputFocused,
                  !!error && s.inputError,
                ]}>
                  <TextInput
                    ref={inputRef}
                    style={s.input}
                    value={formatPhoneDisplay(digits)}
                    onChangeText={handleChangeText}
                    placeholder="(555) 555-5555"
                    placeholderTextColor={GRAY_L}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleContinue}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    selectionColor={ORANGE}
                  />
                  {isValid && (
                    <View style={s.checkWrap}>
                      <Icon name="check-circle" size={18} color={ORANGE} />
                    </View>
                  )}
                </View>

                {!!error && (
                  <View style={s.errorRow}>
                    <Icon name="alert-circle-outline" size={13} color="#DC2626" />
                    <Text style={s.errorText}>{error}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                disabled={!canSubmit}
                onPress={handleContinue}
                activeOpacity={0.88}
                style={[s.btn, !canSubmit && s.btnDisabled]}>
                {sendOtp.isPending
                  ? <ActivityIndicator color={WHITE} size="small" />
                  : <Text style={s.btnText}>Send code</Text>}
              </TouchableOpacity>

              <View style={s.trustRow}>
                <Icon name="lock-outline" size={12} color={GRAY_L} />
                <Text style={s.trustText}>End-to-end encrypted · No spam</Text>
              </View>

              <Text style={s.legal}>
                By continuing you agree to our{' '}
                <Text style={s.legalLink}>Terms</Text>
                {' '}and{' '}
                <Text style={s.legalLink}>Privacy Policy</Text>.
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: BG},
  safe: {flex: 1},
  kav:  {flex: 1},
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 40,
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

  wordmark: {
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  logoImg: {
    height: 48,
    aspectRatio: 711 / 392,
  },

  title: {
    fontSize: 40, fontWeight: '800',
    color: INK, letterSpacing: -1.8,
    lineHeight: 44, marginBottom: 10,
  },
  sub: {
    fontSize: 15, color: INK,
    lineHeight: 22, letterSpacing: -0.1,
    marginBottom: 32,
  },

  fieldBlock: {gap: 8, marginBottom: 20},
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1.5, borderColor: GRAY_L,
    height: 58, paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputFocused: {
    borderColor: ORANGE,
    shadowColor: ORANGE,
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  inputError: {borderColor: '#DC2626'},
  input: {
    flex: 1, color: INK,
    fontSize: 16, fontWeight: '500',
    letterSpacing: -0.2,
  },
  checkWrap: {marginLeft: 8},

  errorRow: {flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 2},
  errorText: {color: '#DC2626', fontSize: 12.5},

  btn: {
    backgroundColor: ORANGE,
    borderRadius: 99,
    height: 58,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: ORANGE,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.30,
    shadowRadius: 16,
    elevation: 8,
  },
  btnDisabled: {opacity: 0.38, shadowOpacity: 0},
  btnText: {
    color: WHITE, fontSize: 17,
    fontWeight: '700', letterSpacing: -0.3,
  },

  trustRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginBottom: 14,
  },
  trustText: {color: GRAY, fontSize: 12},

  legal: {color: GRAY, fontSize: 11.5, textAlign: 'center', lineHeight: 17},
  legalLink: {color: ORANGE, fontWeight: '600'},
});
