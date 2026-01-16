// components/dashboard/HistoryCard.tsx
// Card component for displaying a single history item

export function HistoryCard({ item }: { item: any }) {
  return (
    <div className="border rounded-lg p-5 mb-4">
      <h4 className="font-semibold">
        {item.brandName}
      </h4>
      <p className="text-sm">
        Brand Alignment Score™: {item.score}
      </p>
      <p className="text-sm text-gray-500">
        Primary focus: {item.primaryPillar}
      </p>
    </div>
  );
}
