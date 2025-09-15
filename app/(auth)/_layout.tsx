import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{ title: "Reset Password" }}
      />
    </Stack>
  );
}
