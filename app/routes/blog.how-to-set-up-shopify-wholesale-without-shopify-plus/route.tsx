import type { MetaFunction } from "react-router";

import { SiteFooter } from "../../components/marketing/SiteFooter";
import { SiteHeader } from "../../components/marketing/SiteHeader";
import { FaqAccordion, type FaqItem } from "./FaqAccordion";
import { ScreenshotFigure } from "./ScreenshotFigure";
import { SupportCallout } from "./SupportCallout";
import styles from "./styles.module.css";

const CANONICAL =
  "https://wholesale.suneuron.com/blog/how-to-set-up-shopify-wholesale-without-shopify-plus";
const TITLE =
  "How to Set Up a Shopify Wholesale Channel Without Shopify Plus (2026 Guide)";
const DESCRIPTION =
  "Automate B2B wholesale pricing, customer tag discounts, cart minimums, and custom payment methods on standard Shopify plans without Shopify Plus.";
const APP_URL = "https://apps.shopify.com/wholesaleneuron";
const DATE_PUBLISHED = "2026-10-20";
const DATE_MODIFIED = "2026-10-26";
const VIDEO_EMBED =
  "https://www.youtube-nocookie.com/embed/PLACEHOLDER_VIDEO_ID";

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Will retail or guest shoppers see wholesale notices or checkout blocks?",
    answer:
      "No. WholesaleNeuron only evaluates logged-in customers who carry your configured B2B tag (for example, B2B-VIP). Guest checkout and untagged retail buyers keep a normal Shopify experience—no wholesale messaging, no minimum-order errors, and no payment-method filtering.",
  },
  {
    question: "Do I need to edit my theme code or install Liquid scripts?",
    answer:
      "No theme surgery required. WholesaleNeuron runs on Shopify Functions and admin configuration, so your storefront theme stays untouched. That keeps upgrades safer and avoids fragile Liquid hacks that break on theme updates.",
  },
  {
    question: "Does this work on Shopify Basic, Shopify, and Advanced—or only Plus?",
    answer:
      "WholesaleNeuron is built for standard Shopify plans. You do not need Shopify Plus ($2,500/mo) to automate tag-based discounts, minimum order amounts, and B2B payment filtering for tagged wholesale customers.",
  },
  {
    question: "How is this different from discount codes or draft orders?",
    answer:
      "Discount codes leak when shared. Draft orders burn hours every week and break parts of the native checkout flow. WholesaleNeuron applies rules automatically at cart and checkout for tagged buyers only—no codes to police and no manual order drafting for every wholesale purchase.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: TITLE,
      description: DESCRIPTION,
      image: [
        "https://wholesale.suneuron.com/wholesale-neuron-feature-banner.png",
      ],
      datePublished: DATE_PUBLISHED,
      dateModified: DATE_MODIFIED,
      author: {
        "@type": "Person",
        name: "Sunil Singh",
      },
      publisher: {
        "@type": "Organization",
        name: "Suneuron",
        logo: {
          "@type": "ImageObject",
          url: "https://wholesale.suneuron.com/suneuron-logo.png",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": CANONICAL,
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

export const meta: MetaFunction = () => {
  return [
    { title: TITLE },
    { name: "description", content: DESCRIPTION },
    { tagName: "link", rel: "canonical", href: CANONICAL },
    { name: "robots", content: "index, follow" },
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: "WholesaleNeuron" },
    { property: "og:locale", content: "en_US" },
    { property: "og:url", content: CANONICAL },
    { property: "og:title", content: TITLE },
    { property: "og:description", content: DESCRIPTION },
    {
      property: "og:image",
      content:
        "https://wholesale.suneuron.com/wholesale-neuron-feature-banner.png",
    },
    { property: "article:published_time", content: DATE_PUBLISHED },
    { property: "article:modified_time", content: DATE_MODIFIED },
    { property: "article:author", content: "Sunil Singh" },
    { property: "article:section", content: "Shopify B2B" },
    {
      property: "article:tag",
      content: "Shopify wholesale, B2B pricing, Shopify Plus alternative",
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: TITLE },
    { name: "twitter:description", content: DESCRIPTION },
    {
      name: "twitter:image",
      content:
        "https://wholesale.suneuron.com/wholesale-neuron-feature-banner.png",
    },
  ];
};

export default function WholesaleSetupGuide() {
  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <SiteHeader active="blog" />

      <main className={styles.main}>
        <aside className={styles.banner} aria-label="Founding Merchant Program">
          <span className={styles.bannerBadge}>Founding Merchant Program</span>
          <h2 className={styles.bannerTitle}>
            Free Lifetime Access for Our First 10 Stores
          </h2>
          <p className={styles.bannerBody}>
            We are onboarding our first 10 stores with 100% Free Lifetime Access
            to WholesaleNeuron in exchange for onboarding feedback and feature
            requests. Install today and message us via in-app support to claim
            your spot.
          </p>
        </aside>

        <header className={styles.hero}>
          <span className={styles.category}>Shopify B2B Guide</span>
          <h1 className={styles.title}>
            How to Set Up a Shopify Wholesale Channel Without Shopify Plus
            (2026 Guide)
          </h1>
          <div className={styles.metaRow}>
            <span>By Sunil Singh</span>
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.updateBadge}>2026 Update</span>
            <span className={styles.dot} aria-hidden="true" />
            <span>6 min read</span>
          </div>
        </header>

        <section className={styles.section} aria-labelledby="problem-heading">
          <h2 id="problem-heading" className={styles.sectionTitle}>
            The problem: Plus pricing vs. broken workarounds
          </h2>
          <p className={styles.lead}>
            Shopify Plus unlocks native B2B tooling—at roughly{" "}
            <strong>$2,500 per month</strong>. For growing wholesale brands on
            Basic, Shopify, or Advanced, that is often a non-starter. So teams
            improvise. Those improvisations quietly tax margin and time.
          </p>
          <ul className={styles.problemList}>
            <li className={styles.problemItem}>
              <strong>Leaky discount codes</strong>
              <span>
                A “wholesale20” code shared once ends up in retailer Discord
                groups and TikTok comments. You lose control of who gets B2B
                pricing.
              </span>
            </li>
            <li className={styles.problemItem}>
              <strong>Draft orders eating ~10 hrs/week</strong>
              <span>
                Manual drafting for every wholesale cart burns admin time,
                delays buyers, and breaks the smooth checkout experience your
                retail channel already has.
              </span>
            </li>
            <li className={styles.problemItem}>
              <strong>Second “wholesale-only” store costs</strong>
              <span>
                Running a duplicate store means duplicate themes, inventory
                sync headaches, and another Shopify bill—without solving
                checkout automation on your main site.
              </span>
            </li>
          </ul>
          <p className={styles.paragraph}>
            In 2026, you can run a clean wholesale channel on a standard plan:
            tag B2B buyers, configure rules once, and let checkout enforce
            pricing, minimums, and payment methods automatically.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="solution-heading">
          <h2 id="solution-heading" className={styles.sectionTitle}>
            The step-by-step solution with WholesaleNeuron
          </h2>
          <p className={styles.paragraph}>
            Follow these five steps. No Shopify Plus, no theme code edits, and
            no discount codes to babysit.
          </p>

          <div className={styles.step}>
            <span className={styles.stepLabel}>Step 1</span>
            <h3 className={styles.stepTitle}>
              Tag wholesale customers (e.g. <span className={styles.code}>B2B-VIP</span>)
            </h3>
            <p className={styles.paragraph}>
              In Shopify Admin, open Customers and assign a consistent wholesale
              tag—commonly <span className={styles.code}>B2B-VIP</span> or{" "}
              <span className={styles.code}>wholesale</span>. WholesaleNeuron
              only activates for logged-in buyers who carry that tag.
            </p>
            <ScreenshotFigure
              src="/wholesalenueron-customer-tag.png"
              alt="Shopify Admin customer profile showing a B2B-VIP customer tag"
              caption="Assigning customer tags in standard Shopify Admin"
            />
          </div>

          <div className={styles.step}>
            <span className={styles.stepLabel}>Step 2</span>
            <h3 className={styles.stepTitle}>Configure B2B rules in WholesaleNeuron</h3>
            <p className={styles.paragraph}>
              Set your target customer tag, discount percentage (or tiers),
              minimum order amount, and the approved B2B payment method. Save
              once—Shopify Functions read these rules at checkout.
            </p>
            <ScreenshotFigure
              src="/wholesalenueron-settings.png"
              alt="WholesaleNeuron settings showing discount, minimum order, and payment method configuration"
              caption="Configuring B2B discount tiers, cart minimums, and B2B approved payment method inside WholesaleNeuron"
            />
          </div>

          <div className={styles.step}>
            <span className={styles.stepLabel}>Step 3</span>
            <h3 className={styles.stepTitle}>
              Automate tiered wholesale pricing at checkout
            </h3>
            <p className={styles.paragraph}>
              When a tagged buyer reaches cart or checkout, the wholesale
              discount applies in real time—no coupon field, no shared codes,
              and no draft-order workaround.
            </p>
            <ScreenshotFigure
              src="/wholesalenueron-applied-discount.png"
              alt="Checkout showing an automatic wholesale discount applied without a discount code"
              caption="Automatic wholesale discount applied in real-time at checkout without discount codes"
            />
          </div>

          <div className={styles.step}>
            <span className={styles.stepLabel}>Step 4</span>
            <h3 className={styles.stepTitle}>
              Enforce hard minimum order amounts
            </h3>
            <p className={styles.paragraph}>
              Protect margin by blocking tagged wholesale checkouts when the
              subtotal is below your required minimum. Retail shoppers are
              unaffected.
            </p>
            <ScreenshotFigure
              src="/wholesalenueron-minimum-amount.png"
              alt="Checkout validation message blocking an order below the wholesale minimum amount"
              caption="Checkout validation blocking subtotal below the required minimum order amount"
            />
          </div>

          <div className={styles.step}>
            <span className={styles.stepLabel}>Step 5</span>
            <h3 className={styles.stepTitle}>
              Filter payment methods (bank wire vs. credit card)
            </h3>
            <p className={styles.paragraph}>
              Show only the B2B payment method you approve—such as bank wire or
              invoice terms—while hiding retail gateways that eat processing
              fees on large wholesale carts.
            </p>
            <ScreenshotFigure
              src="/wholesalenueron-payment-method.png"
              alt="Checkout payment options limited to the configured B2B payment method"
              caption="Allows only approved and configured B2B payment method"
            />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="isolation-heading">
          <h2 id="isolation-heading" className={styles.sectionTitle}>
            Retail vs. wholesale isolation
          </h2>
          <p className={styles.paragraph}>
            Isolation is the feature. WholesaleNeuron checks customer identity
            and tags before applying any rule. Guest shoppers and untagged
            retail customers never see wholesale notices, never hit
            minimum-order blocks, and never lose their normal payment options.
          </p>
          <p className={styles.paragraph}>
            Your DTC storefront stays conversion-optimized for consumers, while
            logged-in B2B accounts get a controlled wholesale channel on the
            same catalog—without a second store or Shopify Plus.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="compare-heading">
          <h2 id="compare-heading" className={styles.sectionTitle}>
            Comparison: Plus vs. manual vs. WholesaleNeuron
          </h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Approach</th>
                  <th scope="col">Monthly cost</th>
                  <th scope="col">Admin time</th>
                  <th scope="col">Automation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Shopify Plus B2B</th>
                  <td>~$2,500/mo</td>
                  <td>Low once live</td>
                  <td>Native enterprise B2B</td>
                </tr>
                <tr>
                  <th scope="row">Manual draft orders</th>
                  <td>$0 software</td>
                  <td>~10 hrs/week</td>
                  <td>None—fully manual</td>
                </tr>
                <tr>
                  <th scope="row" className={styles.highlightCol}>
                    WholesaleNeuron
                  </th>
                  <td className={styles.highlightCol}>$29/mo</td>
                  <td className={styles.highlightCol}>Minutes to configure</td>
                  <td className={styles.highlightCol}>
                    Tag discounts, MOV, payment filter
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <SupportCallout />

        <section className={styles.section} aria-labelledby="video-heading">
          <h2 id="video-heading" className={styles.sectionTitle}>
            Video walkthrough
          </h2>
          <p className={styles.paragraph}>
            Watch the end-to-end setup: customer tags, rule configuration, and
            a tagged checkout with discount, minimum order, and payment
            filtering.
          </p>
          <div className={styles.videoWrap}>
            {VIDEO_EMBED.includes("PLACEHOLDER_VIDEO_ID") ? (
              <div className={styles.videoPlaceholder}>
                <div className={styles.playIcon} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <strong>WholesaleNeuron walkthrough</strong>
                <p>
                  YouTube embed placeholder — replace{" "}
                  <code>PLACEHOLDER_VIDEO_ID</code> when the video is live.
                </p>
              </div>
            ) : (
              <iframe
                className={styles.videoIframe}
                src={VIDEO_EMBED}
                title="How to set up Shopify wholesale with WholesaleNeuron"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="faq-heading">
          <h2 id="faq-heading" className={styles.sectionTitle}>
            Frequently asked questions
          </h2>
          <FaqAccordion items={FAQ_ITEMS} />
        </section>

        <section className={styles.ctaBox} aria-labelledby="cta-heading">
          <h2 id="cta-heading" className={styles.ctaTitle}>
            Ready to automate wholesale on a standard Shopify plan?
          </h2>
          <p className={styles.ctaBody}>
            Install WholesaleNeuron, tag your B2B buyers, and go live without
            Shopify Plus, draft orders, or leaky discount codes.
          </p>
          <a
            className={styles.ctaButton}
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Install WholesaleNeuron (7-Day Free Trial)
          </a>
        </section>
      </main>

      <SiteFooter compactBottom />

      <div className={styles.stickyCta}>
        <div className={styles.stickyCtaInner}>
          <p className={styles.stickyCopy}>
            <strong>Wholesale without Shopify Plus</strong>
            Automate discounts, minimums, and B2B payments.
          </p>
          <a
            className={styles.stickyButton}
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Install WholesaleNeuron (7-Day Free Trial)
          </a>
        </div>
      </div>
    </div>
  );
}
