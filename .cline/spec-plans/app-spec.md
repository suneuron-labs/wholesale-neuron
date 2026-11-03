# Product Specification: Native Wholesale & B2B Toolkit (For Standard Plans)

## 1. App Overview & Business Context
We are building a native Shopify B2B application tailored for standard merchant plans ($39 or $105/month). This app bypasses the expensive Shopify Plus ($2,300+/mo) paywall by providing enterprise-grade wholesale features using the new **Shopify Functions** architecture.

**The Problem with Legacy Apps:**
Older B2B apps rely on destructive hacks because they lack deep checkout access:
- **Duplicate Variant Hack:** They secretly create hidden duplicate products (e.g., "T-Shirt - WHOLESALE - $10"). This breaks inventory tracking, accounting sync, and SEO.

- **Draft Order Hack:** They intercept the checkout and create "Draft Orders," which breaks automatic shipping calculations and post-purchase upsells.

**Our Native Solution:**
This app will NEVER use draft orders or duplicate variants. It uses Shopify Functions to safely manipulate the checkout directly when a customer logs in with a specific tag (e.g., `wholesale`):
1. **The Pricing Engine:** Dynamically reduces the price of the *original* product in the cart.
2. **The Guardrail:** Enforces a Minimum Order Value (MOV) and natively blocks checkout if the cart is too small.
3. **The Payment Filter:** Hides standard credit card gateways (saving the merchant heavy processing fees) and only reveals manual payment terms like "Net 30 / Invoice".

---

## 2. Core Architecture & Tech Stack
- **Framework:** Shopify CLI + React Router / Remix App Template.
- **Frontend / Admin UI:** React, Polaris v12 components, and Tailwind CSS for custom utility styling.
- **Backend / Database:** Prisma with Neon Postgres (`DATABASE_URL` / `DIRECT_URL`) for session and install tracking.
- **Validation & Business Logic:** Shopify Functions (TypeScript API) executed natively in the WebAssembly checkout pipeline.
- **Data State:** Merchant configuration (target tag, discount %, MOV amount, payment toggle) MUST be saved as a stringified JSON object to `appInstallation` Metafields. The stateless Functions read these metafields at checkout.

---

## 3. Implementation Phases for Cursor

### Phase 1: The Admin Dashboard & Metafield Setup
Build a single-page settings interface (`app/routes/app._index.tsx`).
1. **UI Components (Polaris + Tailwind CSS):** 
   - A `<Card>` containing the primary configuration form.
   - `<TextField>` for the Target Customer Tag (default: `wholesale`).
   - `<TextField>` (numeric) for the Wholesale Discount Percentage (e.g., `20`).
   - `<TextField>` (numeric) for the Minimum Order Value (e.g., `500`).
   - `<Checkbox>` to "Hide Credit Cards & Enforce Net-30 Terms".
   - A sticky save `<Button>` using the framework's native `<Form>`.
2. **Data Fetching (Loader):** Query the `AppInstallation` metafield (namespace: `b2b_toolkit`, key: `settings`) to load the current saved state.
3. **Data Saving (Action):** Use the `metafieldsSet` GraphQL mutation to save the configuration form data as a stringified JSON object to the `AppInstallation` owner.

### Phase 2: Product Discount Function (The Pricing Engine)
Generate the extension: `npm run shopify app generate extension` -> `Product discount` -> `TypeScript`.
1. **Input Definition (`run.graphql`):**
   - Query `cart.buyerIdentity.customer.hasAnyTag` (passing the tag dynamically from the metafield).
   - Query `cart.lines` and their underlying `merchandise.price`.
   - Query the `appInstallation` metafield to parse the discount percentage.
2. **Logic (`run.ts`):**
   - If the metafield is empty, or if the customer lacks the required tag, return `{ discounts: [] }`.
   - If the tag matches, map over `cart.lines` and apply a `percentage` value discount based on the metafield configuration.

### Phase 3: Cart Validation Function (The Guardrail)
Generate the extension: `npm run shopify app generate extension` -> `Cart and checkout validation` -> `TypeScript`.
1. **Input Definition (`run.graphql`):**
   - Query `cart.buyerIdentity.customer.hasAnyTag`.
   - Query `cart.cost.totalAmount`.
   - Query the `appInstallation` metafield for the MOV value.
2. **Logic (`run.ts`):**
   - If the customer lacks the tag, or MOV is not configured, return `{ errors: [] }`.
   - If the total amount is strictly less than the MOV value, return an error blocking the checkout.
   - *Error Message Format:* `"Wholesale orders require a minimum spend of $[MOV_AMOUNT]."`

### Phase 4: Payment Customization Function (The B2B Terms)
Generate the extension: `npm run shopify app generate extension` -> `Payment customization` -> `TypeScript`.
1. **Input Definition (`run.graphql`):**
   - Query `cart.buyerIdentity.customer.hasAnyTag`.
   - Query `paymentCustomization.metafield` (or `appInstallation.metafield`) to check if the payment restriction toggle is enabled.
   - Query `paymentMethods`.
2. **Logic (`run.ts`):**
   - If the toggle is false or the customer lacks the tag, return `{ operations: [] }`.
   - If true, iterate through `paymentMethods`. If a method is a standard Credit Card gateway (e.g., Shopify Payments, PayPal), push a `hide` operation. 

---

## 4. Strict Development Guardrails
- **No Draft Orders or Duplicate Variants:** Do NOT use the Admin REST or GraphQL APIs to create draft orders or duplicate products to circumvent checkout. All logic must occur via the native Shopify Functions listed above.
- **Fail-Open Architecture:** If any function crashes, throws an exception, or encounters missing metafield data, it must return an empty array (e.g., `{ errors: [] }` or `{ operations: [] }`) to ensure standard retail checkouts are never accidentally frozen.
- **Tailwind Setup:** Ensure `tailwind.config.js` is properly initialized to wrap Polaris components without breaking standard Shopify App Bridge iframe styles.