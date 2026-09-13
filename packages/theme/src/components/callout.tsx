import * as React from "react";
import { Info, AlertTriangle, Lightbulb, AlertCircle, CheckCircle2 } from "lucide-react";

/* The theme Callout accepts its own types and the Fumadocs types.
   "warn" is "warning". "danger" and "error" share one look. */
export type CalloutType =
  | "info"
  | "tip"
  | "warning"
  | "warn"
  | "danger"
  | "error"
  | "success";

type Tone = "info" | "tip" | "warning" | "danger" | "success";

export interface CalloutProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  type?: CalloutType;
  title?: React.ReactNode;
  /** Replace the default icon. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

function toTone(type: CalloutType): Tone {
  if (type === "warn") return "warning";
  if (type === "error") return "danger";
  return type;
}

const icons: Record<Tone, React.ReactNode> = {
  info: <Info className="size-4" />,
  tip: <Lightbulb className="size-4" />,
  warning: <AlertTriangle className="size-4" />,
  danger: <AlertCircle className="size-4" />,
  success: <CheckCircle2 className="size-4" />,
};

/* The colored rule and the icon read the Fumadocs status tokens.
   guide.css maps these to the NUU Four Elements. */
const colors: Record<Tone, string> = {
  info: "var(--color-fd-info)",
  tip: "var(--color-fd-success)",
  warning: "var(--color-fd-warning)",
  danger: "var(--color-fd-error)",
  success: "var(--color-fd-success)",
};

const titles: Record<Tone, string> = {
  info: "Note",
  tip: "Tip",
  warning: "Warning",
  danger: "Danger",
  success: "Done",
};

/**
 * Callout. A hairline box with a thin colored rule on the left.
 * No fill, no shadow. The title is T1. The body is T3.
 */
export function Callout({
  type = "info",
  title,
  icon,
  children,
  className,
  style,
  ...props
}: CalloutProps) {
  const tone = toTone(type);
  const heading = title ?? titles[tone];
  return (
    <div
      data-callout={tone}
      className={[
        "not-prose my-5 flex gap-3 rounded-lg border border-fd-border p-3 ps-2 text-sm",
        className ?? "",
      ].join(" ")}
      style={{ "--callout-color": colors[tone], ...style } as React.CSSProperties}
      {...props}
    >
      <div
        role="none"
        className="w-0.5 shrink-0 self-stretch rounded-sm opacity-60"
        style={{ backgroundColor: "var(--callout-color)" }}
      />
      <div
        className="mt-0.5 shrink-0"
        style={{ color: "var(--callout-color)" }}
      >
        {icon ?? icons[tone]}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {heading ? (
          <p className="m-0 font-medium text-fd-foreground">{heading}</p>
        ) : null}
        <div className="prose prose-no-margin text-sm text-fd-muted-foreground [&>p]:my-0 [&>p+p]:mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
