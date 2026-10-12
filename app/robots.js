export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/k/", "/ready", "/api/"] }],
    sitemap: "https://kept.nyttolabs.com/sitemap.xml"
  };
}
