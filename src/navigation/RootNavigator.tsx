import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuthStore} from '@/store/authStore';
import {RootStackParamList} from './types';
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const hasSeenOnboarding = useAuthStore(s => s.hasSeenOnboarding);

  const devBypassAuth = __DEV__;

  const getInitialRoute = (): keyof RootStackParamList => {
    if (!hasSeenOnboarding) {
      return 'OnboardingStack';
    }
    if (!devBypassAuth && !isAuthenticated) {
      return 'AuthStack';
    }
    return 'MainStack';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{headerShown: false}}>
        {!hasSeenOnboarding && (
          <Stack.Screen
            name="OnboardingStack"
            component={OnboardingNavigator}
          />
        )}
        {devBypassAuth || isAuthenticated ? (
          <Stack.Screen name="MainStack" component={MainNavigator} />
        ) : (
          <Stack.Screen name="AuthStack" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}