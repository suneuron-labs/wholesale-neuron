export type WholesaleLine = { id: string };

export function wholesaleLineDiscounts(input: {
  hasWholesaleTag: boolean;
  settingsJson: string | null | undefined;
  lines: WholesaleLine[];
}): { lineId: string; percent: number }[] {
  if (!input.hasWholesaleTag || input.lines.length === 0) {
    return [];
  }
  const settings = readSettings(input.settingsJson);
  if (!settings || settings.discountPercent === 0) {
    return [];
  }
  return input.lines.map((line) => ({
    lineId: line.id,
    percent: settings.discountPercent,
  }));
}

function readSettings(value: string | null | undefined): { discountPercent: number } | null {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value) as {
      customerTag?: unknown;
      discountPercent?: unknown;
    };
    if (
      !savedCustomerTag(parsed.customerTag) ||
      typeof parsed.discountPercent !== "number" ||
      !Number.isInteger(parsed.discountPercent) ||
      parsed.discountPercent < 0 ||
      parsed.discountPercent > 100
    ) {
      return null;
    }
    return { discountPercent: parsed.discountPercent };
  } catch {
    return null;
  }
}

function savedCustomerTag(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}
