import type { MetaFunction } from "react-router";

import { SiteFooter } from "../components/marketing/SiteFooter";
import { SiteHeader } from "../components/marketing/SiteHeader";
import { usePageSeo } from "../components/marketing/usePageSeo";

const PAGE_TITLE = "Privacy Policy | WholesaleNeuron";
const PAGE_DESCRIPTION =
  "Privacy policy and data handling practices for the WholesaleNeuron Shopify application.";

export const meta: MetaFunction = () => {
  return [
    { title: PAGE_TITLE },
    { name: "description", content: PAGE_DESCRIPTION },
  ];
};

const styles = {
  page: {
    margin: 0,
    minHeight: "100vh",
    display: "flex" as const,
    flexDirection: "column" as const,
    background: "#f8fafc",
    color: "#0f172a",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    lineHeight: 1.6,
  },
  main: {
    boxSizing: "border-box" as const,
    maxWidth: "800px",
    width: "100%",
    margin: "0 auto",
    padding: "48px 24px 48px",
    flex: 1,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "32px",
  },
  title: {
    margin: "0 0 8px",
    fontSize: "2rem",
    lineHeight: 1.25,
    fontWeight: 700,
  },
  updated: {
    margin: "0 0 28px",
    color: "#64748b",
    fontSize: "0.95rem",
  },
  heading: {
    margin: "28px 0 12px",
    fontSize: "1.25rem",
    lineHeight: 1.35,
    fontWeight: 650,
  },
  paragraph: {
    margin: "0 0 12px",
    fontSize: "1rem",
  },
  list: {
    margin: "0 0 12px",
    paddingLeft: "1.25rem",
  },
  listItem: {
    marginBottom: "8px",
  },
  link: {
    color: "#fc5739",
  },
};

export default function PrivacyPolicy() {
  usePageSeo(PAGE_TITLE, PAGE_DESCRIPTION);

  return (
    <div style={styles.page}>
      <SiteHeader active="privacy" />
      <main style={styles.main}>
        <article style={styles.card}>
          <h1 style={styles.title}>Privacy Policy</h1>
          <p style={styles.updated}>
            WholesaleNeuron · Last updated October 19, 2026
          </p>

          <h2 style={styles.heading}>Overview</h2>
          <p style={styles.paragraph}>
            WholesaleNeuron (“we”, “our”, or “the app”) is a Shopify embedded app
            operated by SUNEURON PTE. LTD., a company incorporated in Singapore.
            WholesaleNeuron helps merchants configure wholesale checkout rules
            for tagged customers. We design our products and data practices to
            comply with applicable global privacy standards, including the
            General Data Protection Regulation (GDPR) and the California Consumer
            Privacy Act (CCPA), as well as Shopify’s App Store privacy
            requirements.
          </p>

          <h2 style={styles.heading}>Data Collected &amp; Stored</h2>
          <p style={styles.paragraph}>
            When a merchant installs WholesaleNeuron, we store only the
            information required to operate the app securely:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>Shop domain:</strong> Identifies the merchant store that
              installed the app.
            </li>
            <li style={styles.listItem}>
              <strong>Access tokens / session records:</strong> Used for
              authenticated Admin API access and session management while the
              app remains installed.
            </li>
            <li style={styles.listItem}>
              <strong>Merchant rule configuration:</strong> Wholesale settings
              such as customer tags, discount percentage, minimum order amount,
              and allowed payment method name.
            </li>
            <li style={styles.listItem}>
              <strong>Operational logs:</strong> Records of webhook events
              (e.g., topic, delivery status, and timestamps) maintained for
              debugging and system reliability.
            </li>
          </ul>
          <p style={styles.paragraph}>
            WholesaleNeuron does not sell customer personal identifiable
            information (PII). We do not collect, process, or store shopper
            names, email addresses, shipping/billing addresses, phone numbers, or
            payment credentials in our external application database. Wholesale
            checkout behavior and tag checks are evaluated entirely inside
            Shopify’s native Functions runtime using merchant-configured rules.
          </p>

          <h2 style={styles.heading}>Subprocessors &amp; Cloud Infrastructure</h2>
          <p style={styles.paragraph}>
            Shop metadata, session tokens, and merchant configuration are stored
            and processed using the following cloud infrastructure and
            subprocessors:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>Supabase:</strong> Managed PostgreSQL database used to
              store shop domain records, access tokens / sessions, and merchant
              rule settings.
            </li>
            <li style={styles.listItem}>
              <strong>Amazon Web Services (AWS):</strong> Underlying cloud
              infrastructure hosting the Supabase database region used by
              WholesaleNeuron.
            </li>
            <li style={styles.listItem}>
              <strong>Vercel:</strong> Cloud application hosting for the
              WholesaleNeuron web service that serves the embedded admin UI,
              public pages, and webhook endpoints.
            </li>
            <li style={styles.listItem}>
              <strong>Shopify:</strong> Platform provider for merchant
              authentication, Admin API access, billing, and checkout Functions
              execution.
            </li>
          </ul>
          <p style={styles.paragraph}>
            These providers process data only as needed to operate and secure the
            app. We do not sell or rent merchant or customer data to third
            parties.
          </p>

          <h2 style={styles.heading}>Mandatory Shopify Privacy Webhooks</h2>
          <p style={styles.paragraph}>
            We implement Shopify’s mandatory compliance webhooks as follows:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>customers/data_request:</strong> We acknowledge the
              request and return successfully. WholesaleNeuron does not retain
              customer PII, so there is no customer personal data to disclose
              from our systems.
            </li>
            <li style={styles.listItem}>
              <strong>customers/redact:</strong> We acknowledge the request and
              return successfully. Because we do not store customer PII, there
              is no customer personal data to delete from our systems.
            </li>
            <li style={styles.listItem}>
              <strong>shop/redact:</strong> Shopify sends this webhook
              approximately 48 hours after a merchant uninstalls the app. When
              received, we permanently delete that shop’s records from our
              database, including app settings, session tokens, and associated
              delivery logs.
            </li>
          </ul>

          <h2 style={styles.heading}>Merchant &amp; Subject Rights (GDPR / CCPA)</h2>
          <p style={styles.paragraph}>
            Merchants and individuals may request access to, correction of, or
            deletion of personal information we hold about them, subject to
            applicable law (including GDPR and CCPA). To exercise these rights,
            email{" "}
            <a style={styles.link} href="mailto:support@wholesale.suneuron.com">
              support@wholesale.suneuron.com
            </a>{" "}
            with enough detail for us to verify the request and identify the
            relevant shop or record. We will respond within the timeframe
            required by applicable law. Where Shopify privacy webhooks apply, we
            also fulfill those automated obligations as described above.
          </p>

          <h2 style={styles.heading}>Security</h2>
          <p style={styles.paragraph}>
            Data in transit is protected using TLS/SSL encryption. Application
            data at rest is stored in a secured cloud database with access
            restricted to the services that operate WholesaleNeuron. We rely on
            Shopify’s authentication model for embedded admin sessions and revoke
            store access when the app is uninstalled.
          </p>

          <h2 style={styles.heading}>Contact Information</h2>
          <p style={styles.paragraph}>
            WholesaleNeuron is operated by SUNEURON PTE. LTD. For privacy
            questions, data requests, or support related to WholesaleNeuron,
            please contact{" "}
            <a style={styles.link} href="mailto:support@wholesale.suneuron.com">
              support@wholesale.suneuron.com
            </a>
            . You may also reach us through the support channel listed on our
            Shopify App Store listing page.
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
