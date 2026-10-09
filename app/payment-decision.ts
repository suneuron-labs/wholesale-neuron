import { sameFoldedText } from "./text-match";

export function hiddenPaymentMethodIds(input: {
  hasWholesaleTag: boolean;
  settingsJson?: string | null;
  methods: { id: string; name: string }[];
}): string[] {
  if (!input.hasWholesaleTag) {
    return [];
  }
  const allowedName = readPaymentMethodName(input.settingsJson);
  if (!allowedName) {
    return [];
  }
  return input.methods
    .filter((method) => !sameFoldedText(method.name, allowedName))
    .map((method) => method.id);
}

function readPaymentMethodName(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value) as { paymentMethodName?: unknown };
    if (typeof parsed.paymentMethodName !== "string") {
      return null;
    }
    const name = parsed.paymentMethodName.trim();
    return name.length > 0 ? name : null;
  } catch {
    return null;
  }
}
