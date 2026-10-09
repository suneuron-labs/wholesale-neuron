export const SETTINGS_METAFIELD_NAMESPACE = "$app:b2b_toolkit";
export const SETTINGS_METAFIELD_KEY = "settings";

export const DEFAULT_WHOLESALE_SETTINGS = {
  customerTag: "wholesale",
  discountPercent: 20,
  minimumOrderValue: 500,
  paymentMethodName: "",
};

export type WholesaleSettings = {
  customerTag: string;
  discountPercent: number;
  minimumOrderValue: number;
  paymentMethodName: string;
};

export type SettingsFieldErrors = {
  customerTag?: string;
  discountPercent?: string;
  minimumOrderValue?: string;
  paymentMethodName?: string;
};

const TAG_ERROR =
  "Use 1 to 40 letters, numbers, spaces, hyphens, or underscores.";
const PERCENT_ERROR = "Enter a whole number from 0 to 100.";
const MOV_ERROR =
  "Enter a number that is 0 or greater, with at most 2 decimal places.";
const PAYMENT_METHOD_ERROR = "Enter 1 to 100 characters.";
const TAG_PATTERN = /^[A-Za-z0-9 _-]{1,40}$/;
const PERCENT_PATTERN = /^(?:0|[1-9]|[1-9]\d|100)$/;
const MOV_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;

type SettingsInput = {
  customerTag: unknown;
  discountPercent: unknown;
  minimumOrderValue: unknown;
  paymentMethodName: unknown;
};

export type SaveSettingsResult =
  | {
      ok: true;
      settings: WholesaleSettings;
      fieldErrors: SettingsFieldErrors;
      userErrors: string[];
    }
  | {
      ok: false;
      settings: WholesaleSettings | null;
      fieldErrors: SettingsFieldErrors;
      userErrors: string[];
    };

type GraphqlRunner = {
  graphql: (
    query: string,
    options?: { variables?: Record<string, unknown> },
  ) => Promise<{ json: () => Promise<unknown> }>;
};

const INSTALLATION_QUERY = `#graphql
  query WholesaleAppInstallation {
    currentAppInstallation {
      id
    }
  }
`;

const SETTINGS_SAVE_MUTATION = `#graphql
  mutation SetWholesaleSettings($metafields: [MetafieldsSetInput!]!) {
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

export function parseStoredSettings(value: string | null | undefined): {
  settings: WholesaleSettings;
  saved: boolean;
} {
  if (!value) {
    return { settings: DEFAULT_WHOLESALE_SETTINGS, saved: false };
  }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const validated = validateSettings({
      customerTag: parsed.customerTag,
      discountPercent: parsed.discountPercent,
      minimumOrderValue: parsed.minimumOrderValue,
      paymentMethodName: parsed.paymentMethodName,
    });
    if (validated.ok) {
      return { settings: validated.settings, saved: true };
    }
    if (
      !validated.fieldErrors.customerTag &&
      !validated.fieldErrors.discountPercent &&
      !validated.fieldErrors.minimumOrderValue
    ) {
      const pricing = validateSettings({
        customerTag: parsed.customerTag,
        discountPercent: parsed.discountPercent,
        minimumOrderValue: parsed.minimumOrderValue,
        paymentMethodName: "saved",
      });
      if (pricing.ok) {
        return {
          settings: { ...pricing.settings, paymentMethodName: "" },
          saved: false,
        };
      }
    }
    return { settings: DEFAULT_WHOLESALE_SETTINGS, saved: false };
  } catch {
    return { settings: DEFAULT_WHOLESALE_SETTINGS, saved: false };
  }
}

export function validateSettings(input: SettingsInput):
  | { ok: true; settings: WholesaleSettings }
  | { ok: false; fieldErrors: SettingsFieldErrors } {
  const fieldErrors: SettingsFieldErrors = {};
  const customerTag =
    typeof input.customerTag === "string" ? input.customerTag.trim() : "";
  if (!TAG_PATTERN.test(customerTag)) {
    fieldErrors.customerTag = TAG_ERROR;
  }

  const percentText = textValue(input.discountPercent);
  const discountPercent =
    percentText != null && PERCENT_PATTERN.test(percentText)
      ? Number(percentText)
      : null;
  if (discountPercent == null) {
    fieldErrors.discountPercent = PERCENT_ERROR;
  }

  const movText = textValue(input.minimumOrderValue);
  const minimumOrderValue =
    movText != null && MOV_PATTERN.test(movText) ? Number(movText) : null;
  if (minimumOrderValue == null) {
    fieldErrors.minimumOrderValue = MOV_ERROR;
  }

  const paymentMethodName =
    typeof input.paymentMethodName === "string" ? input.paymentMethodName.trim() : "";
  if (paymentMethodName.length > 100) {
    fieldErrors.paymentMethodName = PAYMENT_METHOD_ERROR;
  }

  if (
    fieldErrors.customerTag ||
    fieldErrors.discountPercent ||
    fieldErrors.minimumOrderValue ||
    fieldErrors.paymentMethodName ||
    discountPercent == null ||
    minimumOrderValue == null
  ) {
    return { ok: false, fieldErrors };
  }

  return {
    ok: true,
    settings: { customerTag, discountPercent, minimumOrderValue, paymentMethodName },
  };
}

export async function saveWholesaleSettings(
  admin: GraphqlRunner,
  formData: FormData,
): Promise<SaveSettingsResult> {
  const validated = validateSettings({
    customerTag: formData.get("customerTag"),
    discountPercent: formData.get("discountPercent"),
    minimumOrderValue: formData.get("minimumOrderValue"),
    paymentMethodName: formData.get("paymentMethodName"),
  });

  if (!validated.ok) {
    return {
      ok: false,
      settings: null,
      fieldErrors: validated.fieldErrors,
      userErrors: [],
    };
  }

  const installationResponse = await admin.graphql(INSTALLATION_QUERY);
  const installationJson = (await installationResponse.json()) as {
    data?: { currentAppInstallation?: { id?: string | null } | null };
  };
  const ownerId = installationJson.data?.currentAppInstallation?.id;
  if (!ownerId?.startsWith("gid://")) {
    return {
      ok: false,
      settings: validated.settings,
      fieldErrors: {},
      userErrors: ["Could not find the app installation."],
    };
  }

  const response = await admin.graphql(SETTINGS_SAVE_MUTATION, {
    variables: {
      metafields: [
        {
          ownerId,
          namespace: SETTINGS_METAFIELD_NAMESPACE,
          key: SETTINGS_METAFIELD_KEY,
          type: "json",
          value: JSON.stringify(validated.settings),
        },
      ],
    },
  });
  const json = (await response.json()) as {
    data?: {
      metafieldsSet?: {
        userErrors?: { message?: string | null }[];
      } | null;
    };
  };
  const userErrors = (json.data?.metafieldsSet?.userErrors ?? [])
    .map((error) => error.message)
    .filter((message): message is string => Boolean(message));

  if (!json.data?.metafieldsSet || userErrors.length > 0) {
    return {
      ok: false,
      settings: validated.settings,
      fieldErrors: {},
      userErrors:
        userErrors.length > 0
          ? userErrors
          : ["Shopify did not save the settings."],
    };
  }

  return {
    ok: true,
    settings: validated.settings,
    fieldErrors: {},
    userErrors: [],
  };
}

function textValue(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return null;
}
