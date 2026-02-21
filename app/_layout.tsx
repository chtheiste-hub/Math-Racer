import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import Colors from "@/constants/colors";
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from "@expo-google-fonts/outfit";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

const isWeb = Platform.OS === "web";

const webModalOptions = isWeb
  ? { presentation: "containedTransparentModal" as const, animation: "none" as const }
  : {};

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: isWeb ? "none" : "slide_from_right",
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="multiplication" options={webModalOptions} />
      <Stack.Screen name="division" options={webModalOptions} />
      <Stack.Screen name="addition" options={webModalOptions} />
      <Stack.Screen name="subtraction" options={webModalOptions} />
      <Stack.Screen name="practice" options={{ gestureEnabled: false, ...webModalOptions }} />
      <Stack.Screen name="results" options={{ gestureEnabled: false, animation: isWeb ? "none" : "fade", ...(isWeb ? { presentation: "containedTransparentModal" as const } : {}) }} />
      <Stack.Screen name="history" options={webModalOptions} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <StatusBar style="light" />
            <RootLayoutNav />
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
