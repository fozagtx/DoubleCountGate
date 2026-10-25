type IconProps = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export function LeafIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" />
      <path d="M5 19c3-4 6-7 10-9" />
    </svg>
  );
}

export function DocIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  );
}

export function FingerprintIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 11v3a8 8 0 0 1-1.5 4.5" />
      <path d="M8.5 8.5A5 5 0 0 1 17 12v1.5a12 12 0 0 1-.8 4" />
      <path d="M5.5 15a12 12 0 0 0 .5-3 6 6 0 0 1 1.2-3.6" />
      <path d="M9 12a3 3 0 0 1 6 0v1a14 14 0 0 1-1 5" />
      <path d="M4.5 8A9 9 0 0 1 20 9.5" />
    </svg>
  );
}

export function ShieldIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function BlockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m5.7 5.7 12.6 12.6" />
    </svg>
  );
}

export function CheckIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function AlertIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0" />
    </svg>
  );
}

export function WalletIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7a2 2 0 0 1 2-2h12v4" />
      <path d="M4 7v11a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2" />
      <path d="M16 14.5h.01" />
    </svg>
  );
}

export function EyeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function CopyIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </svg>
  );
}

export function SparkIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
    </svg>
  );
}

export function HomeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9M9 20v-6h6v6" />
    </svg>
  );
}

export function SearchIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function ChevronLeftIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m14.5 5-7 7 7 7" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m9.5 5 7 7-7 7" />
    </svg>
  );
}
