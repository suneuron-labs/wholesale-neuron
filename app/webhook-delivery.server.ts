export const MISSING_ADMIN_REASON = "missing_offline_session_or_admin";

export type WebhookStatus =
  | "RECEIVED"
  | "PROCESSING"
  | "SUCCESS"
  | "SKIPPED"
  | "FAILED";

export type WebhookDeliveryRecord = {
  id: number;
  shop: string;
  eventId: string;
  topic: string;
  status: WebhookStatus;
  failureReason: string | null;
};

export type WebhookDeliveryStore = {
  findByShopAndEvent: (
    shop: string,
    eventId: string,
  ) => Promise<WebhookDeliveryRecord | null>;
  createReceived: (input: {
    shop: string;
    eventId: string;
    topic: string;
  }) => Promise<WebhookDeliveryRecord>;
  updateStatus: (
    id: number,
    status: WebhookStatus,
    failureReason?: string | null,
  ) => Promise<void>;
};

export type ComplianceEffects = {
  markUninstalled: (shop: string) => Promise<void>;
  deleteShopData: (shop: string, keepEventId: string) => Promise<void>;
  updateSessionScope: (sessionId: string, scope: string) => Promise<void>;
};

type ComplianceInput = {
  store: WebhookDeliveryStore;
  effects: ComplianceEffects;
  shop: string;
  eventId: string;
  topic: string;
  admin: unknown | null;
  sessionId: string | null;
  sessionScopes: string | null;
  requiresAdmin?: boolean;
};

type UninstallDb = {
  appSettings: {
    upsert: (args: {
      where: { shop: string };
      create: {
        shop: string;
        isInstalled: boolean;
        discountGid: null;
        validationGid: null;
        paymentGid: null;
      };
      update: {
        isInstalled: boolean;
        discountGid: null;
        validationGid: null;
        paymentGid: null;
      };
    }) => Promise<unknown>;
  };
  session: {
    deleteMany: (args: { where: { shop: string } }) => Promise<unknown>;
  };
};

type ShopPurgeDb = {
  session: {
    deleteMany: (args: { where: { shop: string } }) => Promise<unknown>;
  };
  appSettings: {
    deleteMany: (args: { where: { shop: string } }) => Promise<unknown>;
  };
  webhookDelivery: {
    deleteMany: (args: {
      where: { shop: string; eventId: { not: string } };
    }) => Promise<unknown>;
  };
};

export async function markShopUninstalled(db: UninstallDb, shop: string) {
  await db.appSettings.upsert({
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
  await db.session.deleteMany({ where: { shop } });
}

export async function purgeShopData(
  db: ShopPurgeDb,
  shop: string,
  keepEventId: string,
) {
  await db.session.deleteMany({ where: { shop } });
  await db.appSettings.deleteMany({ where: { shop } });
  await db.webhookDelivery.deleteMany({
    where: { shop, eventId: { not: keepEventId } },
  });
}

export async function handleComplianceWebhook(input: ComplianceInput) {
  const existing = await input.store.findByShopAndEvent(input.shop, input.eventId);
  if (existing && (existing.status === "SUCCESS" || existing.status === "PROCESSING")) {
    return { status: 200 as const, outcome: existing.status };
  }

  const record =
    existing ??
    (await input.store.createReceived({
      shop: input.shop,
      eventId: input.eventId,
      topic: input.topic,
    }));

  if (input.requiresAdmin && !input.admin) {
    await input.store.updateStatus(record.id, "FAILED", MISSING_ADMIN_REASON);
    return { status: 200 as const, outcome: "FAILED" as const };
  }

  try {
    await input.store.updateStatus(record.id, "PROCESSING", null);
    const outcome = await runTopic(input);
    await input.store.updateStatus(record.id, outcome.status, outcome.reason);
    return { status: 200 as const, outcome: outcome.status };
  } catch (error) {
    const message = error instanceof Error ? error.message : "webhook_failed";
    await input.store.updateStatus(record.id, "FAILED", message);
    return { status: 200 as const, outcome: "FAILED" as const };
  }
}

function canonicalTopic(topic: string): string {
  return topic.trim().toUpperCase().replaceAll("/", "_");
}

async function runTopic(input: ComplianceInput): Promise<{
  status: "SUCCESS" | "SKIPPED";
  reason: string | null;
}> {
  switch (canonicalTopic(input.topic)) {
    case "APP_UNINSTALLED":
      await input.effects.markUninstalled(input.shop);
      return { status: "SUCCESS", reason: null };
    case "CUSTOMERS_DATA_REQUEST":
      return { status: "SKIPPED", reason: "no_customer_data_stored" };
    case "CUSTOMERS_REDACT":
      return { status: "SKIPPED", reason: "no_customer_linked_records" };
    case "SHOP_REDACT":
      await input.effects.deleteShopData(input.shop, input.eventId);
      return { status: "SUCCESS", reason: null };
    case "APP_SCOPES_UPDATE":
      if (!input.sessionId || input.sessionScopes == null) {
        return { status: "SKIPPED", reason: "missing_session" };
      }
      await input.effects.updateSessionScope(input.sessionId, input.sessionScopes);
      return { status: "SUCCESS", reason: null };
    default:
      return { status: "SKIPPED", reason: "unhandled_topic" };
  }
}
