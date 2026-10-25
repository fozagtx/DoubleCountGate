import type { ReactNode } from "react";
import { AlertIcon, CheckIcon } from "@/components/Icons";

export function Banner({
  tone,
  title,
  children,
  testId,
}: {
  tone: "good" | "bad";
  title: string;
  children?: ReactNode;
  testId?: string;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-[12px] px-4 py-4 ${tone === "good" ? "bg-moss" : "bg-blush"}`}
      data-testid={testId}
    >
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sheet ${
          tone === "good" ? "bg-forest" : "bg-clay"
        }`}
      >
        {tone === "good" ? <CheckIcon className="h-4 w-4" /> : <AlertIcon className="h-4 w-4" />}
      </span>
      <div>
        <p className="text-[16px] font-semibold text-ink">{title}</p>
        {children ? <div className="mt-1 text-[14px] leading-relaxed text-lead">{children}</div> : null}
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
      aria-hidden
    />
  );
}
