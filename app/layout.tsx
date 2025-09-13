import type { Viewport } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import ResponsiveToaster from "@/components/ui/ResponsiveToaster";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
import siteConfig from "@/lib/site-config";
import { ThemeProvider } from "@/components/theme-provider"

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" }
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  alternates: {
    canonical: siteConfig.alternates.canonical,
  },
  metadataBase: siteConfig.metadataBase,
  title: siteConfig.title,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: "BikeFit AI Team" }],
  creator: "BikeFit AI",
  openGraph: siteConfig.openGraphMeta,
  twitter: siteConfig.twitterMeta,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${geistMono.variable} antialiased md:subpixel-antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <ResponsiveToaster />
        <Analytics />
      </body>
    </html>
  );
}
