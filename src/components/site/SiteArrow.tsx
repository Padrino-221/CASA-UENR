export default function SiteArrow({ stroke }: { stroke: string }) {
  return (
    <span className="btn-circle">
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </span>
  );
}
