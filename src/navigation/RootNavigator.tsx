import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuthStore} from '@/store/authStore';
import {RootStackParamList} from './types';
import PreAuthNavigator from './PreAuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const isAuthenticated   = useAuthStore(s => s.isAuthenticated);
  const needsProfileSetup = useAuthStore(s => s.needsProfileSetup);

  const showMainApp = isAuthenticated && !needsProfileSetup;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false, animation: 'fade'}}>
        {showMainApp ? (
          <Stack.Screen name="MainStack"    component={MainNavigator} />
        ) : (
          <Stack.Screen name="PreAuthStack" component={PreAuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
