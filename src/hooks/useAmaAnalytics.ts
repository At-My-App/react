import { useAmaContext } from "../context/AmaProvider";
import { AtMyAppClient } from "@atmyapp/core";

/**
 * Hook to access analytics functionality using the core library
 *
 * @param client - Optional AtMyApp client instance from createAtMyApp
 * @returns Analytics client from the core library
 */
export function useAmaAnalytics(client?: AtMyAppClient) {
  // Use provided client or get from context
  const context = !client ? useAmaContext() : null;
  const amaClient = client || context?.client;

  if (!amaClient) {
    throw new Error(
      "useAmaAnalytics must be used within an AmaProvider or provide a client instance"
    );
  }

  return {
    /**
     * Track a basic event (server automatically collects metadata)
     */
    trackEvent: async (eventId: string) => {
      return amaClient.analytics.trackEvent(eventId);
    },

    /**
     * Track a custom event with structured data
     */
    trackCustomEvent: async (
      eventId: string,
      data: Record<string, string> | string[]
    ) => {
      return amaClient.analytics.trackCustomEvent(eventId, data);
    },
  };
}
