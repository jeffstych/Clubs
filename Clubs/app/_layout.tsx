import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, Redirect, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { ThemeProvider as AppThemeProvider } from '@/context/ThemeContext';
import { EventProvider } from '@/context/EventContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FollowProvider } from '@/context/FollowContext';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, loading, tookQuiz } = useAuth();
  const segments = useSegments();

  const inAuthGroup = segments[0] === 'auth';
  const onQuizPage = segments[0] === 'auth' && segments[1] === 'quiz';

  // Wait for auth to load before making any redirect decisions
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // If no session and not already on auth pages, redirect to login
  if (!session && !inAuthGroup) {
    return <Redirect href="/auth/login" />;
  }

  // If has session but hasn't taken quiz, redirect to quiz (unless already there)
  if (session && tookQuiz === false && !onQuizPage) {
    return <Redirect href="/auth/quiz" />;
  }

  // If has session, took quiz, and on login page, redirect to explore
  // (but allow quiz page access for editing)
  if (session && tookQuiz === true && inAuthGroup && !onQuizPage) {
    return <Redirect href="/(tabs)/explore" />;
  }

  // User is in the right place - render the app
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/quiz" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppThemeProvider>
        <EventProvider>
          <FollowProvider>
            <RootLayoutNav />
          </FollowProvider>
        </EventProvider>
      </AppThemeProvider>
    </AuthProvider>
  );
}