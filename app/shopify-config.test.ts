import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appConfig = readFileSync(new URL("../shopify.app.toml", import.meta.url), "utf8");
const webConfig = readFileSync(new URL("../shopify.web.toml", import.meta.url), "utf8");

describe("shopify.app.toml", () => {
  it("uses the Vercel production application url and the v1 scopes", () => {
    expect(appConfig).toMatch(
      /application_url\s*=\s*"https:\/\/wholesale-neuron\.vercel\.app"/,
    );
    expect(appConfig).toMatch(
      /https:\/\/wholesale-neuron\.vercel\.app\/auth\/callback/,
    );
    expect(appConfig).toMatch(
      /https:\/\/wholesale-neuron\.vercel\.app\/auth\/shopify\/callback/,
    );
    expect(appConfig).toMatch(
      /https:\/\/wholesale-neuron\.vercel\.app\/api\/auth\/callback/,
    );
    expect(appConfig).toMatch(/write_discounts/);
    expect(appConfig).toMatch(/write_validations/);
    expect(appConfig).not.toMatch(/write_products/);
    expect(appConfig).not.toMatch(/write_metaobjects/);
  });

  it("subscribes to uninstall and the three privacy topics", () => {
    expect(appConfig).toMatch(/app\/uninstalled/);
    expect(appConfig).toMatch(/customers\/data_request/);
    expect(appConfig).toMatch(/customers\/redact/);
    expect(appConfig).toMatch(/shop\/redact/);
  });

  it("uses the July 2026 API version for webhooks", () => {
    expect(appConfig).toMatch(/api_version\s*=\s*"2026-07"/);
  });
});

describe("shopify.web.toml", () => {
  it("declares the web process roles", () => {
    expect(webConfig).toMatch(/name\s*=\s*"React Router"/);
    expect(webConfig).toMatch(/"frontend"/);
    expect(webConfig).toMatch(/"backend"/);
  });
});
