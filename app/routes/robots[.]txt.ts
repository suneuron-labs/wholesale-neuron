/**
 * Dynamic robots.txt for crawlers.
 * Served at https://wholesale.suneuron.com/robots.txt
 *
 * Note: This project uses React Router (not Next.js App Router).
 * Equivalent to Next.js `app/robots.ts`.
 */

export async function loader() {
  const body = `User-Agent: *
Allow: /

Sitemap: https://wholesale.suneuron.com/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
