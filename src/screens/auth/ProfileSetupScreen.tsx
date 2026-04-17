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

export default function ProfileSetupScreen() {
  const [name, setName]       = useState('');
  const [error, setError]     = useState('');
  const [focused, setFocused] = useState(false);
  const nameRef = useRef<TextInput>(null);
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
    if (error) setError('');
    if (t.trim().length >= 2) {
      Animated.spring(checkScale, {toValue: 1, tension: 180, friction: 8, useNativeDriver: true}).start();
    } else {
      Animated.timing(checkScale, {toValue: 0, duration: 140, useNativeDriver: true}).start();
    }
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) { setError('Please enter at least 2 characters.'); return; }
    setError('');
    try {
      await completeProfile.mutateAsync(trimmed);
    } catch (err) {
      setError(extractApiError(err, 'Could not save profile. Please try again.'));
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

              {/* Progress */}
              <View style={s.progressRow}>
                {[1, 2, 3].map(n => (
                  <View key={n} style={[s.progressSeg, {backgroundColor: ORANGE}]} />
                ))}
              </View>
              <Text style={s.progressLabel}>Final step — 3 of 3</Text>

              {/* Headline */}
              <Text style={s.title}>What should{'\n'}we call you?</Text>
              <Text style={s.sub}>You can always update this in Settings.</Text>

              {/* Name input */}
              <View style={s.fieldBlock}>
                <View style={[
                  s.inputWrap,
                  focused && s.inputFocused,
                  !!error && s.inputError,
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
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    selectionColor={ORANGE}
                  />
                  <Animated.View style={{transform: [{scale: checkScale}]}}>
                    <Icon name="check-circle" size={20} color={ORANGE} />
                  </Animated.View>
                </View>
                {!!error && (
                  <View style={s.errorRow}>
                    <Icon name="alert-circle-outline" size={12} color="#DC2626" />
                    <Text style={s.errorText}>{error}</Text>
                  </View>
                )}
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

  progressRow: {flexDirection: 'row', gap: 4, marginBottom: 8},
  progressSeg: {
    flex: 1, height: 3, borderRadius: 99,
    backgroundColor: ORANGE,
  },
  progressLabel: {
    fontSize: 12, color: GRAY,
    fontWeight: '500', letterSpacing: 0.2,
    marginBottom: 28,
  },

  title: {
    fontSize: 40, fontWeight: '800',
    color: INK, letterSpacing: -1.8,
    lineHeight: 44, marginBottom: 10,
  },
  sub: {
    fontSize: 15, color: GRAY,
    lineHeight: 22, marginBottom: 30,
  },

  fieldBlock: {gap: 8, marginBottom: 24},
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

  // Next card
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
