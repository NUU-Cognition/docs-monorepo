import { createFromSource } from "fumadocs-core/search/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSearchHandler(source: any) {
  return createFromSource(source);
}
