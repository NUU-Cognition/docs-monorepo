import Link from "next/link";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";

/**
 * The page for a path that is not in the guide. It renders inside the docs
 * layout, so the sidebar, the product tabs, and the search stay available.
 */
export default function NotFound() {
  return (
    <DocsPage>
      <DocsTitle>Page not found</DocsTitle>
      <DocsDescription className="mb-6">
        This page is not in NUU Guide. The page moved, or the link is wrong.
      </DocsDescription>
      <DocsBody>
        <p>Search the guide, or pick a product in the sidebar.</p>
        <p>
          <Link href="/">Go to the NUU Guide home</Link>
        </p>
      </DocsBody>
    </DocsPage>
  );
}
