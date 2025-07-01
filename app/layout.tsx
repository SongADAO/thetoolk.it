import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import type { Metadata } from "next";
// eslint-disable-next-line camelcase
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "./providers";

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

export const metadata: Metadata = {
  description: "TheToolk.it",
  title: "TheToolk.it",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
