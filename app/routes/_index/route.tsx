import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, Form, useActionData, useLoaderData } from "react-router";

import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

import styles from "./styles.module.css";

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

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>
          <span className={styles.logoWholesale}>Wholesale</span>
          <span className={styles.logoNeuron}>Neuron</span>
        </h1>
        <p className={styles.text}>
          B2B wholesale pricing, tiered discounts, and checkout rules for your
          tagged customers.
        </p>
        {showForm && (
          <Form className={styles.form} method="post">
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
                />
                <button className={styles.button} type="submit">
                  Log in / Install
                </button>
              </div>
              <span className={styles.hint}>
                {errors?.shop ?? "e.g: my-shop-domain.myshopify.com"}
              </span>
            </div>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong className={styles.featureTitle}>
              Tiered Wholesale Pricing
            </strong>
            <span className={styles.featureDesc}>
              Automatically apply customized percentage discounts to tagged
              buyers directly within Shopify checkout.
            </span>
          </li>
          <li>
            <strong className={styles.featureTitle}>
              Minimum Order Validation
            </strong>
            <span className={styles.featureDesc}>
              Enforce custom order minimums and quantities before wholesale
              customers can proceed to checkout.
            </span>
          </li>
          <li>
            <strong className={styles.featureTitle}>
              Native Checkout Integration
            </strong>
            <span className={styles.featureDesc}>
              Built securely on Shopify Functions for ultra-fast, zero-flicker
              rule enforcement.
            </span>
          </li>
        </ul>
        <footer className={styles.footer}>
          <p>
            <a href="/privacy">Privacy Policy</a>
          </p>
          <img
            className={styles.footerLogo}
            src="/suneuron-logo.png"
            alt="Suneuron Logo"
          />
          <p>
            Support:{" "}
            <a href="mailto:support@wholesale.suneuron.com">
              support@wholesale.suneuron.com
            </a>
          </p>
          <p>© 2026 SUNEURON PTE. LTD.</p>
        </footer>
      </div>
    </div>
  );
}
