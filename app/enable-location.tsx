import { requestForegroundPermissionsAsync } from "expo-location";
import { Link, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function EnableLocation() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retry = useCallback(async () => {
    try {
      setChecking(true);
      const { status } = await requestForegroundPermissionsAsync();
      if (status === "granted") {
        router.back();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    // Try once on mount in case the user already enabled it
    retry();
  }, [retry]);

  const openSettings = async () => {
    setError(null);
    if (Platform.OS === "ios") {
      await Linking.openURL("app-settings:");
    } else {
      await Linking.openSettings();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enable Location</Text>
      <Text style={styles.body}>
        Location access is required to show your current position and navigate
        effectively. Please enable location permissions for this app in your
        device Settings, then return here and press Retry.
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          onPress={openSettings}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Open Settings</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={checking}
          onPress={retry}
          style={styles.buttonSecondary}
        >
          <Text style={styles.buttonText}>
            {checking ? "Checking…" : "Retry"}
          </Text>
        </Pressable>
      </View>
      <View style={{ height: 16 }} />
      <Link href="/(tabs)" style={styles.link}>
        Go back
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", gap: 12 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  body: { color: "#333", lineHeight: 20, textAlign: "center" },
  error: { color: "#b00020", textAlign: "center" },
  row: { flexDirection: "row", gap: 12, justifyContent: "center" },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonSecondary: {
    backgroundColor: "#5856D6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: { color: "white", fontWeight: "600" },
  link: { color: "#007AFF", textAlign: "center" },
});
