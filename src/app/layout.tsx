import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

export const metadata: Metadata = {
  title: "JEE Main 2026 PYQ | Mobile Practice & Teaching Solutions",
  description:
    "Official JEE Main 2026 Previous Year Questions with step-by-step teaching explanations, hints, and exam patterns.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JEE 2026",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0284c7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-sky-500/30 selection:text-sky-200">
        <Header />
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">{children}</main>
        <PwaInstallPrompt />
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
