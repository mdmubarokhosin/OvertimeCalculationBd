import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Overtime Tracker BD - ওভারটাইম ক্যালকুলেশন সিস্টেম",
  description: "ওভারটাইম ট্র্যাকিং ও ক্যালকুলেশন সিস্টেম - আপনার কাজের সময় সঠিকভাবে হিসাব রাখুন",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="OT Tracker BD" />
        <link rel="stylesheet" href="/bootstrap-icons/bootstrap-icons.min.css" />
        <script dangerouslySetInnerHTML={{__html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
