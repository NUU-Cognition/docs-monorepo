import defaultMdxComponents from "fumadocs-ui/mdx";
import { Card, Cards } from "fumadocs-ui/components/card";
import type { MDXComponents } from "mdx/types";

/**
 * MDX components available to every page in NUU Guide.
 * Cards and Card render the product list on the landing page.
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Card,
    Cards,
    ...components,
  };
}

export const mdxComponents: MDXComponents = getMDXComponents();
