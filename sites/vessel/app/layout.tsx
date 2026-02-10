import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    template: "%s | NUU Vessel Docs",
    default: "NUU Vessel Documentation",
  },
  description: "Documentation for NUU Vessel - the publishing platform for Flint mesh content",
  icons: {
    icon: "/docs/logo-with-bg.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <RootProvider
          theme={{ enabled: false }}
          search={{ options: { api: "/docs/api/search" } }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
