import type { SiteConfig } from "@nuucognition/docs-theme";
import { GuideLogo } from "@/lib/product-icons";

/**
 * NUU Guide Site Configuration
 *
 * One site for every NUU Cognition product, served at guide.nuucognition.com.
 * basePath is "" because the site is served at the domain root. The theme
 * builds paths as `${basePath}/api/search`, so "" gives "/api/search".
 */
export const siteConfig: SiteConfig = {
  name: "NUU Guide",
  description: "User guides for every NUU Cognition product",
  url: "https://guide.nuucognition.com",
  basePath: "",
  logo: <GuideLogo size={18} className="text-fd-foreground" />,
  github: "https://github.com/NUU-Cognition",
  links: [
    {
      text: "NUU Cognition",
      url: "https://nuucognition.com",
      external: true,
    },
  ],
};
