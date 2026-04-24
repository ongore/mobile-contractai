import React, {useCallback} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {MainStackParamList, HomeTabsParamList} from '@/navigation/types';
import {useContracts} from '@/hooks/useContracts';
import {useAuthStore} from '@/store/authStore';
import {ContractCard} from '@/components/contract/ContractCard';
import {Contract} from '@/types/contract';
import {spacing} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

const {width} = Dimensions.get('window');

const BG       = '#F7F5F2';
const WHITE    = '#FFFFFF';
const INK      = '#111111';
const GRAY     = '#8C8C8C';
const GRAY_L   = '#E2DED8';
const ORANGE   = '#FF5C28';
const ORANGE_L = '#FFF0EB';

const SIDE     = 10;
const CARD_GAP = 12;
const SMALL_W  = (width - SIDE * 2 - CARD_GAP) / 2;

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Mon=0 … Sun=6  →  JS getDay(): Sun=0, Mon=1 … Sat=6
function jsDay(monIndex: number) {
  return monIndex === 6 ? 0 : monIndex + 1;
}

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<HomeTabsParamList, 'Contracts'>,
    NativeStackNavigationProp<MainStackParamList>
  >;
};

export default function ContractsScreen({navigation}: Props) {
  const user = useAuthStore(s => s.user);
  const {data: contracts, isLoading, isRefetching, refetch} = useContracts();

  const handlePress = useCallback(
    (c: Contract) => navigation.navigate('ContractDetail', {contractId: c.id}),
    [navigation],
  );

  const firstName = user?.name?.split(' ')[0] ?? user?.phone ?? 'there';

  const total   = contracts?.length ?? 0;
  const signed  = contracts?.filter(c => c.status === 'completed' || c.status === 'signed_by_me' || c.status === 'signed_by_other').length ?? 0;
  const pending = contracts?.filter(c => c.status === 'sent' || c.status === 'viewed').length ?? 0;

  const FREE_LIMIT = 1;
  const isAtLimit = total >= FREE_LIMIT;

  const navigateOrPaywall = (method: 'screenshot' | 'text' | 'camera') => {
    if (isAtLimit) {
      navigation.navigate('Paywall');
    } else {
      navigation.navigate('InputMethod', {method});
    }
  };

  const handleUploadScan = () => navigateOrPaywall('screenshot');
  const handleFromText   = () => navigateOrPaywall('text');
  const handleFromCamera = () => navigateOrPaywall('camera');

  // Real per-day contract counts (Mon–Sun)
  const dayCounts = DAY_LABELS.map((_, i) =>
    contracts?.filter(c => new Date(c.createdAt).getDay() === jsDay(i)).length ?? 0,
  );
  const maxDay = Math.max(...dayCounts, 1);
  const bars   = dayCounts.map(n => n / maxDay);
  const todayBar = (() => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; })();

  const renderHeader = () => (
    <View style={s.headerWrap}>

      {/* ── TOP BAR ─────────────────────────────────── */}
      <SafeAreaView edges={['top']}>
        <View style={s.topBar}>
          <Image
            source={require('@/assets/clerra-logo.png')}
            style={s.logoImg}
            resizeMode="contain"
            accessibilityLabel="Clerra"
          />
        </View>
      </SafeAreaView>

      {/* ── GREETING ────────────────────────────────── */}
      <View style={s.greeting}>
        <Text style={s.greetTitle}>Hey, {firstName}!</Text>
        <Text style={s.greetSub}>What are you working on today?</Text>
      </View>

      {/* ── BENTO GRID ──────────────────────────────── */}
      <View style={s.bento}>

        <TouchableOpacity style={s.heroCard} onPress={handleUploadScan} activeOpacity={0.82}>
          <LinearGradient
            colors={['#E8380D', '#FF5C28', '#FF8040']}
            start={{x: 0, y: 0}} end={{x: 1, y: 1}}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>RECOMMENDED</Text>
          </View>
          <View style={s.heroTop}>
            <View style={s.heroIconSolid}>
              <Icon name="image-search-outline" size={28} color={WHITE} />
            </View>
          </View>
          <View style={s.heroBottom}>
            <Text style={[s.heroTitle, {color: WHITE}]}>Upload or Scan</Text>
            <Text style={[s.heroSub, {color: 'rgba(255,255,255,0.75)'}]}>
              Take a photo, pick an image, or import a PDF — our AI reads it instantly.
            </Text>
          </View>
        </TouchableOpacity>

        <View style={s.smallRow}>
          <TouchableOpacity style={[s.smallCard, {width: SMALL_W}]} onPress={handleFromText} activeOpacity={0.82}>
            <LinearGradient
              colors={['#4C1D95', '#7C3AED', '#A78BFA']}
              start={{x: 0, y: 0}} end={{x: 1, y: 1}}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View style={[s.smallIconWrap, {backgroundColor: 'rgba(255,255,255,0.20)'}]}>
              <Icon name="clipboard-text-outline" size={18} color={WHITE} />
            </View>
            <Text style={[s.smallTitle, {color: WHITE}]}>Paste {'&'} Draft</Text>
            <Text style={[s.smallSub, {color: 'rgba(255,255,255,0.65)'}]}>MANUAL INPUT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[s.smallCard, {width: SMALL_W}]} onPress={handleFromCamera} activeOpacity={0.82}>
            <LinearGradient
              colors={['#86198F', '#C026D3', '#E879F9']}
              start={{x: 0, y: 0}} end={{x: 1, y: 1}}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View style={[s.smallIconWrap, {backgroundColor: 'rgba(255,255,255,0.20)'}]}>
              <Icon name="camera-outline" size={18} color={WHITE} />
            </View>
            <Text style={[s.smallTitle, {color: WHITE}]}>Scan Document</Text>
            <Text style={[s.smallSub, {color: 'rgba(255,255,255,0.65)'}]}>CAMERA</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── INSIGHTS ────────────────────────────────── */}
      <View style={s.section}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Insights</Text>
          <View style={s.weekPill}>
            <Text style={s.weekPillText}>WEEKLY VIEW</Text>
          </View>
        </View>

        <View style={s.insightCard}>
          <LinearGradient
            colors={['#020617', '#0F172A', '#1E293B']}
            start={{x: 0, y: 0}} end={{x: 1, y: 1}}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['rgba(255,92,40,0.22)', 'rgba(124,58,237,0.10)', 'transparent']}
            start={{x: 1, y: 0}} end={{x: 0, y: 1}}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          <View style={s.insightTopRow}>
            <View>
              <View style={s.insightNumRow}>
                <Text style={[s.insightBig, {color: WHITE}]}>{total}</Text>
                <Text style={s.insightBigUnit}> contracts</Text>
              </View>
              <Text style={[s.insightMetaLabel, {color: 'rgba(255,255,255,0.45)'}]}>TOTAL CONTRACTS</Text>
              <View style={s.trendRow}>
                <Icon name="trending-up" size={10} color="#4ADE80" />
                <Text style={[s.trendText, {color: '#4ADE80'}]}>+{signed} signed</Text>
              </View>
            </View>

            <View style={s.insightRight}>
              <Text style={[s.statusLabel, {color: 'rgba(255,255,255,0.45)'}]}>STATUS</Text>
              <View style={s.statusPill}>
                <Text style={s.statusPillText}>
                  {pending > 0 ? 'Active' : signed > 0 ? 'Optimal' : 'Empty'}
                </Text>
              </View>
            </View>
          </View>

          <View style={s.chartOuter}>
            {bars.map((h, i) => (
              <View key={i} style={s.chartCol}>
                <Text style={[s.chartDay, i === todayBar ? {color: ORANGE} : {color: 'rgba(255,255,255,0.35)'}]}>
                  {DAY_LABELS[i]}
                </Text>
                {i === todayBar ? (
                  <LinearGradient
                    colors={[ORANGE, '#FF8A50']}
                    start={{x: 0, y: 0}} end={{x: 0, y: 1}}
                    style={[s.chartBar, {height: Math.max(Math.round(h * 52), 4),
                      shadowColor: ORANGE, shadowOffset: {width: 0, height: 4},
                      shadowOpacity: 0.6, shadowRadius: 8}]}
                  />
                ) : (
                  <View style={[s.chartBar, {
                    height: Math.max(Math.round(h * 52), 4),
                    backgroundColor: 'rgba(255,255,255,0.12)',
                  }]} />
                )}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ── RECENT DOCS HEADER ──────────────────────── */}
      <View style={s.recentHeader}>
        <Text style={s.sectionTitle}>Recent Documents</Text>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={s.loading}>
          <ActivityIndicator color={ORANGE} size="large" />
          <Text style={s.loadingText}>Loading…</Text>
        </View>
      );
    }
    return (
      <View style={s.emptyWrap}>
        <View style={s.emptyIcon}>
          <Icon name="file-document-outline" size={28} color={ORANGE} />
        </View>
        <Text style={s.emptyTitle}>No contracts yet</Text>
        <Text style={s.emptySub}>Create your first AI-generated contract in seconds.</Text>
        <TouchableOpacity style={s.emptyBtn} onPress={handleUploadScan} activeOpacity={0.88}>
          <Text style={s.emptyBtnText}>Create Contract</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <FlatList
        data={contracts ?? []}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <ContractCard contract={item} onPress={() => handlePress(item)} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[s.list, (!contracts || !contracts.length) && s.listEmpty]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={ORANGE} colors={[ORANGE]} />
        }
        ItemSeparatorComponent={() => (
          <View style={{height: 1, backgroundColor: GRAY_L, marginHorizontal: SIDE}} />
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: BG},
  list: {paddingBottom: 140},
  listEmpty: {flexGrow: 1},
  headerWrap: {backgroundColor: 'transparent'},

  topBar: {
    paddingLeft: 14,
    paddingRight: 20,
    paddingBottom: spacing[3],
    paddingTop: spacing[3],
  },
  logoImg: {height: 48, aspectRatio: 1.81},
  iconBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: WHITE,
    borderWidth: 1, borderColor: GRAY_L,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  greeting: {
    paddingHorizontal: SIDE,
    paddingLeft: 20,
    paddingTop: spacing[2],
    paddingBottom: spacing[6],
  },
  greetTitle: {
    color: INK, fontSize: 36,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -1.5, marginBottom: 4,
  },
  greetSub: {color: GRAY, fontSize: fontSize.sm, fontWeight: fontWeight.medium},

  bento: {paddingHorizontal: SIDE, gap: CARD_GAP, marginBottom: spacing[6]},

  heroCard: {
    borderRadius: 20, padding: spacing[5], overflow: 'hidden',
    backgroundColor: ORANGE, borderWidth: 0,
    shadowColor: ORANGE, shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.40, shadowRadius: 20, elevation: 10,
  },
  heroBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 16,
  },
  heroBadgeText: {color: WHITE, fontSize: 9, fontWeight: fontWeight.bold, letterSpacing: 1},
  heroTop: {marginBottom: spacing[5]},
  heroIconGrad: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.20, shadowRadius: 12, elevation: 6,
  },
  heroIconSolid: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  },
  heroBottom: {gap: 8},
  heroTitle: {color: INK, fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, letterSpacing: -0.6},
  heroSub: {color: GRAY, fontSize: fontSize.xs, lineHeight: 18, maxWidth: '80%'},

  smallRow: {flexDirection: 'row', gap: CARD_GAP},
  smallCard: {
    borderRadius: 20, padding: spacing[4], gap: spacing[3], overflow: 'hidden',
    backgroundColor: '#7C3AED', borderWidth: 0,
    shadowColor: '#7C3AED', shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  smallIconWrap: {width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  smallTitle: {color: INK, fontSize: 13, fontWeight: fontWeight.bold, letterSpacing: -0.2},
  smallSub: {color: GRAY, fontSize: 9, fontWeight: fontWeight.bold, letterSpacing: 1.0, textTransform: 'uppercase'},

  section: {paddingHorizontal: SIDE, marginBottom: spacing[6]},
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing[4], paddingHorizontal: 2,
  },
  sectionTitle: {color: INK, fontSize: fontSize.lg, fontWeight: fontWeight.extrabold, letterSpacing: -0.4},
  weekPill: {
    borderRadius: 999, borderWidth: 1,
    borderColor: 'rgba(255,92,40,0.30)', paddingHorizontal: 10, paddingVertical: 4,
  },
  weekPillText: {color: ORANGE, fontSize: 9, fontWeight: fontWeight.bold, letterSpacing: 0.8},

  insightCard: {
    borderRadius: 20, padding: spacing[5], overflow: 'hidden',
    backgroundColor: '#0D2247', borderWidth: 0,
    shadowColor: '#0D2247', shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.40, shadowRadius: 20, elevation: 10,
  },
  insightTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: spacing[6],
  },
  insightNumRow: {flexDirection: 'row', alignItems: 'flex-end', gap: 2},
  insightBig: {color: INK, fontSize: 48, fontWeight: fontWeight.extrabold, letterSpacing: -2.5, lineHeight: 48},
  insightBigUnit: {color: ORANGE, fontSize: 18, fontWeight: fontWeight.extrabold, paddingBottom: 6},
  insightMetaLabel: {color: GRAY, fontSize: 9, fontWeight: fontWeight.bold, letterSpacing: 1.0, textTransform: 'uppercase', marginTop: 4},
  trendRow: {flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4},
  trendText: {color: '#16A34A', fontSize: 10, fontWeight: fontWeight.bold},
  insightRight: {alignItems: 'flex-end', gap: 6},
  statusLabel: {color: GRAY, fontSize: 9, fontWeight: fontWeight.bold, letterSpacing: 0.8, textTransform: 'uppercase'},
  statusPill: {
    borderRadius: 999, borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.40)', backgroundColor: 'rgba(74,222,128,0.15)',
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusPillText: {color: '#4ADE80', fontSize: 10, fontWeight: fontWeight.bold},

  chartOuter: {flexDirection: 'row', alignItems: 'flex-end', height: 72, gap: 5},
  chartCol: {flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 72, gap: 5},
  chartDay: {color: GRAY, fontSize: 8, fontWeight: fontWeight.bold, textTransform: 'uppercase'},
  chartDayActive: {color: ORANGE},
  chartBar: {width: '100%', borderTopLeftRadius: 5, borderTopRightRadius: 5},

  recentHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIDE, paddingBottom: spacing[3],
  },

  loading: {alignItems: 'center', paddingTop: spacing[12], gap: spacing[4]},
  loadingText: {color: GRAY, fontSize: fontSize.sm},
  emptyWrap: {alignItems: 'center', paddingTop: spacing[12], paddingHorizontal: SIDE * 2, gap: spacing[4]},
  emptyIcon: {
    width: 68, height: 68, borderRadius: 20, backgroundColor: ORANGE_L,
    borderWidth: 1, borderColor: 'rgba(255,92,40,0.20)',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2],
  },
  emptyTitle: {color: INK, fontSize: fontSize.xl, fontWeight: fontWeight.bold, letterSpacing: -0.4},
  emptySub: {color: GRAY, fontSize: fontSize.sm, textAlign: 'center', lineHeight: 20},
  emptyBtn: {
    backgroundColor: ORANGE, borderRadius: 99,
    paddingVertical: spacing[3] + 2, paddingHorizontal: spacing[6],
    marginTop: spacing[2],
    shadowColor: ORANGE, shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.30, shadowRadius: 16, elevation: 8,
  },
  emptyBtnText: {color: WHITE, fontSize: fontSize.sm, fontWeight: fontWeight.bold},
});
