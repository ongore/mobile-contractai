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
import {useCompleteProfile} from '@/hooks/useAuth';
import {extractApiError} from '@/utils/apiError';

const BG     = '#F7F5F2';
const WHITE  = '#FFFFFF';
const INK    = '#111111';
const GRAY   = '#8C8C8C';
const GRAY_L = '#E2DED8';
const ORANGE = '#FF5C28';
const ORANGE_L = '#FFF0EB';

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function ProfileSetupScreen() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [nameError, setNameError]   = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameFocused, setNameFocused]   = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const nameRef  = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const completeProfile = useCompleteProfile();

  const fadeIn     = useRef(new Animated.Value(0)).current;
  const slideUp    = useRef(new Animated.Value(20)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  {toValue: 1, duration: 400, useNativeDriver: true}),
      Animated.timing(slideUp, {toValue: 0, duration: 400, useNativeDriver: true}),
    ]).start();
    setTimeout(() => nameRef.current?.focus(), 500);
  }, []);

  const canSubmit = name.trim().length >= 2 && !completeProfile.isPending;

  const handleNameChange = (t: string) => {
    setName(t);
    if (nameError) setNameError('');
    if (t.trim().length >= 2) {
      Animated.spring(checkScale, {toValue: 1, tension: 180, friction: 8, useNativeDriver: true}).start();
    } else {
      Animated.timing(checkScale, {toValue: 0, duration: 140, useNativeDriver: true}).start();
    }
  };

  const handleEmailChange = (t: string) => {
    setEmail(t);
    if (emailError) setEmailError('');
  };

  const handleSubmit = async () => {
    const trimmedName  = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setNameError('Please enter at least 2 characters.');
      return;
    }
    if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      setEmailError('Enter a valid email address.');
      return;
    }

    setNameError('');
    setEmailError('');
    try {
      await completeProfile.mutateAsync({
        name: trimmedName,
        email: trimmedEmail || undefined,
      });
    } catch (err) {
      setNameError(extractApiError(err, 'Could not save profile. Please try again.'));
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

            <Animated.View style={{opacity: fadeIn, transform: [{translateY: slideUp}]}}>

              {/* Top wordmark */}
              <View style={s.wordmark}>
                <Image source={require('@/assets/clerra-logo.png')} style={s.logoImg} resizeMode="contain" />
              </View>

              {/* Headline */}
              <Text style={s.title}>Set up your{'\n'}profile.</Text>
              <Text style={s.sub}>Just the basics — you can always update this later.</Text>

              {/* Name input */}
              <View style={s.fieldBlock}>
                <Text style={s.fieldLabel}>Your name</Text>
                <View style={[
                  s.inputWrap,
                  nameFocused && s.inputFocused,
                  !!nameError && s.inputError,
                ]}>
                  <TextInput
                    ref={nameRef}
                    style={s.input}
                    value={name}
                    onChangeText={handleNameChange}
                    placeholder="Jane Smith"
                    placeholderTextColor={GRAY_L}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                    selectionColor={ORANGE}
                  />
                  <Animated.View style={{transform: [{scale: checkScale}]}}>
                    <Icon name="check-circle" size={20} color={ORANGE} />
                  </Animated.View>
                </View>
                {!!nameError && (
                  <View style={s.errorRow}>
                    <Icon name="alert-circle-outline" size={12} color="#DC2626" />
                    <Text style={s.errorText}>{nameError}</Text>
                  </View>
                )}
              </View>

              {/* Email input (optional) */}
              <View style={s.fieldBlock}>
                <View style={s.fieldLabelRow}>
                  <Text style={s.fieldLabel}>Email address</Text>
                  <View style={s.optionalBadge}>
                    <Text style={s.optionalText}>Optional</Text>
                  </View>
                </View>
                <View style={[
                  s.inputWrap,
                  emailFocused && s.inputFocused,
                  !!emailError && s.inputError,
                ]}>
                  <TextInput
                    ref={emailRef}
                    style={s.input}
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder="you@example.com"
                    placeholderTextColor={GRAY_L}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    selectionColor={ORANGE}
                  />
                  {email.length > 0 && isValidEmail(email) && (
                    <Icon name="check-circle" size={20} color={ORANGE} />
                  )}
                </View>
                {!!emailError && (
                  <View style={s.errorRow}>
                    <Icon name="alert-circle-outline" size={12} color="#DC2626" />
                    <Text style={s.errorText}>{emailError}</Text>
                  </View>
                )}
                <Text style={s.emailHint}>
                  Add your email to receive contract copies and signing notifications.
                </Text>
              </View>

              {/* Preview card */}
              <View style={s.nextCard}>
                <Text style={s.nextCardLabel}>YOU'LL BE ABLE TO</Text>
                {[
                  {icon: 'creation',             label: 'Draft contracts with AI'},
                  {icon: 'draw-pen',             label: 'Send for e-signature instantly'},
                  {icon: 'shield-check-outline', label: 'Track every step in real-time'},
                ].map((item, i) => (
                  <View key={i} style={[s.nextRow, i > 0 && s.nextRowBorder]}>
                    <View style={s.nextIcon}>
                      <Icon name={item.icon as any} size={14} color={ORANGE} />
                    </View>
                    <Text style={s.nextLabel}>{item.label}</Text>
                    <Icon name="chevron-right" size={14} color={GRAY_L} />
                  </View>
                ))}
              </View>

              {/* CTA */}
              <TouchableOpacity
                disabled={!canSubmit}
                onPress={handleSubmit}
                activeOpacity={0.88}
                style={[s.btn, !canSubmit && s.btnDisabled]}>
                {completeProfile.isPending
                  ? <ActivityIndicator color={WHITE} size="small" />
                  : <Text style={s.btnText}>Enter Clerra</Text>}
              </TouchableOpacity>

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
    paddingTop: 20,
    paddingBottom: 44,
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
    lineHeight: 22, marginBottom: 30,
  },

  fieldBlock: {gap: 8, marginBottom: 20},
  fieldLabelRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  fieldLabel: {
    fontSize: 13, fontWeight: '600',
    color: INK, letterSpacing: -0.1,
  },
  optionalBadge: {
    backgroundColor: ORANGE_L,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  optionalText: {
    fontSize: 10, fontWeight: '700',
    color: ORANGE, letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  emailHint: {
    fontSize: 12, color: GRAY,
    lineHeight: 17, paddingLeft: 2,
  },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1.5, borderColor: GRAY_L,
    height: 58, paddingHorizontal: 18, gap: 10,
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
    fontSize: 16, fontWeight: '500', letterSpacing: -0.2,
  },
  errorRow: {flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 2},
  errorText: {color: '#DC2626', fontSize: 12.5},

  nextCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1, borderColor: GRAY_L,
    padding: 18,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  nextCardLabel: {
    fontSize: 9, fontWeight: '800',
    color: GRAY_L, letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  nextRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, paddingVertical: 11,
  },
  nextRowBorder: {
    borderTopWidth: 1, borderTopColor: '#F4F2EF',
  },
  nextIcon: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: ORANGE_L,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  nextLabel: {
    flex: 1, color: INK,
    fontSize: 14, fontWeight: '500',
  },

  btn: {
    backgroundColor: ORANGE,
    borderRadius: 99,
    height: 58,
    alignItems: 'center', justifyContent: 'center',
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
});
