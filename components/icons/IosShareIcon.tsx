"use client";

type Props = { className?: string };

export default function IosShareIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Arrow up */}
      <path d="M12 3v9" />
      <path d="M9 6l3-3 3 3" />
      {/* Rounded square container */}
      <rect x="5" y="11" width="14" height="10" rx="2" />
    </svg>
  );
}


