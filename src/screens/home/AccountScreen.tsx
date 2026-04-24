import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {useAuthStore} from '@/store/authStore';
import {useSignOut} from '@/hooks/useAuth';
import {useContracts} from '@/hooks/useContracts';
import {MainStackParamList} from '@/navigation/types';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

const BG       = '#F7F5F2';
const WHITE    = '#FFFFFF';
const INK      = '#111111';
const GRAY     = '#8C8C8C';
const GRAY_L   = '#E2DED8';
const ORANGE   = '#FF5C28';
const ORANGE_L = '#FFF0EB';

const APP_VERSION     = '1.0.0';
const CONTRACT_LIMIT  = 1;

const MENU: {icon: string; label: string; color: string; bg: string}[] = [
  {icon: 'bell-outline',        label: 'Notifications',     color: ORANGE,     bg: ORANGE_L},
  {icon: 'shield-lock-outline', label: 'Privacy & Security', color: '#10B981', bg: 'rgba(16,185,129,0.10)'},
  {icon: 'help-circle-outline', label: 'Help & Support',    color: '#8B5CF6',  bg: 'rgba(139,92,246,0.10)'},
  {icon: 'information-outline', label: 'About Clerra',      color: '#0A84FF',  bg: 'rgba(10,132,255,0.10)'},
];

export default function AccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const user    = useAuthStore(s => s.user);
  const signOut = useSignOut();
  const {data: contracts} = useContracts();

  const name     = user?.name ?? user?.phone ?? 'User';
  const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const count    = contracts?.length ?? 0;
  const pct      = Math.min((count / CONTRACT_LIMIT) * 100, 100);
  const isAtLimit = count >= CONTRACT_LIMIT;

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign out', style: 'destructive', onPress: () => signOut.mutate()},
    ]);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <SafeAreaView edges={['top']}>
          <View style={s.header}>
            <Text style={s.pageTitle}>Account</Text>
          </View>
        </SafeAreaView>

        {/* Avatar + name */}
        <View style={s.profileRow}>
          <View style={s.avatarWrap}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={s.profileMeta}>
            <Text style={s.profileName}>{name}</Text>
            {user?.phone && <Text style={s.profileSub}>{user.phone}</Text>}
            {user?.email && <Text style={s.profileSub}>{user.email}</Text>}
            <View style={s.planBadge}>
              <Icon name="lightning-bolt" size={10} color={ORANGE} />
              <Text style={s.planText}>Free plan</Text>
            </View>
          </View>
        </View>

        {/* Usage card */}
        <View style={s.usageCard}>
          <View style={s.usageTop}>
            <Text style={s.usageLabel}>Contract usage</Text>
            <Text style={s.usageCount}>
              <Text style={s.usageCountNum}>{count}</Text> / {CONTRACT_LIMIT}
            </Text>
          </View>
          <View style={s.trackBg}>
            <View style={[
              s.trackFill,
              {width: `${pct}%` as any, backgroundColor: isAtLimit ? '#EF4444' : ORANGE},
            ]} />
          </View>
          <Text style={s.usageSub}>
            {isAtLimit
              ? 'Limit reached — upgrade to create more'
              : `${CONTRACT_LIMIT - count} contracts remaining on free plan`}
          </Text>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          {[
            {label: 'Total',   value: count,                                                                         color: INK},
            {label: 'Signed',  value: contracts?.filter(c => c.status === 'completed').length ?? 0,                  color: '#16A34A'},
            {label: 'Pending', value: contracts?.filter(c => c.status === 'sent').length ?? 0,                       color: '#F59E0B'},
          ].map((st, i) => (
            <View key={i} style={s.statCard}>
              <Text style={[s.statNum, {color: st.color}]}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Upgrade banner */}
        {isAtLimit && (
          <TouchableOpacity
            style={s.upgradeBanner}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Paywall')}>
            <Icon name="crown-outline" size={16} color={ORANGE} />
            <View style={{flex: 1}}>
              <Text style={s.upgradeTitle}>Upgrade to Pro</Text>
              <Text style={s.upgradeSub}>Unlimited contracts & priority support</Text>
            </View>
            <View style={s.upgradePill}>
              <Text style={s.upgradePillText}>Upgrade →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Preferences */}
        <Text style={s.sectionLabel}>PREFERENCES</Text>
        <View style={s.menuGroup}>
          {MENU.map((item, i) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity style={s.menuRow} activeOpacity={0.6}>
                <View style={[s.menuIconWrap, {backgroundColor: item.bg}]}>
                  <Icon name={item.icon} size={17} color={item.color} />
                </View>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Icon name="chevron-right" size={15} color={GRAY_L} />
              </TouchableOpacity>
              {i < MENU.length - 1 && <View style={s.rowSep} />}
            </React.Fragment>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut} activeOpacity={0.65}>
          <Icon name="logout" size={16} color="#EF4444" />
          <Text style={s.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={s.version}>Clerra v{APP_VERSION}</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: BG},
  scroll: {paddingBottom: spacing[12]},

  header: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
  },
  pageTitle: {
    color: INK, fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold, letterSpacing: -0.8,
  },

  profileRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: spacing[4], paddingHorizontal: spacing[5],
    marginBottom: spacing[5],
  },
  avatarWrap: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: ORANGE,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: ORANGE,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.30,
    shadowRadius: 12, elevation: 6,
  },
  avatarText: {color: WHITE, fontSize: 22, fontWeight: fontWeight.bold, letterSpacing: -0.5},
  profileMeta: {flex: 1, gap: 3, paddingTop: 4},
  profileName: {color: INK, fontSize: fontSize.lg, fontWeight: fontWeight.bold, letterSpacing: -0.3},
  profileSub: {color: GRAY, fontSize: fontSize.sm},
  planBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', marginTop: 4,
    backgroundColor: ORANGE_L, borderRadius: borderRadius.full,
    borderWidth: 1, borderColor: 'rgba(255,92,40,0.20)',
    paddingHorizontal: 10, paddingVertical: 4,
  },
  planText: {color: ORANGE, fontSize: 11, fontWeight: fontWeight.semibold},

  usageCard: {
    marginHorizontal: spacing[5], marginBottom: spacing[5],
    backgroundColor: WHITE, borderRadius: borderRadius.xl,
    borderWidth: 1.5, borderColor: GRAY_L,
    padding: spacing[4], gap: spacing[3],
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  usageTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  usageLabel: {color: GRAY, fontSize: 13, fontWeight: fontWeight.medium},
  usageCount: {color: GRAY, fontSize: 13},
  usageCountNum: {color: INK, fontWeight: fontWeight.bold},
  trackBg: {height: 5, borderRadius: 3, backgroundColor: GRAY_L, overflow: 'hidden'},
  trackFill: {height: '100%', borderRadius: 3},
  usageSub: {color: GRAY, fontSize: 12},

  statsRow: {
    flexDirection: 'row', gap: spacing[3],
    paddingHorizontal: spacing[5], marginBottom: spacing[6],
  },
  statCard: {
    flex: 1, backgroundColor: WHITE,
    borderRadius: borderRadius.xl, borderWidth: 1.5, borderColor: GRAY_L,
    paddingVertical: spacing[4], alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  statNum: {fontSize: 24, fontWeight: fontWeight.extrabold, letterSpacing: -1},
  statLabel: {color: GRAY, fontSize: 11, fontWeight: fontWeight.medium},

  upgradeBanner: {
    marginHorizontal: spacing[5], marginBottom: spacing[6],
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    backgroundColor: ORANGE_L, borderRadius: borderRadius.xl,
    borderWidth: 1.5, borderColor: 'rgba(255,92,40,0.25)',
    padding: spacing[4],
  },
  upgradeTitle: {color: INK, fontSize: 13, fontWeight: fontWeight.bold, marginBottom: 2},
  upgradeSub: {color: GRAY, fontSize: 11},
  upgradePill: {
    backgroundColor: ORANGE, borderRadius: borderRadius.full,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  upgradePillText: {color: WHITE, fontSize: 12, fontWeight: fontWeight.bold},

  sectionLabel: {
    color: GRAY, fontSize: 11, fontWeight: fontWeight.semibold,
    letterSpacing: 0.8, paddingHorizontal: spacing[5], marginBottom: spacing[2],
  },
  menuGroup: {
    marginHorizontal: spacing[5], backgroundColor: WHITE,
    borderRadius: borderRadius.xl, borderWidth: 1.5, borderColor: GRAY_L,
    overflow: 'hidden', marginBottom: spacing[6],
    shadowColor: '#000', shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[4], paddingVertical: spacing[4],
  },
  menuIconWrap: {width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0},
  menuLabel: {flex: 1, color: INK, fontSize: fontSize.sm, fontWeight: fontWeight.medium},
  rowSep: {height: 1, marginLeft: spacing[4] + 34 + spacing[3], backgroundColor: GRAY_L},

  signOutBtn: {
    marginHorizontal: spacing[5],
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing[2], backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: borderRadius.xl, borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.20)',
    paddingVertical: spacing[4] + 1, marginBottom: spacing[4],
  },
  signOutText: {color: '#EF4444', fontSize: fontSize.sm, fontWeight: fontWeight.semibold},

  version: {color: GRAY_L, fontSize: 11, textAlign: 'center'},
});
