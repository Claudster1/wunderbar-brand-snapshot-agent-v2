\"use client\";

import { useState } from \"react\";
import SnapshotModal from \"@/components/SnapshotModal\";

export default function BrandSnapshotPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SnapshotModal isOpen={open} onClose={() => setOpen(false)} />

      <main className=\"w-full min-h-screen bg-white\">
        <section className=\"px-6 py-20 max-w-3xl mx-auto text-left\">
          <h1 className=\"text-4xl font-semibold text-brand-navy\">
            Start Your Free Brand Snapshot™
          </h1>

          <p className=\"text-lg text-slate-700 mt-4 leading-relaxed\">
            In a few guided minutes, our strategic assistant will help you assess how clearly,
            consistently, and confidently your brand shows up in the market today.
            Your Brand Alignment Score™ is the first step toward stronger messaging, deeper trust,
            and higher conversion.
          </p>

          <button
            onClick={() => setOpen(true)}
            className=\"mt-8 inline-flex items-center px-6 py-3 rounded-md bg-brand-blue text-white font-semibold shadow-lg hover:bg-brand-blueHover transition\"
          >
            Start Your Free Brand Snapshot™ →
          </button>
        </section>

        {/* TODO: Add feature grid, pillars, visuals, trust markers */}
      </main>
    </>
  );
}


