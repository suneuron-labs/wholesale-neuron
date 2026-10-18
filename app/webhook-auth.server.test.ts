import { createHmac } from "node:crypto";
import { HttpResponseError, InvalidJwtError } from "@shopify/shopify-api";
import { afterEach, describe, expect, it } from "vitest";
import {
  isOfflineTokenRefreshFailure,
  recoverPostUninstallWebhook,
  resolveComplianceWebhook,
  shopifyWebhookHmacValid,
} from "./webhook-auth.server";

const secret = "shpss_test_secret";

function signedRequest(topic: string, body = '{"shop_id":1}', hmac?: string) {
  const header =
    hmac ?? createHmac("sha256", secret).update(body, "utf8").digest("base64");
  return new Request("https://app.example/webhooks", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-shopify-hmac-sha256": header,
      "x-shopify-shop-domain": "shop.myshopify.com",
      "x-shopify-topic": topic,
      "x-shopify-webhook-id": "wh_1",
      "x-shopify-api-version": "2026-07",
    },
    body,
  });
}

afterEach(() => {
  delete process.env.SHOPIFY_API_SECRET;
});

describe("shopifyWebhookHmacValid", () => {
  it("accepts the base64 HMAC of the raw body", () => {
    const body = '{"shop_id":1}';
    const hmac = createHmac("sha256", secret).update(body, "utf8").digest("base64");
    expect(shopifyWebhookHmacValid(body, hmac, secret)).toBe(true);
  });

  it("rejects a mismatched or truncated HMAC", () => {
    expect(shopifyWebhookHmacValid("{}", "not-a-valid-hmac", secret)).toBe(false);
    expect(shopifyWebhookHmacValid("{}", "abc", secret)).toBe(false);
    expect(shopifyWebhookHmacValid("{}", "", secret)).toBe(false);
  });
});

describe("isOfflineTokenRefreshFailure", () => {
  it("matches the library refresh failure and ignores HMAC rejections", () => {
    expect(isOfflineTokenRefreshFailure(new Response(null, { status: 500 }))).toBe(true);
    expect(isOfflineTokenRefreshFailure(new InvalidJwtError("expired"))).toBe(true);
    expect(
      isOfflineTokenRefreshFailure(
        new HttpResponseError({
          message: "invalid subject",
          code: 400,
          statusText: "Bad Request",
          body: { error: "invalid_subject_token" },
        }),
      ),
    ).toBe(true);
    expect(isOfflineTokenRefreshFailure(new Response(null, { status: 401 }))).toBe(false);
    expect(isOfflineTokenRefreshFailure(new Response(null, { status: 400 }))).toBe(false);
    expect(isOfflineTokenRefreshFailure(new Error("database down"))).toBe(false);
  });
});

describe("recoverPostUninstallWebhook", () => {
  it("returns a session-less context for uninstall and compliance topics", async () => {
    process.env.SHOPIFY_API_SECRET = secret;
    for (const topic of [
      "app/uninstalled",
      "shop/redact",
      "customers/redact",
      "customers/data_request",
    ]) {
      const recovered = await recoverPostUninstallWebhook(signedRequest(topic));
      expect(recovered).toMatchObject({
        shop: "shop.myshopify.com",
        topic,
        webhookId: "wh_1",
        admin: null,
        sessionId: null,
        sessionScopes: null,
      });
    }
  });

  it("returns null for topics that still need a session", async () => {
    process.env.SHOPIFY_API_SECRET = secret;
    await expect(
      recoverPostUninstallWebhook(signedRequest("app/scopes_update")),
    ).resolves.toBeNull();
  });

  it("rejects an invalid HMAC before trusting the topic", async () => {
    process.env.SHOPIFY_API_SECRET = secret;
    const response = await recoverPostUninstallWebhook(
      signedRequest("app/uninstalled", '{"shop_id":1}', "forged"),
    ).catch((error: unknown) => error);
    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(401);
  });

  it("rejects a request that is missing a required Shopify header", async () => {
    process.env.SHOPIFY_API_SECRET = secret;
    const body = "{}";
    const hmac = createHmac("sha256", secret).update(body, "utf8").digest("base64");
    const request = new Request("https://app.example/webhooks", {
      method: "POST",
      headers: {
        "x-shopify-hmac-sha256": hmac,
        "x-shopify-shop-domain": "shop.myshopify.com",
        "x-shopify-topic": "shop/redact",
        "x-shopify-webhook-id": "wh_1",
      },
      body,
    });
    const response = await recoverPostUninstallWebhook(request).catch(
      (error: unknown) => error,
    );
    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(400);
  });
});

describe("resolveComplianceWebhook", () => {
  it("uses the library result when token refresh succeeds", async () => {
    const request = signedRequest("app/uninstalled");
    const result = await resolveComplianceWebhook(request, async () => ({
      shop: "shop.myshopify.com",
      topic: "APP_UNINSTALLED",
      webhookId: "wh_1",
      payload: { current: ["read_products"] },
      admin: { graphql: true },
      session: { id: "offline_shop.myshopify.com" },
    }));
    expect(result.sessionId).toBe("offline_shop.myshopify.com");
    expect(result.sessionScopes).toBe("read_products");
    expect(result.admin).toEqual({ graphql: true });
  });

  it("continues uninstall handling once, without a session, when refresh returns 500", async () => {
    process.env.SHOPIFY_API_SECRET = secret;
    let calls = 0;
    const result = await resolveComplianceWebhook(signedRequest("app/uninstalled"), async () => {
      calls += 1;
      throw new Response(undefined, { status: 500, statusText: "Internal Server Error" });
    });
    expect(calls).toBe(1);
    expect(result).toMatchObject({
      topic: "app/uninstalled",
      admin: null,
      sessionId: null,
    });
  });

  it("rethrows refresh failures for scopes updates", async () => {
    process.env.SHOPIFY_API_SECRET = secret;
    const failure = new Response(undefined, { status: 500 });
    await expect(
      resolveComplianceWebhook(signedRequest("app/scopes_update"), async () => {
        throw failure;
      }),
    ).rejects.toBe(failure);
  });

  it("rethrows HMAC failures from the library", async () => {
    const unauthorized = new Response(undefined, { status: 401 });
    await expect(
      resolveComplianceWebhook(signedRequest("app/uninstalled"), async () => {
        throw unauthorized;
      }),
    ).rejects.toBe(unauthorized);
  });
});
