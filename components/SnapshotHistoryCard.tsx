// components/SnapshotHistoryCard.tsx
// Card component for displaying a snapshot in history

export default function SnapshotHistoryCard({ snapshot }: any) {
  const showResumeCTA = snapshot.status === "draft";

  return (
    <div className="border rounded-lg p-5 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{snapshot.business_name}</h3>
          <p className="text-sm text-gray-500">
            {new Date(snapshot.created_at).toLocaleDateString()}
          </p>
        </div>

        <span className="text-sm font-semibold">
          {snapshot.brand_alignment_score}/100
        </span>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs uppercase tracking-wide text-gray-500">
          Primary Focus: {snapshot.primary_pillar}
        </span>

        {showResumeCTA ? (
          <a
            href={`/brand-snapshot?resume=${snapshot.id}`}
            className="text-brand-blue text-sm font-medium"
          >
            Resume →
          </a>
        ) : (
          <a
            href={`/results/${snapshot.id}`}
            className="text-brand-blue text-sm font-medium"
          >
            View →
          </a>
        )}
      </div>
    </div>
  );
}
