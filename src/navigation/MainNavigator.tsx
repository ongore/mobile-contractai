import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainStackParamList} from './types';
import HomeTabNavigator from './HomeTabNavigator';
import InputMethodScreen from '@/screens/contract/InputMethodScreen';
import ExtractReviewScreen from '@/screens/contract/ExtractReviewScreen';
import ContractPreviewScreen from '@/screens/contract/ContractPreviewScreen';
import SignatureScreen from '@/screens/contract/SignatureScreen';
import SendLinkScreen from '@/screens/contract/SendLinkScreen';
import ContractDetailScreen from '@/screens/contract/ContractDetailScreen';
import PaywallScreen from '@/screens/paywall/PaywallScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import {colors} from '@/theme/colors';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: '#F7F5F2'},
      }}>
      <Stack.Screen name="HomeTabs" component={HomeTabNavigator} />
      <Stack.Screen
        name="InputMethod"
        component={InputMethodScreen}
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ExtractReview"
        component={ExtractReviewScreen}
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ContractPreview"
        component={ContractPreviewScreen}
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Signature"
        component={SignatureScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SendLink"
        component={SendLinkScreen}
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ContractDetail"
        component={ContractDetailScreen}
        options={{
          presentation: 'card',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
