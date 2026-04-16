import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {useAuthStore} from '@/store/authStore';
import {useContracts} from '@/hooks/useContracts';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

const APP_VERSION = '1.0.0';
const CONTRACT_LIMIT = 10;

const MENU: {icon: string; label: string; color: string; bg: string}[] = [
  {icon: 'bell-outline',         label: 'Notifications',    color: '#0A84FF', bg: 'rgba(10,132,255,0.12)'},
  {icon: 'shield-lock-outline',  label: 'Privacy & Security', color: '#10B981', bg: 'rgba(48,209,88,0.12)'},
  {icon: 'help-circle-outline',  label: 'Help & Support',   color: '#F59E0B', bg: 'rgba(255,159,10,0.12)'},
  {icon: 'information-outline',  label: 'About ContractAI', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)'},
];

export default function AccountScreen() {
  const user    = useAuthStore(s => s.user);
  const signOut = useAuthStore(s => s.signOut);
  const {data: contracts} = useContracts();

  const name     = user?.name ?? user?.email?.split('@')[0] ?? 'User';
  const email    = user?.email ?? '';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const count    = contracts?.length ?? 0;
  const pct      = Math.min((count / CONTRACT_LIMIT) * 100, 100);
  const isAtLimit = count >= CONTRACT_LIMIT;

  const handleSignOut = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Sign out', style: 'destructive', onPress: signOut},
      ],
    );
  };

  return (
    <LinearGradient
      colors={['#0D2247', '#020617', '#150D38']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}>

        {/* Profile header */}
        <View style={s.profileSection}>

          <SafeAreaView edges={['top']}>
            <View style={s.profileInner}>
              {/* Title */}
              <Text style={s.pageTitle}>Account</Text>

              {/* Avatar + info */}
              <View style={s.profileRow}>
                <View style={s.avatarWrap}>
                  <LinearGradient
                    colors={['#3B82F6', '#3B82F6']}
                    start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                    style={s.avatarGrad}>
                    <Text style={s.avatarText}>{initials}</Text>
                  </LinearGradient>
                  <View style={s.avatarBadge}>
                    <Icon name="check-decagram" size={12} color="#10B981" />
                  </View>
                </View>
                <View style={s.profileMeta}>
                  <Text style={s.profileName}>{name}</Text>
                  <Text style={s.profileEmail}>{email}</Text>
                  <View style={s.planBadge}>
                    <LinearGradient
                      colors={['rgba(59,130,246,0.25)', 'rgba(59,130,246,0.25)']}
                      start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                      style={s.planGrad}>
                      <Icon name="lightning-bolt" size={10} color="#3B82F6" />
                      <Text style={s.planText}>Free plan</Text>
                    </LinearGradient>
                  </View>
                </View>
              </View>

              {/* Usage */}
              <View style={s.usageCard}>
                <View style={s.usageTop}>
                  <Text style={s.usageLabel}>Contract usage</Text>
                  <Text style={s.usageCount}>
                    <Text style={s.usageCountNum}>{count}</Text>
                    <Text style={s.usageCountSep}> / </Text>
                    {CONTRACT_LIMIT}
                  </Text>
                </View>
                <View style={s.trackBg}>
                  <LinearGradient
                    colors={isAtLimit ? ['#EF4444', '#FF6B6B'] : ['#3B82F6', '#3B82F6']}
                    start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                    style={[s.trackFill, {width: `${pct}%`}]}
                  />
                </View>
                <Text style={s.usageSub}>
                  {isAtLimit
                    ? 'Limit reached — upgrade to create more'
                    : `${CONTRACT_LIMIT - count} contracts remaining on free plan`}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          {[
            {label: 'Total',   value: count, color: '#FFFFFF'},
            {label: 'Signed',  value: contracts?.filter(c => c.status === 'completed').length ?? 0, color: '#10B981'},
            {label: 'Pending', value: contracts?.filter(c => c.status === 'sent').length ?? 0,      color: '#F59E0B'},
          ].map((st, i) => (
            <View key={i} style={s.statCard}>
              <Text style={[s.statNum, {color: st.color}]}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Upgrade banner (if at limit) */}
        {isAtLimit && (
          <View style={s.upgradeBanner}>
            <LinearGradient
              colors={['rgba(59,130,246,0.18)', 'rgba(59,130,246,0.18)']}
              start={{x: 0, y: 0}} end={{x: 1, y: 0}}
              style={s.upgradeBannerGrad}>
              <View style={s.upgradeLeft}>
                <Icon name="crown-outline" size={16} color="#3B82F6" />
                <View>
                  <Text style={s.upgradeTitle}>Upgrade to Pro</Text>
                  <Text style={s.upgradeSub}>Unlimited contracts & priority support</Text>
                </View>
              </View>
              <View style={s.upgradePill}>
                <Text style={s.upgradePillText}>Upgrade →</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Section label */}
        <Text style={s.sectionLabel}>PREFERENCES</Text>

        {/* Menu items */}
        <View style={s.menuGroup}>
          {MENU.map((item, i) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity style={s.menuRow} activeOpacity={0.6}>
                <View style={[s.menuIconWrap, {backgroundColor: item.bg}]}>
                  <Icon name={item.icon} size={17} color={item.color} />
                </View>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Icon name="chevron-right" size={15} color="rgba(235,235,245,0.20)" />
              </TouchableOpacity>
              {i < MENU.length - 1 && (
                <View style={s.rowSep} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={s.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.65}>
          <Icon name="logout" size={16} color="#EF4444" />
          <Text style={s.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={s.version}>ContractAI v{APP_VERSION}</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: {flex: 1},
  scroll: {paddingBottom: spacing[12]},

  // Profile section
  profileSection: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    marginBottom: spacing[5],
  },
  profileInner: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.8,
    marginTop: spacing[3],
    marginBottom: spacing[6],
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[4],
    marginBottom: spacing[5],
  },
  avatarWrap: {position: 'relative'},
  avatarGrad: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  avatarText: {
    color: '#fff', fontSize: 22, fontWeight: fontWeight.bold, letterSpacing: -0.5,
  },
  avatarBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 22, height: 22, borderRadius: 8,
    backgroundColor: '#000',
    borderWidth: 2, borderColor: '#000',
    alignItems: 'center', justifyContent: 'center',
  },
  profileMeta: {flex: 1, gap: 3, paddingTop: 4},
  profileName: {
    color: '#FFFFFF', fontSize: fontSize.lg,
    fontWeight: fontWeight.bold, letterSpacing: -0.3,
  },
  profileEmail: {
    color: 'rgba(235,235,245,0.45)', fontSize: fontSize.sm,
  },
  planBadge: {alignSelf: 'flex-start', marginTop: 4},
  planGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)',
  },
  planText: {color: '#3B82F6', fontSize: 11, fontWeight: fontWeight.semibold},

  usageCard: {
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: spacing[4],
    gap: spacing[3],
  },
  usageTop: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  usageLabel: {color: 'rgba(235,235,245,0.55)', fontSize: 13, fontWeight: fontWeight.medium},
  usageCount: {color: 'rgba(235,235,245,0.40)', fontSize: 13},
  usageCountNum: {color: '#FFFFFF', fontWeight: fontWeight.bold},
  usageCountSep: {},
  trackBg: {
    height: 5, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  trackFill: {height: '100%', borderRadius: 3},
  usageSub: {color: 'rgba(235,235,245,0.35)', fontSize: 12},

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    marginBottom: spacing[6],
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingVertical: spacing[4],
    alignItems: 'center',
    gap: 4,
  },
  statNum: {fontSize: 24, fontWeight: fontWeight.extrabold, letterSpacing: -1},
  statLabel: {color: 'rgba(235,235,245,0.40)', fontSize: 11, fontWeight: fontWeight.medium},

  // Upgrade banner
  upgradeBanner: {
    marginHorizontal: spacing[5],
    marginBottom: spacing[6],
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.20)',
  },
  upgradeBannerGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    gap: spacing[3],
  },
  upgradeLeft: {flexDirection: 'row', alignItems: 'center', gap: spacing[3], flex: 1},
  upgradeTitle: {color: '#FFFFFF', fontSize: 13, fontWeight: fontWeight.bold, marginBottom: 2},
  upgradeSub: {color: 'rgba(235,235,245,0.50)', fontSize: 11},
  upgradePill: {
    backgroundColor: '#3B82F6',
    borderRadius: borderRadius.full,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  upgradePillText: {color: '#fff', fontSize: 12, fontWeight: fontWeight.bold},

  // Section label
  sectionLabel: {
    color: 'rgba(235,235,245,0.30)',
    fontSize: 11, fontWeight: fontWeight.semibold,
    letterSpacing: 0.8,
    paddingHorizontal: spacing[5],
    marginBottom: spacing[2],
  },

  // Menu
  menuGroup: {
    marginHorizontal: spacing[5],
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
    marginBottom: spacing[6],
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  menuIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  menuLabel: {
    flex: 1, color: '#FFFFFF', fontSize: fontSize.sm, fontWeight: fontWeight.medium,
  },
  rowSep: {
    height: 1, marginLeft: spacing[4] + 34 + spacing[3],
    backgroundColor: 'rgba(84,84,88,0.25)',
  },

  // Sign out
  signOutBtn: {
    marginHorizontal: spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    backgroundColor: 'rgba(255,69,58,0.10)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,69,58,0.20)',
    paddingVertical: spacing[4] + 1,
    marginBottom: spacing[4],
  },
  signOutText: {
    color: '#EF4444', fontSize: fontSize.sm, fontWeight: fontWeight.semibold,
  },

  version: {
    color: 'rgba(235,235,245,0.20)',
    fontSize: 11, textAlign: 'center',
  },
});
