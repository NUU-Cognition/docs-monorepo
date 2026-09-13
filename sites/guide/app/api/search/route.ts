import { source } from "@/lib/source";
import { createSearchHandler } from "@nuucognition/docs-theme";

export const { GET } = createSearchHandler(source);
