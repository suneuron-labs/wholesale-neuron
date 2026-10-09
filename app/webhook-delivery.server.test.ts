import { describe, expect, it, vi } from "vitest";
import {
  MISSING_ADMIN_REASON,
  handleComplianceWebhook,
  markShopUninstalled,
  purgeShopData,
  type ComplianceEffects,
  type WebhookDeliveryRecord,
  type WebhookDeliveryStore,
} from "./webhook-delivery.server";

function memoryStore(seed: WebhookDeliveryRecord[] = []) {
  const rows = seed.map((row) => ({ ...row }));
  const history: string[] = [];
  let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

  const store: WebhookDeliveryStore = {
    async findByShopAndEvent(shop, eventId) {
      return rows.find((row) => row.shop === shop && row.eventId === eventId) ?? null;
    },
    async createReceived(input) {
      const row: WebhookDeliveryRecord = {
        id: nextId++,
        shop: input.shop,
        eventId: input.eventId,
        topic: input.topic,
        status: "RECEIVED",
        failureReason: null,
      };
      rows.push(row);
      history.push("RECEIVED");
      return row;
    },
    async updateStatus(id, status, failureReason = null) {
      const row = rows.find((candidate) => candidate.id === id);
      if (!row) {
        throw new Error(`missing delivery ${id}`);
      }
      row.status = status;
      row.failureReason = failureReason;
      history.push(status);
    },
  };

  return { rows, history, store };
}

function effects(): ComplianceEffects & {
  markUninstalled: ReturnType<typeof vi.fn>;
  deleteShopData: ReturnType<typeof vi.fn>;
  updateSessionScope: ReturnType<typeof vi.fn>;
} {
  return {
    markUninstalled: vi.fn().mockResolvedValue(undefined),
    deleteShopData: vi.fn().mockResolvedValue(undefined),
    updateSessionScope: vi.fn().mockResolvedValue(undefined),
  };
}

const shop = "wholesale-neuron-dev.myshopify.com";

describe("webhook idempotency", () => {
  it.each(["SUCCESS", "PROCESSING"] as const)(
    "returns 200 and skips work when the delivery is already %s",
    async (status) => {
      const seeded = memoryStore([
        {
          id: 4,
          shop,
          eventId: "evt-1",
          topic: "app/uninstalled",
          status,
          failureReason: null,
        },
      ]);
      const sideEffects = effects();

      const result = await handleComplianceWebhook({
        store: seeded.store,
        effects: sideEffects,
        shop,
        eventId: "evt-1",
        topic: "app/uninstalled",
        admin: null,
        sessionId: null,
        sessionScopes: null,
      });

      expect(result).toEqual({ status: 200, outcome: status });
      expect(sideEffects.markUninstalled).not.toHaveBeenCalled();
      expect(seeded.rows).toHaveLength(1);
      expect(seeded.history).toEqual([]);
    },
  );
});

describe("app/uninstalled", () => {
  it("accepts the APP_UNINSTALLED topic returned by authenticate.webhook", async () => {
    const seeded = memoryStore();
    const sideEffects = effects();

    const result = await handleComplianceWebhook({
      store: seeded.store,
      effects: sideEffects,
      shop,
      eventId: "evt-uninstall-enum",
      topic: "APP_UNINSTALLED",
      admin: null,
      sessionId: "offline_suneuron-dev-wholesale.myshopify.com",
      sessionScopes: null,
    });

    expect(result).toEqual({ status: 200, outcome: "SUCCESS" });
    expect(sideEffects.markUninstalled).toHaveBeenCalledWith(shop);
  });

  it("marks the shop uninstalled and deletes sessions even when admin is missing", async () => {
    const seeded = memoryStore();
    const sideEffects = effects();

    const result = await handleComplianceWebhook({
      store: seeded.store,
      effects: sideEffects,
      shop,
      eventId: "evt-uninstall",
      topic: "app/uninstalled",
      admin: null,
      sessionId: null,
      sessionScopes: null,
    });

    expect(result).toEqual({ status: 200, outcome: "SUCCESS" });
    expect(sideEffects.markUninstalled).toHaveBeenCalledWith(shop);
    expect(seeded.history).toEqual(["RECEIVED", "PROCESSING", "SUCCESS"]);
    expect(seeded.rows[0]?.failureReason).toBeNull();
  });

  it("upserts isInstalled false and deletes sessions for that shop only", async () => {
    const upsert = vi.fn().mockResolvedValue({});
    const deleteMany = vi.fn().mockResolvedValue({ count: 2 });

    await markShopUninstalled(
      {
        appSettings: { upsert },
        session: { deleteMany },
      },
      shop,
    );

    expect(upsert).toHaveBeenCalledWith({
      where: { shop },
      create: {
        shop,
        isInstalled: false,
        discountGid: null,
        validationGid: null,
        paymentGid: null,
      },
      update: {
        isInstalled: false,
        discountGid: null,
        validationGid: null,
        paymentGid: null,
      },
    });
    expect(deleteMany).toHaveBeenCalledWith({ where: { shop } });
  });
});

describe("privacy webhooks", () => {
  it("accepts CUSTOMERS_DATA_REQUEST and SHOP_REDACT topic enums", async () => {
    const dataRequest = memoryStore();
    const redact = memoryStore();
    const sideEffects = effects();

    const dataResult = await handleComplianceWebhook({
      store: dataRequest.store,
      effects: sideEffects,
      shop,
      eventId: "evt-data-enum",
      topic: "CUSTOMERS_DATA_REQUEST",
      admin: null,
      sessionId: null,
      sessionScopes: null,
    });
    const redactResult = await handleComplianceWebhook({
      store: redact.store,
      effects: sideEffects,
      shop,
      eventId: "evt-shop-enum",
      topic: "SHOP_REDACT",
      admin: null,
      sessionId: null,
      sessionScopes: null,
    });

    expect(dataResult).toEqual({ status: 200, outcome: "SKIPPED" });
    expect(dataRequest.rows[0]?.failureReason).toBe("no_customer_data_stored");
    expect(redactResult).toEqual({ status: 200, outcome: "SUCCESS" });
    expect(sideEffects.deleteShopData).toHaveBeenCalledWith(shop, "evt-shop-enum");
  });

  it("skips customers/data_request because no customer data is stored", async () => {
    const seeded = memoryStore();
    const sideEffects = effects();

    const result = await handleComplianceWebhook({
      store: seeded.store,
      effects: sideEffects,
      shop,
      eventId: "evt-data",
      topic: "customers/data_request",
      admin: { graphql: vi.fn() },
      sessionId: "offline-1",
      sessionScopes: null,
    });

    expect(result).toEqual({ status: 200, outcome: "SKIPPED" });
    expect(seeded.rows[0]?.failureReason).toBe("no_customer_data_stored");
    expect(sideEffects.deleteShopData).not.toHaveBeenCalled();
    expect(sideEffects.markUninstalled).not.toHaveBeenCalled();
  });

  it("skips customers/redact because nothing customer-linked is stored", async () => {
    const seeded = memoryStore();
    const sideEffects = effects();

    const result = await handleComplianceWebhook({
      store: seeded.store,
      effects: sideEffects,
      shop,
      eventId: "evt-customer-redact",
      topic: "customers/redact",
      admin: null,
      sessionId: null,
      sessionScopes: null,
    });

    expect(result).toEqual({ status: 200, outcome: "SKIPPED" });
    expect(seeded.rows[0]?.failureReason).toBe("no_customer_linked_records");
    expect(sideEffects.deleteShopData).not.toHaveBeenCalled();
  });

  it("deletes shop settings, sessions, and older delivery logs on shop/redact", async () => {
    const seeded = memoryStore();
    const sideEffects = effects();

    const result = await handleComplianceWebhook({
      store: seeded.store,
      effects: sideEffects,
      shop,
      eventId: "evt-shop-redact",
      topic: "shop/redact",
      admin: null,
      sessionId: null,
      sessionScopes: null,
    });

    expect(result).toEqual({ status: 200, outcome: "SUCCESS" });
    expect(sideEffects.deleteShopData).toHaveBeenCalledWith(shop, "evt-shop-redact");
    expect(seeded.rows[0]?.status).toBe("SUCCESS");
  });

  it("purges shop rows and keeps the current delivery record", async () => {
    const sessionDelete = vi.fn().mockResolvedValue({ count: 1 });
    const settingsDelete = vi.fn().mockResolvedValue({ count: 1 });
    const deliveryDelete = vi.fn().mockResolvedValue({ count: 3 });

    await purgeShopData(
      {
        session: { deleteMany: sessionDelete },
        appSettings: { deleteMany: settingsDelete },
        webhookDelivery: { deleteMany: deliveryDelete },
      },
      shop,
      "evt-shop-redact",
    );

    expect(sessionDelete).toHaveBeenCalledWith({ where: { shop } });
    expect(settingsDelete).toHaveBeenCalledWith({ where: { shop } });
    expect(deliveryDelete).toHaveBeenCalledWith({
      where: { shop, eventId: { not: "evt-shop-redact" } },
    });
  });
});

describe("admin null path", () => {
  it("writes FAILED when a Shopify mutation has no admin client", async () => {
    const seeded = memoryStore();
    const sideEffects = effects();

    const result = await handleComplianceWebhook({
      store: seeded.store,
      effects: sideEffects,
      shop,
      eventId: "evt-mutate",
      topic: "app/uninstalled",
      admin: null,
      sessionId: null,
      sessionScopes: null,
      requiresAdmin: true,
    });

    expect(result).toEqual({ status: 200, outcome: "FAILED" });
    expect(seeded.rows[0]?.status).toBe("FAILED");
    expect(seeded.rows[0]?.failureReason).toBe(MISSING_ADMIN_REASON);
    expect(sideEffects.markUninstalled).not.toHaveBeenCalled();
    expect(sideEffects.deleteShopData).not.toHaveBeenCalled();
  });
});

describe("webhook failures stay at HTTP 200", () => {
  it("records FAILED and does not throw when side effects throw", async () => {
    const seeded = memoryStore();
    const sideEffects = effects();
    sideEffects.markUninstalled.mockRejectedValue(new Error("database locked"));

    const result = await handleComplianceWebhook({
      store: seeded.store,
      effects: sideEffects,
      shop,
      eventId: "evt-fail",
      topic: "app/uninstalled",
      admin: null,
      sessionId: null,
      sessionScopes: null,
    });

    expect(result).toEqual({ status: 200, outcome: "FAILED" });
    expect(seeded.rows[0]?.failureReason).toBe("database locked");
  });
});
