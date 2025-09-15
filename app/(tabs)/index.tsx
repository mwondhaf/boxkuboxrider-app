import MapScreen from "@/components/common/Map";
import { Button } from "heroui-native";
import { Text, View } from "react-native";

const HomeScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <Text className="text-2xl">Map Example</Text>
      <Button onPress={() => console.log("Pressed!")}>Get Started</Button>

      <MapScreen />
    </View>
  );
};

export default HomeScreen;
