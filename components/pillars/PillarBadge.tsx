// components/pillars/PillarBadge.tsx

type PillarBadgeProps = {
  label: "Primary Focus Area";
};

export function PillarBadge({ label }: PillarBadgeProps) {
  return (
    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-brand-blue/10 text-brand-blue">
      {label}
    </span>
  );
}
