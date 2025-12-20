import * as React from "react";
import { Info, AlertTriangle, Lightbulb, AlertCircle } from "lucide-react";

type CalloutType = "info" | "warning" | "tip" | "danger";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const icons: Record<CalloutType, React.ReactNode> = {
  info: <Info className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  tip: <Lightbulb className="h-5 w-5" />,
  danger: <AlertCircle className="h-5 w-5" />,
};

const styles: Record<CalloutType, string> = {
  info: "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  warning: "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  tip: "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300",
  danger: "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300",
};

const titles: Record<CalloutType, string> = {
  info: "Info",
  warning: "Warning",
  tip: "Tip",
  danger: "Danger",
};

/**
 * Callout component for highlighting important information
 */
export function Callout({ type = "info", title, children }: CalloutProps) {
  return (
    <div className={`my-4 flex gap-3 rounded-lg border-l-4 p-4 ${styles[type]}`}>
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div>
        {(title || titles[type]) && (
          <p className="font-semibold mb-1">{title || titles[type]}</p>
        )}
        <div className="text-sm [&>p]:m-0">{children}</div>
      </div>
    </div>
  );
}
