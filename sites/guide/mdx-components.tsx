import type { MDXComponents } from "mdx/types";
import { mdxComponents as themeMdxComponents } from "@nuucognition/docs-theme";

/**
 * MDX components available to every page in NUU Guide.
 * The theme supplies the Fumadocs defaults plus Cards, Card, Callout,
 * ProductGrid, and ProductCard.
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...(themeMdxComponents as MDXComponents),
    ...components,
  };
}

export const mdxComponents: MDXComponents = getMDXComponents();
