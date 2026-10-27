import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { redirect, Form, useActionData, useLoaderData } from "react-router";

import { USE_TEMP_EARLY_ACCESS_CTA } from "../../components/marketing/cta";
import { SiteFooter } from "../../components/marketing/SiteFooter";
import { SiteHeader } from "../../components/marketing/SiteHeader";
import { usePageSeo } from "../../components/marketing/usePageSeo";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

import styles from "./styles.module.css";

const PAGE_TITLE =
  "WholesaleNeuron | Shopify B2B & Multi-Tier Wholesale App";
const PAGE_DESCRIPTION =
  "Set up Shopify B2B in less than a minute without the Plus upgrade. Automate wholesale checkout with tags and bypass native 3-tier limits with our upcoming unlimited tiers Pro plan.";

export const meta: MetaFunction = () => {
  return [
    { title: PAGE_TITLE },
    { name: "description", content: PAGE_DESCRIPTION },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return { errors };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const errors = actionData?.errors;

  usePageSeo(PAGE_TITLE, PAGE_DESCRIPTION);

  return (
    <div className={styles.index}>
      <SiteHeader active="home" />

      <div className={styles.content}>
        <h1 className={styles.heading}>
          <span className={styles.logoWholesale}>Wholesale</span>
          <span className={styles.logoNeuron}>Neuron</span>
        </h1>
        <p className={styles.text}>
          Shopify&apos;s native B2B forces you to waste hours building complex
          Company Profiles, assigning Locations, and managing catalogs just to
          set up basic wholesale rules. WholesaleNeuron is the zero-friction
          alternative: just add a tag to any standard customer account to
          instantly automate B2B discounts, minimums, and payment methods.
        </p>
        {showForm && (
          <Form
            className={`${styles.form} ${USE_TEMP_EARLY_ACCESS_CTA ? styles.formDisabled : ""}`}
            method="post"
            onSubmit={(event) => {
              if (USE_TEMP_EARLY_ACCESS_CTA) {
                event.preventDefault();
              }
            }}
          >
            <div className={styles.field}>
              <label className={styles.label} htmlFor="shop">
                Shop domain
              </label>
              <div className={styles.controls}>
                <input
                  id="shop"
                  className={styles.input}
                  type="text"
                  name="shop"
                  disabled={USE_TEMP_EARLY_ACCESS_CTA}
                  aria-disabled={USE_TEMP_EARLY_ACCESS_CTA}
                />
                <button
                  className={styles.button}
                  type="submit"
                  disabled={USE_TEMP_EARLY_ACCESS_CTA}
                  aria-disabled={USE_TEMP_EARLY_ACCESS_CTA}
                >
                  Log in / Install
                </button>
              </div>
              <span className={styles.hint}>
                {USE_TEMP_EARLY_ACCESS_CTA
                  ? "Install is paused — use Request Early Access above."
                  : (errors?.shop ?? "e.g., your-store.myshopify.com")}
              </span>
            </div>
          </Form>
        )}
        <p className={styles.planNote}>
          Note: The current Standard plan ($29/mo) supports one global wholesale
          tier. Unlimited multi-tier PRO plan coming soon!
        </p>
        <div className={styles.planSections}>
          <section className={styles.planSection} aria-labelledby="standard-plan-heading">
            <div className={styles.planSectionHeader}>
              <h2 id="standard-plan-heading" className={styles.standardPlanLabel}>
                Standard Plan: Single-Tier
              </h2>
              <span className={styles.liveBadge}>Live</span>
            </div>
            <ul className={styles.standardGrid}>
              <li className={styles.featureCard}>
                <h3 className={styles.featureTitle}>B2B Discount</h3>
                <span className={styles.featureDesc}>
                  Apply a{" "}
                  <strong className={styles.featureStrong}>
                    store-wide percentage discount
                  </strong>{" "}
                  to your tagged wholesale buyers{" "}
                  <strong className={styles.featureStrong}>
                    instantly at checkout
                  </strong>
                  .
                </span>
              </li>
              <li className={styles.featureCard}>
                <h3 className={styles.featureTitle}>B2B Minimum Order</h3>
                <span className={styles.featureDesc}>
                  Enforce a{" "}
                  <strong className={styles.featureStrong}>
                    single minimum order amount
                  </strong>
                  , preventing tagged buyers from checking out below your
                  required threshold.
                </span>
              </li>
              <li className={styles.featureCard}>
                <h3 className={styles.featureTitle}>B2B Approved Payments</h3>
                <span className={styles.featureDesc}>
                  <strong className={styles.featureStrong}>
                    Hide standard retail payment gateways
                  </strong>{" "}
                  and only show your{" "}
                  <strong className={styles.featureStrong}>
                    approved B2B method
                  </strong>{" "}
                  (e.g., Net-30, Bank Wire) for tagged buyers.
                </span>
              </li>
            </ul>
          </section>

          <section className={styles.planSection} aria-labelledby="pro-plan-heading">
            <div className={styles.planSectionHeader}>
              <h2 id="pro-plan-heading" className={styles.proPlanLabel}>
                Pro Plan: Multi-Tier
              </h2>
              <span className={styles.comingSoonBadge}>Coming Soon</span>
            </div>
            <div className={styles.proCard}>
              <h3 className={styles.proTitle}>PRO: Unlimited Tiers</h3>
              <span className={styles.proDesc}>
                Shopify standard caps you at 3 catalogs, forcing a{" "}
                <strong className={styles.proStrong}>
                  $2,500/mo Plus upgrade
                </strong>{" "}
                to add more. Pro gives you infinite flexibility to{" "}
                <strong className={styles.proStrong}>
                  create as many tiers as you like
                </strong>
                , there is no limit. Assign custom deals to a single VIP or
                100+ buyers using simple tags—bypassing the Plus paywall
                entirely.
              </span>
            </div>
          </section>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
