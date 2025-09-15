import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  AppState,
  Linking,
  LogBox,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import "react-native-reanimated";
import "../global.css";

import Providers from "@/components/integrations/Providers";
import type { Status } from "@/hooks/use-location";
import {
  getForegroundPermissionsAsync,
  requestForegroundPermissionsAsync,
} from "expo-location";
import { useEffect, useRef, useState } from "react";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [status, setStatus] = useState<Status>("undetermined");
  const [checking, setChecking] = useState(false);
  const mounted = useRef(true);

  // Suppress benign NativeEventEmitter warnings from some libraries.
  LogBox.ignoreLogs([
    "new NativeEventEmitter() was called with a non-null argument without the required `addListener` method.",
    "new NativeEventEmitter() was called with a non-null argument without the required `removeListeners` method.",
  ]);

  const openSettings = async () => {
    if (Platform.OS === "ios") {
      await Linking.openURL("app-settings:");
    } else {
      await Linking.openSettings();
    }
  };

  const retry = async () => {
    try {
      setChecking(true);
      const { status: next } = await requestForegroundPermissionsAsync();
      setStatus(next as Status);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    mounted.current = true;
    (async () => {
      const { status: current } = await getForegroundPermissionsAsync();
      if (mounted.current) {
        setStatus(current as Status);
      }
    })();
    return () => {
      mounted.current = false;
    };
  }, []);

  // Refresh permission when app returns to foreground (e.g., after user opens Settings)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        getForegroundPermissionsAsync()
          .then(({ status: current }) => {
            if (mounted.current) {
              setStatus(current as Status);
            }
          })
          .catch(() => {
            // no-op
          });
      }
    });
    return () => {
      sub.remove();
    };
  }, []);

  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
        <Stack.Screen
          name="enable-location"
          options={{ title: "Enable Location" }}
        />
      </Stack>
      <StatusBar style="auto" />
      {status === "denied" ? (
        <View pointerEvents="box-none" style={styles.banner}>
          <View accessibilityLiveRegion="polite" style={styles.bannerInner}>
            <Text style={styles.bannerText}>
              Location is disabled. Enable it in Settings, then Retry.
            </Text>
            <View style={styles.bannerRow}>
              <Pressable
                accessibilityRole="button"
                onPress={openSettings}
                style={styles.bannerBtnPrimary}
              >
                <Text style={styles.bannerBtnText}>Open Settings</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={checking}
                onPress={retry}
                style={styles.bannerBtnSecondary}
              >
                <Text style={styles.bannerBtnText}>
                  {checking ? "Checking…" : "Retry"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </Providers>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
  },
  bannerInner: {
    backgroundColor: "#222",
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  bannerText: { color: "#fff", textAlign: "center" },
  bannerRow: { flexDirection: "row", gap: 12, justifyContent: "center" },
  bannerBtnPrimary: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  bannerBtnSecondary: {
    backgroundColor: "#5856D6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  bannerBtnText: { color: "#fff", fontWeight: "600" },
});
