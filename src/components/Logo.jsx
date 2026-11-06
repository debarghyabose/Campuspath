export default function Logo({ className = 'h-7 w-7' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#193957" stroke="#294968" />
      <path d="M8 22 L14 10 L18 18 L24 9" fill="none" stroke="#38BDF8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="22" r="2.4" fill="#F1F5F9" />
      <circle cx="24" cy="9" r="2.4" fill="#38BDF8" />
    </svg>
  );
}
