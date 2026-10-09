import type { ActionFunctionArgs } from "react-router";
import db from "./db.server";
import { authenticate } from "./shopify.server";
import {
  handleComplianceWebhook,
  markShopUninstalled,
  purgeShopData,
  type WebhookDeliveryRecord,
  type WebhookStatus,
} from "./webhook-delivery.server";

export async function complianceWebhookAction({ request }: ActionFunctionArgs) {
  const { shop, topic, webhookId, admin, session, payload } =
    await authenticate.webhook(request);
  const current = payload.current;
  const sessionScopes = Array.isArray(current) ? current.join(",") : null;

  await handleComplianceWebhook({
    store: {
      findByShopAndEvent: async (deliveryShop, eventId) => {
        const row = await db.webhookDelivery.findUnique({
          where: { shop_eventId: { shop: deliveryShop, eventId } },
        });
        return row ? toRecord(row) : null;
      },
      createReceived: async (input) => {
        const row = await db.webhookDelivery.create({
          data: {
            shop: input.shop,
            eventId: input.eventId,
            topic: input.topic,
            status: "RECEIVED",
          },
        });
        return toRecord(row);
      },
      updateStatus: async (id, status, failureReason = null) => {
        await db.webhookDelivery.update({
          where: { id },
          data: { status, failureReason },
        });
      },
    },
    effects: {
      markUninstalled: (deliveryShop) => markShopUninstalled(db, deliveryShop),
      deleteShopData: (deliveryShop, keepEventId) =>
        purgeShopData(db, deliveryShop, keepEventId),
      updateSessionScope: async (sessionId, scope) => {
        await db.session.update({
          where: { id: sessionId },
          data: { scope },
        });
      },
    },
    shop,
    eventId: webhookId,
    topic,
    admin: admin ?? null,
    sessionId: session?.id ?? null,
    sessionScopes,
  });

  return new Response(null, { status: 200 });
}

function toRecord(row: {
  id: number;
  shop: string;
  eventId: string;
  topic: string;
  status: WebhookStatus;
  failureReason: string | null;
}): WebhookDeliveryRecord {
  return {
    id: row.id,
    shop: row.shop,
    eventId: row.eventId,
    topic: row.topic,
    status: row.status,
    failureReason: row.failureReason,
  };
}
