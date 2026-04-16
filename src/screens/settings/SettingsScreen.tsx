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
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import {MainStackParamList} from '@/navigation/types';
import {useAuthStore} from '@/store/authStore';
import {useDeleteAccount, useSignOut} from '@/hooks/useAuth';
import {colors} from '@/theme/colors';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Settings'>;
};

export default function SettingsScreen({navigation}: Props) {
  const user = useAuthStore(s => s.user);
  const signOut = useSignOut();
  const deleteAccount = useDeleteAccount();

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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}>
          <Icon name="close" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.accountCard}>
            <View style={styles.accountAvatar}>
              <Text style={styles.accountAvatarText}>
                {user?.email?.[0]?.toUpperCase() ?? 'U'}
              </Text>
            </View>
            <View style={styles.accountInfo}>
              {user?.name && (
                <Text style={styles.accountName}>{user.name}</Text>
              )}
              <Text style={styles.accountEmail}>{user?.email ?? ''}</Text>
            </View>
          </View>
        </View>

        {/* App settings */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>App</Text>
          {[
            {
              icon: 'bell-outline',
              label: 'Notifications',
              value: 'Enabled',
              onPress: () => {},
            },
            {
              icon: 'theme-light-dark',
              label: 'Appearance',
              value: 'System',
              onPress: () => {},
            },
            {
              icon: 'translate',
              label: 'Language',
              value: 'English',
              onPress: () => {},
            },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}>
              <Icon name={item.icon} size={20} color="rgba(235,235,245,0.55)" />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuValue}>{item.value}</Text>
              <Icon
                name="chevron-right"
                size={16}
                color="rgba(235,235,245,0.20)"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Privacy</Text>
          {[
            {
              icon: 'shield-lock-outline',
              label: 'Privacy Policy',
              onPress: () => {},
            },
            {
              icon: 'file-document-outline',
              label: 'Terms of Service',
              onPress: () => {},
            },
            {
              icon: 'delete-outline',
              label: 'Delete Account',
              danger: true,
              onPress: () => {
                Alert.alert(
                  'Delete Account',
                  'This action is irreversible. All your contracts and data will be permanently deleted.',
                  [
                    {text: 'Cancel', style: 'cancel'},
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => deleteAccount.mutate(),
                    },
                  ],
                );
              },
            },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}>
              <Icon
                name={item.icon}
                size={20}
                color={item.danger ? '#EF4444' : 'rgba(235,235,245,0.55)'}
              />
              <Text
                style={[
                  styles.menuLabel,
                  item.danger && {color: '#EF4444'},
                ]}>
                {item.label}
              </Text>
              <Icon
                name="chevron-right"
                size={16}
                color="rgba(235,235,245,0.20)"
                style={styles.menuChevron}
              />
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

        <Text style={styles.version}>ContractFlow v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[5],
    backgroundColor: '#020617',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(84,84,88,0.30)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: spacing[8],
    gap: spacing[2],
  },
  section: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    gap: spacing[2],
  },
  sectionLabel: {
    color: 'rgba(235,235,245,0.30)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing[1],
    marginLeft: spacing[1],
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: spacing[4],
  },
  accountAvatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountAvatarText: {
    color: '#FFFFFF',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    color: '#FFFFFF',
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
  },
  accountEmail: {
    color: 'rgba(235,235,245,0.45)',
    fontSize: fontSize.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing[4],
  },
  menuLabel: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: fontSize.base,
  },
  menuValue: {
    color: 'rgba(235,235,245,0.40)',
    fontSize: fontSize.sm,
  },
  menuChevron: {
    marginLeft: spacing[1],
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    marginHorizontal: spacing[5],
    marginTop: spacing[4],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,69,58,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,69,58,0.20)',
  },
  signOutText: {
    color: '#EF4444',
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  version: {
    color: 'rgba(235,235,245,0.22)',
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing[5],
  },
});
