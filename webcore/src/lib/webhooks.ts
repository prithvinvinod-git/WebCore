export type WebhookEvent = "scan.complete" | "scan.failed" | "monitor.alert" | "monitor.down" | "monitor.up"

interface WebhookPayload {
  event: WebhookEvent
  timestamp: string
  data: Record<string, unknown>
}

const WEBHOOK_TIMEOUT = 10000

async function deliverWebhook(url: string, payload: WebhookPayload): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT)

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "WebCore/1.0" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeout)
    return res.ok
  } catch {
    return false
  }
}

export async function sendWebhookNotifications(
  webhooks: string[],
  event: WebhookEvent,
  data: Record<string, unknown>
) {
  if (!webhooks || webhooks.length === 0) return

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  }

  const results = await Promise.allSettled(
    webhooks.map((url) => deliverWebhook(url, payload))
  )

  const failed = results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value)).length
  if (failed > 0) {
    console.warn(`[Webhooks] ${failed}/${webhooks.length} deliveries failed for event: ${event}`)
  }
}
