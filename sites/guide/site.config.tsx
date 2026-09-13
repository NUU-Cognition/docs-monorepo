import type { SiteConfig } from "@nuucognition/docs-theme";

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
  basePath: "",
  logo: (
    <img
      src="/logo.png"
      alt="NUU Guide"
      width={24}
      height={24}
      className="mb-0.5"
    />
  ),
  github: "https://github.com/NUU-Cognition",
  links: [
    {
      text: "NUU Cognition",
      url: "https://nuucognition.com",
      external: true,
    },
  ],
};
