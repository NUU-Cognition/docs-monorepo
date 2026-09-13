import { docs } from "@/.source";
import { loader } from "fumadocs-core/source";
import { hasProductIcon, productIcon } from "@/lib/product-icons";

/**
 * A product folder's meta.json carries `icon: "<slug>"`. The port engine
 * writes it. The resolver turns it into the product mark for the sidebar
 * tab switcher, so every tab shows its mark instead of an empty slot.
 */
export const source = loader({
  baseUrl: "/",
  source: docs.toFumadocsSource(),
  icon(name) {
    return hasProductIcon(name) ? productIcon(name) : undefined;
  },
});
