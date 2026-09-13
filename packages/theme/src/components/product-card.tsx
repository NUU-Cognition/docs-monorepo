import * as React from "react";
import Link from "fumadocs-core/link";
import { ArrowUpRight } from "lucide-react";

export interface ProductCardProps {
  /** Product or section name. */
  title: React.ReactNode;
  /** One or two short sentences. */
  description?: React.ReactNode;
  /** Link target. Internal paths and full URLs both work. */
  href: string;
  /** Optional small icon or logo. Rendered at 16px. */
  icon?: React.ReactNode;
  /** Force external link behavior. Detected from href by default. */
  external?: boolean;
  className?: string;
}

/**
 * ProductCard. One entry on a landing page.
 * Hairline border, no fill. The title moves to brand text on hover.
 */
export function ProductCard({
  title,
  description,
  href,
  icon,
  external,
  className,
}: ProductCardProps) {
  return (
    <Link
      href={href}
      external={external}
      data-product-card=""
      className={[
        "group not-prose flex flex-col gap-2 rounded-lg border border-fd-border p-4",
        "text-fd-foreground no-underline transition-colors",
        "hover:border-fd-muted-foreground/40 hover:bg-fd-accent/60",
        className ?? "",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        {icon ? (
          <span className="flex size-4 shrink-0 items-center text-fd-muted-foreground [&_svg]:size-4">
            {icon}
          </span>
        ) : null}
        <span className="font-heading text-[15px] font-medium tracking-tight group-hover:text-brand-text">
          {title}
        </span>
        <ArrowUpRight className="ms-auto size-3.5 shrink-0 text-fd-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      {description ? (
        <p className="m-0 text-[13px] leading-relaxed text-fd-muted-foreground">
          {description}
        </p>
      ) : null}
    </Link>
  );
}

export interface ProductGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Columns on wide screens. Default 2. */
  columns?: 2 | 3;
}

/**
 * ProductGrid. Lays ProductCard items out in two or three columns.
 */
export function ProductGrid({
  columns = 2,
  className,
  children,
  ...props
}: ProductGridProps) {
  const cols = columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div
      data-product-grid=""
      className={["not-prose my-6 grid grid-cols-1 gap-4", cols, className ?? ""].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
