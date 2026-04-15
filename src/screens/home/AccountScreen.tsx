import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import {useSignOut} from '@/hooks/useAuth';
import {useAuthStore} from '@/store/authStore';
import {useContracts} from '@/hooks/useContracts';
import {colors} from '@/theme/colors';
import {spacing, borderRadius, shadow} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';
import {FREE_CONTRACT_LIMIT} from '@/utils/constants';

const APP_VERSION = '1.0.0';

export default function AccountScreen() {
  const user = useAuthStore(s => s.user);
  const signOut = useSignOut();
  const {data: contracts} = useContracts();

  const contractCount = contracts?.length ?? 0;
  const isAtLimit = contractCount >= FREE_CONTRACT_LIMIT;
  const usagePercent = Math.min(
    (contractCount / FREE_CONTRACT_LIMIT) * 100,
    100,
  );

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut.mutate(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            {user?.name && (
              <Text style={styles.profileName}>{user.name}</Text>
            )}
            <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
          </View>
        </View>

        {/* Usage Card */}
        <View style={styles.usageCard}>
          <View style={styles.usageHeader}>
            <Text style={styles.usageTitle}>Free Plan Usage</Text>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>Free</Text>
            </View>
          </View>

          <Text style={styles.usageCount}>
            {contractCount}/{FREE_CONTRACT_LIMIT} contracts used
          </Text>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${usagePercent}%` as any,
                  backgroundColor: isAtLimit ? colors.danger : colors.accent,
                },
              ]}
            />
          </View>

          {isAtLimit && (
            <Text style={styles.limitWarning}>
              You've reached your free contract limit.
            </Text>
          )}
        </View>

        {/* Upgrade Card */}
        {isAtLimit && (
          <TouchableOpacity style={styles.upgradeCard} activeOpacity={0.9}>
            <View style={styles.upgradeLeft}>
              <Text style={styles.upgradeIcon}>⚡</Text>
              <View>
                <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
                <Text style={styles.upgradeSubtitle}>
                  Unlimited contracts + priority support
                </Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color={colors.white} />
          </TouchableOpacity>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionLabel}>Preferences</Text>
          {[
            {icon: 'bell-outline', label: 'Notifications', onPress: () => {}},
            {icon: 'shield-outline', label: 'Privacy & Security', onPress: () => {}},
            {icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {}},
            {icon: 'information-outline', label: 'About', onPress: () => {}},
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}>
              <Icon name={item.icon} size={20} color={colors.text.secondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Icon
                name="chevron-right"
                size={18}
                color={colors.border.default}
                style={styles.menuChevron}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={signOut.isPending}
          activeOpacity={0.8}>
          <Icon name="logout" size={18} color={colors.danger} />
          <Text style={styles.signOutText}>
            {signOut.isPending ? 'Signing out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>ContractFlow v{APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    paddingBottom: spacing[8],
  },
  header: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[5],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing[5],
    marginTop: spacing[5],
    padding: spacing[5],
    borderRadius: borderRadius.xl,
    ...shadow.md,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing[1],
  },
  profileEmail: {
    color: colors.muted,
    fontSize: fontSize.sm,
  },
  usageCard: {
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing[5],
    marginTop: spacing[4],
    padding: spacing[5],
    borderRadius: borderRadius.xl,
    ...shadow.sm,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  usageTitle: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  planBadge: {
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  planBadgeText: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  usageCount: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    marginBottom: spacing[3],
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  limitWarning: {
    color: colors.danger,
    fontSize: fontSize.xs,
    marginTop: spacing[2],
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.accent,
    marginHorizontal: spacing[5],
    marginTop: spacing[4],
    padding: spacing[5],
    borderRadius: borderRadius.xl,
    ...shadow.lg,
  },
  upgradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  upgradeIcon: {
    fontSize: 24,
  },
  upgradeTitle: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  upgradeSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: fontSize.xs,
  },
  menuSection: {
    marginHorizontal: spacing[5],
    marginTop: spacing[6],
  },
  menuSectionLabel: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing[4],
    gap: spacing[3],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[1],
  },
  menuLabel: {
    flex: 1,
    color: colors.text.primary,
    fontSize: fontSize.base,
  },
  menuChevron: {
    marginLeft: 'auto',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginHorizontal: spacing[5],
    marginTop: spacing[6],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  signOutText: {
    color: colors.danger,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  version: {
    color: colors.muted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing[6],
  },
});
