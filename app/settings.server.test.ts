import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_WHOLESALE_SETTINGS,
  SETTINGS_METAFIELD_KEY,
  SETTINGS_METAFIELD_NAMESPACE,
  parseStoredSettings,
  saveWholesaleSettings,
  validateSettings,
} from "./settings.server";

const installationId = "gid://shopify/AppInstallation/1";

function form(values: {
  customerTag: string;
  discountPercent: string;
  minimumOrderValue: string;
  paymentMethodName: string;
}) {
  const data = new FormData();
  data.set("customerTag", values.customerTag);
  data.set("discountPercent", values.discountPercent);
  data.set("minimumOrderValue", values.minimumOrderValue);
  data.set("paymentMethodName", values.paymentMethodName);
  return data;
}

describe("settings defaults and parsing", () => {
  it("uses wholesale, 20 percent, and a 500 minimum when nothing is stored", () => {
    expect(DEFAULT_WHOLESALE_SETTINGS).toEqual({
      customerTag: "wholesale",
      discountPercent: 20,
      minimumOrderValue: 500,
      paymentMethodName: "",
    });
    expect(parseStoredSettings(null)).toEqual({
      settings: DEFAULT_WHOLESALE_SETTINGS,
      saved: false,
    });
    expect(parseStoredSettings("")).toEqual({
      settings: DEFAULT_WHOLESALE_SETTINGS,
      saved: false,
    });
  });

  it("returns defaults for bad JSON and for values that fail validation", () => {
    expect(parseStoredSettings("{")).toEqual({
      settings: DEFAULT_WHOLESALE_SETTINGS,
      saved: false,
    });
    expect(
      parseStoredSettings(
        JSON.stringify({
          customerTag: "wholesale,vip",
          discountPercent: 20,
          minimumOrderValue: 500,
        }),
      ).saved,
    ).toBe(false);
  });

  it("treats a missing payment method name as blank and saved", () => {
    expect(
      parseStoredSettings(
        JSON.stringify({
          customerTag: "VIP",
          discountPercent: 20,
          minimumOrderValue: 50,
        }),
      ),
    ).toEqual({
      settings: {
        customerTag: "VIP",
        discountPercent: 20,
        minimumOrderValue: 50,
        paymentMethodName: "",
      },
      saved: true,
    });
  });

  it("loads a valid stored JSON object", () => {
    const stored = {
      customerTag: "vip buyers",
      discountPercent: 15,
      minimumOrderValue: 0,
      paymentMethodName: "Pay by invoice",
    };

    expect(parseStoredSettings(JSON.stringify(stored))).toEqual({
      settings: stored,
      saved: true,
    });
  });
});

describe("validateSettings", () => {
  it("accepts the locked tag, percent, and minimum order rules", () => {
    expect(
      validateSettings({
        customerTag: "  vip_buyers-1  ",
        discountPercent: "15",
        minimumOrderValue: "10.50",
        paymentMethodName: "  Pay By Invoice  ",
      }),
    ).toEqual({
      ok: true,
      settings: {
        customerTag: "vip_buyers-1",
        discountPercent: 15,
        minimumOrderValue: 10.5,
        paymentMethodName: "Pay By Invoice",
      },
    });
  });

  it("accepts a zero discount and a blank payment method name", () => {
    expect(
      validateSettings({
        customerTag: "vip",
        discountPercent: "0",
        minimumOrderValue: "0",
        paymentMethodName: "   ",
      }),
    ).toEqual({
      ok: true,
      settings: {
        customerTag: "vip",
        discountPercent: 0,
        minimumOrderValue: 0,
        paymentMethodName: "",
      },
    });
  });

  it("rejects commas, a percent outside 0 to 100, and more than 2 decimal places", () => {
    const result = validateSettings({
      customerTag: "wholesale,vip",
      discountPercent: "20.5",
      minimumOrderValue: "1.255",
      paymentMethodName: "Pay by invoice",
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.fieldErrors.customerTag).toBeTruthy();
    expect(result.fieldErrors.discountPercent).toBeTruthy();
    expect(result.fieldErrors.minimumOrderValue).toBeTruthy();
  });

  it("rejects an empty tag, 101 percent, and a negative minimum", () => {
    expect(
      validateSettings({
        customerTag: "",
        discountPercent: "1",
        minimumOrderValue: "-1",
        paymentMethodName: "",
      }).ok,
    ).toBe(false);
    expect(
      validateSettings({
        customerTag: "wholesale",
        discountPercent: "101",
        minimumOrderValue: "0",
        paymentMethodName: "Pay by invoice",
      }).ok,
    ).toBe(false);
    expect(
      validateSettings({
        customerTag: "a".repeat(41),
        discountPercent: "1",
        minimumOrderValue: "0",
        paymentMethodName: "x".repeat(101),
      }).ok,
    ).toBe(false);
  });
});

describe("saveWholesaleSettings", () => {
  it("does not call Shopify when validation fails", async () => {
    const graphql = vi.fn();

    const result = await saveWholesaleSettings(
      { graphql },
      form({
        customerTag: "bad,tag",
        discountPercent: "20",
        minimumOrderValue: "500",
        paymentMethodName: "Pay by invoice",
      }),
    );

    expect(graphql).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
    expect(result.userErrors).toEqual([]);
  });

  it("writes JSON to the app installation metafield", async () => {
    const graphql = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({
          data: { currentAppInstallation: { id: installationId } },
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          data: { metafieldsSet: { userErrors: [] } },
        }),
      });

    const result = await saveWholesaleSettings(
      { graphql },
      form({
        customerTag: "wholesale",
        discountPercent: "20",
        minimumOrderValue: "500",
        paymentMethodName: "Pay by invoice",
      }),
    );

    expect(result).toEqual({
      ok: true,
      settings: {
        ...DEFAULT_WHOLESALE_SETTINGS,
        paymentMethodName: "Pay by invoice",
      },
      fieldErrors: {},
      userErrors: [],
    });
    const mutation = graphql.mock.calls[1];
    expect(String(mutation[0])).toContain("metafieldsSet");
    expect(mutation[1]).toEqual({
      variables: {
        metafields: [
          {
            ownerId: installationId,
            namespace: SETTINGS_METAFIELD_NAMESPACE,
            key: SETTINGS_METAFIELD_KEY,
            type: "json",
            value: JSON.stringify({
              ...DEFAULT_WHOLESALE_SETTINGS,
              paymentMethodName: "Pay by invoice",
            }),
          },
        ],
      },
    });
    expect(SETTINGS_METAFIELD_NAMESPACE).toBe("$app:b2b_toolkit");
    expect(SETTINGS_METAFIELD_KEY).toBe("settings");
  });

  it("returns Shopify userErrors and does not treat the save as successful", async () => {
    const graphql = vi
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({
          data: { currentAppInstallation: { id: installationId } },
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          data: {
            metafieldsSet: {
              userErrors: [{ field: ["metafields"], message: "Owner is invalid" }],
            },
          },
        }),
      });

    const result = await saveWholesaleSettings(
      { graphql },
      form({
        customerTag: "wholesale",
        discountPercent: "20",
        minimumOrderValue: "500",
        paymentMethodName: "Pay by invoice",
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.userErrors).toEqual(["Owner is invalid"]);
  });
});
