import React, {useCallback} from 'react';
import {
  View,
  Text,
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
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

const {width} = Dimensions.get('window');
const SIDE = spacing[5];
const CARD_GAP = 12;
const SMALL_W = (width - SIDE * 2 - CARD_GAP) / 2;

// Day labels + bar proportions
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const BARS = [0.30, 0.55, 0.45, 0.75, 0.60, 1.0, 0.70];
const ACTIVE_BAR = 5; // Saturday (peak)

// Glass card helper styles
const GLASS = {
  backgroundColor: 'rgba(15, 23, 42, 0.80)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
} as const;

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
  const handleUploadScan = () => navigation.navigate('InputMethod', {method: 'screenshot'});
  const handleFromText   = () => navigation.navigate('InputMethod', {method: 'text'});
  const handleFromCamera = () => navigation.navigate('InputMethod', {method: 'camera'});

  const firstName = user?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';
  const initials  = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  const total   = contracts?.length ?? 0;
  const signed  = contracts?.filter(c => c.status === 'completed' || c.status === 'signed_by_other').length ?? 0;
  const pending = contracts?.filter(c => c.status === 'sent' || c.status === 'viewed').length ?? 0;
  const draft   = Math.max(0, total - signed - pending);

  const renderHeader = () => (
    <View style={s.headerWrap}>

      {/* ── HEADER BAR ─────────────────────────────── */}
      <SafeAreaView edges={['top']}>
        <View style={s.topBar}>
          {/* Search pill */}
          <TouchableOpacity style={s.searchPill} activeOpacity={0.75}>
            <Icon name="magnify" size={17} color="#64748B" />
            <Text style={s.searchPlaceholder}>Search contracts…</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}>
            <Icon name="cog-outline" size={19} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ── GREETING ────────────────────────────────── */}
      <View style={s.greeting}>
        <Text style={s.greetTitle}>Welcome {firstName}!</Text>
        <Text style={s.greetSub}>Start your legal architecture.</Text>
      </View>

      {/* ── BENTO GRID ──────────────────────────────── */}
      <View style={s.bento}>

        {/* Hero card — Upload or Scan */}
        <TouchableOpacity
          style={[s.heroCard, GLASS]}
          onPress={handleUploadScan}
          activeOpacity={0.82}>

          <LinearGradient
            colors={['rgba(59,130,246,0.14)', 'transparent']}
            start={{x: 0, y: 0}} end={{x: 1, y: 1}}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>RECOMMENDED</Text>
          </View>

          <View style={s.heroTop}>
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              start={{x: 0, y: 0}} end={{x: 1, y: 1}}
              style={s.heroIconGrad}>
              <Icon name="image-search-outline" size={28} color="#fff" />
            </LinearGradient>
          </View>

          <View style={s.heroBottom}>
            <Text style={s.heroTitle}>Upload or Scan</Text>
            <Text style={s.heroSub}>
              Take a photo, pick an image, or import a PDF — our AI reads it instantly.
            </Text>
          </View>

          <View style={s.heroArrowBtn}>
            <Icon name="arrow-right" size={15} color="#3B82F6" />
          </View>
        </TouchableOpacity>

        {/* Small bento row */}
        <View style={s.smallRow}>
          <TouchableOpacity
            style={[s.smallCard, GLASS, {width: SMALL_W}]}
            onPress={handleFromText}
            activeOpacity={0.82}>
            <LinearGradient
              colors={['rgba(139,92,246,0.14)', 'transparent']}
              start={{x: 0, y: 0}} end={{x: 1, y: 1}}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View style={[s.smallIconWrap, {backgroundColor: 'rgba(139,92,246,0.12)'}]}>
              <Icon name="clipboard-text-outline" size={18} color="#8B5CF6" />
            </View>
            <Text style={s.smallTitle}>Paste{'\n'}&amp; Draft</Text>
            <Text style={s.smallSub}>MANUAL INPUT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.smallCard, GLASS, {width: SMALL_W}]}
            onPress={handleFromCamera}
            activeOpacity={0.82}>
            <LinearGradient
              colors={['rgba(217,70,239,0.14)', 'transparent']}
              start={{x: 0, y: 0}} end={{x: 1, y: 1}}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <View style={[s.smallIconWrap, {backgroundColor: 'rgba(217,70,239,0.12)'}]}>
              <Icon name="camera-outline" size={18} color="#D946EF" />
            </View>
            <Text style={s.smallTitle}>Scan{'\n'}Document</Text>
            <Text style={s.smallSub}>CAMERA</Text>
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

        <View style={[s.insightCard, GLASS, {borderColor: 'rgba(59,130,246,0.20)'}]}>

          <View style={s.insightTopRow}>
            <View>
              <View style={s.insightNumRow}>
                <Text style={s.insightBig}>{total}</Text>
                <Text style={s.insightBigUnit}> contracts</Text>
              </View>
              <View style={s.insightMetaRow}>
                <Text style={s.insightMetaLabel}>TOTAL CONTRACTS</Text>
              </View>
              <View style={s.trendRow}>
                <Icon name="trending-up" size={10} color="#10B981" />
                <Text style={s.trendText}>+{signed} signed</Text>
              </View>
            </View>

            <View style={s.insightRight}>
              <Text style={s.statusLabel}>STATUS</Text>
              <View style={s.statusPill}>
                <Text style={s.statusPillText}>
                  {pending > 0 ? 'Active' : signed > 0 ? 'Optimal' : 'Empty'}
                </Text>
              </View>
            </View>
          </View>

          {/* Bar chart with day labels */}
          <View style={s.chartOuter}>
            {BARS.map((h, i) => (
              <View key={i} style={s.chartCol}>
                {/* Day label */}
                <Text style={[
                  s.chartDay,
                  i === ACTIVE_BAR && s.chartDayActive,
                ]}>
                  {DAYS[i]}
                </Text>
                {/* Bar */}
                {i === ACTIVE_BAR ? (
                  <LinearGradient
                    colors={['#3B82F6', '#8B5CF6']}
                    start={{x: 0, y: 0}} end={{x: 0, y: 1}}
                    style={[s.chartBar, {height: Math.round(h * 52)}]}
                  />
                ) : (
                  <View style={[
                    s.chartBar,
                    {
                      height: Math.round(h * 52),
                      backgroundColor: i === 3
                        ? 'rgba(255,255,255,0.12)'
                        : 'rgba(255,255,255,0.06)',
                      borderTopWidth: i === 3 ? 1.5 : 0,
                      borderColor: 'rgba(59,130,246,0.4)',
                    },
                  ]} />
                )}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ── RECENT DOCS HEADER ──────────────────────── */}
      <View style={s.recentHeader}>
        <Text style={s.sectionTitle}>Recent Documents</Text>
        <TouchableOpacity activeOpacity={0.65}>
          <Text style={s.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={s.loading}>
          <ActivityIndicator color="#3B82F6" size="large" />
          <Text style={s.loadingText}>Loading…</Text>
        </View>
      );
    }
    return (
      <View style={s.emptyWrap}>
        <View style={[s.emptyIcon, GLASS]}>
          <Icon name="file-document-outline" size={28} color="#3B82F6" />
        </View>
        <Text style={s.emptyTitle}>No contracts yet</Text>
        <Text style={s.emptySub}>Create your first AI-generated contract in seconds.</Text>
        <TouchableOpacity style={s.emptyBtn} onPress={handleUploadScan} activeOpacity={0.85}>
          <LinearGradient
            colors={['#3B82F6', '#8B5CF6']}
            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
            style={s.emptyBtnGrad}>
            <Text style={s.emptyBtnText}>Create Contract</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#0D2247', '#020617', '#150D38']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

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
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        ItemSeparatorComponent={() => (
          <View style={{
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.05)',
            marginHorizontal: SIDE,
          }} />
        )}
      />
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#020617'},
  list: {paddingBottom: 140},
  listEmpty: {flexGrow: 1},

  headerWrap: {backgroundColor: 'transparent'},

  // ── Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIDE,
    paddingBottom: spacing[2],
    paddingTop: spacing[2],
    gap: spacing[3],
  },
  avatarRingWrap: {
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarRing: {
    width: 36, height: 36, borderRadius: 10, padding: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInner: {
    flex: 1, width: '100%',
    borderRadius: 8.5,
    backgroundColor: '#0F172A',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {color: '#F8FAFC', fontSize: 12, fontWeight: fontWeight.bold},
  brandText: {
    flex: 1,
    color: '#3B82F6',
    fontSize: 15, fontWeight: fontWeight.bold, letterSpacing: -0.4,
  },
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchPlaceholder: {
    color: '#64748B',
    fontSize: 14,
    letterSpacing: -0.1,
  },
  topRight: {flexDirection: 'row', gap: 4},
  iconBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Greeting
  greeting: {
    paddingHorizontal: SIDE,
    paddingTop: spacing[5],
    paddingBottom: spacing[6],
  },
  greetTitle: {
    color: '#F8FAFC',
    fontSize: 36,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -1.5,
    marginBottom: 4,
  },
  greetSub: {
    color: '#94A3B8',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  // ── Bento grid
  bento: {
    paddingHorizontal: SIDE,
    gap: CARD_GAP,
    marginBottom: spacing[6],
  },

  // Hero card
  heroCard: {
    borderRadius: 20,
    padding: spacing[5],
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.35)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 16,
  },
  heroBadgeText: {
    color: '#60A5FA',
    fontSize: 9,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  heroTop: {
    marginBottom: spacing[5],
  },
  heroIconGrad: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  heroArrowBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59,130,246,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.25)',
    borderRadius: 10,
    padding: 8,
    marginTop: 16,
  },
  heroBottom: {gap: 8},
  heroTitle: {
    color: '#F8FAFC',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.6,
  },
  heroSub: {
    color: '#64748B',
    fontSize: fontSize.xs,
    lineHeight: 18,
    maxWidth: '80%',
  },

  // Small bento cards
  smallRow: {flexDirection: 'row', gap: CARD_GAP},
  smallCard: {
    borderRadius: 20,
    padding: spacing[4],
    gap: spacing[3],
    overflow: 'hidden',
  },
  smallIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  smallTitle: {
    color: '#F8FAFC', fontSize: 13,
    fontWeight: fontWeight.bold, letterSpacing: -0.2,
  },
  smallSub: {
    color: '#475569',
    fontSize: 9, fontWeight: fontWeight.bold,
    letterSpacing: 1.0, textTransform: 'uppercase',
  },

  // ── Section header
  section: {paddingHorizontal: SIDE, marginBottom: spacing[6]},
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.4,
  },
  weekPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.35)',
    paddingHorizontal: 10, paddingVertical: 4,
  },
  weekPillText: {
    color: '#3B82F6', fontSize: 9,
    fontWeight: fontWeight.bold, letterSpacing: 0.8,
  },

  // ── Insights card
  insightCard: {
    borderRadius: 20,
    padding: spacing[5],
    overflow: 'hidden',
  },
  insightTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[6],
  },
  insightNumRow: {flexDirection: 'row', alignItems: 'flex-end', gap: 2},
  insightBig: {
    color: '#F8FAFC',
    fontSize: 48,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -2.5,
    lineHeight: 48,
  },
  insightBigUnit: {
    color: '#3B82F6',
    fontSize: 18, fontWeight: fontWeight.extrabold,
    paddingBottom: 6,
  },
  insightMetaRow: {marginTop: 4},
  insightMetaLabel: {
    color: '#475569',
    fontSize: 9, fontWeight: fontWeight.bold,
    letterSpacing: 1.0, textTransform: 'uppercase',
  },
  trendRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 3, marginTop: 4,
  },
  trendText: {
    color: '#10B981', fontSize: 10, fontWeight: fontWeight.bold,
  },
  insightRight: {alignItems: 'flex-end', gap: 6},
  statusLabel: {
    color: '#475569', fontSize: 9,
    fontWeight: fontWeight.bold, letterSpacing: 0.8, textTransform: 'uppercase',
  },
  statusPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    backgroundColor: 'rgba(16,185,129,0.10)',
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusPillText: {
    color: '#10B981', fontSize: 10, fontWeight: fontWeight.bold,
  },

  // Bar chart
  chartOuter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 72,
    gap: 5,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 72,
    gap: 5,
  },
  chartDay: {
    color: '#475569',
    fontSize: 8,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
  },
  chartDayActive: {color: '#3B82F6'},
  chartBar: {
    width: '100%',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    minHeight: 4,
  },

  // ── Recent header
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE,
    paddingBottom: spacing[3],
  },
  viewAll: {
    color: '#3B82F6', fontSize: 12, fontWeight: fontWeight.bold,
  },

  // ── Empty state
  loading: {alignItems: 'center', paddingTop: spacing[12], gap: spacing[4]},
  loadingText: {color: '#64748B', fontSize: fontSize.sm},
  emptyWrap: {
    alignItems: 'center',
    paddingTop: spacing[12],
    paddingHorizontal: SIDE * 2,
    gap: spacing[4],
  },
  emptyIcon: {
    width: 68, height: 68, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing[2],
  },
  emptyTitle: {
    color: '#F8FAFC', fontSize: fontSize.xl,
    fontWeight: fontWeight.bold, letterSpacing: -0.4,
  },
  emptySub: {
    color: '#64748B', fontSize: fontSize.sm,
    textAlign: 'center', lineHeight: 20,
  },
  emptyBtn: {
    borderRadius: 14, overflow: 'hidden', marginTop: spacing[2],
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 14, elevation: 8,
  },
  emptyBtnGrad: {
    paddingVertical: spacing[3] + 2,
    paddingHorizontal: spacing[6],
    alignItems: 'center',
  },
  emptyBtnText: {
    color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.bold,
  },
});
