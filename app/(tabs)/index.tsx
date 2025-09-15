import MapScreen from "@/components/common/Map";
import { Text, View } from "react-native";

const HomeScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <Text className="text-2xl">Map Example</Text>
      <MapScreen />
    </View>
  );
};

export default HomeScreen;
