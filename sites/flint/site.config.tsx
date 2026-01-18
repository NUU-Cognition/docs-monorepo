import type { SiteConfig } from "@nuucognition/docs-theme";
import Image from "next/image";

/**
 * Flint Documentation Site Configuration
 */
export const siteConfig: SiteConfig = {
  name: "NUU Flint Docs",
  description:
    "Documentation for NUU Flint - the structured workspace system for knowledge work",
  basePath: "/docs",
  logo: <Image src="/logo.png" alt="Flint" width={24} height={24} className="mb-0.5" />,
  github: "https://github.com/NUU-Cognition/flint",
};
