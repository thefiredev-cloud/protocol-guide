import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, TextInput, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";

const BRAND = {
  primary: "#A31621",
  dark: "#622A32",
};

export default function ContactScreen() {
  const colors = useColors();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setError(null);
    },
    onError: (err) => {
      setError(err.message || "Failed to submit. Please try again.");
    },
  });

  const handleSubmit = () => {
    setError(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Valid email is required");
      return;
    }
    if (!message.trim() || message.length < 10) {
      setError("Message must be at least 10 characters");
      return;
    }

    submitMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });
  };

  if (submitted) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]}>
        <View
          className="flex-row items-center px-4 py-3 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, padding: 8 }]}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </Pressable>
          <Text className="text-lg font-bold text-foreground ml-2">Contact</Text>
        </View>

        <View className="flex-1 justify-center items-center px-6">
          <IconSymbol name="checkmark.circle.fill" size={64} color={BRAND.primary} />
          <Text className="text-2xl font-bold text-foreground mt-4 text-center">
            Message Sent
          </Text>
          <Text className="text-base text-muted mt-2 text-center">
            Thank you for reaching out. We will get back to you soon.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{
              backgroundColor: pressed ? BRAND.dark : BRAND.primary,
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 8,
              marginTop: 24,
            }]}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 16 }}>
              Done
            </Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, padding: 8 }]}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text className="text-lg font-bold text-foreground ml-2">Contact</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-2xl font-bold text-foreground mb-2">Get in Touch</Text>
        <Text className="text-base text-muted mb-6">
          Have questions, feedback, or need support? Send us a message.
        </Text>

        {/* Name Field */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.muted}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 14,
              fontSize: 16,
              color: colors.foreground,
            }}
          />
        </View>

        {/* Email Field */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 14,
              fontSize: 16,
              color: colors.foreground,
            }}
          />
        </View>

        {/* Message Field */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-2">Message</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="How can we help?"
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 14,
              fontSize: 16,
              color: colors.foreground,
              minHeight: 150,
            }}
          />
        </View>

        {/* Error Message */}
        {error && (
          <View
            className="mb-4 p-3 rounded-lg"
            style={{ backgroundColor: "#FEE2E2" }}
          >
            <Text style={{ color: BRAND.primary, fontSize: 14 }}>{error}</Text>
          </View>
        )}

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={submitMutation.isPending}
          style={({ pressed }) => [{
            backgroundColor: submitMutation.isPending
              ? colors.muted
              : (pressed ? BRAND.dark : BRAND.primary),
            paddingVertical: 16,
            borderRadius: 8,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }]}
        >
          {submitMutation.isPending && (
            <ActivityIndicator size="small" color="#FFFFFF" />
          )}
          <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 16 }}>
            {submitMutation.isPending ? "Sending..." : "Send Message"}
          </Text>
        </Pressable>

        <View className="h-8" />
      </ScrollView>
    </ScreenContainer>
  );
}
