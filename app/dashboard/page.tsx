// app/dashboard/page.tsx

import { ReportHistoryCard } from "./components/ReportHistoryCard";

export default function DashboardPage() {
  return (
    <main>
      <h1>Your Brand Reports</h1>
      <p>
        Each report captures a moment in your brand's evolution.
        Revisit past insights or deepen them as your business grows.
      </p>

      <section>
        <ReportHistoryCard
          title="Brand Snapshot™"
          date="Jan 2026"
          status="Completed"
        />

        <ReportHistoryCard
          title="Brand Snapshot+™"
          date="Jan 2026"
          status="Active"
          upgrade="Brand Blueprint™"
        />
      </section>
    </main>
  );
}
