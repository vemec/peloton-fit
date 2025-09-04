import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BikeFit AI - Análisis de Postura en Tiempo Real",
    template: "%s | BikeFit AI"
  },
  description: "Aplicación web de análisis de postura para ciclistas y triatletas en tiempo real. Utiliza visión por computadora para detectar puntos clave del cuerpo, calcular ángulos de referencia y optimizar tu posición sobre la bicicleta.",
  keywords: [
    "bikefitting",
    "bike fit",
    "análisis postura",
    "ciclismo",
    "triatlón",
    "posición bicicleta",
    "visión por computadora",
    "MediaPipe",
    "TensorFlow",
    "análisis biomecánico",
    "pose detection",
    "real time analysis",
    "cycling performance",
    "bike position optimization"
  ],
  authors: [{ name: "BikeFit AI Team" }],
  creator: "BikeFit AI",
  publisher: "BikeFit AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://bikefit-ai.vercel.app'),
  alternates: {
    canonical: '/',
    languages: {
      'es-ES': '/es',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://bikefit-ai.vercel.app',
    title: 'BikeFit AI - Análisis de Postura en Tiempo Real',
    description: 'Optimiza tu posición en la bicicleta con análisis de postura en tiempo real usando IA y visión por computadora.',
    siteName: 'BikeFit AI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BikeFit AI - Análisis de postura para ciclistas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BikeFit AI - Análisis de Postura en Tiempo Real',
    description: 'Optimiza tu posición en la bicicleta con análisis de postura en tiempo real usando IA.',
    images: ['/og-image.jpg'],
    creator: '@bikefitai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'Sports & Fitness',
  classification: 'Cycling Performance Analysis Tool',
  referrer: 'origin-when-cross-origin',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="bottom-center"
          expand={true}
          richColors={true}
          theme="light"
          toastOptions={{
            duration: 4000,
            style: {
              fontSize: '14px',
              fontFamily: 'inherit',
            }
          }}
        />
      </body>
    </html>
  );
}
