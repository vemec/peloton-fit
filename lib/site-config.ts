// No Next.js Metadata import here — this file only contains raw site config.

/**
 * Site configuration values used throughout the application.
 * Centralizes important site information to avoid hardcoding values.
 */
export const siteConfig = {
  // Basic site info
  title: {
    default: "BikeFit AI - Real-time Posture Analysis",
    template: "%s | BikeFit AI",
  },
  description:
    "Web application for real-time posture analysis for cyclists and triathletes. Uses computer vision to detect body keypoints, calculate reference angles, and optimize your position on the bicycle.",
  keywords: [
    "bikefitting",
    "bike fit",
    "posture analysis",
    "cycling",
    "triathlon",
    "bicycle position",
    "computer vision",
    "MediaPipe",
    "TensorFlow",
    "biomechanical analysis",
    "pose detection",
    "real time analysis",
    "cycling performance",
    "bike position optimization",
  ],

  // Social metadata (Open Graph)
  openGraphMeta: {
    type: "website",
    locale: "en_US",
    url: "https://bikefit-ai.vercel.app",
    title: "BikeFit AI - Real-time Posture Analysis",
    description:
      "Optimize your position on the bicycle with real-time posture analysis using AI and computer vision.",
    siteName: "BikeFit AI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BikeFit AI - Posture analysis for cyclists",
      },
    ],
    logo: "https://bikefit-ai.vercel.app/logo.png",
  },

  // Social metadata (Twitter card)
  twitterMeta: {
    card: "summary_large_image",
    title: "BikeFit AI - Real-time Posture Analysis",
    description: "Optimize your position on the bicycle with real-time posture analysis using AI.",
    creator: "@bikefitai",
    site: "@bikefitai",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BikeFit AI - Posture analysis for cyclists",
      },
    ],
  },

  // Schema.org JSON-LD for SEO
  websiteJsonLd: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://bikefit-ai.vercel.app/",
    name: "BikeFit AI",
    description: "Web application for real-time posture analysis for cyclists and triathletes. Uses computer vision to detect body keypoints, calculate reference angles, and optimize your position on the bicycle.",
    publisher: {
      "@type": "Organization",
      name: "BikeFit AI",
      url: "https://bikefit-ai.vercel.app/",
      logo: {
        "@type": "ImageObject",
        url: "https://bikefit-ai.vercel.app/logo.png",
      },
    },
  },

  // Additional helper values
  metadataBase: new URL("https://bikefit-ai.vercel.app"),
  alternates: {
    canonical: "/",
    languages: {
      "es-ES": "/es",
      "en-US": "/en",
    },
  },
};

// Type definition for the site config
export type SiteConfig = typeof siteConfig;

// Export a Metadata-typed object for Next.js app router that uses the
// structured values above. Keep the fields commonly required by Next.
export default siteConfig;
