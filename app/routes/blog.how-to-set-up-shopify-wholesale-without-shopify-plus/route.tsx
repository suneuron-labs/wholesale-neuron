import type { MetaFunction } from "react-router";

import {
  blogCtaHref,
  blogCtaLabel,
  primaryCtaIsExternal,
} from "../../components/marketing/cta";
import { SiteFooter } from "../../components/marketing/SiteFooter";
import { SiteHeader } from "../../components/marketing/SiteHeader";
import { FaqAccordion, type FaqItem } from "./FaqAccordion";
import { ScreenshotFigure } from "./ScreenshotFigure";
import { SupportCallout } from "./SupportCallout";
import styles from "./styles.module.css";

const CANONICAL =
  "https://wholesale.suneuron.com/blog/how-to-set-up-shopify-wholesale-without-shopify-plus";
const TITLE =
  "How to Set Up Shopify Wholesale Without Complex Company Profiles (2026 Guide)";
const DESCRIPTION =
  "Set up Shopify wholesale with customer tags—no Company Profiles, no forced New Customer Accounts. Automate B2B discounts, cart minimums, and payment methods while keeping classic password logins.";
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
    question: "Why use WholesaleNeuron instead of Shopify's free native B2B?",
    answer:
      'Shopify\'s native B2B requires you to set up and manage complex Company Profiles, Locations, and customized Catalogs. This is time-consuming and often highly inefficient for smaller operations. WholesaleNeuron lets you simply tag a customer (e.g., "B2B", "Wholesale", or "VIP"), set up the discount, minimum order, and B2B payment rules in 15 seconds, and our app handles the rest automatically at checkout. This method is extremely scalable—whether you have a single wholesale buyer or 100+ customers—with the exact same ease, zero stress, and no unnecessary ongoing maintenance.',
  },
  {
    question: "How is this different from discount codes or draft orders?",
    answer:
      "Discount codes leak when shared. Draft orders burn hours every week and break parts of the native checkout flow. WholesaleNeuron applies rules automatically at cart and checkout for tagged buyers only—no codes to police and no manual order drafting for every wholesale purchase.",
  },
  {
    question:
      "Can I set up different discount tiers for different customer groups (e.g., Gold, Silver, Bronze)?",
    answer: (
      <>
        Currently, the $29/mo Standard plan supports a single tier rule set per
        store. However, our soon to be launched <strong>Pro Plan</strong> will
        unlock{" "}
        <strong className={styles.tableNoteAccent}>
          unlimited tag-based tiers
        </strong>
        —completely bypassing Shopify&apos;s native 3-tier restriction. You get
        infinite pricing flexibility{" "}
        <strong className={styles.tableNoteAccent}>
          without the $2,500/mo Shopify Plus upgrade
        </strong>
        , and without the headache of managing separate price lists and Company
        Profiles. Want a custom deal for one
        VIP? Give them a unique tag. Want 100+ buyers on a Gold tier? Apply the
        same &quot;Gold&quot; tag to all of them. It&apos;s the same simple
        setup with zero store bloat. If you want early access to the Pro Plan,
        email{" "}
        <a
          href="mailto:support@wholesale.suneuron.com"
          className={styles.faqLink}
        >
          support@wholesale.suneuron.com
        </a>{" "}
        to join the waitlist.
      </>
    ),
    answerText:
      "Currently, the $29/mo Standard plan supports a single tier rule set per store. However, our soon to be launched Pro Plan will unlock unlimited tag-based tiers—completely bypassing Shopify's native 3-tier restriction. You get infinite pricing flexibility without the $2,500/mo Shopify Plus upgrade, and without the headache of managing separate price lists and Company Profiles. Want a custom deal for one VIP? Give them a unique tag. Want 100+ buyers on a Gold tier? Apply the same \"Gold\" tag to all of them. It's the same simple setup with zero store bloat. If you want early access to the Pro Plan, email support@wholesale.suneuron.com to join the waitlist.",
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
          text:
            item.answerText ??
            (typeof item.answer === "string" ? item.answer : ""),
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
      content:
        "Shopify wholesale, B2B pricing, classic customer accounts, Company Profiles alternative",
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
            How to Set Up Shopify Wholesale Without Complex Company Profiles
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
            The problem: Native B2B complexity and forced account migrations
          </h2>
          <p className={styles.lead}>
            Shopify&apos;s native B2B on standard plans sounds great until you
            try to set it up. It forces you to waste hours building
            enterprise-style &apos;Company Profiles&apos;, assigning
            &apos;Locations&apos;, and managing complex catalogs just to set up
            basic wholesale rules. For growing brands that just want to tag a
            wholesale buyer and automate their checkout, this forced complexity
            is an administrative nightmare. WholesaleNeuron is the instant,
            zero-friction alternative.
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
              <strong>The &quot;Company Profile&quot; Headache</strong>
              <span>
                Shopify&apos;s native B2B forces you to waste hours managing
                complex Company Profiles and Locations just to set up basic
                wholesale purchasing rules.
              </span>
            </li>
          </ul>
          <p className={styles.paragraph}>
            In 2026, you can run a clean wholesale channel without Company
            Profiles: keep classic password accounts, tag B2B buyers, configure
            rules once, and let checkout enforce pricing, minimums, and payment
            methods automatically.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="solution-heading">
          <h2 id="solution-heading" className={styles.sectionTitle}>
            The step-by-step solution with WholesaleNeuron
          </h2>
          <p className={styles.paragraph}>
            Follow these five steps. No Company Profiles, no forced passwordless
            logins, no theme code edits, and no discount codes to babysit.
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
              Show approved B2B payment method only
            </h3>
            <p className={styles.paragraph}>
              Show only the specific B2B payment method you approve—such as bank
              wire, net-30, or invoice terms—while hiding standard retail
              gateways that eat processing fees on large wholesale carts.
            </p>
            <p className={styles.caveat}>
              *Note: Due to Shopify&apos;s platform policies for stores based in
              the USA and Canada, standard credit card options (like Shopify
              Payments) will always remain visible at checkout alongside your
              configured B2B method.*
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
            same catalog—without Company Profiles or New Customer Accounts.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="compare-heading">
          <h2 id="compare-heading" className={styles.sectionTitle}>
            Comparison: Native B2B vs. manual vs. WholesaleNeuron
          </h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Approach</th>
                  <th scope="col">Monthly cost</th>
                  <th scope="col">Setup</th>
                  <th scope="col">Limits</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Shopify Native B2B</th>
                  <td>$0 (Included)</td>
                  <td>
                    Hours of admin work (Requires Company Profiles &amp;
                    Locations)
                  </td>
                  <td>Enterprise-style data structure</td>
                </tr>
                <tr className={styles.warnRow}>
                  <th scope="row">Manual draft orders</th>
                  <td>$0 software</td>
                  <td>~10 hrs/week</td>
                  <td>None—fully manual</td>
                </tr>
                <tr>
                  <th scope="row" className={styles.highlightCol}>
                    WholesaleNeuron
                  </th>
                  <td className={styles.highlightCol}>$29/mo Standard</td>
                  <td className={styles.highlightCol}>
                    <strong>&lt; 15 seconds</strong> (Just add a tag)
                  </td>
                  <td className={styles.highlightCol}>
                    One global discount and rule set today. Pro (Coming Soon):
                    unlimited tiers via the same simple tag-mapping—delivering
                    enterprise flexibility without the $2,500/mo price tag.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={styles.tableNote}>
            <h4 className={styles.tableNoteHeading}>
              The Game Changer: Unlimited Tiers Pro (Coming Soon)
            </h4>
            <p className={styles.tableNoteText}>
              <strong className={styles.tableNoteLead}>
                The 3-Tier Paywall:
              </strong>{" "}
              Standard Shopify plans hard-cap your native B2B setup at just 3
              active catalogs. If you need a 4th tier for a custom VIP client,
              Shopify forces you to upgrade to the $2,500/month Plus plan.
              WholesaleNeuron&apos;s Standard plan provides one global rule set
              today, but our upcoming Pro tier will unlock{" "}
              <strong className={styles.tableNoteAccent}>unlimited tiers</strong>{" "}
              using our simple tag-mapping system—allowing you to bypass the
              Plus paywall completely at a{" "}
              <strong className={styles.tableNoteAccent}>
                fraction of the enterprise cost
              </strong>
              .
            </p>
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
              <div
                className={styles.videoPlaceholder}
                role="img"
                aria-label="Video coming soon"
              >
                <span className={styles.videoSoonBadge}>Coming soon</span>
                <div className={styles.playIcon} aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <strong className={styles.videoSoonTitle}>
                  Video coming soon!!
                </strong>
                <p>
                  We&apos;re filming the full WholesaleNeuron walkthrough.
                  Check back shortly—or request early access and we&apos;ll
                  walk you through live.
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
            Ready for wholesale without Company Profiles?
          </h2>
          <p className={styles.ctaBody}>
            Install WholesaleNeuron, keep classic password accounts, tag your
            B2B buyers, and go live without native B2B complexity, draft orders,
            or leaky discount codes.
          </p>
          <a
            className={styles.ctaButton}
            href={blogCtaHref}
            {...(primaryCtaIsExternal
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {blogCtaLabel}
          </a>
        </section>
      </main>

      <SiteFooter compactBottom />

      <div className={styles.stickyCta}>
        <div className={styles.stickyCtaInner}>
          <p className={styles.stickyCopy}>
            <strong>Wholesale without the Complex Setup</strong>
            Just tag your customers—no Company Profiles, Locations, or
            customized Catalogs required.
          </p>
          <a
            className={styles.stickyButton}
            href={blogCtaHref}
            {...(primaryCtaIsExternal
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {blogCtaLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
