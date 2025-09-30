import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/polyfills";
import { Providers } from "./providers";
import { PageErrorBoundary } from "@/components/ErrorBoundary";
import { ToastContainer } from "@/components/ui/Toast";
import React from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FHE-Pay - Secure Salary Streaming with Fully Homomorphic Encryption",
  description: "Revolutionary payroll streaming platform using Fully Homomorphic Encryption (FHE) to ensure complete privacy and security of salary data on the blockchain.",
  keywords: "FHE, Fully Homomorphic Encryption, payroll, salary streaming, blockchain, privacy, security, cryptocurrency, ethereum",
  authors: [{ name: "FHE-Pay Team" }],
  robots: "index, follow",
  openGraph: {
    title: "FHE-Pay - Secure Salary Streaming",
    description: "Revolutionary payroll streaming platform using Fully Homomorphic Encryption for complete privacy.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FHE-Pay - Secure Salary Streaming",
    description: "Revolutionary payroll streaming platform using Fully Homomorphic Encryption for complete privacy.",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-screen bg-background font-sans`}>
        <PageErrorBoundary>
          <Providers>
            <div className="relative flex min-h-screen flex-col">
              <div className="flex-1">
                {children}
              </div>
            </div>
            <ToastContainer />
          </Providers>
        </PageErrorBoundary>
      </body>
    </html>
  );
}