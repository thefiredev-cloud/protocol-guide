/**
 * OAuth State Parameter Validation
 * Prevents CSRF attacks during OAuth flows
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Crypto from "expo-crypto";

const STATE_STORAGE_KEY = "oauth_state";
const STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

interface OAuthState {
  state: string;
  createdAt: number;
  provider: "google" | "apple";
}

/**
 * Generate cryptographically secure state parameter
 */
export async function generateOAuthState(
  provider: "google" | "apple"
): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  const state = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Store state with timestamp
  const stateData: OAuthState = {
    state,
    createdAt: Date.now(),
    provider,
  };

  try {
    await AsyncStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(stateData));
    console.log("[OAuth] State generated and stored:", provider);
  } catch (error) {
    console.error("[OAuth] Failed to store state:", error);
    throw new Error("Failed to initialize OAuth flow");
  }

  return state;
}

/**
 * Validate OAuth state parameter from callback
 */
export async function validateOAuthState(
  receivedState: string
): Promise<{
  valid: boolean;
  error?: string;
  provider?: "google" | "apple";
}> {
  try {
    const storedData = await AsyncStorage.getItem(STATE_STORAGE_KEY);

    if (!storedData) {
      return {
        valid: false,
        error: "No OAuth state found - possible CSRF attack",
      };
    }

    const stateData: OAuthState = JSON.parse(storedData);

    // Check expiration
    const now = Date.now();
    if (now - stateData.createdAt > STATE_EXPIRY_MS) {
      await AsyncStorage.removeItem(STATE_STORAGE_KEY);
      return {
        valid: false,
        error: "OAuth state expired - please try again",
      };
    }

    // Validate state matches
    if (stateData.state !== receivedState) {
      await AsyncStorage.removeItem(STATE_STORAGE_KEY);
      return {
        valid: false,
        error: "OAuth state mismatch - possible CSRF attack",
      };
    }

    // Clean up after successful validation
    await AsyncStorage.removeItem(STATE_STORAGE_KEY);

    console.log("[OAuth] State validated successfully:", stateData.provider);

    return {
      valid: true,
      provider: stateData.provider,
    };
  } catch (error) {
    console.error("[OAuth] State validation error:", error);
    return {
      valid: false,
      error: "Failed to validate OAuth state",
    };
  }
}

/**
 * Clear OAuth state (cleanup on error or cancellation)
 */
export async function clearOAuthState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STATE_STORAGE_KEY);
    console.log("[OAuth] State cleared");
  } catch (error) {
    console.error("[OAuth] Failed to clear state:", error);
  }
}

/**
 * Check if OAuth state exists
 */
export async function hasOAuthState(): Promise<boolean> {
  try {
    const state = await AsyncStorage.getItem(STATE_STORAGE_KEY);
    return state !== null;
  } catch (error) {
    console.error("[OAuth] Failed to check state:", error);
    return false;
  }
}
