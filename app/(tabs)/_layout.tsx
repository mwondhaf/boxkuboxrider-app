import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Alert, Platform } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import useLocation from "@/hooks/use-location";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { location } = useLocation();
  const PRECISION = 6;

  useEffect(() => {
    if (location && Platform.OS !== "web") {
      const { latitude, longitude } = location.coords;
      Alert.alert(
        "Current location",
        `Lat: ${latitude.toFixed(PRECISION)}\nLng: ${longitude.toFixed(PRECISION)}`
      );
    }
  }, [location]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol color={color} name="house.fill" size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol color={color} name="paperplane.fill" size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="location"
        options={{
          title: "Location",
          tabBarIcon: ({ color }) => (
            <IconSymbol color={color} name="location.fill" size={28} />
          ),
        }}
      />
    </Tabs>
  );
}
