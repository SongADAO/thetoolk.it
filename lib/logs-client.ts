interface TriggerLogClientEventProps {
  eventData: object;
  eventType: string;
  mode: string;
  serviceId: string;
}

async function triggerLogClientEvent({
  eventData,
  eventType,
  mode,
  serviceId,
}: TriggerLogClientEventProps): Promise<void> {
  try {
    const response = await fetch("/api/browser/log/create", {
      body: JSON.stringify({
        eventData,
        eventType,
        mode,
        serviceId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to log client event: ${errorText}`);
    }
  } catch (error: unknown) {
    // Allow failure
    console.error("Failed to log client event:", error);
  }
}

export { triggerLogClientEvent };
