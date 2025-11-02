import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#5B9FD8" },
    { media: "(prefers-color-scheme: dark)", color: "#4A8BC2" }
  ],
  colorScheme: "light"
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${process.env.PORT || 3090}`),
  title: {
    default: "云梅Air - 智能门锁",
    template: "%s | 云梅Air"
  },
  description: "云梅门锁蓝牙解锁应用，支持离线使用、PWA安装",
  applicationName: "云梅Air",
  authors: [{ name: "Arisumika" }],
  generator: "Next.js",
  keywords: ["云梅", "智能门锁", "蓝牙开锁", "PWA", "离线应用"],
  referrer: "origin-when-cross-origin",
  creator: "Arisumika",
  publisher: "Arisumika",
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "云梅Air",
    startupImage: [
      {
        url: "/icon-512.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
      }
    ]
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    siteName: "云梅Air",
    title: "云梅Air - 智能门锁",
    description: "云梅门锁蓝牙解锁应用，支持离线使用",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "云梅Air - 智能门锁"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "云梅Air - 智能门锁",
    description: "云梅门锁蓝牙解锁应用，支持离线使用",
    images: ["/og-image.png"]
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-72.png", sizes: "72x72", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-128.png", sizes: "128x128", type: "image/png" },
      { url: "/icon-144.png", sizes: "144x144", type: "image/png" },
      { url: "/icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-384.png", sizes: "384x384", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icon-maskable-512.png",
        color: "#5B9FD8"
      }
    ]
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "云梅Air"
  }
};

import InstallPWA from "@/components/InstallPWA";
import ThemeProvider from "@/components/ThemeProvider";
import NetworkStatus from "@/components/NetworkStatus";
import OfflineProvider from "@/components/OfflineProvider";
import OfflineIndicator from "@/components/OfflineIndicator";
import BrowserCompatibilityBanner from "@/components/BrowserCompatibilityBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-gradient-soft">
        <OfflineProvider>
          <ThemeProvider>
            <BrowserCompatibilityBanner />
            {children}
            <InstallPWA />
            <NetworkStatus />
            <OfflineIndicator />
          </ThemeProvider>
        </OfflineProvider>
      </body>
    </html>
  );
}
