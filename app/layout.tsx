import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import "@neynar/react/dist/style.css";

import type { Metadata } from "next";
// eslint-disable-next-line camelcase
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { ReactNode } from "react";

import { AuthProvider } from "@/contexts/AuthProvider";
// import { Providers } from "@/app/providers";

// eslint-disable-next-line new-cap
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

// eslint-disable-next-line new-cap
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const baseUrl = `https://${host}`;

  return {
    alternates: {
      canonical: "/",
    },
    description: "TheToolk.it",
    metadataBase: new URL(baseUrl),
    title: "TheToolk.it",
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-white antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
