import { Link } from "react-router";

import { BLOG_GUIDE_PATH } from "./SiteHeader";
import styles from "./site-chrome.module.css";

type SiteFooterProps = {
  /** Extra bottom padding when a sticky CTA sits above the footer */
  compactBottom?: boolean;
};

export function SiteFooter({ compactBottom = false }: SiteFooterProps) {
  return (
    <footer
      className={styles.footer}
      style={compactBottom ? { paddingBottom: "5.5rem" } : undefined}
    >
      <div className={styles.footerBrand}>
        <img
          className={styles.footerLogo}
          src="/suneuron-logo.png"
          alt="Suneuron Logo"
        />
        <p className={styles.footerBrandCopy}>© 2026 SUNEURON PTE. LTD.</p>
        <p className={styles.footerDisclaimer}>
          WholesaleNeuron is an independent application and is not affiliated
          with, endorsed by, or sponsored by Shopify Inc. &quot;Shopify&quot; and
          &quot;Shopify Plus&quot; are trademarks of Shopify Inc.
        </p>
      </div>

      <div className={`${styles.footerColumn} ${styles.footerResources}`}>
        <p className={styles.footerColumnTitle}>Resources</p>
        <Link to={BLOG_GUIDE_PATH}>WholesaleNeuron Guide</Link>
        <Link to="/privacy">Privacy Policy</Link>
      </div>

      <div className={`${styles.footerColumn} ${styles.footerSupport}`}>
        <p className={styles.footerColumnTitle}>Support</p>
        <a href="mailto:support@wholesale.suneuron.com">
          support@wholesale.suneuron.com
        </a>
      </div>
    </footer>
  );
}
