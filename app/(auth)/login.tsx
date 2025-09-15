import { useForm } from "@tanstack/react-form";
import { Link, useRouter } from "expo-router";
import { Button, TextField } from "heroui-native";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { z } from "zod";

type LoginValues = {
  email: string;
  password: string;
};

const NETWORK_DELAY_MS = 800;
const MIN_PASSWORD_LENGTH = 6;
const KEYBOARD_VERTICAL_OFFSET = 64;

const userSchema = z.object({
  email: z.email("Enter a valid email").min(1, "Email is required"),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Minimum ${MIN_PASSWORD_LENGTH} characters`),
});

const getErrorMessage = (err: unknown): string => {
  if (typeof err === "string") {
    return err;
  }
  if (typeof err === "object" && err !== null && "message" in err) {
    const maybe = (err as { message?: unknown }).message;
    if (typeof maybe === "string") {
      return maybe;
    }
  }
  return "";
};

export default function LoginScreen() {
  const router = useRouter();

  const signIn = useCallback(
    async ({ email, password }: LoginValues) => {
      await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
      if (email && password.length >= MIN_PASSWORD_LENGTH) {
        Alert.alert("Success", "You are now logged in.", [
          {
            text: "OK",
            onPress: () => {
              router.replace("/");
            },
          },
        ]);
        return;
      }
      throw new Error("Invalid credentials");
    },
    [router]
  );

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onChange: userSchema,
    },
    onSubmit: async ({ value }) => {
      await signIn(value as LoginValues);
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center gap-4 bg-background p-6">
          <Text className="text-center font-bold text-xl">Welcome back</Text>

          <form.Field name="email">
            {(field) => (
              <TextField>
                <TextField.Label>Email</TextField.Label>
                <TextField.Input
                  accessibilityLabel="Email"
                  autoCapitalize="none"
                  autoCorrect={false}
                  inputMode="email"
                  keyboardType="email-address"
                  onBlur={field.handleBlur}
                  onChangeText={(text) => field.handleChange(text)}
                  placeholder="you@example.com"
                  value={field.state.value}
                />
                {field.state.meta.isTouched && field.state.meta.errors?.[0] ? (
                  <Text className="text-red-500 text-sm">
                    {getErrorMessage(field.state.meta.errors[0])}
                  </Text>
                ) : null}
              </TextField>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <TextField>
                <TextField.Label>Password</TextField.Label>
                <TextField.Input
                  accessibilityLabel="Password"
                  onBlur={field.handleBlur}
                  onChangeText={(text) => field.handleChange(text)}
                  placeholder="••••••"
                  secureTextEntry
                  value={field.state.value}
                />
                {field.state.meta.isTouched && field.state.meta.errors?.[0] ? (
                  <Text className="text-red-500 text-sm">
                    {getErrorMessage(field.state.meta.errors[0])}
                  </Text>
                ) : null}
              </TextField>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                disabled={!canSubmit || isSubmitting}
                onPress={() => form.handleSubmit()}
                variant="primary"
              >
                {isSubmitting && (
                  <Button.StartContent>
                    <ActivityIndicator size={18} />
                  </Button.StartContent>
                )}
                <Button.LabelContent>Sign In</Button.LabelContent>
              </Button>
            )}
          </form.Subscribe>

          <View>
            <Link href="./reset-password">Forgot password?</Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
