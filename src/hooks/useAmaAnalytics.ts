import { useAmaContextSafe } from "../context/AmaProvider";
import {
  AmaCustomEventDef,
  AmaEvent,
  AmaEventDef,
  AtMyAppClient,
} from "@atmyapp/core";

/**
 * Hook to access analytics functionality using the core library
 *
 * @param client - Optional AtMyApp client instance from createAtMyApp
 * @returns Analytics client from the core library with error handling
 */
export function useAmaAnalytics(client?: AtMyAppClient) {
  // Use provided client or get from context with safer error handling
  const context = !client ? useAmaContextSafe() : null;

  // Determine the error state
  let contextError: Error | null = null;
  if (!client && !context) {
    contextError = new Error(
      "useAmaContext must be used within an AmaProvider"
    );
  } else if (context?.error) {
    contextError = context.error;
  }

  const amaClient = client || context?.client || null;

  return {
    /**
     * Track a basic event (server automatically collects metadata)
     */
    trackEvent: async <Event extends AmaEventDef<string> = any>(
      eventId: Event["id"]
    ) => {
      try {
        if (contextError) {
          console.error("Cannot track event - client error:", contextError);
          return false;
        }

        if (!amaClient) {
          console.error("Cannot track event - client not available");
          return false;
        }

        return await amaClient.analytics.trackEvent<Event>(eventId);
      } catch (error) {
        console.error("Error tracking event:", error);
        return false;
      }
    },

    /**
     * Track a custom event with structured data
     */
    trackCustomEvent: async <
      Event extends AmaCustomEventDef<string, string[]> = any
    >(
      eventId: Event["id"],
      data: Record<Event["columns"][number], string> | string[]
    ) => {
      try {
        if (contextError) {
          console.error(
            "Cannot track custom event - client error:",
            contextError
          );
          return false;
        }

        if (!amaClient) {
          console.error("Cannot track custom event - client not available");
          return false;
        }

        return await amaClient.analytics.trackCustomEvent<Event>(eventId, data);
      } catch (error) {
        console.error("Error tracking custom event:", error);
        return false;
      }
    },

    /**
     * Get the current client error state
     */
    error: contextError,

    /**
     * Check if analytics is available
     */
    isAvailable: !!amaClient && !contextError,
  };
}
