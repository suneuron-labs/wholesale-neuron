import { useState } from "react";
import { Link } from "react-router";

import {
  primaryCtaHref,
  primaryCtaIsExternal,
  primaryCtaLabel,
} from "./cta";
import styles from "./site-chrome.module.css";

export const BLOG_GUIDE_PATH =
  "/blog/how-to-set-up-shopify-wholesale-without-shopify-plus";

type SiteHeaderProps = {
  active?: "home" | "blog" | "privacy";
  showInstallCta?: boolean;
};

export function SiteHeader({
  active,
  showInstallCta = true,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = (
    <>
      <Link
        to={BLOG_GUIDE_PATH}
        className={`${styles.navLink} ${active === "blog" ? styles.navLinkActive : ""}`}
        onClick={() => setMenuOpen(false)}
      >
        Guides
      </Link>
      <Link
        to="/privacy"
        className={`${styles.navLink} ${active === "privacy" ? styles.navLinkActive : ""}`}
        onClick={() => setMenuOpen(false)}
      >
        Privacy
      </Link>
      {showInstallCta ? (
        <a
          className={styles.headerCta}
          href={primaryCtaHref}
          {...(primaryCtaIsExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          onClick={() => setMenuOpen(false)}
        >
          {primaryCtaLabel}
        </a>
      ) : null}
    </>
  );

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link
          to="/"
          className={styles.brandLink}
          aria-label="WholesaleNeuron home"
        >
          <span className={styles.logoWholesale}>Wholesale</span>
          <span className={styles.logoNeuron}>Neuron</span>
        </Link>

        <nav className={`${styles.nav} ${styles.desktopNav}`} aria-label="Primary">
          {navLinks}
        </nav>

        <button
          type="button"
          className={styles.menuToggle}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {menuOpen ? (
              <>
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      <nav
        id="mobile-nav"
        className={menuOpen ? styles.mobileNavOpen : styles.mobileNav}
        aria-label="Mobile"
        hidden={!menuOpen}
      >
        {navLinks}
      </nav>
    </header>
  );
}
