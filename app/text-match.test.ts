import { describe, expect, it } from "vitest";
import { customerTagLookupValues, sameFoldedText } from "./text-match";

describe("sameFoldedText", () => {
  it("ignores surrounding spaces and capitalization", () => {
    expect(sameFoldedText("  Pay By Invoice  ", "pay by invoice")).toBe(true);
    expect(sameFoldedText("VIP", "  vip ")).toBe(true);
    expect(sameFoldedText("PayPal", "Shopify Payments")).toBe(false);
  });
});

describe("customerTagLookupValues", () => {
  it("trims the tag and includes every capitalization for a short tag", () => {
    const values = customerTagLookupValues("  VIP ");

    expect(values).toContain("VIP");
    expect(values).toContain("vip");
    expect(values).toContain("Vip");
    expect(values).toContain("vIp");
    expect(values).toHaveLength(8);
  });

  it("includes the common capitalizations of a longer tag", () => {
    expect(customerTagLookupValues("  wholesale ")).toEqual(
      expect.arrayContaining(["wholesale", "WHOLESALE", "Wholesale"]),
    );
  });
});
