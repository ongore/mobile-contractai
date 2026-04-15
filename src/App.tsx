import React from 'react';
import {StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import RootNavigator from '@/navigation/RootNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed queries up to 2 times before showing an error
      retry: 2,
      // Keep data fresh for 30 seconds
      staleTime: 30_000,
      // Keep cached data for 5 minutes after the component unmounts
      gcTime: 5 * 60 * 1000,
      // Refetch on window focus (useful for contract status polling)
      refetchOnWindowFocus: false,
      // Show last known data while refetching
      placeholderData: previousData => previousData,
    },
    mutations: {
      // Retry mutations once on network error
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <RootNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
