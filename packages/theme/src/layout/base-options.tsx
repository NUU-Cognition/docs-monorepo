import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Logo } from "../components/logo";

/**
 * Base layout options for all NUU docs sites
 *
 * Customize per-site by spreading and overriding.
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <div className="flex items-center gap-2">
        <Logo className="text-foreground" />
        <span className="font-semibold">NUU Docs</span>
      </div>
    ),
  },
  githubUrl: "https://github.com/NUU-Cognition",
  links: [
    {
      text: "NUU Cognition",
      url: "https://nuucognition.com",
      external: true,
    },
  ],
};
