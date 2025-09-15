import MapScreen from "@/components/common/Map";
import { Button } from "heroui-native";
import { Alert, Text, View } from "react-native";

const HomeScreen = () => {
  return (
    <View className="relative flex-1">
      <View className="absolute right-0 bottom-0 left-0 z-10">
        <View className="m-4 rounded-lg bg-background p-4">
          <Text className="text-2xl">Map Example</Text>
          <Button onPress={() => Alert.alert("Welcome", "Let’s get started!")}>
            Get Started
          </Button>
        </View>
      </View>

      <MapScreen />
    </View>
  );
};

export default HomeScreen;
