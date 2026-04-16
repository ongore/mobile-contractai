import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {LinearGradient} from 'expo-linear-gradient';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import ContractsScreen from '@/screens/home/ContractsScreen';
import AccountScreen from '@/screens/home/AccountScreen';
import {HomeTabsParamList} from './types';
import {fontWeight} from '@/theme/typography';

// ── Custom tab bar ─────────────────────────────────────────────────────────
function CustomTabBar({state, navigation}: BottomTabBarProps) {
  const isContracts = state.index === 0;
  const isAccount   = state.index === 1;

  const handleNewContract = () => {
    (navigation as any).getParent()?.navigate('InputMethod', {method: 'screenshot'});
  };

  return (
    <View style={tb.container}>
      <View style={[StyleSheet.absoluteFill, tb.bg]} />
      <View style={tb.topBorder} />

      <View style={tb.row}>

        {/* Contracts tab */}
        <TouchableOpacity
          style={tb.tabItem}
          onPress={() => navigation.navigate('Contracts')}
          activeOpacity={0.7}>
          {isContracts ? (
            <View style={tb.activeIconWrap}>
              <Icon name="view-grid" size={22} color="#3B82F6" />
            </View>
          ) : (
            <View style={tb.inactiveIconWrap}>
              <Icon name="view-grid-outline" size={22} color="#475569" />
            </View>
          )}
          <Text style={[tb.label, isContracts && tb.labelActive]}>ATELIER</Text>
        </TouchableOpacity>

        {/* Center FAB — elevated square, blue→violet gradient */}
        <View style={tb.fabSpace}>
          <TouchableOpacity
            style={tb.fabWrap}
            onPress={handleNewContract}
            activeOpacity={0.85}>
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              start={{x: 0, y: 0}} end={{x: 1, y: 1}}
              style={tb.fabGrad}>
              <Icon name="plus" size={28} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Account tab */}
        <TouchableOpacity
          style={tb.tabItem}
          onPress={() => navigation.navigate('Account')}
          activeOpacity={0.7}>
          {isAccount ? (
            <View style={tb.activeIconWrap}>
              <Icon name="account-circle" size={22} color="#3B82F6" />
            </View>
          ) : (
            <View style={tb.inactiveIconWrap}>
              <Icon name="account-circle-outline" size={22} color="#475569" />
            </View>
          )}
          <Text style={[tb.label, isAccount && tb.labelActive]}>PROFILE</Text>
        </TouchableOpacity>

      </View>

      <View style={{height: Platform.OS === 'ios' ? 22 : 0}} />
    </View>
  );
}

// ── Navigator ──────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator<HomeTabsParamList>();

export default function HomeTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{headerShown: false}}>
      <Tab.Screen name="Contracts" component={ContractsScreen} />
      <Tab.Screen name="Account"   component={AccountScreen} />
    </Tab.Navigator>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const tb = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    overflow: 'visible',
  },
  bg: {
    backgroundColor: 'rgba(2, 6, 23, 0.88)',
  },
  topBorder: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },

  // Tab items
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  activeIconWrap: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.28)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveIconWrap: {
    paddingHorizontal: 20,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: '#475569',
  },
  labelActive: {color: '#3B82F6'},

  // Center FAB
  fabSpace: {
    flex: 1,
    alignItems: 'center',
    marginTop: -38,
  },
  fabWrap: {
    borderRadius: 18,
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 18,
  },
  fabGrad: {
    width: 60, height: 60,
    borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.20)',
  },
});
