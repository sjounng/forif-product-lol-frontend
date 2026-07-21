export function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="border-l border-line pl-4">
      <p className="eyebrow mb-2">{label}</p>
      <p className="tabular text-2xl font-medium leading-none">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-dim">{sub}</p>}
    </div>
  );
}
