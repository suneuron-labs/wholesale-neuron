import { useEffect } from "react";

/**
 * Client-side SEO injection for public marketing pages.
 * Ensures document.title and meta[name=description] are set on mount.
 */
export function usePageSeo(title: string, description: string) {
  useEffect(() => {
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, [title, description]);
}
