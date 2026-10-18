import { createHmac, timingSafeEqual } from "node:crypto";
import { HttpResponseError, InvalidJwtError } from "@shopify/shopify-api";

const POST_UNINSTALL_TOPICS = new Set([
  "APP_UNINSTALLED",
  "SHOP_REDACT",
  "CUSTOMERS_REDACT",
  "CUSTOMERS_DATA_REQUEST",
]);

export type ComplianceWebhookContext = {
  shop: string;
  topic: string;
  webhookId: string;
  payload: Record<string, unknown>;
  admin: unknown | null;
  sessionId: string | null;
  sessionScopes: string | null;
};

type LibraryWebhookContext = {
  shop: string;
  topic: string;
  webhookId: string;
  payload: Record<string, unknown>;
  admin?: unknown;
  session?: { id: string } | null;
};

export function canonicalWebhookTopic(topic: string): string {
  return topic.trim().toUpperCase().replaceAll("/", "_");
}

export function isPostUninstallTopic(topic: string): boolean {
  return POST_UNINSTALL_TOPICS.has(canonicalWebhookTopic(topic));
}

/**
 * True when authenticate.webhook failed while refreshing an expiring offline token.
 * HMAC failures are Response 401/400 and must not match.
 */
export function isOfflineTokenRefreshFailure(error: unknown): boolean {
  if (error instanceof Response) {
    return error.status === 500;
  }
  if (error instanceof InvalidJwtError) {
    return true;
  }
  if (error instanceof HttpResponseError) {
    const code = error.response.code;
    return code === 400 || code === 401;
  }
  return false;
}

export function shopifyWebhookHmacValid(
  rawBody: string,
  hmacHeader: string,
  secret: string,
): boolean {
  if (!secret || !hmacHeader) {
    return false;
  }
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
  const actual = Buffer.from(digest);
  const expected = Buffer.from(hmacHeader);
  if (actual.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(actual, expected);
}

export function sessionScopesFromPayload(payload: Record<string, unknown>): string | null {
  const current = payload.current;
  return Array.isArray(current) ? current.join(",") : null;
}

/**
 * Re-verify a webhook after the library's token refresh threw.
 * Returns null when the HMAC is valid but the topic still needs a live session.
 * Throws 401 when the HMAC does not match, and 400 when required headers or JSON are missing.
 */
export async function recoverPostUninstallWebhook(
  request: Request,
): Promise<ComplianceWebhookContext | null> {
  const rawBody = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  const secret = process.env.SHOPIFY_API_SECRET ?? "";
  if (!hmac || !shopifyWebhookHmacValid(rawBody, hmac, secret)) {
    throw new Response(undefined, { status: 401, statusText: "Unauthorized" });
  }

  const shop = request.headers.get("x-shopify-shop-domain");
  const topic = request.headers.get("x-shopify-topic");
  const webhookId = request.headers.get("x-shopify-webhook-id");
  const apiVersion = request.headers.get("x-shopify-api-version");
  if (!shop || !topic || !webhookId || !apiVersion) {
    throw new Response(undefined, { status: 400, statusText: "Bad Request" });
  }
  if (!isPostUninstallTopic(topic)) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw new Response(undefined, { status: 400, statusText: "Bad Request" });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Response(undefined, { status: 400, statusText: "Bad Request" });
  }

  return {
    shop,
    topic,
    webhookId,
    payload: payload as Record<string, unknown>,
    admin: null,
    sessionId: null,
    sessionScopes: null,
  };
}

export async function resolveComplianceWebhook(
  request: Request,
  authenticateWebhook: (request: Request) => Promise<LibraryWebhookContext>,
): Promise<ComplianceWebhookContext> {
  const bodyRequest = request.clone();
  try {
    const result = await authenticateWebhook(request);
    return {
      shop: result.shop,
      topic: result.topic,
      webhookId: result.webhookId,
      payload: result.payload,
      admin: result.admin ?? null,
      sessionId: result.session?.id ?? null,
      sessionScopes: sessionScopesFromPayload(result.payload),
    };
  } catch (error) {
    if (!isOfflineTokenRefreshFailure(error)) {
      throw error;
    }
    const recovered = await recoverPostUninstallWebhook(bodyRequest);
    if (!recovered) {
      throw error;
    }
    return recovered;
  }
}
