import { describe, expect, it } from "vitest";
import { wholesaleLineDiscounts } from "../extensions/wholesale-pricing/src/pricing-decision";

const settings = JSON.stringify({
  customerTag: "wholesale",
  discountPercent: 20,
  minimumOrderValue: 500,
});

describe("wholesaleLineDiscounts", () => {
  it("gives the configured percent on every line for a tagged customer", () => {
    expect(
      wholesaleLineDiscounts({
        hasWholesaleTag: true,
        settingsJson: settings,
        lines: [{ id: "line-1" }, { id: "line-2" }],
      }),
    ).toEqual([
      { lineId: "line-1", percent: 20 },
      { lineId: "line-2", percent: 20 },
    ]);
  });

  it("uses the saved customer tag, including tags other than wholesale", () => {
    expect(
      wholesaleLineDiscounts({
        hasWholesaleTag: true,
        settingsJson: JSON.stringify({
          customerTag: "VIP",
          discountPercent: 15,
          minimumOrderValue: 0,
        }),
        lines: [{ id: "line-1" }],
      }),
    ).toEqual([{ lineId: "line-1", percent: 15 }]);
  });

  it("returns no discounts when the percent is zero", () => {
    expect(
      wholesaleLineDiscounts({
        hasWholesaleTag: true,
        settingsJson: JSON.stringify({
          customerTag: "vip",
          discountPercent: 0,
          minimumOrderValue: 500,
        }),
        lines: [{ id: "line-1" }],
      }),
    ).toEqual([]);
  });

  it.each([
    ["untagged", false, settings],
    ["guest", false, settings],
    ["empty metafield", true, null],
    ["bad json", true, "{"],
  ])("returns no discounts for %s", (_label, hasWholesaleTag, settingsJson) => {
    expect(
      wholesaleLineDiscounts({
        hasWholesaleTag,
        settingsJson,
        lines: [{ id: "line-1" }],
      }),
    ).toEqual([]);
  });
});
