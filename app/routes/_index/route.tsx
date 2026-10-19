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
          Automatic wholesale discounts, minimum order amounts, and payment
          method restrictions for your tagged B2B customers.
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
                {errors?.shop ?? "e.g., your-store.myshopify.com"}
              </span>
            </div>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong className={styles.featureTitle}>
              Tag-Based B2B Discounts
            </strong>
            <span className={styles.featureDesc}>
              Automatically apply your configured percentage discount to tagged
              wholesale buyers directly in the cart and checkout.
            </span>
          </li>
          <li>
            <strong className={styles.featureTitle}>
              Minimum Order Amount
            </strong>
            <span className={styles.featureDesc}>
              Enforce a required minimum order amount, preventing tagged
              wholesale customers from checking out until the requirement is
              met.
            </span>
          </li>
          <li>
            <strong className={styles.featureTitle}>
              Restrict Payment Methods
            </strong>
            <span className={styles.featureDesc}>
              Hide standard retail payment gateways at checkout so wholesale
              buyers only see the specific B2B payment method you configure.
            </span>
          </li>
        </ul>
      </div>
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <img
            className={styles.footerLogo}
            src="/suneuron-logo.png"
            alt="Suneuron Logo"
          />
          <span>© 2026 SUNEURON PTE. LTD.</span>
        </div>
        <div className={styles.footerLinks}>
          <a href="mailto:support@wholesale.suneuron.com">
            support@wholesale.suneuron.com
          </a>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
