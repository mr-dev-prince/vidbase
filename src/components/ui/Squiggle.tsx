export function Squiggle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4 20 Q 17 2 30 20 T 56 20 T 82 20 T 108 20 T 134 20 T 160 20 T 186 20"
        stroke="currentColor"
        strokeWidth={7}
        strokeLinecap="round"
      />
    </svg>
  );
}
