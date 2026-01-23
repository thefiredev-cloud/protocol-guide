/**
 * Lazy-loaded modal components to reduce initial bundle size
 * Modals are loaded on-demand when users interact with triggers
 */
import { Suspense, lazy, ComponentType } from "react";
import { View, ActivityIndicator } from "react-native";
import { useColors } from "@/hooks/use-colors";

// Lazy load heavy modals
const DisclaimerConsentModalLazy = lazy(() =>
  import("@/components/DisclaimerConsentModal").then(m => ({ default: m.DisclaimerConsentModal }))
);

const CountyLimitModalLazy = lazy(() =>
  import("@/components/county-limit-modal").then(m => ({ default: m.CountyLimitModal }))
);

const VoiceSearchModalLazy = lazy(() =>
  import("@/components/VoiceSearchModal").then(m => ({ default: m.VoiceSearchModal }))
);

// Loading fallback for modals
function ModalLoadingFallback() {
  const colors = useColors();
  return (
    <View style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

// Wrapped exports with Suspense
export function DisclaimerConsentModal(props: any) {
  return (
    <Suspense fallback={<ModalLoadingFallback />}>
      <DisclaimerConsentModalLazy {...props} />
    </Suspense>
  );
}

export function CountyLimitModal(props: any) {
  return (
    <Suspense fallback={<ModalLoadingFallback />}>
      <CountyLimitModalLazy {...props} />
    </Suspense>
  );
}

export function VoiceSearchModal(props: any) {
  return (
    <Suspense fallback={<ModalLoadingFallback />}>
      <VoiceSearchModalLazy {...props} />
    </Suspense>
  );
}
