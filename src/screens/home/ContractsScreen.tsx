import React, {useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {CompositeNavigationProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import {MainStackParamList, HomeTabsParamList} from '@/navigation/types';
import {useContracts} from '@/hooks/useContracts';
import {useAuthStore} from '@/store/authStore';
import {ContractCard} from '@/components/contract/ContractCard';
import {EmptyState} from '@/components/common/EmptyState';
import {Contract} from '@/types/contract';
import {colors} from '@/theme/colors';
import {spacing, borderRadius, shadow} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<HomeTabsParamList, 'Contracts'>,
    NativeStackNavigationProp<MainStackParamList>
  >;
};

export default function ContractsScreen({navigation}: Props) {
  const user = useAuthStore(s => s.user);
  const {data: contracts, isLoading, isRefetching, refetch} = useContracts();

  const handleContractPress = useCallback(
    (contract: Contract) => {
      navigation.navigate('ContractDetail', {contractId: contract.id});
    },
    [navigation],
  );

  const handleNewContract = () => {
    navigation.navigate('NewContract');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.sectionTitle}>My Contracts</Text>
      {contracts && contracts.length > 0 && (
        <Text style={styles.countLabel}>{contracts.length} total</Text>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.loadingText}>Loading contracts...</Text>
        </View>
      );
    }

    return (
      <EmptyState
        icon="file-document-outline"
        title="No contracts yet"
        subtitle="Create your first contract in seconds using AI. Upload a screenshot, paste text, or scan a document."
        ctaLabel="Create Contract"
        onCta={handleNewContract}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoMark}>
            <Text style={styles.logoMarkText}>CF</Text>
          </View>
          <Text style={styles.headerTitle}>ContractFlow</Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      {/* Contracts List */}
      <FlatList
        data={contracts ?? []}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <ContractCard contract={item} onPress={() => handleContractPress(item)} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          (!contracts || contracts.length === 0) && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleNewContract}
        activeOpacity={0.9}>
        <Icon name="plus" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  avatarText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  listContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: 120,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  countLabel: {
    color: colors.muted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  separator: {
    height: spacing[3],
  },
  loadingContainer: {
    alignItems: 'center',
    paddingTop: spacing[16],
    gap: spacing[4],
  },
  loadingText: {
    color: colors.muted,
    fontSize: fontSize.sm,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing[5],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.xl,
  },
});
