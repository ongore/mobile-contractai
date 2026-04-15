import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Platform, StyleSheet, View} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import {HomeTabsParamList} from './types';
import ContractsScreen from '@/screens/home/ContractsScreen';
import AccountScreen from '@/screens/home/AccountScreen';
import {colors} from '@/theme/colors';
import {spacing} from '@/theme/spacing';

const Tab = createBottomTabNavigator<HomeTabsParamList>();

export default function HomeTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIcon: ({focused, color, size}) => {
          const iconName =
            route.name === 'Contracts'
              ? focused
                ? 'file-document'
                : 'file-document-outline'
              : focused
              ? 'account-circle'
              : 'account-circle-outline';

          return (
            <View style={[styles.iconContainer, focused && styles.iconActive]}>
              <Icon name={iconName} size={size} color={color} />
            </View>
          );
        },
      })}>
      <Tab.Screen
        name="Contracts"
        component={ContractsScreen}
        options={{tabBarLabel: 'Contracts'}}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{tabBarLabel: 'Account'}}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.primary,
    borderTopColor: colors.border.light,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
    ...{
      shadowColor: '#000',
      shadowOffset: {width: 0, height: -2},
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tabBarItem: {
    paddingTop: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 32,
    borderRadius: 12,
  },
  iconActive: {
    backgroundColor: colors.accentLight,
  },
});
