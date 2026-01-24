import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

export function useDisclaimer() {
  const { isAuthenticated } = useAuth();
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [disclaimerAcknowledged, setDisclaimerAcknowledged] = useState(false);

  // P0 CRITICAL: Check disclaimer acknowledgment status
  const { data: disclaimerStatus, refetch: refetchDisclaimerStatus } =
    trpc.user.hasAcknowledgedDisclaimer.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  // P0 CRITICAL: Check disclaimer acknowledgment on mount and show modal if needed
  useEffect(() => {
    if (isAuthenticated && disclaimerStatus) {
      const hasAcknowledged = disclaimerStatus.hasAcknowledged;
      setDisclaimerAcknowledged(hasAcknowledged);

      // Show modal if not acknowledged
      if (!hasAcknowledged) {
        setShowDisclaimerModal(true);
      }
    }
  }, [isAuthenticated, disclaimerStatus]);

  // Handler for when disclaimer is acknowledged
  const handleDisclaimerAcknowledged = useCallback(() => {
    setShowDisclaimerModal(false);
    setDisclaimerAcknowledged(true);
    // Refetch to ensure we have the latest status
    refetchDisclaimerStatus();
  }, [refetchDisclaimerStatus]);

  const checkDisclaimerBeforeAction = useCallback((): boolean => {
    if (isAuthenticated && !disclaimerAcknowledged) {
      setShowDisclaimerModal(true);
      return false;
    }
    return true;
  }, [isAuthenticated, disclaimerAcknowledged]);

  return {
    showDisclaimerModal,
    disclaimerAcknowledged,
    handleDisclaimerAcknowledged,
    checkDisclaimerBeforeAction,
  };
}
