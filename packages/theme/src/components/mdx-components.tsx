import type * as React from "react";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Callout } from "./callout";
import { ProductCard, ProductGrid } from "./product-card";

/** The shape MDX expects: a map from tag or component name to a component. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MdxComponentMap = Record<string, React.ComponentType<any>>;

/**
 * MDX components for NUU Guide pages.
 *
 * Merges the Fumadocs defaults (headings, links, code blocks, tables, images)
 * with Cards, Card, the theme Callout, ProductGrid and ProductCard.
 *
 * Wire it in a site's mdx-components.tsx:
 *
 *   import { mdxComponents } from "@nuucognition/docs-theme";
 *   export function getMDXComponents(components?: MDXComponents) {
 *     return { ...mdxComponents, ...components };
 *   }
 */
export const mdxComponents = {
  ...defaultMdxComponents,
  Cards,
  Card,
  Callout,
  ProductGrid,
  ProductCard,
} satisfies MdxComponentMap;

export type GuideMdxComponents = typeof mdxComponents;
