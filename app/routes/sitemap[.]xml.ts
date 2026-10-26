/**
 * Dynamic sitemap for Google indexing.
 * Served at https://wholesale.suneuron.com/sitemap.xml
 *
 * Note: This project uses React Router (not Next.js App Router).
 * Equivalent to Next.js `app/sitemap.ts`.
 */

const BASE_URL = "https://wholesale.suneuron.com";

const routes = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  {
    path: "/blog/how-to-set-up-shopify-wholesale-without-shopify-plus",
    changeFrequency: "monthly",
    priority: 0.9,
  },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
] as const;

export async function loader() {
  const lastMod = new Date().toISOString().slice(0, 10);

  const urls = routes
    .map(
      ({ path, changeFrequency, priority }) => `  <url>
    <loc>${BASE_URL}${path === "/" ? "" : path}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${changeFrequency}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
