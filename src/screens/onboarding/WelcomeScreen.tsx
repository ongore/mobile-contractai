import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '@/navigation/types';
import {useAuthStore} from '@/store/authStore';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

const {width} = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;
};

const MOCK_CONTRACTS = [
  {title: 'Master Service Agreement', party: 'Acme Corp',     status: 'Draft',      color: '#8B5CF6'},
  {title: 'NDAs — Project Phoenix',   party: 'TechStart Inc', status: 'Finalized',  color: '#10B981'},
  {title: 'Privacy Policy Update',    party: 'Studio Blue',   status: 'Reviewing',  color: '#D946EF'},
];
const DAYS  = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const BARS  = [0.30, 0.55, 0.45, 0.75, 0.60, 1.0, 0.70];

export default function WelcomeScreen({navigation}: Props) {
  const setHasSeenOnboarding = useAuthStore(s => s.setHasSeenOnboarding);

  const fadeCard = useRef(new Animated.Value(0)).current;
  const slideCard = useRef(new Animated.Value(28)).current;
  const fadeText = useRef(new Animated.Value(0)).current;
  const slideText = useRef(new Animated.Value(16)).current;
  const fadeCta = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeCard,  {toValue: 1, duration: 540, useNativeDriver: true}),
        Animated.spring(slideCard, {toValue: 0, tension: 62, friction: 12, useNativeDriver: true}),
      ]),
      Animated.delay(60),
      Animated.parallel([
        Animated.timing(fadeText,  {toValue: 1, duration: 460, useNativeDriver: true}),
        Animated.spring(slideText, {toValue: 0, tension: 70, friction: 13, useNativeDriver: true}),
      ]),
      Animated.delay(60),
      Animated.timing(fadeCta, {toValue: 1, duration: 360, useNativeDriver: true}),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#0D2247', '#020617', '#150D38']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>

        {/* ── Wordmark ──────────────────────────────── */}
        <View style={s.topBar}>
          <View style={s.brandRow}>
            <Text style={s.brandText}>ContractAi</Text>
          </View>
          <View style={s.atTag}>
            <Text style={s.atTagText}>ATELIER</Text>
          </View>
        </View>

        {/* ── Glass product card ────────────────────── */}
        <Animated.View
          style={[s.cardWrap, {opacity: fadeCard, transform: [{translateY: slideCard}]}]}>


          <View style={s.glassCard}>
            {/* Top specular line */}
            <LinearGradient
              colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0)']}
              style={s.specular}
            />

            {/* Card header */}
            <View style={s.cardHeader}>
              <View style={s.cardHeaderLeft}>
                <View style={s.headerDot} />
                <Text style={s.cardHeaderTitle}>Recent Documents</Text>
              </View>
              <View style={s.cardHeaderBadge}>
                <Text style={s.cardHeaderBadgeText}>3</Text>
              </View>
            </View>

            {/* Document rows */}
            {MOCK_CONTRACTS.map((row, i) => (
              <View key={i} style={[s.docRow, i < 2 && s.docRowBorder]}>
                <View style={[s.docIcon, {backgroundColor: `${row.color}14`, borderColor: `${row.color}22`}]}>
                  <Icon name="file-document-outline" size={16} color={row.color} />
                </View>
                <View style={s.docBody}>
                  <Text style={s.docTitle}>{row.title}</Text>
                  <Text style={s.docParty}>{row.party}</Text>
                </View>
                {/* Outlined pill badge */}
                <View style={[s.docBadge, {borderColor: `${row.color}40`}]}>
                  <Text style={[s.docBadgeText, {color: row.color}]}>{row.status}</Text>
                </View>
              </View>
            ))}

            {/* Mini insights strip */}
            <View style={s.miniInsight}>
              <View style={s.miniInsightLeft}>
                <Text style={s.miniInsightNum}>84<Text style={s.miniInsightPct}>%</Text></Text>
                <Text style={s.miniInsightLabel}>COMPLIANCE</Text>
              </View>
              <View style={s.miniChart}>
                {BARS.map((h, i) => (
                  <View key={i} style={s.miniChartCol}>
                    <Text style={[s.miniDay, i === 5 && s.miniDayActive]}>{DAYS[i]}</Text>
                    {i === 5 ? (
                      <LinearGradient
                        colors={['#3B82F6', '#8B5CF6']}
                        start={{x: 0, y: 0}} end={{x: 0, y: 1}}
                        style={[s.miniBar, {height: Math.round(h * 32)}]}
                      />
                    ) : (
                      <View style={[s.miniBar, {
                        height: Math.round(h * 32),
                        backgroundColor: 'rgba(255,255,255,0.07)',
                      }]} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Floating notification chip */}
          <View style={s.notifChip}>
            <View style={s.notifIconWrap}>
              <Icon name="check-circle" size={14} color="#10B981" />
            </View>
            <View>
              <Text style={s.notifTitle}>Contract Signed</Text>
              <Text style={s.notifSub}>Jane Smith · just now</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Headline ──────────────────────────────── */}
        <Animated.View
          style={[s.textBlock, {opacity: fadeText, transform: [{translateY: slideText}]}]}>
          <Text style={s.headline}>
            Contracts that{'\n'}
            <Text style={s.headlineBlue}>close deals.</Text>
          </Text>
          <Text style={s.tagline}>
            AI-generated. Legally binding. Signed and tracked entirely on your phone.
          </Text>
        </Animated.View>

        {/* ── CTA ───────────────────────────────────── */}
        <Animated.View style={[s.cta, {opacity: fadeCta}]}>
          <TouchableOpacity
            onPress={() => { setHasSeenOnboarding(true); navigation.navigate('OnboardingStep1'); }}
            activeOpacity={0.84}
            style={s.ctaBtnWrap}>
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              start={{x: 0, y: 0}} end={{x: 1, y: 0}}
              style={s.ctaBtn}>
              <Text style={s.ctaBtnText}>Get started</Text>
              <View style={s.ctaArrow}>
                <Icon name="arrow-right" size={15} color="rgba(255,255,255,0.8)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('OnboardingStep1')}
            activeOpacity={0.6}>
            <Text style={s.signIn}>
              Already have an account?{' '}
              <Text style={s.signInLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const CARD_W = width - spacing[5] * 2;

const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#020617'},
  safe: {flex: 1, paddingHorizontal: spacing[5]},

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: spacing[4], paddingBottom: spacing[5],
  },
  brandRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  logoGrad: {
    width: 32, height: 32, borderRadius: 10, padding: 1.5,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5,
  },
  logoInner: {
    flex: 1, width: '100%', borderRadius: 8.5,
    backgroundColor: '#0F172A',
    alignItems: 'center', justifyContent: 'center',
  },
  logoGlyph: {fontSize: 13, color: '#3B82F6'},
  brandText: {
    color: '#3B82F6', fontSize: 14,
    fontWeight: fontWeight.bold, letterSpacing: -0.3,
  },
  atTag: {
    borderRadius: 999, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  atTagText: {color: '#475569', fontSize: 9, fontWeight: fontWeight.bold, letterSpacing: 1.5},

  // Card
  cardWrap: {position: 'relative', alignItems: 'center', marginBottom: spacing[6]},
  glassCard: {
    width: CARD_W,
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 20}, shadowOpacity: 0.70, shadowRadius: 36, elevation: 18,
  },
  specular: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 50,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[3],
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  cardHeaderLeft: {flexDirection: 'row', alignItems: 'center', gap: 7},
  headerDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6', shadowOffset: {width: 0, height: 0}, shadowOpacity: 1, shadowRadius: 5,
  },
  cardHeaderTitle: {
    color: '#F8FAFC', fontSize: 12,
    fontWeight: fontWeight.bold, letterSpacing: -0.2,
  },
  cardHeaderBadge: {
    width: 18, height: 18, borderRadius: 6,
    backgroundColor: 'rgba(59,130,246,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardHeaderBadgeText: {color: '#3B82F6', fontSize: 9, fontWeight: fontWeight.bold},

  // Doc rows
  docRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
  },
  docRowBorder: {borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)'},
  docIcon: {
    width: 34, height: 34, borderRadius: 10, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  docBody: {flex: 1},
  docTitle: {
    color: '#F8FAFC', fontSize: 11,
    fontWeight: fontWeight.semibold, marginBottom: 2,
  },
  docParty: {color: '#475569', fontSize: 10},
  docBadge: {
    borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  docBadgeText: {
    fontSize: 9, fontWeight: fontWeight.bold,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },

  // Mini insight strip
  miniInsight: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  miniInsightLeft: {gap: 2},
  miniInsightNum: {
    color: '#F8FAFC', fontSize: 22,
    fontWeight: fontWeight.extrabold, letterSpacing: -0.8,
  },
  miniInsightPct: {color: '#3B82F6', fontSize: 14},
  miniInsightLabel: {
    color: '#475569', fontSize: 8,
    fontWeight: fontWeight.bold, letterSpacing: 0.8, textTransform: 'uppercase',
  },
  miniChart: {flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 48},
  miniChartCol: {
    flex: 1, alignItems: 'center',
    justifyContent: 'flex-end', height: 48, gap: 3,
  },
  miniDay: {color: '#334155', fontSize: 7, fontWeight: fontWeight.bold},
  miniDayActive: {color: '#3B82F6'},
  miniBar: {width: '100%', borderTopLeftRadius: 3, borderTopRightRadius: 3, minHeight: 3},

  // Notification chip
  notifChip: {
    position: 'absolute', top: -12, right: -8,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.60, shadowRadius: 16, elevation: 10,
  },
  notifIconWrap: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: 'rgba(16,185,129,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  notifTitle: {color: '#F8FAFC', fontSize: 11, fontWeight: fontWeight.bold},
  notifSub: {color: '#64748B', fontSize: 10},

  // Text
  textBlock: {marginBottom: spacing[6]},
  headline: {
    color: '#F8FAFC',
    fontSize: 36,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -1.8, lineHeight: 42,
    marginBottom: spacing[4],
  },
  headlineBlue: {color: '#3B82F6'},
  tagline: {
    color: '#64748B', fontSize: fontSize.sm,
    lineHeight: 22, maxWidth: width * 0.82,
  },

  // CTA
  cta: {marginTop: 'auto', paddingBottom: spacing[2], gap: spacing[4]},
  ctaBtnWrap: {
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.40, shadowRadius: 20, elevation: 10,
  },
  ctaBtn: {
    paddingVertical: spacing[4] + 2,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[3],
  },
  ctaBtnText: {
    color: '#FFFFFF', fontSize: fontSize.base,
    fontWeight: fontWeight.bold, letterSpacing: -0.2,
  },
  ctaArrow: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  signIn: {color: '#475569', fontSize: fontSize.sm, textAlign: 'center'},
  signInLink: {color: '#3B82F6', fontWeight: fontWeight.semibold},
});
