// components/dashboard/RequestRefinementPanel.tsx

export function RequestRefinementPanel({
  pillar,
}: {
  pillar: string;
}) {
  return (
    <section className="refinement">
      <h3>Refine: {pillar}</h3>

      <p>
        Add more context to sharpen this insight.  
        This will regenerate only this section — not the entire report.
      </p>

      <textarea
        placeholder="Share additional details that weren't captured earlier…"
      />

      <button>Refine This Pillar</button>
    </section>
  );
}
