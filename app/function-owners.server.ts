import {
  SETTINGS_METAFIELD_KEY,
  SETTINGS_METAFIELD_NAMESPACE,
  type WholesaleSettings,
} from "./settings.server";
import { customerTagLookupValues } from "./text-match";

export const DISCOUNT_TITLE = "Wholesale pricing";
export const VALIDATION_TITLE = "Wholesale minimum order";
export const DISCOUNT_FUNCTION_HANDLE = "wholesale-pricing";
export const VALIDATION_FUNCTION_HANDLE = "wholesale-minimum-order";
export const PAYMENT_TITLE = "Wholesale payment methods";
export const PAYMENT_FUNCTION_HANDLE = "wholesale-payment-methods";
export const FUNCTION_VARIABLES_KEY = "function_variables";
export const DISCOUNT_STARTS_AT = "2026-01-01T00:00:00Z";

export type SyncState = "SUCCESS" | "FAILED";

export type OwnerSync = {
  status: SyncState;
  gid: string | null;
  userErrors: string[];
};

export type FunctionOwnerSync = {
  discount: OwnerSync;
  validation: OwnerSync;
  payment: OwnerSync;
};

type StoredOwners = {
  discountGid: string | null;
  validationGid: string | null;
  paymentGid?: string | null;
};

type GraphqlRunner = {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<{ json: () => Promise<unknown> }>;
};

const DISCOUNT_CREATE = `#graphql
  mutation CreateWholesalePricing($automaticAppDiscount: DiscountAutomaticAppInput!) {
    discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
      automaticAppDiscount {
        discountId
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const VALIDATION_CREATE = `#graphql
  mutation CreateWholesaleMinimumOrder($validation: ValidationCreateInput!) {
    validationCreate(validation: $validation) {
      validation {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PAYMENT_CREATE = `#graphql
  mutation CreateWholesalePaymentMethods($paymentCustomization: PaymentCustomizationInput!) {
    paymentCustomizationCreate(paymentCustomization: $paymentCustomization) {
      paymentCustomization {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const OWNER_METAFIELDS = `#graphql
  mutation SetWholesaleOwnerMetafields($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function syncFunctionOwners(input: {
  admin: GraphqlRunner;
  settings: WholesaleSettings;
  stored: StoredOwners;
}): Promise<FunctionOwnerSync> {
  const discount = await syncOwner({
    admin: input.admin,
    gid: input.stored.discountGid,
    settings: input.settings,
    create: () =>
      input.admin.graphql(DISCOUNT_CREATE, {
        variables: {
          automaticAppDiscount: {
            title: DISCOUNT_TITLE,
            functionHandle: DISCOUNT_FUNCTION_HANDLE,
            discountClasses: ["PRODUCT"],
            startsAt: DISCOUNT_STARTS_AT,
            combinesWith: {
              productDiscounts: false,
              orderDiscounts: false,
              shippingDiscounts: true,
            },
          },
        },
      }),
    createdId: (json) =>
      (
        json as {
          data?: {
            discountAutomaticAppCreate?: {
              automaticAppDiscount?: { discountId?: string | null } | null;
              userErrors?: { message?: string | null }[];
            };
          };
        }
      ).data?.discountAutomaticAppCreate?.automaticAppDiscount?.discountId,
    createdErrors: (json) =>
      messages(
        (
          json as {
            data?: {
              discountAutomaticAppCreate?: { userErrors?: { message?: string | null }[] };
            };
          }
        ).data?.discountAutomaticAppCreate?.userErrors,
      ),
  });

  const validation = await syncOwner({
    admin: input.admin,
    gid: input.stored.validationGid,
    settings: input.settings,
    create: () =>
      input.admin.graphql(VALIDATION_CREATE, {
        variables: {
          validation: {
            title: VALIDATION_TITLE,
            functionHandle: VALIDATION_FUNCTION_HANDLE,
            enable: true,
            blockOnFailure: false,
          },
        },
      }),
    createdId: (json) =>
      (
        json as {
          data?: {
            validationCreate?: {
              validation?: { id?: string | null } | null;
            };
          };
        }
      ).data?.validationCreate?.validation?.id,
    createdErrors: (json) =>
      messages(
        (
          json as {
            data?: { validationCreate?: { userErrors?: { message?: string | null }[] } };
          }
        ).data?.validationCreate?.userErrors,
      ),
  });

  const payment = await syncOwner({
    admin: input.admin,
    gid: input.stored.paymentGid ?? null,
    settings: input.settings,
    create: () =>
      input.admin.graphql(PAYMENT_CREATE, {
        variables: {
          paymentCustomization: {
            title: PAYMENT_TITLE,
            functionHandle: PAYMENT_FUNCTION_HANDLE,
            enabled: true,
          },
        },
      }),
    createdId: (json) =>
      (
        json as {
          data?: {
            paymentCustomizationCreate?: {
              paymentCustomization?: { id?: string | null } | null;
            };
          };
        }
      ).data?.paymentCustomizationCreate?.paymentCustomization?.id,
    createdErrors: (json) =>
      messages(
        (
          json as {
            data?: {
              paymentCustomizationCreate?: { userErrors?: { message?: string | null }[] };
            };
          }
        ).data?.paymentCustomizationCreate?.userErrors,
      ),
  });

  return { discount, validation, payment };
}

async function syncOwner(input: {
  admin: GraphqlRunner;
  gid: string | null;
  settings: WholesaleSettings;
  create: () => Promise<{ json: () => Promise<unknown> }>;
  createdId: (json: unknown) => string | null | undefined;
  createdErrors: (json: unknown) => string[];
}): Promise<OwnerSync> {
  let gid = input.gid;
  if (!gid) {
    const created = await (await input.create()).json();
    const userErrors = input.createdErrors(created);
    const createdGid = input.createdId(created);
    if (userErrors.length > 0 || !createdGid) {
      return {
        status: "FAILED",
        gid: null,
        userErrors:
          userErrors.length > 0
            ? userErrors
            : ["Shopify did not return the function owner."],
      };
    }
    gid = createdGid;
  }

  const response = await input.admin.graphql(OWNER_METAFIELDS, {
    variables: { metafields: ownerMetafields(gid, input.settings) },
  });
  const json = (await response.json()) as {
    data?: { metafieldsSet?: { userErrors?: { message?: string | null }[] } | null };
  };
  const userErrors = messages(json.data?.metafieldsSet?.userErrors);
  if (!json.data?.metafieldsSet || userErrors.length > 0) {
    return {
      status: "FAILED",
      gid,
      userErrors:
        userErrors.length > 0
          ? userErrors
          : ["Shopify did not save the function owner settings."],
    };
  }

  return { status: "SUCCESS", gid, userErrors: [] };
}

function ownerMetafields(ownerId: string, settings: WholesaleSettings) {
  return [
    {
      ownerId,
      namespace: SETTINGS_METAFIELD_NAMESPACE,
      key: SETTINGS_METAFIELD_KEY,
      type: "json",
      value: JSON.stringify(settings),
    },
    {
      ownerId,
      namespace: SETTINGS_METAFIELD_NAMESPACE,
      key: FUNCTION_VARIABLES_KEY,
      type: "json",
      value: JSON.stringify({
        customerTags: customerTagLookupValues(settings.customerTag),
      }),
    },
  ];
}

function messages(errors: { message?: string | null }[] | undefined) {
  return (errors ?? [])
    .map((error) => error.message)
    .filter((message): message is string => Boolean(message));
}
