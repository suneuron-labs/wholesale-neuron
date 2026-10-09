# Wholesale & B2B Toolkit — plan and tracker

Last updated: 2026-10-09. Status: **Vercel deploy live** at `https://wholesale-neuron.vercel.app`. GitHub is `suneuron-labs/wholesale-neuron` with author `suneuron-labs`. 2026-10-09: first Vercel build warned that `vercelPreset()` was missing; closed by adding `@vercel/react-router` and `react-router.config.ts`. Next: reinstall on the dev store and run the production billing check.

## Locked decisions (2026-09-28)

User answers, in order:

| # | Decision |
| --- | --- |
| 1 | **Defer creating payments** was the 2026-09-28 decision. Hide-by-name shipped later. The name is the merchant's **Allowed B2B Payment Method Name**, not a hardcoded `Net 30` string. The app does not create the method. Blank means hide nothing. |
| 2 | **$29 USD / month, 7-day trial.** Native Shopify Billing only. |
| 3 | **MOV uses merchandise subtotal after the wholesale discount**, shop currency. |
| 4 | **Polaris web components, no Tailwind.** Match the current React Router app template. |
| 5 | **Do not stack** with other product or order discounts. Shipping discounts may still apply. |
| 6 | **No order history.** Log settings saves and function-sync status only. |

## Brand

- App name in Partner Dashboard, Admin, and billing: **WholesaleNeuron**
- Support mailto: `support@wholesale.suneuron.com`
- Colors: navy `#0B1F33`, copper `#D4A574`, white
- Mark: one large node (the merchant) branching to smaller nodes (wholesale buyers). The copper path is the checkout pricing route.
- App icon only: `brand/wholesale-neuron-mark.png`. Square mark, three buyer paths. No wordmark file. The app name is set in the Partner Dashboard, not inside the image.
- Listing spec is square PNG or JPEG at **1200×1200** (current file is 1024×1024 and should be exported to 1200 before upload). No pre-rounded corners. Keep about a 75px margin so Shopify’s automatic corner rounding does not clip the nodes. Shopify’s app-icon best practices say to **avoid text** in the icon. Do not add “WholesaleNeuron” into the square. Admin already shows the name beside it, and the word is unreadable at sidebar size.

## Session memory

- React Router template is in the workspace root. Partner app created 2026-09-28.
- User asked to plan first. Build starts only on an explicit "build" instruction.
- Generic rules: `.cursor/rules/shopify.mdc`. Product spec: `.cursor/spec-plans/app-spec.md`.
- The `$39` / `$105` figures in the spec are **Shopify plan prices**, not this app's fee. The app fee is **$29/month**.
- Support link in the embedded UI is `mailto:support@wholesale.suneuron.com`.
- 2026-09-28: user created the dev store and asked for the Partner app. App created with the React Router template.
- 2026-09-29: user set Dev Dashboard distribution to **Public**.
- 2026-09-29: Slice 2 was confirmed on `suneuron-dev-wholesale`: both function lines SUCCESS, logged-out checkout stayed retail. Slice 3 (pricing engine logic) stays blocked until the user says to build it. The function files return no discounts and no validation errors until then.
- 2026-09-29: Dev store **suneuron-dev-wholesale** is linked. Scopes on the store are Discounts and Shopify Functions (`write_discounts`, `write_validations`). User confirmed the empty settings page, billing-bypass banner, and support link. Do not use `npm run dev -- --reset`; that re-downloads the dashboard copy of `shopify.app.toml` and restores the template scopes.
- 2026-09-29: First real uninstall arrived as topic `APP_UNINSTALLED` and was skipped (`unhandled_topic`). Handler now accepts both topic forms. Repeat uninstall at 05:11 UTC was `SUCCESS`: no session rows, `isInstalled` false. Slice 0 manual checks are complete. App was reinstalled afterward. Pressing **p** while uninstalled 404s until `npm run dev` is restarted without `--reset`.
- 2026-09-29: User asked for slices 3, 4, and a new slice 5. Slice 5 hides payment methods by name for tagged wholesale customers and leaves `Net 30 - Pay by Invoice`. It does not create that method. Plus-only Net terms and US/CA credit-card field limits still apply.
- 2026-10-01: The checkout tag is the merchant's saved customer tag (`wholesale`, `VIP`, `bulk`, `fav`, or any other valid string). `wholesale` is only the form default. Pricing, minimum order, and payment functions read that tag from the `function_variables` metafield (`customerTags`) via an input query variable.
- 2026-10-01: Merchants enter **Allowed B2B Payment Method Name**. For a tagged buyer, checkout hides every payment method except names that match that text. The customer tag and the payment method name are trimmed, and capitalization does not matter. The app does not create the payment method.
- 2026-10-02: Discount, minimum order, and payment hide are each optional. `0` turns the discount off. `0` turns the minimum off. A blank payment-method name hides nothing. User completed a first-pass guest and tagged checkout on `suneuron-dev-wholesale` with a $24.95 product: 20% off, $30 minimum block, `Cash` hidden, **Credit card** still visible, and the 0 / 0 / blank pass left retail with every method.
- 2026-10-06: Supabase Postgres hooked up (`DATABASE_URL` / `DIRECT_URL`). Billing plan renamed to **Essential B2B Plan**. Test charge approval verified with `ENFORCE_BILLING=1`.
- 2026-10-06: Public `/privacy` route + dashboard Quick Setup Guide added for App Store compliance. Pre-submission security audit completed; criticals fixed (billing gate on settings action, `.env.example`, webhook API `2026-07`, gitignore hardening). Privacy subprocessors kept as **Supabase / AWS / Vercel / Shopify**. Production URLs stay localhost until Vercel deploy. `NODE_ENV=production` will be set in Vercel. GitHub push is next (no remote yet).

## What v1 is

An embedded Shopify admin app plus three checkout Functions. Wholesale customers are regular customers with the merchant's saved tag (form default `wholesale`). When that customer is logged in at checkout, and the matching feature is turned on:

1. A discount function reduces the original variant price by the configured percent. `0` applies no discount.
2. A cart-and-checkout validation function blocks checkout when the post-discount merchandise subtotal is below the minimum order value. `0` does not block.
3. A payment customization hides every method except the saved name. A blank name hides nothing. The app does not create the method. On a non-Plus store in the US or Canada, Shopify still shows the credit card.

No draft orders. No duplicate variants. No theme edits. No ScriptTag. No third-party billing. No Net terms created by the app.

Retail and guest checkouts fail open: missing metafields, crashes, or a missing tag return no discounts, no validation errors, and no payment hides.

## Platform corrections to the spec

These override the spec's implementation notes.

### 1. Do not generate a "Product discount" extension

The Product Discount Function API is deprecated as of Admin API `2025-04`. Use the unified **Discount Function API** with target `cart.lines.discounts.generate.run`, `discountClasses: [PRODUCT]`, and `discountAutomaticAppCreate` using `functionHandle`.

`combinesWith`: product discounts false, order discounts false, shipping discounts true.

### 2. Functions cannot read `AppInstallation` metafields

Input queries expose the **function owner** metafield (`discountNode`, `validation`), not `appInstallation`. App-owned metafields use the `$app:` namespace and type `json`, written by this app.

`hasAnyTag(tags:)` is a static GraphQL argument. Pass the tag through a Function input variable whose metafield key matches the variable and whose value supplies `[String!]`.

### 3. Hide a payment method by name. Do not create Net terms

Implemented: for a tagged buyer, hide every method whose name does not match **Allowed B2B Payment Method Name**. The merchant creates that method. The app does not.

Still deferred:

- `paymentTermsSet` (Net terms created by the function) is Plus only.
- Order review (draft-at-checkout) is Plus only and is the draft-order behavior this app must not use.
- Hiding a specific card placement is Plus only.
- On non-Plus stores in the United States and Canada, payment customizations do not change credit-card fields. The function still sends the hide. Checkout keeps the card.

### 4. Admin UI

Polaris web components (`s-page`, `s-text-field`, `s-button`) and App Bridge. No Tailwind. No React Polaris. Single page. No nested `s-app-nav`.

### 5. Settings sync log, not an order log

Checkout Functions do not call the app back. There is no per-cart run and no `orders/*` subscription. The dashboard shows a log of settings saves and whether the discount and validation owners updated (`SUCCESS` / `FAILED`), plus an empty state that tells the merchant to tag a customer and check out while logged in.

Webhook handlers still follow the rules pipeline (dedupe, `RECEIVED` → final status, HTTP 200, audit even when `admin` is null).

## Locked architecture

```
Admin (embedded)
  save form
    → validate
    → metafieldsSet on currentAppInstallation ($app:b2b_toolkit / settings)
    → ensure discount + validation owners exist (idempotent)
    → metafieldsSet the same JSON on each owner
    → metafield for the customer-tag input variable on each owner
    → Prisma row stores shop, isInstalled, discountGid, validationGid, and paymentGid

Checkout (WASM, no network)
  discount function    reads discount owner metafield
  validation function  reads validation owner metafield
  payment function     reads payment-customization owner metafield
```

Settings JSON (no PII):

```json
{
  "customerTag": "wholesale",
  "discountPercent": 20,
  "minimumOrderValue": 500,
  "paymentMethodName": ""
}
```

| Rule | Behavior |
| --- | --- |
| Who gets wholesale | Logged-in customer whose tag matches the saved tag after trim, ignoring capitalization. Guests and other customers are unchanged. `wholesale` is the form default, not a fixed tag. |
| Price | Percentage off every cart line (product class). Original variants only. |
| Stacking | Does not combine with other product or order discounts. Shipping discounts may still apply. |
| MOV amount | Shop-currency `cart.cost.subtotalAmount` after line discounts. Block only when the amount is strictly below MOV. `0` means MOV off. |
| When MOV runs | `CHECKOUT_INTERACTION` and `CHECKOUT_COMPLETION` only, so Add to cart is not blocked. |
| Message | `Wholesale orders require a minimum spend of $[MOV].` |
| Currency | Shop currency. Markets / presentment conversion is out of v1. |
| Collections | All products. No exclusions in v1. |
| Fail open | Any throw or missing config returns empty discounts or empty errors. |

Function owners are created on the first successful save, not at install. Stable titles so later saves update the same records:

- Discount: `Wholesale pricing`
- Validation: `Wholesale minimum order`
- Payment: `Wholesale payment methods`

Shopify removes app-owned discounts and validations on uninstall.

## Scopes and webhooks

`shopify.app.toml` scopes (confirm exact strings when scaffolding):

- `write_discounts`
- `write_validations`
- `write_payment_customizations`

No `read_orders`. No customer PII scopes.

Webhooks:

- `app/uninstalled` — mark `isInstalled: false`, delete sessions, HTTP 200
- `customers/data_request` — HTTP 200, no customer data stored
- `customers/redact` — HTTP 200, nothing customer-linked to delete
- `shop/redact` — delete Prisma rows for that shop

Compliance handlers use a `WebhookDelivery` row keyed by `[shop, eventId]` with statuses `RECEIVED | PROCESSING | SUCCESS | SKIPPED | FAILED`.

## Prisma (Postgres via Supabase `DATABASE_URL` / `DIRECT_URL`)

Template `Session` model stays.

`AppSettings`: `shop` (id), `isInstalled`, `discountGid`, `validationGid`, `paymentGid`, timestamps. Upsert only. Settings values live in metafields.

`WebhookDelivery`: id, shop, eventId, topic, status, failureReason, timestamps. `@@unique([shop, eventId])`.

No customer name, email, phone, or address columns. No order-audit model.

## Billing

- Plan handle constant: one monthly plan.
- Amount: **$29 USD**.
- Interval: `BillingInterval.Every30Days`.
- Trial: **7 days**.
- `isTest` when `NODE_ENV !== "production"`.
- Shared `requireAppSubscription`. Non-production public-distribution errors bypass with a warning banner. Production rethrows.
- `distribution: AppDistribution.AppStore`.
- Do not call `billing.request` unless `ENFORCE_BILLING=1` or production.
- Authenticate and bill only in the leaf route. The layout loader returns the API key only.

Partner Dashboard before a real charge: Distribution = Public. Protected customer data is not required for the v1 scope set.

## Admin page

Single route `app/routes/app._index.tsx` (or the React Router equivalent):

- Form: customer tag (default `wholesale`), discount percent (`0` off), minimum order (`0` off), allowed payment method name (blank off), save button.
- Loader reads the app installation metafield and falls back to defaults.
- Action validates, calls `metafieldsSet`, syncs the two owners, checks `userErrors`, upserts GIDs.
- Banner when dev billing is bypassed.
- Sync log, or an empty state if the merchant has never saved.
- Support control: `mailto:support@wholesale.suneuron.com`, label WholesaleNeuron support.
- Route `ErrorBoundary` with a critical banner.

Server-side validation:

- Tag: required, 1–40 chars, letters, numbers, spaces, hyphens, underscores. No commas.
- Percent: integer 0–100. `0` disables the discount.
- MOV: number ≥ 0, at most 2 decimal places. `0` disables the minimum.
- Payment method name: optional, trimmed, at most 100 characters. Blank disables the hide. Match ignores capitalization.

## Build slices (test first)

Each slice: failing test → minimum code → full `npm test` green → handover with a manual script. No slice is done with a failing suite.

| Slice | Deliver | Automated coverage |
| --- | --- | --- |
| 0. Scaffold and compliance | React Router template, `application_url = "https://localhost"`, concrete `shopify.web.toml`, scopes, three privacy webhooks + uninstall, Vitest, billing helper ($29 / 7 days) with dev bypass, empty settings page, error boundary | Plan constants, public-distribution error detection, bypass only outside production, webhook idempotency, redact/uninstall, `admin: null` path |
| 1. Settings | Form, defaults, `metafieldsSet`, `userErrors`, validation | Parse/validate settings; action writes JSON and surfaces userErrors; loader defaults |
| 2. Function owners | Idempotent create/update of discount and validation; write owner metafields + tag input variable; store GIDs | Duplicate save does not create a second discount; userErrors fail the sync |
| 3. Pricing engine | Discount function, pure decision module | Tagged customer gets the percent on each line; untagged, guest, empty metafield, and bad JSON return no discounts; combinesWith matches the locked stacking rule |
| 4. Guardrail | Validation function, pure decision module | Below post-discount subtotal at checkout steps blocks with the exact message; at or above passes; cart interaction passes; untagged and MOV 0 pass |
| 5. Handover | Manual script for the dev store | Full suite green before the script is handed over |

Function logic is extracted as pure TypeScript so Vitest does not need the WASM runtime.

## Manual proof (after the suite is green)

CLI `webhook trigger` only proves the route returns 200. Checkout proof is a logged-in tagged customer on the dev store. A guest checkout of the same cart stays full price, with no MOV error.

## Functionality breakdown

Checked against the code on 2026-10-02. Automated column is `npm test` (59 passed). Manual column is the dev store `suneuron-dev-wholesale`.

| Function | Implemented behavior | Automated | Manual |
| --- | --- | --- | --- |
| Settings form | Tag, discount, minimum, and payment-method name. Save writes the app-installation metafield and syncs the three function owners. Sync lines show `SUCCESS` or `FAILED`. | Yes. Defaults, validation, metafield write, `userErrors`. | Yes. Saves and three `SUCCESS` lines seen during checkout proof. |
| Customer tag | Form default `wholesale`. Any valid tag works. Trimmed. Capitalization ignored: every case form for tags of 6 letters or fewer, and the saved, lower, upper, and title forms for longer tags. Guests and other customers are unchanged. | Yes. `VIP` / `vip` lookup values. Discount, minimum, and payment decisions for a non-wholesale tag. | Yes. Settings `vip`, customer tagged `VIP`. Guest stayed retail. |
| Discount | Logged-in tagged customer gets the percent off every line. Message `20% off`. `0`, missing, or bad JSON returns no discount. Does not stack with other product or order discounts. Shipping discounts may still apply. | Yes. Line discounts, `0` and missing return empty operations, `combinesWith` on create. | Yes. $24.95 became $19.96 at 20%. `0` left the full price. |
| Minimum order | Blocks checkout when the post-discount merchandise subtotal is strictly below the minimum. Message `Wholesale orders require a minimum spend of $[amount].` `0` or missing does not block. Add to cart is not blocked. **Pay now** can stay enabled; the order does not complete. | Yes. Below, at, above, cart step, untagged, and `0`. | Yes. One $19.96 item blocked at $30. Two items ($39.92) were not blocked. |
| Payment hide | Tagged buyer: hide every method that does not match the saved name, after trim and ignoring capitalization. Blank or whitespace hides nothing. The app does not create the method. If the name matches nothing, every method the platform allows is hidden. | Yes. Case and spaces, blank name, no match hides all, guest hides none. | Yes. Saved `bank deposit` hid `Cash` and left **Bank Deposit**. |
| Credit card on this store | The function sends a hide for the test card (`(for testing) Bogus Gateway`). Shopify does not apply it on a non-Plus store in the US or Canada, so **Credit card** stays. | The hide operation is covered. The platform exception is not a unit test. | Yes. Tagged checkout still showed **Credit card** beside **Bank Deposit**. Function log showed the hide was sent. |
| Billing | $29 USD / 30 days, 7-day trial. Plan name **Essential B2B Plan**. Dev bypass with a warning banner. No charge unless production or `ENFORCE_BILLING=1`. Loader and settings action both call `requireAppSubscription`. | Yes. Plan constants, action gate, and dev-only bypass. | Banner seen 2026-09-29. Test charge approval confirmed 2026-10-06 with `ENFORCE_BILLING=1`. |
| Privacy and uninstall | Uninstall clears the session and marks the shop uninstalled. The three privacy topics return 200 and store no customer PII. Public `/privacy` route documents GDPR/CCPA, webhooks, rights, and subprocessors (Supabase / AWS / Vercel / Shopify). Legal entity **SUNEURON PTE. LTD.** | Yes. Idempotency, redact, uninstall, `admin: null`. | Uninstall confirmed 2026-09-29. Privacy page live in app 2026-10-06. |
| Support | `mailto:support@wholesale.suneuron.com` plus in-app Privacy policy link | No | Support + privacy links seen 2026-10-06 |
| Quick Setup Guide | Merchant-friendly 3-step guide on the dashboard (Polaris web components) | No | Seen 2026-10-06 |

## Not in this version

| Item | State |
| --- | --- |
| Create a payment method or Net terms | Not built. The merchant creates the method. Plus-only Net terms stay out. |
| Hide the credit card on a non-Plus US or Canada store | Not possible on the platform. Needs Plus, or a non-Plus store outside the US and Canada, to see the card disappear. |
| Markets / presentment currency | Out. Amounts use shop currency. The minimum message always uses `$`. |
| Order history | Out. The page logs the latest settings sync only. |
| App icon at 1200×1200 | Not exported. Current file is 1024×1024. |
| Production hosting and a real $29 charge | Code ready. Vercel deploy + live URLs + production charge still open. |

## Open items

1. Export the app icon to 1200×1200 before a listing upload.
2. Push `main` to GitHub (remote not configured yet).
3. Deploy to Vercel; set `NODE_ENV=production` and other env vars in the Vercel dashboard.
4. ~~Update `shopify.app.toml` `application_url` and OAuth `redirect_urls` to the live Vercel domain~~ Done: `https://wholesale-neuron.vercel.app`. Mirror the same URLs in Partner Dashboard / `shopify app deploy` / Vercel `SHOPIFY_APP_URL`.
5. Run a real $29 charge outside development (`isTest: false` in production).

## Progress

| Item | State |
| --- | --- |
| Spec read | Done |
| Plan written | Done |
| Six product decisions | Locked 2026-09-28 |
| Brand name | WholesaleNeuron |
| Support contact | support@wholesale.suneuron.com |
| Logo | `brand/wholesale-neuron-mark.png` only. Wordmark lockup removed 2026-09-28. |
| Dev store | Linked: `suneuron-dev-wholesale.myshopify.com`. Scopes, embedded page, and live uninstall confirmed 2026-09-29 |
| Partner app | Created. Name **WholesaleNeuron**. Org **SUNEURON PTE. LTD.** (`236696948`). Client ID `887f5834812eeebb06938e6c3f5de5a2`. Dashboard: https://dev.shopify.com/dashboard/236696948 |
| Distribution | Public, set by the user 2026-09-29. Billing API is allowed on this client ID |
| Scaffold | React Router template. `application_url` is `https://wholesale-neuron.vercel.app`. Scopes are `write_discounts`, `write_validations`, `write_payment_customizations`. Demo product scopes and metaobjects removed |
| Vercel production | URL live: `https://wholesale-neuron.vercel.app`. `vercelPreset()` added 2026-10-09 after the build warning |
| Git author | `suneuron-labs` / `sunil.suneuron@gmail.com` as of the 2026-10-09 root commit |
| Slice 0 | Done 2026-09-29. Billing helper $29 / 7 days, privacy webhooks, uninstall, empty settings page, route error boundary. Uninstall confirmed on the store |
| Slice 1 | Done 2026-09-29. Form, validation, app-installation `metafieldsSet`, `userErrors`. User confirmed **Settings saved** on `suneuron-dev-wholesale` |
| Slice 2 | Done 2026-09-29. Idempotent discount, validation, and payment owners. Later saves update the same three records |
| Slices 3–5 | Done 2026-10-02. Optional discount, minimum, and payment-method hide. First-pass guest and tagged checkout confirmed on the dev store |
| Supabase | Done 2026-10-06. Postgres via `DATABASE_URL` / `DIRECT_URL` |
| Billing plan rename | Done 2026-10-06. **Essential B2B Plan**; test charge verified |
| App Store compliance UI | Done 2026-10-06. `/privacy`, Quick Setup Guide, privacy link, action billing gate, `.env.example`, webhook API `2026-07` |
| Security audit | Done 2026-10-06. Criticals fixed. Full suite: 67 passed |
| Create Net terms | Deferred. Hide-by-name is implemented. Creating the method or Net terms is not |
| GitHub remote | Done — https://github.com/suneuron-labs/wholesale-neuron |