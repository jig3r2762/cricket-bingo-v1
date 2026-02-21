import { useEffect } from "react";

interface SeoHead {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  jsonLd?: object;
}

const DEFAULTS = {
  title: "Cricket Bingo — Free Online Cricket Quiz Game | Play Cricket Card Game Free",
  description:
    "Play Cricket Bingo — the free online cricket game with 3600+ real player cards! Answer cricket quiz questions, match players to IPL teams, stats & trophies on a bingo grid. No download needed.",
  canonical: "https://cricket-bingo.in",
  ogImage: "https://cricket-bingo.in/og-image.png",
};

function setMeta(selector: string, content: string) {
  const el = document.querySelector<HTMLMetaElement>(selector);
  if (el) el.content = content;
}

function setLink(rel: string, href: string) {
  const el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (el) el.href = href;
}

/**
 * Sets per-page SEO head tags (title, description, og, canonical, JSON-LD).
 * Restores site defaults on unmount so navigating back to Landing works correctly.
 */
export function useSeoHead({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  jsonLd,
}: SeoHead) {
  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', ogTitle ?? title);
    setMeta('meta[property="og:description"]', ogDescription ?? description);
    setMeta('meta[property="og:url"]', canonical);
    if (ogImage) setMeta('meta[property="og:image"]', ogImage);
    setMeta('meta[name="twitter:title"]', ogTitle ?? title);
    setMeta('meta[name="twitter:description"]', ogDescription ?? description);
    setLink("canonical", canonical);

    // Inject page-specific JSON-LD
    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement("script");
      script.id = "__page-jsonld__";
      script.type = "application/ld+json";
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      // Restore site-wide defaults when leaving the page
      document.title = DEFAULTS.title;
      setMeta('meta[name="description"]', DEFAULTS.description);
      setMeta('meta[property="og:title"]', DEFAULTS.title);
      setMeta('meta[property="og:description"]', DEFAULTS.description);
      setMeta('meta[property="og:url"]', DEFAULTS.canonical);
      setMeta('meta[property="og:image"]', DEFAULTS.ogImage);
      setMeta('meta[name="twitter:title"]', DEFAULTS.title);
      setMeta('meta[name="twitter:description"]', DEFAULTS.description);
      setLink("canonical", DEFAULTS.canonical);
      if (script) document.head.removeChild(script);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
