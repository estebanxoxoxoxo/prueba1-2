
// utils/meta.ts

import { MetaEvent } from "./metaEventsTypes";

export async function sendMetaEvent(
  eventName: MetaEvent,
  eventId: string
): Promise<void> {
  const response = await fetch("/api/meta-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventName,
      eventId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send Meta event");
  }
}