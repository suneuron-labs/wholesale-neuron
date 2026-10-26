/**
 * Temporary founding-merchant CTA override.
 * Flip `USE_TEMP_EARLY_ACCESS_CTA` to `false` to restore:
 * - App Store / install CTAs
 * - Landing page shop domain login form
 */

export const USE_TEMP_EARLY_ACCESS_CTA = true;

/** Original App Store install CTA (restore target) */
export const ORIGINAL_PRIMARY_CTA_LABEL = "Install free trial";
export const ORIGINAL_PRIMARY_CTA_HREF =
  "https://apps.shopify.com/wholesaleneuron";

/** Original blog conversion CTA (restore target) */
export const ORIGINAL_BLOG_CTA_LABEL =
  "Install WholesaleNeuron (7-Day Free Trial)";
export const ORIGINAL_BLOG_CTA_HREF =
  "https://apps.shopify.com/wholesaleneuron";

const TEMP_EARLY_ACCESS_LABEL = "Request Early Access";
const TEMP_EARLY_ACCESS_HREF =
  "mailto:support@wholesale.suneuron.com?subject=Founding Merchant Access Request&body=Hi Sunil,%0D%0A%0D%0AI'm interested in the 15-second wholesale setup. Please let me know when a spot opens up in the Founding Merchant program.";

export const primaryCtaLabel = USE_TEMP_EARLY_ACCESS_CTA
  ? TEMP_EARLY_ACCESS_LABEL
  : ORIGINAL_PRIMARY_CTA_LABEL;

export const primaryCtaHref = USE_TEMP_EARLY_ACCESS_CTA
  ? TEMP_EARLY_ACCESS_HREF
  : ORIGINAL_PRIMARY_CTA_HREF;

export const blogCtaLabel = USE_TEMP_EARLY_ACCESS_CTA
  ? TEMP_EARLY_ACCESS_LABEL
  : ORIGINAL_BLOG_CTA_LABEL;

export const blogCtaHref = USE_TEMP_EARLY_ACCESS_CTA
  ? TEMP_EARLY_ACCESS_HREF
  : ORIGINAL_BLOG_CTA_HREF;

export const primaryCtaIsExternal = !USE_TEMP_EARLY_ACCESS_CTA;
