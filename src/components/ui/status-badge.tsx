export function StatusBadge({
  className = "",
  label,
  status,
}: {
  className?: string;
  label?: string;
  status: string;
}) {
  return (
    <span
      className={`status-chip status-${status}${className ? ` ${className}` : ""}`}
    >
      <i aria-hidden="true" />
      {label ?? status}
    </span>
  );
}
