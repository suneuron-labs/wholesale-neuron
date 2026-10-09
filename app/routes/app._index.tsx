import { Form, isRouteErrorResponse, useActionData, useLoaderData, useRouteError } from "react-router";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  requireAppSubscription,
  shopIsPartnerDevelopment,
} from "../billing.server";
import db from "../db.server";
import { syncFunctionOwners } from "../function-owners.server";
import {
  parseStoredSettings,
  saveWholesaleSettings,
  SETTINGS_METAFIELD_KEY,
  SETTINGS_METAFIELD_NAMESPACE,
} from "../settings.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, billing, session } = await authenticate.admin(request);
  const partnerDevelopment = await shopIsPartnerDevelopment(admin);
  const subscription = await requireAppSubscription(billing, process.env, {
    partnerDevelopment,
  });
  const owners = await db.appSettings.findUnique({
    where: { shop: session.shop },
    select: { discountGid: true, validationGid: true, paymentGid: true },
  });
  const response = await admin.graphql(
    `#graphql
      query WholesaleSettings {
        currentAppInstallation {
          metafield(namespace: "${SETTINGS_METAFIELD_NAMESPACE}", key: "${SETTINGS_METAFIELD_KEY}") {
            value
          }
        }
      }`,
  );
  const json = (await response.json()) as {
    data?: {
      currentAppInstallation?: {
        metafield?: { value?: string | null } | null;
      } | null;
    };
  };
  const stored = parseStoredSettings(
    json.data?.currentAppInstallation?.metafield?.value,
  );

  return {
    ...subscription,
    ...stored,
    discountGid: owners?.discountGid ?? null,
    validationGid: owners?.validationGid ?? null,
    paymentGid: owners?.paymentGid ?? null,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, billing, session } = await authenticate.admin(request);
  const partnerDevelopment = await shopIsPartnerDevelopment(admin);
  await requireAppSubscription(billing, process.env, { partnerDevelopment });
  const formData = await request.formData();
  const saved = await saveWholesaleSettings(admin, formData);
  if (!saved.ok || !saved.settings) {
    return { ...saved, sync: null };
  }

  const stored = await db.appSettings.findUnique({
    where: { shop: session.shop },
    select: { discountGid: true, validationGid: true, paymentGid: true },
  });
  const sync = await syncFunctionOwners({
    admin,
    settings: saved.settings,
    stored: {
      discountGid: stored?.discountGid ?? null,
      validationGid: stored?.validationGid ?? null,
      paymentGid: stored?.paymentGid ?? null,
    },
  });
  await db.appSettings.upsert({
    where: { shop: session.shop },
    create: {
      shop: session.shop,
      isInstalled: true,
      discountGid: sync.discount.gid,
      validationGid: sync.validation.gid,
      paymentGid: sync.payment.gid,
    },
    update: {
      isInstalled: true,
      discountGid: sync.discount.gid,
      validationGid: sync.validation.gid,
      paymentGid: sync.payment.gid,
    },
  });

  return { ...saved, sync };
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const settings = actionData?.ok ? actionData.settings : loaderData.settings;
  const saved = actionData?.ok ? true : loaderData.saved;
  const { billingBypassed, bypassReason } = loaderData;

  return (
    <s-page heading="WholesaleNeuron">
      {billingBypassed && bypassReason ? (
        <s-banner heading="Billing bypassed" tone="warning">
          <s-paragraph>{bypassReason}</s-paragraph>
        </s-banner>
      ) : null}
      {actionData && !actionData.ok && actionData.userErrors.length > 0 ? (
        <s-banner heading="Settings were not saved" tone="critical">
          <s-paragraph>{actionData.userErrors.join(" ")}</s-paragraph>
        </s-banner>
      ) : null}
      <s-section>
        <s-stack gap="base">
          <s-stack
            direction="inline"
            justifyContent="space-between"
            alignItems="center"
          >
            <s-heading>Quick Setup Guide</s-heading>
            <s-badge tone="info">Get Started</s-badge>
          </s-stack>
          <s-paragraph>
            Follow these 3 simple steps to activate wholesale rules for your
            tagged customers:
          </s-paragraph>
          <s-ordered-list>
            <s-list-item>
              <s-text>
                <strong>Configure Rules:</strong> Set your required customer tag
                (e.g., WHOLESALE), discount percentage, minimum order amount,
                and allowed payment methods below.
              </s-text>
            </s-list-item>
            <s-list-item>
              <s-text>
                <strong>Save &amp; Activate:</strong> Click &apos;Save
                Configuration&apos; below to activate your wholesale rules at
                checkout.
              </s-text>
            </s-list-item>
            <s-list-item>
              <s-text>
                <strong>Test on Storefront:</strong> Log in to your storefront
                as a customer with your configured tag and proceed to checkout
                to see your wholesale rules in action.
              </s-text>
            </s-list-item>
          </s-ordered-list>
        </s-stack>
      </s-section>
      {saved ? (
        <s-banner heading="Settings saved" tone="success">
          <s-paragraph>
            These values are stored for this store.
          </s-paragraph>
        </s-banner>
      ) : (
        <s-section heading="No wholesale settings yet">
          <s-paragraph>
            The customer tag, wholesale discount, minimum order, and allowed
            payment method are not configured yet. Checkout stays at the retail
            price for every customer until you save settings.
          </s-paragraph>
          <s-paragraph>
            After settings are saved, tag a customer and check out while that
            customer is logged in. A guest checkout of the same cart keeps the
            retail price and is not blocked.
          </s-paragraph>
          <s-paragraph>
            A Shopify CLI webhook trigger only proves this app received the
            call. It uses a sample shop, so it does not show activity for the
            store you are viewing.
          </s-paragraph>
        </s-section>
      )}
      <Form method="post" data-save-bar>
        <s-section heading="Wholesale settings">
          <s-text-field
            label="Customer tag"
            name="customerTag"
            defaultValue={settings.customerTag}
            details="1 to 40 letters, numbers, spaces, hyphens, or underscores. Spaces at the ends are ignored, and capitalization does not matter."
            error={actionData?.fieldErrors.customerTag}
          />
          <s-text-field
            label="Discount percent"
            name="discountPercent"
            defaultValue={String(settings.discountPercent)}
            details="Enter 0 to disable wholesale discounts for tagged buyers."
            error={actionData?.fieldErrors.discountPercent}
          />
          <s-text-field
            label="Minimum order"
            name="minimumOrderValue"
            defaultValue={String(settings.minimumOrderValue)}
            details="Enter 0 to disable minimum order value restrictions for tagged buyers."
            error={actionData?.fieldErrors.minimumOrderValue}
          />
          <s-text-field
            label="Allowed B2B Payment Method Name"
            name="paymentMethodName"
            defaultValue={settings.paymentMethodName}
            details="Leave blank to keep standard credit cards active. Enter a method name (e.g., 'Net 30') to hide all other payment options."
            error={actionData?.fieldErrors.paymentMethodName}
          />
          <s-button type="submit" variant="primary">
            Save Configuration
          </s-button>
        </s-section>
      </Form>
      {actionData?.sync ? (
        <s-section heading="Function sync">
          <s-paragraph>
            Wholesale pricing: {actionData.sync.discount.status}
            {actionData.sync.discount.userErrors.length > 0
              ? `. ${actionData.sync.discount.userErrors.join(" ")}`
              : ""}
          </s-paragraph>
          <s-paragraph>
            Wholesale minimum order: {actionData.sync.validation.status}
            {actionData.sync.validation.userErrors.length > 0
              ? `. ${actionData.sync.validation.userErrors.join(" ")}`
              : ""}
          </s-paragraph>
          <s-paragraph>
            Wholesale payment methods: {actionData.sync.payment.status}
            {actionData.sync.payment.userErrors.length > 0
              ? `. ${actionData.sync.payment.userErrors.join(" ")}`
              : ""}
          </s-paragraph>
        </s-section>
      ) : saved &&
        (!loaderData.discountGid || !loaderData.validationGid || !loaderData.paymentGid) ? (
        <s-section heading="Function sync">
          <s-paragraph>
            Save again to connect wholesale pricing and the minimum order.
          </s-paragraph>
        </s-section>
      ) : null}
      <s-section heading="Support" slot="aside">
        <s-paragraph>
          <s-link href="mailto:support@wholesale.suneuron.com">
            WholesaleNeuron support
          </s-link>
        </s-paragraph>
        <s-paragraph>
          <s-link href="/privacy" target="_blank">
            Privacy policy
          </s-link>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) || error instanceof Response) {
    return boundary.error(error);
  }

  return (
    <s-page heading="WholesaleNeuron">
      <s-banner heading="Something went wrong" tone="critical">
        <s-paragraph>
          WholesaleNeuron could not load this page. Reload the app, or contact
          WholesaleNeuron support.
        </s-paragraph>
      </s-banner>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
