import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PreAuthStackParamList} from './types';
import {useAuthStore} from '@/store/authStore';

import OnboardingScreen from '@/screens/onboarding/OnboardingScreen';
// AUTH MODE: currently uses email OTP. Swap import below to switch to phone auth.
import EmailEntryScreen from '@/screens/auth/EmailEntryScreen';
import VerifyOtpScreen from '@/screens/auth/VerifyOtpScreen';
import ProfileSetupScreen from '@/screens/auth/ProfileSetupScreen';

const Stack = createNativeStackNavigator<PreAuthStackParamList>();

export default function PreAuthNavigator() {
  const hasSeenOnboarding = useAuthStore(s => s.hasSeenOnboarding);
  const needsProfileSetup = useAuthStore(s => s.needsProfileSetup);

  const initialRoute: keyof PreAuthStackParamList = needsProfileSetup
    ? 'ProfileSetup'
    : 'Onboarding';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen name="Onboarding"    component={OnboardingScreen} />
      <Stack.Screen name="EmailEntry"    component={EmailEntryScreen} />
      <Stack.Screen name="VerifyOtp"     component={VerifyOtpScreen} />
      <Stack.Screen name="ProfileSetup"  component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
}
