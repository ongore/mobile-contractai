import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PACKAGE_TYPE, PurchasesPackage} from 'react-native-purchases';
import {MainStackParamList} from '@/navigation/types';
import {useRevenueCat} from '@/hooks/useRevenueCat';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

type Props = NativeStackScreenProps<MainStackParamList, 'Paywall'>;

const BG       = '#F7F5F2';
const WHITE    = '#FFFFFF';
const INK      = '#111111';
const GRAY     = '#8C8C8C';
const GRAY_L   = '#E2DED8';
const ORANGE   = '#FF5C28';
const ORANGE_L = '#FFF0EB';

const FEATURES: Array<{icon: keyof typeof Icon.glyphMap; label: string}> = [
  {icon: 'infinity',              label: 'Unlimited contracts'},
  {icon: 'auto-fix',              label: 'AI-powered extraction'},
  {icon: 'file-sign',             label: 'E-signatures with audit trail'},
  {icon: 'cloud-check-outline',   label: 'Cloud sync across devices'},
  {icon: 'headset',               label: 'Priority support'},
];

type BillingCycle = 'yearly' | 'monthly';

export default function PaywallScreen({navigation}: Props) {
  const {offering, loading, purchasePackage, restorePurchases} = useRevenueCat();
  const [cycle, setCycle] = useState<BillingCycle>('yearly');
  const [purchasing, setPurchasing] = useState(false);

  const {yearly, monthly} = useMemo(() => {
    const pkgs = offering?.availablePackages ?? [];
    return {
      yearly:  pkgs.find(p => p.packageType === PACKAGE_TYPE.ANNUAL)  ?? null,
      monthly: pkgs.find(p => p.packageType === PACKAGE_TYPE.MONTHLY) ?? null,
    };
  }, [offering]);

  const activePkg: PurchasesPackage | null =
    cycle === 'yearly' ? (yearly ?? monthly) : (monthly ?? yearly);

  const yearlySavings = useMemo(() => {
    if (!yearly || !monthly) return null;
    const m12 = monthly.product.price * 12;
    if (!m12) return null;
    return Math.round(((m12 - yearly.product.price) / m12) * 100);
  }, [yearly, monthly]);

  const handleUpgrade = async () => {
    if (!activePkg || purchasing) return;
    setPurchasing(true);
    const ok = await purchasePackage(activePkg);
    setPurchasing(false);
    if (ok) {
      Alert.alert('Welcome to Clerra Pro', 'Your subscription is active.');
      navigation.goBack();
    }
  };

  const handleRestore = async () => {
    const ok = await restorePurchases();
    Alert.alert(
      ok ? 'Purchases restored' : 'Nothing to restore',
      ok
        ? 'Your Clerra Pro subscription is active.'
        : 'No active subscription was found for this account.',
    );
    if (ok) navigation.goBack();
  };

  const ctaLabel = activePkg
    ? `Continue · ${activePkg.product.priceString}`
    : 'Continue';

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="close" size={20} color={INK} />
        </TouchableOpacity>

        <View style={s.content}>
          <View style={s.topGroup}>
            {/* Logo */}
            <View style={s.logoWrap}>
              <Image
                source={require('@/assets/clerra-logo.png')}
                style={s.logoImg}
                resizeMode="contain"
              />
            </View>

            {/* Hero */}
            <View style={s.hero}>
              <View style={s.limitBadge}>
                <Icon name="lock-outline" size={11} color={ORANGE} />
                <Text style={s.limitBadgeText}>FREE LIMIT REACHED</Text>
              </View>
              <Text style={s.heroTitle}>Clerra Pro</Text>
              <Text style={s.heroSub}>
                Unlimited contracts, AI extraction, and priority support.
              </Text>
            </View>

            {/* Features */}
            <View style={s.featureList}>
              {FEATURES.map(f => (
                <View key={f.label} style={s.featureRow}>
                  <View style={s.featureIconWrap}>
                    <Icon name={f.icon} size={16} color={ORANGE} />
                  </View>
                  <Text style={s.featureText}>{f.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Trust strip */}
          <View style={s.trustRow}>
            <View style={s.trustItem}>
              <Icon name="shield-check-outline" size={13} color={ORANGE} />
              <Text style={s.trustText}>Secure payments</Text>
            </View>
            <View style={s.trustDivider} />
            <View style={s.trustItem}>
              <Icon name="close-circle-outline" size={13} color={ORANGE} />
              <Text style={s.trustText}>Cancel anytime</Text>
            </View>
            <View style={s.trustDivider} />
            <View style={s.trustItem}>
              <Icon name="block-helper" size={11} color={ORANGE} />
              <Text style={s.trustText}>No ads</Text>
            </View>
          </View>

          {/* Plan selection */}
          {loading ? (
            <View style={s.loadingBlock}>
              <ActivityIndicator color={ORANGE} />
            </View>
          ) : !yearly && !monthly ? (
            <Text style={s.errorText}>
              Subscriptions are unavailable right now. Please try again later.
            </Text>
          ) : (
            <View style={s.planList}>
              {yearly && (
                <PlanCard
                  pkg={yearly}
                  title="Yearly"
                  sub={pricePerMonth(yearly)}
                  selected={cycle === 'yearly'}
                  badge={yearlySavings ? `SAVE ${yearlySavings}%` : 'BEST VALUE'}
                  onPress={() => setCycle('yearly')}
                />
              )}
              {monthly && (
                <PlanCard
                  pkg={monthly}
                  title="Monthly"
                  sub="Billed monthly"
                  selected={cycle === 'monthly'}
                  onPress={() => setCycle('monthly')}
                />
              )}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <TouchableOpacity
            onPress={handleUpgrade}
            activeOpacity={0.88}
            disabled={!activePkg || purchasing || loading}
            style={[s.ctaOuter, (!activePkg || purchasing || loading) && {opacity: 0.6}]}>
            <LinearGradient
              colors={[ORANGE, '#FF8A50']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={s.ctaGrad}>
              {purchasing || loading ? (
                <ActivityIndicator color={WHITE} />
              ) : (
                <>
                  <Icon name="crown-outline" size={18} color={WHITE} />
                  <Text style={s.ctaText}>{ctaLabel}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={s.disclosureText}>
            {Platform.OS === 'ios'
              ? 'Payment charged to your Apple Account at purchase. Auto-renews unless canceled at least 24 hours before the period ends. Manage in your App Store account settings.'
              : 'Payment charged to your Google Play account at purchase. Auto-renews unless canceled at least 24 hours before the period ends. Manage in your Google Play account settings.'}
          </Text>

          <View style={s.legalRow}>
            <Pressable onPress={() => Linking.openURL('https://clerra.app/terms')} hitSlop={8}>
              <Text style={s.legalLink}>Terms of Use</Text>
            </Pressable>
            <Text style={s.legalDot}>·</Text>
            <Pressable onPress={() => Linking.openURL('https://clerra.app/privacy')} hitSlop={8}>
              <Text style={s.legalLink}>Privacy</Text>
            </Pressable>
            <Text style={s.legalDot}>·</Text>
            <Pressable onPress={handleRestore} hitSlop={8}>
              <Text style={s.legalLink}>Restore</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function pricePerMonth(pkg: PurchasesPackage): string {
  const perMonth = pkg.product.price / 12;
  const currency = pkg.product.priceString.replace(/[\d.,\s]/g, '').trim();
  return `${currency}${perMonth.toFixed(2)} / month · billed yearly`;
}

interface PlanCardProps {
  pkg:      PurchasesPackage;
  title:    string;
  sub:      string;
  selected: boolean;
  badge?:   string;
  onPress:  () => void;
}

function PlanCard({pkg, title, sub, selected, badge, onPress}: PlanCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[s.planCard, selected && s.planCardSelected]}>
      <View style={[s.radio, selected && s.radioSelected]}>
        {selected && <View style={s.radioDot} />}
      </View>
      <View style={s.planBody}>
        <View style={s.planTitleRow}>
          <Text style={s.planTitle}>{title}</Text>
          {badge && (
            <View style={s.planBadge}>
              <Text style={s.planBadgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={s.planSub}>{sub}</Text>
      </View>
      <Text style={s.planPrice}>{pkg.product.priceString}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: BG},
  safe: {flex: 1},

  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: GRAY_L,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {flex: 1, justifyContent: 'space-between'},
  topGroup: {},

  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[5],
    gap: spacing[3],
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustText: {
    color: INK,
    fontSize: 11.5,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.1,
  },
  trustDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: GRAY_L,
  },

  logoWrap: {alignItems: 'center', marginTop: spacing[4]},
  logoImg: {height: 30, width: 56},

  hero: {alignItems: 'center', paddingHorizontal: spacing[6], marginTop: spacing[3]},
  limitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: ORANGE_L,
    borderWidth: 1,
    borderColor: 'rgba(255,92,40,0.25)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: spacing[3],
  },
  limitBadgeText: {
    color: ORANGE,
    fontSize: 10,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: INK,
    fontSize: 28,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -1,
    marginBottom: spacing[1],
  },
  heroSub: {
    color: GRAY,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },

  featureList: {
    marginTop: spacing[5],
    paddingHorizontal: spacing[5],
    gap: spacing[2],
  },
  featureRow: {flexDirection: 'row', alignItems: 'center', gap: spacing[3]},
  featureIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: ORANGE_L,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    color: INK,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  loadingBlock: {paddingVertical: spacing[8], alignItems: 'center'},
  errorText: {
    color: GRAY,
    fontSize: fontSize.sm,
    textAlign: 'center',
    marginTop: spacing[6],
    paddingHorizontal: spacing[5],
  },

  planList: {
    marginTop: spacing[5],
    paddingHorizontal: spacing[5],
    gap: spacing[2],
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: WHITE,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: GRAY_L,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  planCardSelected: {
    borderColor: ORANGE,
    backgroundColor: '#FFF8F5',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: GRAY_L,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {borderColor: ORANGE},
  radioDot: {width: 10, height: 10, borderRadius: 5, backgroundColor: ORANGE},
  planBody: {flex: 1},
  planTitleRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  planTitle: {
    color: INK,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  planBadge: {
    backgroundColor: ORANGE,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  planBadgeText: {
    color: WHITE,
    fontSize: 9,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  planSub: {color: GRAY, fontSize: 12, marginTop: 2},
  planPrice: {
    color: INK,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },

  footer: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: GRAY_L,
  },
  ctaOuter: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: ORANGE,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: 16,
    borderRadius: borderRadius.xl,
  },
  ctaText: {
    color: WHITE,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },

  disclosureText: {
    textAlign: 'center',
    color: GRAY,
    fontSize: 10,
    lineHeight: 14,
    marginTop: spacing[3],
    paddingHorizontal: spacing[2],
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
    paddingBottom: spacing[2],
  },
  legalLink: {
    color: INK,
    fontSize: 11,
    fontWeight: fontWeight.semibold,
  },
  legalDot: {color: GRAY_L, fontSize: 11},
});
