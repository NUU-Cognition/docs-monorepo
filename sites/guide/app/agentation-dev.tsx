"use client";

import dynamic from "next/dynamic";

/**
 * Agentation, the click-to-annotate toolbar, mounted only in development.
 * The guard is `process.env.NODE_ENV`, which Next.js inlines at build time,
 * so the production bundle never loads the package. Verify with:
 *   pnpm build && grep -r agentation .next/static | head
 */
const Agentation =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("agentation").then((m) => m.Agentation), { ssr: false })
    : null;

export function AgentationDev() {
  if (!Agentation) return null;
  return <Agentation />;
}
