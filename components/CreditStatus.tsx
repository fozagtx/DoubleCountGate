import { STATUS_LABEL } from "@/lib/abi";

export function CreditStatus({ status }: { status: number }) {
  const style: Record<number, string> = {
    1: "bg-moss text-forest",
    2: "bg-sand text-lead",
    3: "bg-blush text-clay",
  };
  const label = status === 3 ? "Flagged" : STATUS_LABEL[status] ?? "Unknown";

  return (
    <span className={`rounded-full px-3 py-1 text-[13px] font-semibold ${style[status] ?? "bg-sand text-lead"}`}>
      {label}
    </span>
  );
}
