import { describe, expect, it, vi } from "vitest";
import { DEFAULT_WHOLESALE_SETTINGS } from "./settings.server";
import { customerTagLookupValues } from "./text-match";
import {
  DISCOUNT_FUNCTION_HANDLE,
  DISCOUNT_TITLE,
  FUNCTION_VARIABLES_KEY,
  VALIDATION_FUNCTION_HANDLE,
  VALIDATION_TITLE,
  syncFunctionOwners,
} from "./function-owners.server";
import { SETTINGS_METAFIELD_KEY, SETTINGS_METAFIELD_NAMESPACE } from "./settings.server";

const discountGid = "gid://shopify/DiscountAutomaticNode/11";
const validationGid = "gid://shopify/Validation/22";

function mockGraphql(handler: (query: string) => unknown) {
  return vi.fn(async (query: string, _options?: { variables?: unknown }) => ({
    json: async () => handler(String(query)),
  }));
}

describe("syncFunctionOwners", () => {
  it("does not create a second discount when the gid is already stored", async () => {
    const graphql = mockGraphql(() => ({
      data: { metafieldsSet: { userErrors: [] } },
    }));

    const result = await syncFunctionOwners({
      admin: { graphql },
      settings: DEFAULT_WHOLESALE_SETTINGS,
      stored: { discountGid, validationGid },
    });

    const queries = graphql.mock.calls.map((call) => String(call[0]));
    expect(queries.some((query) => query.includes("discountAutomaticAppCreate"))).toBe(
      false,
    );
    expect(queries.some((query) => query.includes("validationCreate"))).toBe(false);
    expect(result.discount).toEqual({
      status: "SUCCESS",
      gid: discountGid,
      userErrors: [],
    });
    expect(result.validation.status).toBe("SUCCESS");

    const discountWrite = graphql.mock.calls[0]?.[1] as {
      variables: { metafields: { ownerId: string; key: string; value: string }[] };
    };
    expect(discountWrite.variables.metafields).toEqual([
      {
        ownerId: discountGid,
        namespace: SETTINGS_METAFIELD_NAMESPACE,
        key: SETTINGS_METAFIELD_KEY,
        type: "json",
        value: JSON.stringify(DEFAULT_WHOLESALE_SETTINGS),
      },
      {
        ownerId: discountGid,
        namespace: SETTINGS_METAFIELD_NAMESPACE,
        key: FUNCTION_VARIABLES_KEY,
        type: "json",
        value: JSON.stringify({
          customerTags: customerTagLookupValues(DEFAULT_WHOLESALE_SETTINGS.customerTag),
        }),
      },
    ]);
  });

  it("creates the discount once with product-only stacking and stores its gid", async () => {
    const graphql = mockGraphql((query) => {
      if (query.includes("discountAutomaticAppCreate")) {
        return {
          data: {
            discountAutomaticAppCreate: {
              automaticAppDiscount: { discountId: discountGid },
              userErrors: [],
            },
          },
        };
      }
      if (query.includes("validationCreate")) {
        return {
          data: {
            validationCreate: {
              validation: { id: validationGid },
              userErrors: [],
            },
          },
        };
      }
      return { data: { metafieldsSet: { userErrors: [] } } };
    });

    const result = await syncFunctionOwners({
      admin: { graphql },
      settings: DEFAULT_WHOLESALE_SETTINGS,
      stored: { discountGid: null, validationGid: null },
    });

    const createCall = graphql.mock.calls.find((call) =>
      String(call[0]).includes("discountAutomaticAppCreate"),
    );
    expect(createCall?.[1] as unknown).toEqual({
      variables: {
        automaticAppDiscount: {
          title: DISCOUNT_TITLE,
          functionHandle: DISCOUNT_FUNCTION_HANDLE,
          discountClasses: ["PRODUCT"],
          startsAt: "2026-01-01T00:00:00Z",
          combinesWith: {
            productDiscounts: false,
            orderDiscounts: false,
            shippingDiscounts: true,
          },
        },
      },
    });
    expect(DISCOUNT_TITLE).toBe("Wholesale pricing");
    expect(VALIDATION_TITLE).toBe("Wholesale minimum order");
    expect(VALIDATION_FUNCTION_HANDLE).toBe("wholesale-minimum-order");
    expect(result.discount).toEqual({
      status: "SUCCESS",
      gid: discountGid,
      userErrors: [],
    });
    expect(result.validation.gid).toBe(validationGid);
    expect(
      graphql.mock.calls.filter((call) =>
        String(call[0]).includes("discountAutomaticAppCreate"),
      ),
    ).toHaveLength(1);
  });

  it("fails the sync when Shopify returns userErrors", async () => {
    const graphql = mockGraphql((query) => {
      if (query.includes("discountAutomaticAppCreate")) {
        return {
          data: {
            discountAutomaticAppCreate: {
              automaticAppDiscount: null,
              userErrors: [{ message: "Function not found" }],
            },
          },
        };
      }
      if (query.includes("validationCreate")) {
        return {
          data: {
            validationCreate: {
              validation: null,
              userErrors: [{ message: "Validation function not found" }],
            },
          },
        };
      }
      return { data: { metafieldsSet: { userErrors: [] } } };
    });

    const result = await syncFunctionOwners({
      admin: { graphql },
      settings: DEFAULT_WHOLESALE_SETTINGS,
      stored: { discountGid: null, validationGid: null },
    });

    expect(result.discount).toEqual({
      status: "FAILED",
      gid: null,
      userErrors: ["Function not found"],
    });
    expect(result.validation).toEqual({
      status: "FAILED",
      gid: null,
      userErrors: ["Validation function not found"],
    });
    expect(
      graphql.mock.calls.some((call) => String(call[0]).includes("metafieldsSet")),
    ).toBe(false);
  });
});
