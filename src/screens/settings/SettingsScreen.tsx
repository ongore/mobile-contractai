import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {MainStackParamList} from '@/navigation/types';
import {useAuthStore} from '@/store/authStore';
import {useDeleteAccount, useSignOut} from '@/hooks/useAuth';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

const BG     = '#F7F5F2';
const WHITE  = '#FFFFFF';
const INK    = '#111111';
const GRAY   = '#8C8C8C';
const GRAY_L = '#E2DED8';
const ORANGE = '#FF5C28';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Settings'>;
};

export default function SettingsScreen({navigation}: Props) {
  const user          = useAuthStore(s => s.user);
  const signOut       = useSignOut();
  const deleteAccount = useDeleteAccount();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: () => signOut.mutate()},
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Icon name="close" size={20} color={INK} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.accountCard}>
            <View style={styles.accountAvatar}>
              <Text style={styles.accountAvatarText}>
                {user?.name?.[0]?.toUpperCase() ?? user?.phone?.[0] ?? 'U'}
              </Text>
            </View>
            <View style={styles.accountInfo}>
              {user?.name && <Text style={styles.accountName}>{user.name}</Text>}
              {user?.phone && <Text style={styles.accountSub}>{user.phone}</Text>}
              {user?.email && <Text style={styles.accountSub}>{user.email}</Text>}
            </View>
          </View>
        </View>

        {/* App settings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>App</Text>
          {[
            {icon: 'bell-outline',     label: 'Notifications', value: 'Enabled'},
            {icon: 'theme-light-dark', label: 'Appearance',    value: 'System'},
            {icon: 'translate',        label: 'Language',       value: 'English'},
          ].map(item => (
            <TouchableOpacity key={item.label} style={styles.menuItem} activeOpacity={0.7}>
              <Icon name={item.icon} size={20} color={GRAY} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuValue}>{item.value}</Text>
              <Icon name="chevron-right" size={16} color={GRAY_L} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Privacy</Text>
          {[
            {icon: 'shield-lock-outline', label: 'Privacy Policy',   danger: false, onPress: () => {}},
            {icon: 'file-document-outline', label: 'Terms of Service', danger: false, onPress: () => {}},
            {
              icon: 'delete-outline', label: 'Delete Account', danger: true,
              onPress: () => {
                Alert.alert(
                  'Delete Account',
                  'This action is irreversible. All your contracts and data will be permanently deleted.',
                  [
                    {text: 'Cancel', style: 'cancel'},
                    {text: 'Delete', style: 'destructive', onPress: () => deleteAccount.mutate()},
                  ],
                );
              },
            },
          ].map(item => (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
              <Icon name={item.icon} size={20} color={item.danger ? '#EF4444' : GRAY} />
              <Text style={[styles.menuLabel, item.danger && {color: '#EF4444'}]}>{item.label}</Text>
              <Icon name="chevron-right" size={16} color={GRAY_L} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={signOut.isPending || deleteAccount.isPending}
          activeOpacity={0.8}>
          <Icon name="logout" size={18} color="#EF4444" />
          <Text style={styles.signOutText}>
            {signOut.isPending ? 'Signing out...' : 'Sign Out'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.version}>Clerra v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: BG},

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[5], paddingVertical: spacing[5],
    backgroundColor: BG,
    borderBottomWidth: 1, borderBottomColor: GRAY_L,
  },
  headerTitle: {color: INK, fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, letterSpacing: -0.5},
  closeButton: {
    width: 32, height: 32, borderRadius: 11,
    backgroundColor: WHITE, borderWidth: 1, borderColor: GRAY_L,
    alignItems: 'center', justifyContent: 'center',
  },

  content: {paddingBottom: spacing[8], gap: spacing[2]},
  section: {paddingHorizontal: spacing[5], paddingTop: spacing[5], gap: spacing[2]},
  sectionLabel: {
    color: GRAY, fontSize: fontSize.xs, fontWeight: fontWeight.semibold,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: spacing[1], marginLeft: spacing[1],
  },

  accountCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    backgroundColor: WHITE, borderRadius: borderRadius.xl,
    borderWidth: 1.5, borderColor: GRAY_L, padding: spacing[4],
  },
  accountAvatar: {
    width: 48, height: 48, borderRadius: 15,
    backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center',
  },
  accountAvatarText: {color: WHITE, fontSize: fontSize.xl, fontWeight: fontWeight.bold},
  accountInfo: {flex: 1},
  accountName: {color: INK, fontSize: fontSize.base, fontWeight: fontWeight.semibold, marginBottom: 2},
  accountSub: {color: GRAY, fontSize: fontSize.sm},

  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    backgroundColor: WHITE, borderRadius: borderRadius.lg,
    borderWidth: 1.5, borderColor: GRAY_L, padding: spacing[4],
  },
  menuLabel: {flex: 1, color: INK, fontSize: fontSize.base},
  menuValue: {color: GRAY, fontSize: fontSize.sm},

  signOutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing[2], marginHorizontal: spacing[5], marginTop: spacing[4],
    paddingVertical: spacing[4], borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.20)',
  },
  signOutText: {color: '#EF4444', fontSize: fontSize.base, fontWeight: fontWeight.semibold},

  version: {color: GRAY_L, fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing[5]},
});
