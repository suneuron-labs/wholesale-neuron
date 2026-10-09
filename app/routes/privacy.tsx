import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policy | WholesaleNeuron" },
    {
      name: "description",
      content:
        "WholesaleNeuron privacy policy covering GDPR and CCPA compliance, data retention, Shopify privacy webhooks, and merchant support contact.",
    },
  ];
};

const styles = {
  page: {
    margin: 0,
    minHeight: "100vh",
    background: "#f6f6f7",
    color: "#202223",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    lineHeight: 1.6,
  },
  main: {
    boxSizing: "border-box" as const,
    maxWidth: "800px",
    margin: "0 auto",
    padding: "48px 24px 72px",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e1e3e5",
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
    color: "#6d7175",
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
    color: "#2c6ecb",
  },
};

export default function PrivacyPolicy() {
  return (
    <div style={styles.page}>
      <main style={styles.main}>
        <article style={styles.card}>
          <h1 style={styles.title}>Privacy Policy</h1>
          <p style={styles.updated}>WholesaleNeuron · Last updated October 6, 2026</p>

          <h2 style={styles.heading}>Overview</h2>
          <p style={styles.paragraph}>
            WholesaleNeuron (“we”, “our”, or “the app”) is a Shopify embedded app
            operated by <strong>SUNEURON PTE. LTD.</strong> WholesaleNeuron helps
            merchants configure wholesale checkout rules for tagged customers. We
            design our products and data practices to comply with applicable global
            privacy standards, including the General Data Protection Regulation
            (GDPR) and the California Consumer Privacy Act (CCPA), as well as
            Shopify’s App Store privacy requirements.
          </p>

          <h2 style={styles.heading}>Data Collected &amp; Stored</h2>
          <p style={styles.paragraph}>
            When a merchant installs WholesaleNeuron, we store only the
            information required to operate the app securely:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>Shop domain</strong> — identifies the merchant store that
              installed the app.
            </li>
            <li style={styles.listItem}>
              <strong>Access tokens / session records</strong> — used for
              authenticated Admin API access and session management while the
              app remains installed.
            </li>
            <li style={styles.listItem}>
              <strong>Merchant rule configuration</strong> — wholesale settings
              such as customer tags, discount percent, minimum order value, and
              allowed payment method name.
            </li>
          </ul>
          <p style={styles.paragraph}>
            WholesaleNeuron does <strong>not</strong> sell customer personal
            identifiable information (PII). We do not store shopper names,
            emails, addresses, phone numbers, or payment credentials in our
            external application database. Checkout behavior is evaluated inside
            Shopify’s Functions runtime using merchant-configured rules.
          </p>

          <h2 style={styles.heading}>Subprocessors &amp; Cloud Infrastructure</h2>
          <p style={styles.paragraph}>
            Shop metadata, session tokens, and merchant configuration are stored
            and processed using the following cloud infrastructure and
            subprocessors:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <strong>Supabase</strong> — managed PostgreSQL database used to
              store shop domain records, access tokens / sessions, and merchant
              rule settings.
            </li>
            <li style={styles.listItem}>
              <strong>Amazon Web Services (AWS)</strong> — underlying cloud
              infrastructure that hosts the Supabase database region used by
              WholesaleNeuron.
            </li>
            <li style={styles.listItem}>
              <strong>Vercel</strong> — cloud application hosting for the
              WholesaleNeuron web service that serves the embedded admin UI,
              public privacy page, and webhook endpoints.
            </li>
            <li style={styles.listItem}>
              <strong>Shopify</strong> — platform provider for authentication,
              Admin API access, billing, and checkout Functions processing.
            </li>
          </ul>
          <p style={styles.paragraph}>
            These providers process data only as needed to operate and secure the
            app. We do not sell merchant or customer data to third parties.
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
              <strong>shop/redact:</strong> Shopify sends this webhook about 48
              hours after a merchant uninstalls the app. When we receive it, we
              completely delete that shop’s records from our database, including
              app settings, session tokens, and related delivery logs for the
              store.
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
            </a>
            {" "}
            with enough detail for us to verify the request and identify the
            relevant shop or record. We will respond within the timeframe
            required by applicable law. Where Shopify privacy webhooks apply, we
            also fulfill those automated obligations as described above.
          </p>

          <h2 style={styles.heading}>Security</h2>
          <p style={styles.paragraph}>
            Data in transit is protected with TLS/SSL. Application data at rest
            is stored in a secured cloud database with access limited to the
            services that operate WholesaleNeuron. We rely on Shopify’s
            authentication model for embedded admin sessions and revoke store
            access when the app is uninstalled.
          </p>

          <h2 style={styles.heading}>Contact Information</h2>
          <p style={styles.paragraph}>
            WholesaleNeuron is operated by <strong>SUNEURON PTE. LTD.</strong>{" "}
            For privacy questions or data requests related to WholesaleNeuron,
            contact{" "}
            <a style={styles.link} href="mailto:support@wholesale.suneuron.com">
              support@wholesale.suneuron.com
            </a>
            . You may also reach us through the support channel listed on the
            WholesaleNeuron Shopify App Store listing page.
          </p>
        </article>
      </main>
    </div>
  );
}
