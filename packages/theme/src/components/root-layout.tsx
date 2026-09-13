import { Inter, Geist, Geist_Mono } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider";
import type { SiteConfig } from "../config";

/* NUU fonts. Inter for body. Geist for headings. Geist Mono for code.
   Each font exposes one CSS variable. guide.css maps them to the Tailwind
   font-sans, font-heading and font-mono utilities. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

/**
 * Build the search API path from the site base path.
 * "/docs" -> "/docs/api/search". "/" or "" -> "/api/search".
 */
export function searchApiPath(basePath: string | undefined): string {
  const base = (basePath ?? "").replace(/\/+$/, "");
  return `${base}/api/search`;
}

export function DocsRootLayout({
  config,
  children,
}: {
  config: SiteConfig;
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <RootProvider
          theme={{
            enabled: true,
            attribute: "class",
            defaultTheme: "light",
            enableSystem: false,
            disableTransitionOnChange: true,
          }}
          search={{ options: { api: searchApiPath(config.basePath) } }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
