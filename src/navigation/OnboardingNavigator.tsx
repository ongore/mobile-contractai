import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from './types';
import WelcomeScreen from '@/screens/onboarding/WelcomeScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

// OnboardingStep1 and OnboardingStep2 are placeholders for future onboarding steps
function OnboardingStep1Placeholder() {
  return null;
}

function OnboardingStep2Placeholder() {
  return null;
}

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="OnboardingStep1" component={OnboardingStep1Placeholder} />
      <Stack.Screen name="OnboardingStep2" component={OnboardingStep2Placeholder} />
    </Stack.Navigator>
  );
}
