import { brandSnapshotCopy } from "@/src/content/brandSnapshot.copy";

export default function BrandSnapshotPage() {
  return (
    <main>
      <section>
        <h1>{brandSnapshotCopy.hero.title}</h1>
        <p>{brandSnapshotCopy.hero.subtitle}</p>
        <p>{brandSnapshotCopy.hero.intro}</p>

        <button>
          {brandSnapshotCopy.cta.primary}
        </button>

        <a href="/brand-suite">
          {brandSnapshotCopy.cta.secondary}
        </a>
      </section>

      <section>
        {brandSnapshotCopy.howItWorks.map(step => (
          <div key={step.title}>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>{brandSnapshotCopy.outcome.headline}</h2>
        <ul>
          {brandSnapshotCopy.outcome.bullets.map(b => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}


