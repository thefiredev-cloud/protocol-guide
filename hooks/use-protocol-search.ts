/**
 * useProtocolSearch Hook
 *
 * Manages protocol search state and operations with full offline support.
 * Handles the complete search flow including online searches, offline caching,
 * LLM summarization, and automatic retry of failed searches.
 *
 * @module hooks/use-protocol-search
 */

import { useState, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { addRecentSearch } from "@/components/recent-searches";
import { extractKeySteps } from "@/utils/protocol-helpers";
import * as Haptics from "@/lib/haptics";
import { OfflineCache } from "@/lib/offline-cache";
import { useNetworkStatus } from "@/hooks/use-offline-cache";
import { PerfTimer, recordSearchLatency, recordCacheResult, recordOfflineFallback } from "@/lib/performance";
import type { Message, Agency } from "@/types/search.types";

/**
 * Configuration options for the protocol search hook
 */
interface UseProtocolSearchOptions {
  /** Currently selected state filter (e.g., "California") */
  selectedState: string | null;
  /** Currently selected EMS agency for agency-specific search */
  selectedAgency: Agency | null;
  /** Function that checks and prompts for medical disclaimer acknowledgment */
  checkDisclaimerBeforeAction: () => boolean;
}

/**
 * Custom hook for protocol search functionality
 *
 * Features:
 * - Semantic search using Voyage AI embeddings + pgvector
 * - AI-powered summarization via Claude
 * - Offline support with local caching
 * - Automatic retry queue for failed searches
 * - Performance monitoring and analytics
 * - Haptic feedback for mobile devices
 *
 * @param options - Configuration options
 * @returns Object with messages, loading state, search handler, and network status
 *
 * @example
 * ```tsx
 * const { messages, isLoading, handleSendMessage, isOnline } = useProtocolSearch({
 *   selectedState: "California",
 *   selectedAgency: null,
 *   checkDisclaimerBeforeAction: () => hasAcknowledgedDisclaimer,
 * });
 *
 * // Trigger a search
 * handleSendMessage("epinephrine dose for anaphylaxis");
 * ```
 */
export function useProtocolSearch({
  selectedState,
  selectedAgency,
  checkDisclaimerBeforeAction,
}: UseProtocolSearchOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const trpcUtils = trpc.useUtils();
  const isOnline = useNetworkStatus();

  // Process any pending searches when coming back online
  useEffect(() => {
    if (isOnline) {
      processPendingSearches();
    }
  }, [isOnline]);

  const processPendingSearches = async () => {
    try {
      const pendingSearches = await OfflineCache.getPendingSearches();
      
      for (const search of pendingSearches) {
        try {
          // Try to execute the search
          const results = search.agencyId
            ? await trpcUtils.search.searchByAgency.fetch({
                query: search.query,
                agencyId: search.agencyId,
                limit: 3,
              })
            : await trpcUtils.search.semantic.fetch({
                query: search.query,
                limit: 3,
                stateFilter: search.stateFilter || undefined,
              });

          if (results.results && results.results.length > 0) {
            // Cache the results
            const best = results.results[0];
            await OfflineCache.saveProtocol({
              query: search.query,
              response: best.fullContent || best.content || "",
              protocolTitle: best.protocolTitle,
              protocolNumber: best.protocolNumber,
              countyId: search.agencyId || 0,
              countyName: selectedAgency?.name || "Unknown",
            });
          }

          // Remove from pending queue
          await OfflineCache.removePendingSearch(search.id);
        } catch (error) {
          // Increment retry count
          await OfflineCache.incrementRetryCount(search.id);
        }
      }
    } catch (error) {
      console.error("Error processing pending searches:", error);
    }
  };

  const handleSendMessage = useCallback(
    async (text: string) => {
      // P0 CRITICAL: Block search if disclaimer not acknowledged
      if (!checkDisclaimerBeforeAction()) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }

      addRecentSearch(text);

      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Performance timer for total search time
      const searchTimer = new PerfTimer("protocol-search");

      // If offline, try to use cached results
      if (!isOnline) {
        recordOfflineFallback();
        try {
          const cachedResults = await OfflineCache.searchCachedProtocols(
            text,
            selectedAgency?.id
          );

          if (cachedResults.length > 0) {
            // Use cached result
            recordCacheResult(true);
            const best = cachedResults[0];
            const cachedMsg: Message = {
              id: (Date.now() + 1).toString(),
              type: "summary",
              text: best.response,
              protocolTitle: best.protocolTitle,
              protocolNumber: best.protocolNumber,
              timestamp: new Date(),
              isOffline: true,
            };
            setMessages((prev) => [...prev, cachedMsg]);
            
            // Record latency even for cached results
            const duration = searchTimer.stop();
            recordSearchLatency(duration);
            
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            recordCacheResult(false);
            // Queue for later and show offline message
            await OfflineCache.queueSearch({
              query: text,
              stateFilter: selectedState || undefined,
              agencyId: selectedAgency?.id,
            });

            const offlineMsg: Message = {
              id: (Date.now() + 1).toString(),
              type: "error",
              text: "You're offline. This search will be processed when you reconnect. Try searching for something you've looked up before.",
              timestamp: new Date(),
              isOffline: true,
            };
            setMessages((prev) => [...prev, offlineMsg]);
            
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        } catch (error) {
          console.error("Offline search error:", error);
          const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            type: "error",
            text: "Unable to search offline. Please try again when connected.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMsg]);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Online search
      try {
        // Search for protocols
        let results;
        if (selectedAgency) {
          results = await trpcUtils.search.searchByAgency.fetch({
            query: text,
            agencyId: selectedAgency.id,
            limit: 3,
          });
        } else {
          results = await trpcUtils.search.semantic.fetch({
            query: text,
            limit: 3,
            stateFilter: selectedState || undefined,
          });
        }

        if (!results.results || results.results.length === 0) {
          const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            type: "error",
            text: "No protocols found. Try different keywords.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMsg]);
          return;
        }

        // Get the best match and generate ultra-concise summary
        const best = results.results[0];
        const content = best.fullContent || best.content || "";

        // Call LLM for ultra-concise summary via tRPC
        let summaryText = "";
        try {
          const summaryResult = await trpcUtils.search.summarize.fetch({
            query: text,
            content: content.substring(0, 6000),
            protocolTitle: best.protocolTitle,
          });
          summaryText = summaryResult.summary || "";
        } catch (summaryError) {
          console.warn("[Search] Summary generation failed:", summaryError);
        }

        // Fallback: extract key info if LLM fails
        if (!summaryText) {
          summaryText = extractKeySteps(content, text);
        }

        // Cache the result for offline use
        await OfflineCache.saveProtocol({
          query: text,
          response: summaryText,
          protocolRefs: results.results.map((r) => r.id.toString()),
          protocolTitle: best.protocolTitle,
          protocolNumber: best.protocolNumber,
          countyId: selectedAgency?.id || 0,
          countyName: selectedAgency?.name || (selectedState || "Unknown"),
        });

        const summaryMsg: Message = {
          id: (Date.now() + 1).toString(),
          type: "summary",
          text: summaryText,
          protocolTitle: best.protocolTitle,
          protocolNumber: best.protocolNumber,
          protocolYear: best.protocolYear || undefined,
          sourcePdfUrl: best.sourcePdfUrl,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, summaryMsg]);

        // Record successful search latency
        const duration = searchTimer.stop();
        recordSearchLatency(duration);
        recordCacheResult(results.fromCache || false);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Search error:", error);
        
        // Try to fall back to cache on network error
        const cachedResults = await OfflineCache.searchCachedProtocols(
          text,
          selectedAgency?.id
        );

        if (cachedResults.length > 0) {
          const best = cachedResults[0];
          const cachedMsg: Message = {
            id: (Date.now() + 1).toString(),
            type: "summary",
            text: best.response + "\n\n📱 *Retrieved from cache*",
            protocolTitle: best.protocolTitle,
            protocolNumber: best.protocolNumber,
            timestamp: new Date(),
            isOffline: true,
          };
          setMessages((prev) => [...prev, cachedMsg]);
        } else {
          const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            type: "error",
            text: "Search failed. Check connection.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMsg]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [selectedState, selectedAgency, trpcUtils, checkDisclaimerBeforeAction, isOnline]
  );

  return {
    messages,
    isLoading,
    handleSendMessage,
    isOnline,
  };
}
