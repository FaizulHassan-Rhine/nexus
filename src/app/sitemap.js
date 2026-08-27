const BASE_URL = "https://nexus.demo";

const STATIC_ROUTES = [
  "",
  "/about",
  "/how-it-works",
  "/opportunities",
  "/organizations",
  "/universities",
  "/courses",
  "/scholarships",
  "/projects",
  "/technology-marketplace",
  "/help",
  "/faq",
  "/contact",
  "/safety",
  "/privacy",
  "/terms",
];

export default function sitemap() {
  const now = new Date().toISOString();

  const staticEntries = STATIC_ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  return staticEntries;
}
