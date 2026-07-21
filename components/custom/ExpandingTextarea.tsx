"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

const MIN_ROWS = 3;
const MAX_ROWS = 6;

type ExpandingTextareaProps = Omit<
  React.ComponentProps<"textarea">,
  "rows"
>;

export function ExpandingTextarea({
  className,
  value,
  onChange,
  ...props
}: ExpandingTextareaProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  const adjustHeight = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const style = getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight) || 20;
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    const borderTop = parseFloat(style.borderTopWidth) || 0;
    const borderBottom = parseFloat(style.borderBottomWidth) || 0;
    const extras = paddingTop + paddingBottom + borderTop + borderBottom;
    const minHeight = lineHeight * MIN_ROWS + extras;
    const maxHeight = lineHeight * MAX_ROWS + extras;

    el.style.height = "auto";
    const fullHeight = el.scrollHeight;
    el.style.height = `${Math.min(maxHeight, Math.max(minHeight, fullHeight))}px`;
    el.style.overflowY = fullHeight > maxHeight ? "auto" : "hidden";
  }, []);

  React.useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <textarea
      ref={ref}
      rows={MIN_ROWS}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        requestAnimationFrame(adjustHeight);
      }}
      className={cn(
        "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
        className
      )}
      {...props}
    />
  );
}
