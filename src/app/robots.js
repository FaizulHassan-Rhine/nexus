export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
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
      ],
      disallow: [
        "/student/",
        "/faculty/",
        "/organization/",
        "/university-admin/",
        "/ugc/",
        "/helpdesk/",
        "/login",
        "/register",
        "/onboarding/",
      ],
    },
    sitemap: "https://nexus.demo/sitemap.xml",
  };
}
